// Walks a page one viewport at a time and screenshots each step (acceptance check: one idea
// per screen). Usage: node scripts/walk.mjs <url> <outDir> <width> <height> [--reduced] [--step=1]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [url, out, w = "1440", h = "900"] = process.argv.slice(2);
const reduced = process.argv.includes("--reduced");
const step = Number(process.argv.find((a) => a.startsWith("--step="))?.slice(7) ?? 1);
const nogl = process.argv.includes("--nogl");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: nogl ? ["--disable-webgl", "--disable-3d-apis"] : ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const mobile = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? "reduce" : "no-preference" });
const errors = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror " + e.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += Number(h) * step) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(reduced ? 300 : 1300);
  await page.screenshot({ path: `${out}/${String(i).padStart(3, "0")}.png` });
  i++;
}
console.log(JSON.stringify({ shots: i, total, errors: [...new Set(errors)].slice(0, 12) }));
await browser.close();
