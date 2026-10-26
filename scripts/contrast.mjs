// Measures text contrast against the ACTUAL rendered background (3D world, photos, scrims):
// records text boxes, hides all text, screenshots, then compares text colour with the
// 90th-percentile-luminance background pixel inside each box (pessimistic).
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const out = process.argv[2] ?? "contrast";
const vps = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const report = [];
for (const vp of vps) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto("http://localhost:5173/");
  await page.waitForFunction(() => !document.querySelector(".pre") && window.__world, null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  const n = await page.locator("main [data-key]").count();
  for (let i = 0; i < n; i += 2) {
    await page.evaluate((i) => {
      const s = document.querySelectorAll("main [data-key]")[i];
      window.scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.5);
    }, i);
    await page.waitForTimeout(2600);
    const boxes = await page.evaluate(() => {
      const res = [];
      const walker = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
      let t;
      while ((t = walker.nextNode())) {
        if (!t.textContent.trim()) continue;
        const el = t.parentElement;
        if (el.closest(".sr-only, svg, .cta, .dnav__btn, .status, .placeholder-flag, button")) continue;
        const cs = getComputedStyle(el);
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const range = document.createRange();
        range.selectNodeContents(t);
        for (const r of range.getClientRects()) {
          if (r.width < 4 || r.bottom < 80 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
          res.push({ x: r.left, y: r.top, w: r.width, h: r.height, color: cs.color, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), text: t.textContent.trim().slice(0, 40) });
        }
      }
      return res;
    });
    await page.addStyleTag({ content: "main *, main *::before, main *::after { color: transparent !important; text-shadow: none !important; border-color: transparent !important; } main .icon, main svg, .cursor-ring, .cursor-dot { visibility: hidden !important } main .cta, main .dnav__btn { background: transparent !important; }" });
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${out}/${vp.name}-${i}.png` });
    await page.evaluate(() => document.head.lastElementChild.remove());
    report.push({ vp: vp.name, chapter: i, boxes });
  }
  await page.close();
}
writeFileSync(`${out}/boxes.json`, JSON.stringify(report));
await browser.close();
