import { createServer } from "http";
import { chromium } from "playwright";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH = resolve(__dirname, "..", "node_modules", "playwright-core", ".local-browsers");

let browser = null;

async function getBrowser() {
  if (browser?.isConnected()) return browser;
  browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-setuid-sandbox"],
  });
  return browser;
}

async function fetchPage(url) {
  const b = await getBrowser();
  const ctx = await b.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    locale: "fr-FR",
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  try {
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2500);

    const title = await page.title();
    if (/attention required|cloudflare/i.test(title)) {
      await page.waitForTimeout(5000);
    }

    const html = await page.content();
    return html.length > 500 ? html.slice(0, 250000) : null;
  } catch (e) {
    console.error(`[scraper] Error fetching ${url}:`, e.message);
    return null;
  } finally {
    await ctx.close();
  }
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  try {
    const { urls } = JSON.parse(body);
    if (!Array.isArray(urls) || urls.length === 0) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "urls array required" }));
      return;
    }

    const results = {};

    const rootHtml = await fetchPage(urls[0]);
    if (rootHtml) results[urls[0]] = rootHtml;

    if (urls.length > 1) {
      const subResults = await Promise.allSettled(
        urls.slice(1).map((u) => fetchPage(u).then((html) => ({ url: u, html })))
      );
      for (const r of subResults) {
        if (r.status === "fulfilled" && r.value?.html) {
          results[r.value.url] = r.value.html;
        }
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ results }));
  } catch (e) {
    console.error("[scraper] Error:", e.message, e.stack);
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  }
});

const PORT = 3099;
server.listen(PORT, () => {
  console.log(`[scraper] Playwright scraper running on http://localhost:${PORT}`);
});
