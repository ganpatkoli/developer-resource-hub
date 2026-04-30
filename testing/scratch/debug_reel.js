import puppeteer from "puppeteer";
import fs from "fs";

async function debugReel(shortcode) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox"],
        });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        const url = `https://www.instagram.com/reel/${shortcode}/`;
        console.log("Visiting:", url);
        await page.goto(url, { waitUntil: "networkidle2" });

        // Wait a bit for dynamic content
        await new Promise(r => setTimeout(r, 5000));

        // Take a screenshot to see what's happening
        await page.screenshot({ path: "scratch/reel_debug.png" });
        console.log("Screenshot saved to scratch/reel_debug.png");

        const data = await page.evaluate(() => {
            const results = {
                title: document.title,
                allH1: Array.from(document.querySelectorAll('h1')).map(el => el.innerText),
                allH2: Array.from(document.querySelectorAll('h2')).map(el => el.innerText),
                links: Array.from(document.querySelectorAll('header a')).map(el => el.innerText),
                spans: Array.from(document.querySelectorAll('span')).slice(0, 50).map(el => el.innerText),
            };
            return results;
        });

        console.log("Debug Data:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        if (browser) await browser.close();
    }
}

debugReel("DUSZLBBkvyv");
