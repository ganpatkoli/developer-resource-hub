import axios from "axios";
import * as cheerio from "cheerio";

async function testFetch(url) {
    try {
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            }
        });
        console.log("Status:", res.status);
        const $ = cheerio.load(res.data);
        const title = $("title").text();
        console.log("Title:", title);
        
        // Check for common metadata
        const description = $('meta[property="og:description"]').attr('content');
        console.log("Description (Caption):", description);
        
        const usernameMatch = title.match(/@([a-zA-Z0-9._]+)/);
        console.log("Username Match:", usernameMatch ? usernameMatch[1] : "Not found");

    } catch (e) {
        console.error("Error:", e.message);
    }
}

const shortcode = "DUSZLBBkvyv";
testFetch(`https://www.instagram.com/reel/${shortcode}/`);
