// =======================================
// 🚀 Instagram Smart Resolver Backend
// =======================================

import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

// Error handler for malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("❌ Invalid JSON received:", err.message);
    return res.status(400).json({
      error: "Malformed JSON",
      message: "Please ensure your JSON keys and values use double quotes (\").",
      details: err.message
    });
  }
  next();
});

const PORT = 3000;

// =======================================
// 🧩 Extract shortcode from reel URL
// =======================================
const extractShortcode = (url) => {
  const match = url.match(/(reel|p)\/([^/?]+)/);
  return match ? match[2] : null;
};

// =======================================
// 🧩 Fetch Reel Data (username + caption)
// =======================================
const getReelData = async (shortcode) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
    
    const url = `https://www.instagram.com/reel/${shortcode}/`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Wait extra time for the content to render behind any pop-ups
    await new Promise(r => setTimeout(r, 3000));

    const data = await page.evaluate(() => {
      const getVal = (sel) => document.querySelector(sel)?.innerText || "";
      
      // Try primary selectors
      let username = getVal('header span a') || getVal('h2') || "";
      let caption = getVal('h1') || "";

      // If blocked by pop-up, scan all spans for the data
      if (!username || !caption) {
        const spans = Array.from(document.querySelectorAll('span'));
        for (let span of spans) {
          const text = span.innerText;
          // Instagram pattern often looks like: "username\n \n12w\nCaption text"
          if (text.includes('\n \n') || (text.includes('\n') && text.length > 20)) {
            const parts = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length >= 2) {
              if (!username) username = parts[0];
              // Avoid picking up "Sign up" or "Log in" as caption
              if (!caption && !parts[1].includes('Sign up') && !parts[1].includes('Log in')) {
                 caption = parts.slice(1).join(' ');
              }
            }
          }
        }
      }

      // Final fallback for username from links
      if (!username) {
        const userLink = document.querySelector('a[href^="/"]')?.getAttribute('href')?.replace(/\//g, '');
        if (userLink && !['reels', 'p', 'explore', 'direct'].includes(userLink)) {
          username = userLink;
        }
      }

      return { username, caption };
    });

    return (data.username && data.username.length > 1) ? data : null;
  } catch (err) {
    console.log("Reel fetch error:", err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

// =======================================
// 🧩 Get Bio Link
// =======================================
const getBioLink = async (username) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    // Use a mobile User-Agent and viewport to bypass login wall
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1");

    const url = `https://www.instagram.com/${username}/`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Wait for bio to load
    await new Promise(r => setTimeout(r, 4000));

    const bioLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const bioLinkObj = links.find(a => 
        a.href.includes('l.instagram.com') || 
        a.href.includes('linktr.ee') || 
        a.href.includes('superprofile') ||
        (a.getAttribute('role') === 'link' && a.innerText.includes('.'))
      );
      return bioLinkObj ? bioLinkObj.href : null;
    });

    if (bioLink) return bioLink;

    // FALLBACK 2: Search DuckDuckGo for the tool (Less likely to show CAPTCHA)
    try {
      const searchQuery = `https://duckduckgo.com/?q=instagram+${username}+linktree+superprofile+bio`;
      await page.goto(searchQuery, { waitUntil: "networkidle2", timeout: 30000 });
      
      const searchBioLink = await page.evaluate((uname) => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        const toolLink = allLinks.find(a => {
          const h = a.href.toLowerCase();
          // Filter out search engine links and homepages
          if (h.includes('duckduckgo.com') || h.includes('google.com') || h.includes('bing.com')) return false;
          if (h === 'https://linktr.ee/' || h === 'https://superprofile.bio/' || h === 'https://bio.link/') return false;
          
          // Must include username or be a very close match in results
          return (h.includes('linktr.ee') || h.includes('superprofile.bio') || h.includes('bio.link')) && 
                 (h.includes(uname.toLowerCase()) || a.innerText.toLowerCase().includes(uname.toLowerCase()));
        });
        return toolLink ? toolLink.href : null;
      }, username);

      if (searchBioLink) return searchBioLink;
    } catch (e) {
      console.log("Search fallback failed:", e.message);
    }

    // FALLBACK 3: Guessing and Verifying with Browser (Most reliable for Vercel/Cloudflare)
    const commonTools = [
      `https://superprofile.bio/${username}`,
      `https://linktr.ee/${username}`,
      `https://${username}.superprofile.bio/`
    ];
    
    for (let tool of commonTools) {
      try {
        await page.goto(tool, { waitUntil: "networkidle2", timeout: 20000 });
        const finalUrl = page.url().toLowerCase();
        
        // If we didn't get a 404 or a generic error page
        if (!finalUrl.includes('error') && !finalUrl.includes('404')) {
           const isUserPage = await page.evaluate((uname) => {
             return document.body.innerText.toLowerCase().includes(uname.toLowerCase()) || 
                    window.location.href.toLowerCase().includes(uname.toLowerCase());
           }, username);

           if (isUserPage) return tool;
        }
      } catch (e) {
        console.log(`Guessing failed for ${tool}:`, e.message);
      }
    }

    return null;
  } catch (err) {
    console.log("Bio fetch error:", err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

// =======================================
// 🧩 Detect Tool
// =======================================
const detectTool = (url) => {
  if (!url) return "none";

  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;

    if (host.includes("linktr.ee")) return "linktree";
    if (host.includes("superprofile.bio")) return "superprofile";
  } catch (e) {
    // If URL is malformed, check with simple includes as fallback
    if (url.includes("linktr.ee")) return "linktree";
    if (url.includes("superprofile.bio")) return "superprofile";
  }

  return "unknown";
};

// =======================================
// 🧩 Detect Comment Keyword
// =======================================
const detectCommentKeyword = (caption) => {
  if (!caption) return null;

  const patterns = [
    /comment\s+["'“‘]?([a-zA-Z0-9_]+)["'”’]?/i,
    /type\s+["'“‘]?([a-zA-Z0-9_]+)["'”’]?/i,
    /write\s+["'“‘]?([a-zA-Z0-9_]+)["'”’]?/i,
    /drop\s+["'“‘]?([a-zA-Z0-9_]+)["'”’]?/i,
    /reply\s+["'“‘]?([a-zA-Z0-9_]+)["'”’]?/i,
  ];

  for (let pattern of patterns) {
    const match = caption.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// =======================================
// 🧩 Scrape Linktree
// =======================================
const scrapeLinktree = async (url) => {
  try {
    const { data } = await axios.get(url);

    const match = data.match(/__NEXT_DATA__ = ({.*});/);

    if (match) {
      const json = JSON.parse(match[1]);
      const links = json?.props?.pageProps?.links || [];

      return links.map((l) => ({
        title: l.title,
        url: l.url,
      }));
    }

    const $ = cheerio.load(data);
    const links = [];

    $("a").each((i, el) => {
      const link = $(el).attr("href");

      if (link && link.startsWith("http")) {
        links.push({
          title: $(el).text().trim(),
          url: link,
        });
      }
    });

    return links;
  } catch (err) {
    console.log("Linktree error:", err.message);
    return [];
  }
};

// =======================================
// 🧩 Scrape Superprofile (Puppeteer)
// =======================================
const scrapeSuperprofile = async (url) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    // Use mobile view to bypass desktop-only bot blocks
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1");
    
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for the buttons to appear
    await new Promise(r => setTimeout(r, 5000));

    const links = await page.evaluate(() => {
      // Look for all links, prioritizing those that look like profile buttons
      return Array.from(document.querySelectorAll('a'))
        .map((a) => {
          // Find the most relevant text for the button
          let title = a.innerText.trim();
          if (!title) {
             title = a.querySelector('p')?.innerText?.trim() || 
                     a.querySelector('span')?.innerText?.trim() || 
                     "";
          }
          return {
            title: title,
            url: a.href,
          };
        })
        .filter((l) => 
          l.url.startsWith("http") && 
          !l.url.includes('superprofile.bio/signup') &&
          !l.url.includes('superprofile.bio/in/') &&
          l.title.length > 0
        );
    });

    return links;
  } catch (err) {
    console.log("Superprofile error:", err.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

// =======================================
// 🚀 MAIN API
// =======================================
app.post("/analyze", async (req, res) => {
  try {
    const { reelUrl } = req.body;

    if (!reelUrl) {
      return res.status(400).json({ error: "Reel URL required" });
    }

    const shortcode = extractShortcode(reelUrl);

    if (!shortcode) {
      return res.status(400).json({ error: "Invalid Reel URL" });
    }

    // Step 1: Reel Data
    const reelData = await getReelData(shortcode);

    if (!reelData) {
      return res.status(404).json({ error: "Reel not found" });
    }

    const { username, caption } = reelData;

    // Step 2: Keyword Detection
    const keyword = detectCommentKeyword(caption);

    // Step 3: Bio Link
    const bioLink = await getBioLink(username);

    // Step 4: Tool Detection
    const tool = detectTool(bioLink);

    // Step 5: Scrape Links
    let links = [];

    if (tool === "linktree") {
      links = await scrapeLinktree(bioLink);
    } else if (tool === "superprofile") {
      links = await scrapeSuperprofile(bioLink);
    }

    // Final Response Response with Deep Search Fallback
    if (links.length === 0 && keyword && bioLink) {
        try {
            const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
            const page = await browser.newPage();
            const deepQuery = `instagram ${username} ${keyword} link`;
            await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(deepQuery)}`, { waitUntil: "networkidle2" });
            const searchLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(a => ({ title: a.innerText.trim(), url: a.href }))
                    .filter(l => {
                        const u = l.url.toLowerCase();
                        return !u.includes('duckduckgo.com') && 
                               !u.includes('apple.com') && 
                               !u.includes('play.google.com') && 
                               !u.includes('reddit.com') &&
                               u.startsWith('http') &&
                               l.title.length > 2;
                    });
            });
            links = searchLinks;
            await browser.close();
        } catch (e) {}
    }

    // Step 6: Smart Matching
    const matchedLink = links.find(l => {
      if (!keyword) return false;
      const t = l.title.toLowerCase();
      const u = l.url.toLowerCase();
      const k = keyword.toLowerCase();

      if (u.includes('/signup') || u.includes('/pricing') || u.includes('utm_source=spf')) return false;

      return t.includes(k) || u.includes(k);
    });

    res.json({
      success: true,
      username,
      caption,
      detectedKeyword: keyword,
      bioLink,
      tool,
      targetLink: matchedLink ? matchedLink.url : (links.length > 0 ? links[0].url : null),
      links: links.slice(0, 10),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================================
// 🚀 START SERVER
// =======================================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});