// Production performance probe: first-load transfer (excluding lazy photos), LCP, long tasks,
// and frame times during a scripted scroll through the whole home page.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:4173";
const vp = process.argv[3] === "mobile" ? { width: 390, height: 844, dpr: 2, mobile: true } : { width: 1440, height: 900, dpr: 2 };

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
const page = await ctx.newPage();
const reqs = [];
page.on("requestfinished", async (r) => {
  const s = await r.sizes().catch(() => null);
  reqs.push({ url: r.url(), bytes: s ? s.responseBodySize + s.responseHeadersSize : 0, t: Date.now() });
});
await page.addInitScript(() => {
  window.__lcp = 0;
  window.__long = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(Math.round(e.duration)))).observe({ type: "longtask", buffered: true });
});
const t0 = Date.now();
await page.goto(base, { waitUntil: "load" });
await page.waitForFunction(() => !document.querySelector(".pre"), null, { timeout: 120000 });
const liveAt = Date.now() - t0;
await page.waitForTimeout(1500);
const initial = reqs.filter((r) => !r.url.includes("/images/"));
const kb = (b) => (b / 1024).toFixed(0);
const sum = (a) => a.reduce((s, r) => s + r.bytes, 0);
const byType = {};
for (const r of initial) {
  const ext = r.url.split("?")[0].split(".").pop();
  byType[ext] = (byType[ext] ?? 0) + r.bytes;
}
const lcp = await page.evaluate(() => window.__lcp);
const longBefore = await page.evaluate(() => window.__long.slice());

// scripted scroll: 0 → bottom over ~14 s, sample RAF deltas
const frames = await page.evaluate(async () => {
  const deltas = [];
  let last = performance.now();
  let run = true;
  const loop = (t) => {
    deltas.push(t - last);
    last = t;
    if (run) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  const max = document.documentElement.scrollHeight - innerHeight;
  const steps = 40 * 60;
  for (let i = 0; i <= steps; i++) {
    window.scrollTo(0, (max * i) / steps);
    await new Promise((r) => requestAnimationFrame(r));
  }
  await new Promise((r) => setTimeout(r, 800));
  run = false;
  return deltas.slice(5);
});
frames.sort((a, b) => a - b);
const pct = (p) => frames[Math.floor(frames.length * p)].toFixed(1);
const longAfter = await page.evaluate(() => window.__long.slice());
const photos = reqs.filter((r) => r.url.includes("/images/"));
console.log(JSON.stringify({
  viewport: `${vp.width}x${vp.height}@${vp.dpr}`,
  firstLoadKB_excl_photos: kb(sum(initial)),
  firstLoadByTypeKB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, kb(v)])),
  preloaderDoneMs: liveAt,
  lcpMs: Math.round(lcp),
  longTasksDuringLoad: longBefore,
  frames: frames.length,
  frameMs: { p50: pct(0.5), p95: pct(0.95), p99: pct(0.99) },
  fpsMedian: (1000 / frames[Math.floor(frames.length / 2)]).toFixed(0),
  longTasksDuringScroll: longAfter.slice(longBefore.length),
  photosLoadedDuringScrollKB: kb(sum(photos)),
  totalTransferKB: kb(sum(reqs)),
}, null, 1));
await browser.close();
