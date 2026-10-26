import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await p.waitForSelector(".world.is-live");
const info = [];
for (let i = 0; i < 8; i++) {
  await p.evaluate((i) => window.scrollTo(0, window.__tamsBus.conductor.anchor(i)), i);
  await p.waitForTimeout(2500);
  info.push(await p.evaluate(() => { const d = window.__tamsWorld.debug(); return { calls: d.calls, triangles: d.triangles, smooth: +d.smooth.toFixed(2) }; }));
}
console.log("per-chapter", JSON.stringify(info));
// hotspot hover in data chapter
await p.evaluate(() => window.scrollTo(0, window.__tamsBus.conductor.anchor(4) + 100));
await p.waitForTimeout(2500);
const pos = await p.evaluate(() => { const r = window.__tamsBus.labels.get("intel").getBoundingClientRect(); return { x: r.left - 14, y: r.top + 34 }; });
await p.mouse.move(pos.x, pos.y);
await p.waitForTimeout(400);
console.log("hover on intel node:", await p.evaluate(() => window.__tamsBus.get("hover")), "button highlighted:", await p.locator("#diagram-step-intel.is-hover").count());
await p.mouse.click(pos.x, pos.y);
await p.waitForTimeout(200);
console.log("3D click selected:", await p.evaluate(() => window.__tamsBus.get("step")));
// mid transitions with DOM hidden
await p.addStyleTag({ content: "main > .home > [data-chapter], header, .rail, footer, .node-labels { visibility: hidden !important }" });
for (let i = 0; i < 7; i++) {
  await p.evaluate((i) => { const c = window.__tamsBus.conductor; window.scrollTo(0, (c.anchor(i + 1) + c.anchor(i)) / 2 + (c.anchor(i + 1) - c.anchor(i)) * 0.25); }, i);
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}/mid-${i}.png` });
}
await b.close();
