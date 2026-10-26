// Route audit: axe-core (WCAG 2.1 AA), console errors, horizontal overflow, unresolved links.
// Usage: node scripts/audit.mjs [baseUrl] [--width=360]
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const base = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5173";
const width = Number(process.argv.find((a) => a.startsWith("--width="))?.slice(8) ?? 1440);
const axeSrc = readFileSync(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(`${page.url()} :: ${m.text()}`));
page.on("pageerror", (e) => errors.push(`${page.url()} :: ${e.message}`));

await page.goto(`${base}/sitemap`, { waitUntil: "networkidle" });
const routes = [...new Set(await page.$$eval("main a[href^='/']", (as) => as.map((a) => a.getAttribute("href"))))];
let fails = 0;
const allHrefs = new Set();
for (const r of routes) {
  await page.goto(base + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const notFound = await page.locator("text=This line is not connected.").count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  (await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))).forEach((h) => allHrefs.add(h));
  await page.addScriptTag({ content: axeSrc });
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] });
    return r.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
  });
  const bad = notFound || overflow > 0 || res.length;
  if (bad) fails++;
  console.log(`${bad ? "✗" : "✓"} ${r}${notFound ? " [404]" : ""}${overflow > 0 ? ` [overflow ${overflow}px]` : ""}`);
  res.forEach((v) => console.log("    ", v));
}
const hashOnly = [...allHrefs].filter((h) => h === "#" || h === "");
const internal = [...allHrefs].filter((h) => h.startsWith("/")).map((h) => h.split("#")[0]);
const unresolved = internal.filter((h) => !routes.includes(h) && h !== "/");
console.log(`\nroutes: ${routes.length}, failing: ${fails}, '#' links: ${hashOnly.length}, internal hrefs not in sitemap: ${[...new Set(unresolved)].join(", ") || "none"}`);
console.log("console errors:", errors.length ? errors : "none");
await browser.close();
