// Interaction checks: keyboard nav, dropdown, mobile menu, diagram, form states, no-WebGL fallback.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:5173";
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "✓" : "✗"} ${name}${extra ? ` — ${extra}` : ""}`);

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  check("first Tab focuses skip link", await page.evaluate(() => document.activeElement?.classList.contains("skip-link")));
  await page.keyboard.press("Enter");
  check("skip link moves focus to main", await page.evaluate(() => document.activeElement?.id === "main" || location.hash === "#main"));

  const btn = page.locator(".nav__item--menu > button").first();
  await btn.focus();
  await page.keyboard.press("Enter");
  check("dropdown opens on Enter", (await btn.getAttribute("aria-expanded")) === "true");
  await page.keyboard.press("Tab");
  check("Tab moves into dropdown", await page.evaluate(() => !!document.activeElement?.closest(".mega")));
  await page.keyboard.press("Escape");
  check("Escape closes dropdown + returns focus", (await btn.getAttribute("aria-expanded")) === "false" && (await page.evaluate(() => document.activeElement?.classList.contains("nav__link"))));

  // form: empty submit
  const form = page.locator("#contact .form");
  await form.locator("button[type=submit]").click();
  check("empty submit shows 5 field errors", (await form.locator("[aria-invalid=true]").count()) === 5, `${await form.locator("[aria-invalid=true]").count()}`);
  check("focus moves to first invalid field", await page.evaluate(() => document.activeElement?.getAttribute("name") === "name"));
  await form.locator("[name=email]").fill("someone@gmail.com");
  await form.locator("[name=email]").blur();
  check("free-mail address rejected", (await form.locator(".field__error").allInnerTexts()).some((t) => t.includes("work email")));
  await form.locator("[name=name]").fill("Asha Rao");
  await form.locator("[name=email]").fill("asha@example-manufacturing.in");
  await form.locator("[name=company]").fill("Example Forgings");
  await form.locator("[name=breaking]").fill("Production confirmations are typed in from paper at shift end.");
  await form.locator("[name=consent]").check();
  await form.locator("button[type=submit]").click();
  check("loading state disables submit", await form.locator("button[type=submit]").isDisabled());
  await page.waitForSelector("#contact .form-success", { timeout: 5000 });
  check("success state shown and focused", await page.evaluate(() => document.activeElement?.classList.contains("form-success")));
  check("no console errors (home)", errs.length === 0, errs.join(" | "));
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(`${base}/contact?form=fail`, { waitUntil: "networkidle" });
  const form = page.locator(".form");
  await form.locator("[name=name]").fill("Asha Rao");
  await form.locator("[name=email]").fill("asha@example-manufacturing.in");
  await form.locator("[name=company]").fill("Example Forgings");
  await form.locator("[name=breaking]").fill("Month-end close takes two weeks every month.");
  await form.locator("[name=consent]").check();
  await form.locator("button[type=submit]").click();
  await page.waitForSelector(".form-alert", { timeout: 5000 });
  check("error state shows alert and keeps input", (await form.locator("[name=company]").inputValue()) === "Example Forgings");
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".site-header__burger").click();
  check("mobile menu opens", await page.locator("#mobile-menu").isVisible());
  check("focus moved into mobile menu", await page.evaluate(() => !!document.activeElement?.closest("#mobile-menu")));
  await page.keyboard.press("Escape");
  check("mobile menu closes on Escape", !(await page.locator("#mobile-menu").isVisible()));
  await page.close();
}
await browser.close();

// no WebGL
const nogl = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis", "--disable-gpu"] });
{
  const page = await nogl.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(base, { waitUntil: "networkidle" });
  check("no-WebGL: no canvas, static mode", (await page.locator(".world-canvas").count()) === 0 && (await page.evaluate(() => document.documentElement.dataset.mode)) === "static");
  check("no-WebGL: illustrations render", (await page.locator(".beat__art svg").count()) > 10);
  check("no-WebGL: content readable", (await page.locator("h1").innerText()).length > 10);
  check("no-WebGL: no console errors", errs.length === 0, errs.join(" | "));
  await page.screenshot({ path: process.argv[3] ?? "nogl.png" });
  await page.close();
}
await nogl.close();
console.log(results.join("\n"));
