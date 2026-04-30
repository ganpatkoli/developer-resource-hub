import puppeteer from "puppeteer";

async function checkIframe(url) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });
        await new Promise(r => setTimeout(r, 10000));

        const iframes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('iframe')).map(f => f.src);
        });
        console.log("Iframes:", iframes);
        
        // Check for specific text like "Website" in the whole page HTML
        const html = await page.content();
        console.log("Includes 'Website'?", html.includes('Website'));
        console.log("Includes 'poe.com'?", html.includes('poe.com'));

    } catch (e) { console.error(e); } finally { if (browser) await browser.close(); }
}
checkIframe("https://superprofile.bio/moreyournishaant");
