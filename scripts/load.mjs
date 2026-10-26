// Loads a route, waits for the preloader to finish, reports console errors and takes a shot.
import { chromium } from "playwright";
const [url = "http://localhost:5173/", out = "load.png", w = "1440", h = "900"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const mobile = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, isMobile: mobile, hasTouch: mobile });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning" || m.text().startsWith("[t]")) && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push("pageerror: " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")));
const t0 = Date.now();
await page.goto(url, { waitUntil: "domcontentloaded" });
let pct = [];
for (let i = 0; i < 120; i++) {
  await page.waitForTimeout(500);
  const s = await page.evaluate(() => ({ pre: !!document.querySelector(".pre"), pct: document.querySelector(".pre__pct")?.textContent, label: document.querySelector(".pre__label")?.textContent, mode: document.documentElement.dataset.mode }));
  pct.push(`${s.pct}:${s.label}`);
  if (!s.pre) break;
}
console.log("ready after", Date.now() - t0, "ms; progress trail:", [...new Set(pct)].slice(-8).join(" | "));
await page.waitForTimeout(3500);
await page.screenshot({ path: out });
console.log(JSON.stringify(await page.evaluate(() => window.__world?.debug?.() ?? null)));
console.log(logs.slice(0, 80).join("\n") || "no console errors");
await browser.close();
