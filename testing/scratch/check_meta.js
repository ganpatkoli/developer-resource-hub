import puppeteer from "puppeteer";

async function checkMeta(username) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "networkidle2" });
        
        const data = await page.evaluate(() => {
            const ogDescription = document.querySelector('meta[property="og:description"]')?.content || "";
            const links = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('l.instagram.com') || h.includes('linktr.ee') || h.includes('superprofile'));
            return { ogDescription, links };
        });
        console.log(data);
    } catch (e) { console.error(e); } finally { if (browser) await browser.close(); }
}

checkMeta("moreyournishaant");
