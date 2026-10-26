import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { useMotion } from "../motion/MotionProvider";
import { useExperience } from "./Experience";
import { Illustration, type IllustrationId } from "../illustrations";
import { Icon } from "../components/ui";

/* ======================================================================================
   Kinetic type. Characters inside word masks; the accessible name is one unsplit string.
   Each chapter uses its own reveal. Type skews with scroll velocity (CSS var --vel) and its
   weight thins under the cursor (variable wght axis).
   ====================================================================================== */
export type Reveal = "rise" | "jitter" | "slide" | "wipe" | "weight" | "drop" | "mask" | "lines" | "swell" | "roll";

const REVEALS: Record<Reveal, (chars: Element[], words: Element[]) => gsap.core.Timeline> = {
  rise: (c) => gsap.timeline().fromTo(c, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: { each: 0.022, from: "start" } }),
  jitter: (c) =>
    gsap
      .timeline()
      .fromTo(c, { yPercent: 110, xPercent: () => gsap.utils.random(-40, 40) }, { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.015 })
      .to(c, { xPercent: 0, duration: 0.5, ease: "elastic.out(1, 0.35)", stagger: 0.01 }, 0.35),
  slide: (_c, w) => gsap.timeline().fromTo(w, { yPercent: 120, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.0, ease: "power4.out", stagger: 0.09 }),
  wipe: (c) => gsap.timeline().fromTo(c, { clipPath: "inset(0 100% 0 0)", x: -18 }, { clipPath: "inset(0 0% 0 0)", x: 0, duration: 0.8, ease: "power3.out", stagger: 0.025 }),
  weight: (c) => gsap.timeline().fromTo(c, { "--w": 100, opacity: 0 }, { "--w": 820, opacity: 1, duration: 1.2, ease: "power2.out", stagger: 0.03 }),
  drop: (c) => gsap.timeline().fromTo(c, { yPercent: -130, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "back.out(1.4)", stagger: { each: 0.03, from: "random" } }),
  mask: (_c, w) => gsap.timeline().fromTo(w, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 1.0, ease: "expo.inOut", stagger: 0.08 }),
  lines: (_c, w) => gsap.timeline().fromTo(w, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 }),
  swell: (c) => gsap.timeline().fromTo(c, { "--w": 300, scale: 0.92, opacity: 0 }, { "--w": 820, scale: 1, opacity: 1, duration: 1.4, ease: "power3.out", stagger: 0.02 }),
  roll: (c) => gsap.timeline().fromTo(c, { yPercent: 100, rotateX: -80 }, { yPercent: 0, rotateX: 0, duration: 1.0, ease: "power4.out", stagger: 0.04 }),
};

export function Kinetic({
  as: Tag = "h2",
  text,
  reveal = "rise",
  className,
  id,
  delay = 0,
  immediate,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  text: string;
  reveal?: Reveal;
  className?: string;
  id?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { mode, revealed } = useExperience();
  const { reduced } = useMotion();
  const animate = mode === "world" && !reduced;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;
    const chars = Array.from(el.querySelectorAll(".k-c"));
    const words = Array.from(el.querySelectorAll(".k-w"));
    const visual = el.querySelector(".k-line")!;
    gsap.set(visual, { visibility: "hidden" });
    let tl: gsap.core.Timeline | null = null;
    const play = () => {
      tl?.kill();
      gsap.set(visual, { visibility: "visible" });
      tl = REVEALS[reveal](chars, words).delay(delay);
    };
    if (immediate) {
      if (revealed) play();
      return () => void tl?.kill();
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) play();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, [animate, reveal, delay, immediate, revealed]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={`kinetic ${className ?? ""}`} id={id}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="k-line">
        {words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="k-w">
              {Array.from(w).map((ch, ci) => (
                <span className="k-c" key={ci}>
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/** cursor-driven weight: characters near the pointer thin out, the rest stay heavy */
export function useKineticCursor() {
  const { mode } = useExperience();
  useEffect(() => {
    if (mode !== "world" || !matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let px = -999, py = -999;
    const run = () => {
      raf = 0;
      document.querySelectorAll<HTMLElement>(".kinetic--xl .k-c").forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
        const k = Math.max(0, 1 - d / 220);
        c.style.setProperty("--cw", String(Math.round(820 - k * 560)));
      });
    };
    const on = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(run);
    };
    addEventListener("pointermove", on, { passive: true });
    return () => removeEventListener("pointermove", on);
  }, [mode]);
}

/* ======================================================================================
   Beat: one place in the world. data-key binds it to a camera keyframe.
   ====================================================================================== */
export type BeatProps = {
  k: string;
  side?: "left" | "right" | "center";
  eyebrow?: string;
  title: string;
  titleAs?: "h1" | "h2" | "h3";
  reveal?: Reveal;
  size?: "xl" | "l" | "m";
  body?: ReactNode;
  cta?: { to: string; label: string };
  art?: IllustrationId;
  flood?: boolean;
  tall?: boolean;
  children?: ReactNode;
  immediate?: boolean;
  id?: string;
};

export function Beat({ k, side = "left", eyebrow, title, titleAs = "h2", reveal = "rise", size = "l", body, cta, art, flood, tall, children, immediate, id }: BeatProps) {
  const { mode } = useExperience();
  return (
    <section className={`beat beat--${side} ${flood ? "is-flood" : ""} ${tall ? "beat--tall" : ""}`} data-key={k} data-side={side} id={id}>
      <div className="beat__inner">
        {eyebrow ? <p className="beat__eyebrow">{eyebrow}</p> : null}
        <Kinetic as={titleAs} text={title} reveal={reveal} className={`beat__title kinetic--${size}`} immediate={immediate} />
        {body ? <div className="beat__body">{body}</div> : null}
        {children}
        {cta ? (
          <Link to={cta.to} className="cta" data-magnetic>
            <span>{cta.label}</span>
            <Icon name="arrow-right" size={20} className="cta__icon" />
          </Link>
        ) : null}
      </div>
      {mode === "static" && art ? (
        <div className="beat__art">
          <Illustration id={art} />
        </div>
      ) : null}
    </section>
  );
}

/* ======================================================================================
   Magnetic, morphing cursor. No labels. Becomes the shape of what it is over.
   ====================================================================================== */
export function Cursor() {
  const { mode } = useExperience();
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode !== "world" || !matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const r = ring.current!, d = dot.current!;
    const pos = { x: innerWidth / 2, y: innerHeight / 2, w: 36, h: 36, rad: 18 };
    const tgt = { ...pos };
    let over: HTMLElement | null = null;
    let raf = 0;
    const on = (e: PointerEvent) => {
      let el = (e.target as HTMLElement).closest?.<HTMLElement>("a, button, [data-magnetic], input, textarea, label") ?? null;
      if (el?.closest("[inert]")) el = null;
      over = el;
      if (el && !el.matches("input, textarea")) {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        tgt.w = b.width + 14;
        tgt.h = b.height + 14;
        tgt.rad = Math.min(b.height / 2 + 7, parseFloat(cs.borderRadius) + 7 || 12);
        // magnetic: pulled toward the element centre
        tgt.x = b.left + b.width / 2 + (e.clientX - (b.left + b.width / 2)) * 0.18;
        tgt.y = b.top + b.height / 2 + (e.clientY - (b.top + b.height / 2)) * 0.18;
      } else {
        const big = document.documentElement.classList.contains("world-hover");
        tgt.w = tgt.h = big ? 84 : 36;
        tgt.rad = tgt.w / 2;
        tgt.x = e.clientX;
        tgt.y = e.clientY;
      }
      d.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      r.classList.toggle("is-on", !!el);
      r.classList.toggle("is-text", !!el?.matches("input, textarea"));
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const k = 0.2;
      pos.x += (tgt.x - pos.x) * k;
      pos.y += (tgt.y - pos.y) * k;
      pos.w += (tgt.w - pos.w) * k;
      pos.h += (tgt.h - pos.h) * k;
      pos.rad += (tgt.rad - pos.rad) * k;
      r.style.transform = `translate3d(${pos.x - pos.w / 2}px, ${pos.y - pos.h / 2}px, 0)`;
      r.style.width = `${pos.w}px`;
      r.style.height = `${pos.h}px`;
      r.style.borderRadius = `${pos.rad}px`;
      r.classList.toggle("is-world", document.documentElement.classList.contains("world-hover") && !over);
    };
    tick();
    addEventListener("pointermove", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", on);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [mode]);
  if (mode !== "world") return null;
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}

/* ======================================================================================
   Preloader: the mark assembles from three parts with real progress, its blue node floods
   the screen, and the camera falls into the world.
   ====================================================================================== */
export function Preloader() {
  const { mode, progress, label, ready, revealed, setRevealed, world } = useExperience();
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(mode === "world");
  const pct = Math.round(progress * 100);
  const started = useRef(false);
  useEffect(() => {
    if (!ready || revealed || !root.current || !world || started.current) return;
    started.current = true;
    const el = root.current;
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(el.querySelector(".pre__meta"), { opacity: 0, y: 10, duration: 0.4, ease: "power2.in" })
      .to(el.querySelectorAll(".pre__part:not(.pre__node)"), { opacity: 0, duration: 0.35 }, "<")
      .to(el.querySelector(".pre__node"), { scale: 90, duration: 1.0, ease: "power4.in", transformOrigin: "50% 50%" }, "<0.1")
      .add(() => {
        world.playIntro(2.6);
        setRevealed(true);
      })
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "+=0.05")
      .add(() => setShown(false));
  }, [ready, revealed, world, setRevealed]);
  if (!shown) return null;
  const p = (a: number, b: number) => Math.min(1, Math.max(0, (progress - a) / (b - a)));
  return (
    <div className="pre" ref={root} role="status" aria-live="polite" aria-label={`Loading the plant, ${pct} percent`}>
      <svg className="pre__mark" viewBox="-8 -8 48 48" aria-hidden="true">
        <path className="pre__part" d="M0 0H32V8H0Z" style={{ transform: `translate(${(1 - p(0, 0.35)) * -40}px, 0)`, opacity: p(0, 0.2) }} />
        <path className="pre__part" d="M12 12H20V32H12Z" style={{ transform: `translate(0, ${(1 - p(0.3, 0.68)) * 40}px)`, opacity: p(0.3, 0.45) }} />
        <path className="pre__part pre__node" d="M24 24H32V32H24Z" style={{ transform: `translate(${(1 - p(0.62, 0.98)) * 40}px, ${(1 - p(0.62, 0.98)) * 40}px)`, opacity: p(0.62, 0.75) }} />
      </svg>
      <div className="pre__meta">
        <span className="pre__pct">{String(pct).padStart(2, "0")}</span>
        <span className="pre__label">{label}</span>
      </div>
    </div>
  );
}

/* ======================================================================================
   Inspect overlay: caption, hints and a Close button while a machine is in the hand.
   ====================================================================================== */
export function InspectOverlay() {
  const { inspect, world } = useExperience();
  const close = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (inspect) {
      opener.current = document.activeElement as HTMLElement;
      close.current?.focus({ preventScroll: true });
      setStatus(`Inspecting ${inspect.title}. Arrow keys turn it, plus and minus move closer, Escape puts it back.`);
    } else if (opener.current) {
      const o = opener.current;
      opener.current = null;
      setTimeout(() => o.focus?.({ preventScroll: true }), 650);
      setStatus("Back on the plinth.");
    }
  }, [inspect]);
  return (
    <>
      <div className={`inspect ${inspect ? "is-on" : ""}`} role="dialog" aria-modal="true" aria-label={inspect ? `Inspecting ${inspect.title}` : "Inspect"} inert={!inspect}>
        <p className="inspect__title">{inspect?.title}</p>
        <p className="inspect__text">{inspect?.text}</p>
        <p className="inspect__hint">Drag to turn · Wheel or pinch to move closer</p>
        <button ref={close} type="button" className="cta cta--ghost" onClick={() => world?.closeInspect()} onKeyDown={(e) => e.key === "Tab" && e.preventDefault()}>
          <span>Put it back</span>
          <Icon name="close-circle" size={20} className="cta__icon" />
        </button>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
    </>
  );
}

/** a real button that lifts a machine into the hand (keyboard and screen-reader path) */
export function InspectButton({ id, title }: { id: string; title: string }) {
  const { world, mode } = useExperience();
  if (mode !== "world") return null;
  return (
    <button type="button" className="cta cta--ghost" data-magnetic onClick={() => world?.openInspect(id)}>
      <span>Inspect {title.replace(/^TAMS /, "")}</span>
      <Icon name="maximize-square" size={20} className="cta__icon" />
    </button>
  );
}
