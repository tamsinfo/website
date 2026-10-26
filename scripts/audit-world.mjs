// axe in the full WebGL experience (not reduced motion), at several scroll depths.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const axeSrc = readFileSync(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const r of ["/", "/products/exim", "/about"]) {
  await p.goto("http://localhost:5173" + r);
  await p.waitForFunction(() => !document.querySelector(".pre") && window.__world, null, { timeout: 120000 });
  await p.waitForTimeout(2000);
  const depths = r === "/" ? [0, 0.2, 0.45, 0.7, 0.98] : [0, 0.6];
  for (const d of depths) {
    await p.evaluate((d) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * d), d);
    await p.waitForTimeout(1800);
    await p.addScriptTag({ content: axeSrc });
    const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] })).violations.map((x) => `${x.id} (${x.nodes.length}) ${x.nodes[0].target.join(" ")}`));
    const h1 = await p.evaluate(() => document.querySelectorAll("h1").length);
    console.log(r, d, "h1:", h1, v.length ? v : "clean");
  }
}
await b.close();
