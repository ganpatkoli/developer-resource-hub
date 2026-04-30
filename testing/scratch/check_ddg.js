import puppeteer from "puppeteer";

async function checkDDG(username) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        const q = `instagram ${username} superprofile bio`;
        await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2" });
        
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => ({ text: a.innerText, href: a.href }));
        });
        
        console.log(JSON.stringify(links.filter(l => l.href.includes('superprofile') || l.href.includes('linktr')), null, 2));

    } catch (e) { console.error(e); } finally { if (browser) await browser.close(); }
}
checkDDG("moreyournishaant");
