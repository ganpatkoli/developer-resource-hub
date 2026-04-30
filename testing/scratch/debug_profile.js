import puppeteer from "puppeteer";

async function debugProfile(username) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox"],
        });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        const url = `https://www.instagram.com/${username}/`;
        console.log("Visiting:", url);
        await page.goto(url, { waitUntil: "networkidle2" });

        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: "scratch/profile_debug.png" });

        const data = await page.evaluate(() => {
            return {
                title: document.title,
                links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href })),
                spans: Array.from(document.querySelectorAll('span')).slice(0, 100).map(s => s.innerText)
            };
        });

        console.log("Profile Data:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        if (browser) await browser.close();
    }
}

debugProfile("moreyournishaant");
