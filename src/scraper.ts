import puppeteer, { Page } from "puppeteer";

export async function scrapeProfile(url: string, page: Page): Promise<string[]> {
    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector(".x1qjc9v5", { timeout: 15000 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Captura todos os elementos com a classe
    const elements = await page.$eval(".x1qjc9v5", (el) =>
        (el as HTMLElement).innerText.split("\n")
    );

    // Filtra até encontrar um dos bloqueadores
    const result: string[] = [];
    for (const el of elements) {
        result.push(el);
        // if (el === "Esta conta é privada" || el.includes("Mostrar mais publicações")) {
        //     break;
        // }
    };

    console.log(`Elements: `, result);

    // await browser.close();
    return result;
}
