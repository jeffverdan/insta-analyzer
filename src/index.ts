import fs from "fs";
import { scrapeProfile } from "./scraper";
import { analyzeProfile, ProfileAnalysis } from "./openai";
import { exportToCSV, exportToExcel } from "./exporter";
import puppeteer from "puppeteer";
import { Browser, chromium, Page } from "playwright";

interface Follower {
    href: string;
    value: string; // nickname
    timestamp?: number;
}
type List  = string[];

async function salvarSessao(browser: Browser) {    
    const context = await browser.newContext({
        storageState: "insta-session.json",
    });
    const page = await context.newPage();
    const user = 'luiz_alvez@yahoo.com';
    const pass = 'Jefer8774';

    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded" });

    await page.click("input[name=username]");
    await page.fill("input[name=username]", user);
    await page.waitForTimeout(200);

    await page.click("input[name=password]");
    await page.fill("input[name=password]", pass);
    await page.waitForTimeout(200);

    await page.click("button[type=submit]");
    await page.waitForTimeout(1000);

    await page.click("button[type=button]");
    await page.waitForTimeout(5000);

    // await page.waitForSelector("button._aswy", { timeout: 600000 });
    await page.context().storageState({ path: "insta-session.json" });
    return page;
};

async function recuperarSessao(browser: Browser) {    
    
    const context = await browser.newContext({
        storageState: "insta-session.json",
    });
    const page = await context.newPage();    
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded" });

    return page;
}

async function main() {
    // const rawData = JSON.parse(fs.readFileSync("followers.json", "utf-8"));
    const rawData = JSON.parse(fs.readFileSync("list.json", "utf-8")) as List;

    // const followers: Follower[] = rawData.map(
    //     (item: any) => item.string_list_data[0]
    // );
    const followers: Follower[] = rawData.map(
        (item: any) => {
            const parts = item.split("/"); // Exemplo: "https://www.instagram.com/username/"
            return {
                href: item,
                value: parts[parts.length - 2], // Pega a penúltima parte como nickname                
            };
        }
    );

    const results: ProfileAnalysis[] = [];
    const browser = await chromium.launch({ headless: false });
    // const page = await salvarSessao(browser);
    const page = await recuperarSessao(browser);
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
