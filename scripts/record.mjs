// Records a real wheel-driven scroll through the home journey (forward, then a reverse leg).
// Usage: node scripts/record.mjs <baseUrl> <outDir> [w] [h]
import { chromium } from "playwright";
import { renameSync, readdirSync } from "node:fs";
const [base = "http://localhost:4173", out = "docs/recordings", w = "1440", h = "900"] = process.argv.slice(2);
const W = Number(w), H = Number(h);
const mobile = W < 600;
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: out, size: { width: W, height: H } }, isMobile: mobile, hasTouch: mobile });
const p = await ctx.newPage();
await p.goto(base);
await p.waitForFunction(() => !document.querySelector(".pre"), null, { timeout: 120000 });
await p.waitForTimeout(3500);
await p.mouse.move(W * 0.7, H * 0.45, { steps: 20 });
await p.mouse.move(W * 0.62, H * 0.55, { steps: 20 });
const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
if (mobile) {
  for (let y = 0; y < total; y += 14) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(16); }
} else {
  const steps = Math.ceil(total / 60);
  for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(16); }
  await p.waitForTimeout(1500);
  for (let i = 0; i < 260; i++) { await p.mouse.wheel(0, -60); await p.waitForTimeout(16); }
}
await p.waitForTimeout(1500);
const vid = await p.video().path();
await ctx.close();
await b.close();
const name = `${out}/home-${mobile ? "mobile" : "desktop"}.webm`;
renameSync(vid, name);
console.log("saved", name);
