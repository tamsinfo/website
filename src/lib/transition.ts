// Route changes are one physical event: the lens floods with blue, the camera is carried
// to the next room underneath, and the liquid drains away. These are sv-router's
// global hooks; the router waits for `beforeLoad` before swapping the page.
import type { HooksContext } from "sv-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sound } from "./audio/engine";
import { resetScroll, scrollToHash, startScroll, stopScroll } from "./motion/scroll";
import { getWorld, ui } from "./state.svelte";
import type { Flood } from "./world/flood";

let flood: Flood | null = null;
let first = true;
let current = typeof location !== "undefined" ? location.pathname : "/";
let busy = false;

export function setFlood(f: Flood) {
  flood = f;
}

const normal = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

export async function beforeLoad(ctx: HooksContext) {
  if (first || normal(ctx.pathname) === normal(current)) return;
  ui.menuOpen = false;
  busy = true;
  stopScroll();
  sound.cue("transition");
  await flood?.cover();
  getWorld()?.snap();
}

export function afterLoad(ctx: HooksContext) {
  const wasFirst = first;
  first = false;
  const changed = normal(ctx.pathname) !== normal(current);
  current = ctx.pathname;

  if (wasFirst) return;
  if (!changed) {
    if (ctx.hash) scrollToHash(ctx.hash);
    return;
  }

  resetScroll();
  // two frames: one for the new page to mount, one for layout to settle
  requestAnimationFrame(() =>
    requestAnimationFrame(async () => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event("tams:layout"));
      focusPage();
      announce(document.title);
      startScroll();
      await flood?.drain();
      busy = false;
      if (ctx.hash) scrollToHash(ctx.hash);
    }),
  );
}

export function isTransitioning() {
  return busy;
}

function focusPage() {
  const target = document.querySelector<HTMLElement>("main h1") ?? document.getElementById("main");
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

function announce(text: string) {
  const region = document.getElementById("route-announcer");
  if (region) region.textContent = text;
}
