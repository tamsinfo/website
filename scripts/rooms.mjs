// Screenshot the first two beats of each room route.
import { chromium } from "playwright";
const out = process.argv[2];
const w = Number(process.argv[3] ?? 1440), h = Number(process.argv[4] ?? 900);
const routes = ["/services", "/services/s4hana-managed-services", "/solutions", "/solutions/sap-btp", "/industries", "/industries/pharmaceuticals", "/products/vendor-portal", "/about", "/careers", "/contact", "/brand", "/privacy", "/sitemap", "/nope"];
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600 });
const logs = [];
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(m.text().slice(0, 160)));
p.on("pageerror", (e) => logs.push("pageerror " + e.message));
await p.goto("http://localhost:5173" + routes[0]);
await p.waitForFunction(() => !document.querySelector(".pre") && window.__world, null, { timeout: 120000 });
let i = 0;
for (const r of routes) {
  // client-side navigation keeps the one world alive (as a real visitor would)
  await p.evaluate((r) => { const a = document.createElement("a"); a.href = r; document.querySelector("main").appendChild(a); a.click(); a.remove(); }, r);
  await p.waitForTimeout(3600);
  const keys = await p.evaluate(() => [...document.querySelectorAll("main [data-key]")].map((s) => s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.5));
  await p.screenshot({ path: `${out}/${String(i).padStart(2, "0")}a.png` });
  if (keys[1] !== undefined) {
    await p.evaluate((y) => window.scrollTo(0, y), keys[1]);
    await p.waitForTimeout(2400);
    await p.screenshot({ path: `${out}/${String(i).padStart(2, "0")}b.png` });
  }
  i++;
}
console.log("errors:", [...new Set(logs)].slice(0, 10));
await b.close();
