import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

/* GSAP motion for authored SVG illustrations. Every illustration is drawn in its FINAL
   state; this module only adds motion, so reduced-motion users see the static artwork.

   Intro (plays once each time the illustration becomes active):
     data-in="draw"  stroke draws on (element needs pathLength="1")
     data-in="pop"   scales up from 0.7 and fades in
     data-in="rise"  rises 16px and fades in
     data-in="fade"  fades in
     data-d="0.3"    delay in seconds
   Ambient loops (run while the illustration is on screen):
     data-loop="float"   gentle vertical float          data-amp (px)
     data-loop="spin"    rotate 360 around data-o="x y"  data-dur, data-dir="-1"
     data-loop="swing"   rotate between data-a0/data-a1 around data-o
     data-loop="slide"   move by data-dx/data-dy and back
     data-loop="travel"  move by data-dx/data-dy, then restart (conveyors)
     data-loop="path"    ride the path selected by data-path
     data-loop="pulse"   expand and fade (sensor pulse)
     data-loop="blink"   soft opacity breathing
     data-loop="flow"    dashed stroke flows along its path
     data-loop="redraw"  stroke draws on repeatedly (signatures, trend lines)
     data-dur, data-d    duration and phase offset in seconds */

const num = (el: Element, k: string, d: number) => {
  const v = (el as HTMLElement).dataset?.[k] ?? el.getAttribute(`data-${k}`);
  return v == null || v === "" ? d : Number(v);
};
const str = (el: Element, k: string) => el.getAttribute(`data-${k}`) ?? undefined;

export function buildIntro(svg: SVGSVGElement) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  svg.querySelectorAll<SVGElement>("[data-in]").forEach((el) => {
    const kind = str(el, "in");
    const at = num(el, "d", 0);
    if (kind === "draw") {
      tl.fromTo(el, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: num(el, "dur", 1.1), ease: "power2.inOut" }, at);
    } else if (kind === "pop") {
      tl.fromTo(el, { scale: 0.7, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.7 }, at);
    } else if (kind === "rise") {
      tl.fromTo(el, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, at);
    } else {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6 }, at);
    }
  });
  return tl;
}

export function buildLoops(svg: SVGSVGElement) {
  const tweens: gsap.core.Animation[] = [];
  svg.querySelectorAll<SVGElement>("[data-loop]").forEach((el) => {
    const kind = str(el, "loop");
    const dur = num(el, "dur", 0);
    const delay = num(el, "d", 0);
    const origin = str(el, "o");
    let t: gsap.core.Animation | null = null;
    switch (kind) {
      case "float":
        t = gsap.to(el, { y: -num(el, "amp", 6), duration: dur || 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
        break;
      case "spin":
        t = gsap.to(el, { rotation: 360 * num(el, "dir", 1), svgOrigin: origin, duration: dur || 14, ease: "none", repeat: -1 });
        break;
      case "swing":
        t = gsap.fromTo(el, { rotation: num(el, "a0", -10), svgOrigin: origin }, { rotation: num(el, "a1", 10), svgOrigin: origin, duration: dur || 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
        break;
      case "slide":
        t = gsap.to(el, { x: num(el, "dx", 0), y: num(el, "dy", 0), duration: dur || 2.2, ease: "power2.inOut", yoyo: true, repeat: -1, repeatDelay: 0.6 });
        break;
      case "travel":
        t = gsap.fromTo(el, { x: 0, y: 0 }, { x: num(el, "dx", 0), y: num(el, "dy", 0), duration: dur || 4, ease: "none", repeat: -1 });
        break;
      case "path": {
        const path = svg.querySelector(str(el, "path") ?? "");
        if (path) t = gsap.to(el, { motionPath: { path: path as SVGPathElement, align: path as SVGPathElement, alignOrigin: [0.5, 0.5] }, duration: dur || 4, ease: "none", repeat: -1 });
        break;
      }
      case "pulse":
        t = gsap.fromTo(el, { scale: 0.6, opacity: 0.9, transformOrigin: "50% 50%" }, { scale: 1.7, opacity: 0, duration: dur || 1.8, ease: "power2.out", repeat: -1 });
        break;
      case "blink":
        t = gsap.to(el, { opacity: 0.35, duration: dur || 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
        break;
      case "flow":
        t = gsap.to(el, { strokeDashoffset: -num(el, "dist", 24), duration: dur || 1.2, ease: "none", repeat: -1 });
        break;
      case "redraw":
        t = gsap
          .timeline({ repeat: -1, repeatDelay: 1.2 })
          .fromTo(el, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur || 2.2, ease: "power2.inOut" })
          .to(el, { opacity: 0, duration: 0.4 }, "+=1.4")
          .set(el, { opacity: 1, strokeDashoffset: 1 });
        break;
    }
    if (t) {
      if (delay) t.progress((delay / (t.duration() || 1)) % 1);
      tweens.push(t);
    }
  });
  return tweens;
}
