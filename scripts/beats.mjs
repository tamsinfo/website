// Experience run-through: waits for the preloader, then stops at every [data-key] beat
// (forward, and optionally reverse) and screenshots it.
// Usage: node scripts/beats.mjs <url> <outDir> [w] [h] [--reverse] [--from=0] [--to=999]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [url, out, w = "1440", h = "900"] = process.argv.slice(2);
const reverse = process.argv.includes("--reverse");
const from = Number(process.argv.find((a) => a.startsWith("--from="))?.slice(7) ?? 0);
const to = Number(process.argv.find((a) => a.startsWith("--to="))?.slice(5) ?? 999);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const mobile = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => logs.push("pageerror " + e.message));
await page.goto(url);
await page.waitForFunction(() => !document.querySelector(".pre") && window.__world, null, { timeout: 120000 }).catch(() => logs.push("preloader timeout"));
await page.waitForTimeout(3000);
let list = await page.evaluate(() => [...document.querySelectorAll("main [data-key]")].map((s) => ({ key: s.dataset.key, y: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.5 })));
list = list.map((b, i) => ({ ...b, i })).filter((b) => b.i >= from && b.i <= to);
if (reverse) list.reverse();
for (const b of list) {
  await page.mouse.wheel(0, 0);
  await page.evaluate((y) => window.scrollTo(0, y), b.y);
  await page.waitForTimeout(2400);
  await page.screenshot({ path: `${out}/${String(b.i).padStart(2, "0")}-${b.key.replace(/[:.]/g, "_")}.png` });
}
console.log(JSON.stringify({ beats: list.length, errors: [...new Set(logs)].slice(0, 10) }));
await browser.close();
