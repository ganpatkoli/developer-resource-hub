import puppeteer from "puppeteer";

async function debugGoogle(username) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        const q = `instagram ${username} linktree OR superprofile bio`;
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2" });
        
        const data = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(h => h.includes('linktr.ee') || h.includes('superprofile.bio') || h.includes('bio.link'));
        });
        console.log("Found links:", data);
        
        if (data.length === 0) {
            console.log("No links found. Page content snippet:");
            const body = await page.evaluate(() => document.body.innerText.substring(0, 1000));
            console.log(body);
        }

    } catch (e) { console.error(e); } finally { if (browser) await browser.close(); }
}
debugGoogle("moreyournishaant");
