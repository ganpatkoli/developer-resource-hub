import { chromium } from "playwright";
import fs from "fs";

const url = "https://aichief.com/ai-coding-tools/";

async function scrape() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  });

  console.log("Opening page...");

  await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 0,
  });

  // Scroll for lazy loading
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });

  const links = await page.$$eval("a", (anchors) => {
    return anchors
      .map((a) => ({
        name: a.innerText.trim(),
        link: a.href,
      }))
      .filter(
        (x) =>
          x.link.includes("/ai-coding-tools/") &&
          x.name.length > 0
      );
  });

  // Remove duplicates
  const unique = Array.from(
    new Map(links.map((x) => [x.link, x])).values()
  );

  console.log(`Found ${unique.length} tools`);

  fs.writeFileSync(
    "tools.json",
    JSON.stringify(unique, null, 2)
  );

  console.log("Saved to tools.json");

  await browser.close();
}

scrape();