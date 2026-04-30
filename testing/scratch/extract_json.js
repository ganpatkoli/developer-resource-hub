import puppeteer from "puppeteer";

async function extractJson(username) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "networkidle2" });
        
        const json = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script'));
            for (let s of scripts) {
                if (s.innerText.includes('external_url')) {
                    return s.innerText.substring(0, 5000); // Return a chunk
                }
            }
            return "Not found";
        });
        console.log(json);
    } catch (e) { console.error(e); } finally { if (browser) await browser.close(); }
}
extractJson("moreyournishaant");
