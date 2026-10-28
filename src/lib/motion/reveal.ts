// Svelte actions for scroll-entered motion. Content is only hidden once JavaScript has
// confirmed motion is allowed, and every action renders its final state immediately
// under reduced motion.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import { ui } from "../state.svelte";

const reduced = () => ui.reducedMotion;

type RevealOptions = { delay?: number; y?: number; start?: string };

/** Fade and rise once, when the element enters the viewport. */
export function reveal(node: HTMLElement, opts: RevealOptions = {}) {
  if (reduced()) return {};
  const tween = gsap.fromTo(
    node,
    { autoAlpha: 0, y: opts.y ?? 22 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      delay: opts.delay ?? 0,
      ease: "power3.out",
      scrollTrigger: { trigger: node, start: opts.start ?? "top 88%", once: true },
    },
  );
  return {
    destroy() {
      tween.scrollTrigger?.kill();
      tween.kill();
    },
  };
}

/** Reveal direct children (or `selector` matches) in reading order. */
export function stagger(node: HTMLElement, opts: { selector?: string; each?: number; start?: string } = {}) {
  if (reduced()) return {};
  const items = opts.selector ? node.querySelectorAll<HTMLElement>(opts.selector) : (node.children as HTMLCollectionOf<HTMLElement>);
  const tween = gsap.fromTo(
    items,
    { autoAlpha: 0, y: 18 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: opts.each ?? 0.07,
      scrollTrigger: { trigger: node, start: opts.start ?? "top 85%", once: true },
    },
  );
  return {
    destroy() {
      tween.scrollTrigger?.kill();
      tween.kill();
    },
  };
}

/**
 * Split a plain-text heading into words and raise them in sequence. The heading keeps an
 * unsplit accessible name; the word spans are hidden from assistive technology.
 * Pass `{ manual: true }` to build the split now and play it later with `playWords`.
 */
export function words(node: HTMLElement, opts: { manual?: boolean; delay?: number } = {}) {
  if (reduced()) return {};
  const text = node.textContent?.trim() ?? "";
  if (!text || node.children.length) return {};
  node.setAttribute("aria-label", text);
  node.textContent = "";
  const spans: HTMLElement[] = [];
  text.split(/\s+/).forEach((word, i, all) => {
    const mask = document.createElement("span");
    mask.className = "split-word";
    mask.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.textContent = word;
    mask.appendChild(inner);
    node.appendChild(mask);
    if (i < all.length - 1) node.appendChild(document.createTextNode(" "));
    spans.push(inner);
  });
  gsap.set(spans, { yPercent: 115 });
  const tween = gsap.to(spans, {
    yPercent: 0,
    duration: 1.05,
    ease: "power4.out",
    stagger: 0.055,
    delay: opts.delay ?? 0,
    paused: true,
  });
  let trigger: ScrollTrigger | null = null;
  if (!opts.manual) {
    trigger = ScrollTrigger.create({ trigger: node, start: "top 88%", once: true, onEnter: () => tween.play() });
  }
  (node as HTMLElement & { __words?: gsap.core.Tween }).__words = tween;
  return {
    destroy() {
      trigger?.kill();
      tween.kill();
    },
  };
}

export function playWords(node: HTMLElement | null | undefined) {
  (node as (HTMLElement & { __words?: gsap.core.Tween }) | null)?.__words?.play();
}

/** Draw the connector paths of a diagram, then light its nodes. */
export function draw(node: HTMLElement | SVGElement) {
  if (reduced()) return {};
  const paths = node.querySelectorAll<SVGPathElement | SVGLineElement>("[data-draw]");
  const nodes = node.querySelectorAll<HTMLElement>("[data-node]");
  paths.forEach((p) => {
    const len = "getTotalLength" in p ? p.getTotalLength() : 200;
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(nodes, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0);
  tl.to(paths, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.06 }, 0.15);
  const trigger = ScrollTrigger.create({ trigger: node, start: "top 80%", once: true, onEnter: () => tl.play() });
  return {
    destroy() {
      trigger.kill();
      tl.kill();
    },
  };
}
