// Lenis is the only smooth-scroll engine on the site. It runs on GSAP's ticker so
// ScrollTrigger and the scroll position always agree, and it is never created when the
// visitor prefers reduced motion.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initScroll(reducedMotion: boolean) {
  if (reducedMotion || lenis) return lenis;
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    // anchors are handled by `scrollToHash` so focus moves with them
    anchors: false,
  });
  lenis.on("scroll", () => ScrollTrigger.update());
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopScroll() {
  lenis?.stop();
}

export function startScroll() {
  lenis?.start();
}

export function resetScroll() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.resize();
  }
  window.scrollTo(0, 0);
}

/** Scroll to an in-page target and move focus there, as native anchors would. */
export function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  const el = id ? document.getElementById(id) : null;
  if (!el) return;
  const offset = -88;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.1 });
  else el.scrollIntoView({ block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
