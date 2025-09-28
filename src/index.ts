import fs from "fs";
import { scrapeProfile } from "./scraper";
import { analyzeProfile, ProfileAnalysis } from "./openai";
import { exportToCSV, exportToExcel } from "./exporter";
import puppeteer from "puppeteer";

interface Follower {
    href: string;
    value: string; // nickname
    timestamp: number;
}

async function main() {
    const rawData = JSON.parse(fs.readFileSync("followers.json", "utf-8"));

    const followers: Follower[] = rawData.map(
        (item: any) => item.string_list_data[0]
    );

    const results: ProfileAnalysis[] = [];

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button._aswy", { visible: true, timeout: 600000 });
    // await new Promise((resolve) => setTimeout(resolve, 40000));


    for (const f of followers) {
        console.log(`🔎 Analisando: ${f.value} (${f.href})`);

        const scraped = await scrapeProfile(f.href, page);

        const analysis: ProfileAnalysis | null = await analyzeProfile(
            scraped,
            f.href,
            f.value
        );

        if (analysis) {
            results.push(analysis);
        }
    }
    await browser.close();

    // Exportar resultados
    if (results.length > 0) {
        exportToCSV(results);
        exportToExcel(results);
    } else {
        console.log("⚠️ Nenhum resultado para exportar.");
    }
}

main();
