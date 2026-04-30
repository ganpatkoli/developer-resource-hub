import puppeteer from "puppeteer";

async function debugProfileContent(url) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        console.log("Visiting:", url);
        await page.goto(url, { waitUntil: "networkidle2" });
        await new Promise(r => setTimeout(r, 10000)); // Wait a long time

        const data = await page.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href, html: a.innerHTML }));
            const allButtons = Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText, html: b.innerHTML }));
            const bodyText = document.body.innerText.substring(0, 2000);
            return { allLinks, allButtons, bodyText };
        });

        console.log("Found Links Count:", data.allLinks.length);
        console.log("Found Buttons Count:", data.allButtons.length);
        console.log("First 10 Links:", JSON.stringify(data.allLinks.slice(0, 10), null, 2));
        console.log("Body Text Snippet:", data.bodyText);

    } catch (e) { console.error(e); } finally { if (browser) await browser.close(); }
}

debugProfileContent("https://superprofile.bio/moreyournishaant");
