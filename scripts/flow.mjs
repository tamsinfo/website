// Route transition + inspect flow check.
import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(m.text().slice(0, 160)));
p.on("pageerror", (e) => logs.push("pageerror " + e.message));
await p.goto("http://localhost:5173/products");
await p.waitForFunction(() => !document.querySelector(".pre") && window.__world, null, { timeout: 120000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/f0-products-hub.png` });
// click the first item's link → liquid transition into the gate-entry room
const link = p.locator('main a[href="/products/gate-entry"]').first();
await link.scrollIntoViewIfNeeded();
await p.waitForTimeout(2500);
await link.click();
await p.waitForTimeout(450);
await p.screenshot({ path: `${out}/f1-transition.png` });
await p.waitForTimeout(2600);
await p.screenshot({ path: `${out}/f2-detail.png` });
console.log("url", p.url(), "h1", await p.locator("h1").innerText());
// inspect
await p.getByRole("button", { name: /Inspect Gate Entry/ }).click();
await p.waitForTimeout(1600);
await p.screenshot({ path: `${out}/f3-inspect.png` });
console.log("dialog focus:", await p.evaluate(() => document.activeElement?.textContent?.trim()));
await p.mouse.move(700, 450);
await p.mouse.down();
await p.mouse.move(900, 470, { steps: 12 });
await p.mouse.up();
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/f4-turned.png` });
await p.keyboard.press("Escape");
await p.waitForTimeout(1500);
console.log("after close, inspect visible:", await p.locator(".inspect.is-on").count());
// back to home via logo → transition
await p.locator(".site-header__logo").click();
await p.waitForTimeout(3200);
console.log("url", p.url());
console.log("errors:", [...new Set(logs)].slice(0, 8));
await b.close();
