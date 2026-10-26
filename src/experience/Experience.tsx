import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useMotion } from "../motion/MotionProvider";
import type { InspectInfo, World } from "./World";

/* Owns the one persistent canvas and the World. Modes:
   - "world":  WebGL available and motion allowed → the full experience
   - "static": reduced motion or no WebGL → readable DOM with authored SVG illustrations */

type Mode = "world" | "static";
type Ctx = {
  mode: Mode;
  world: World | null;
  ready: boolean;
  revealed: boolean;
  progress: number;
  label: string;
  inspect: InspectInfo;
  setRevealed: (v: boolean) => void;
};
const ExperienceContext = createContext<Ctx>({ mode: "static", world: null, ready: false, revealed: true, progress: 1, label: "", inspect: null, setRevealed: () => {} });
export const useExperience = () => useContext(ExperienceContext);

function webgl2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
let building: Promise<World> | null = null;
let progressSink: ((p: number, l: string) => void) | null = null;
const DISPLAY_FONT = "'Big Shoulders Display Variable', 'Big Shoulders Display', sans-serif";

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const { reduced, lenis } = useMotion();
  const [mode] = useState<Mode>(() => (!reduced && webgl2() ? "world" : "static"));
  const canvas = useRef<HTMLCanvasElement>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [progress, setProgress] = useState(mode === "world" ? 0 : 1);
  const [label, setLabel] = useState("Loading");
  const [revealed, setRevealed] = useState(mode !== "world");
  const [inspect, setInspect] = useState<InspectInfo>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  // build the world once, behind the preloader (a module-level promise survives StrictMode remounts)
  useEffect(() => {
    if (mode !== "world" || !canvas.current) return;
    let alive = true;
    building ??= (async () => {
      await document.fonts.load(`800 120px ${DISPLAY_FONT}`);
      await document.fonts.ready;
      const { createWorld } = await import("./World");
      return createWorld(canvas.current!, { displayFont: DISPLAY_FONT, onProgress: (p, l) => progressSink?.(p, l) });
    })();
    progressSink = (p, l) => {
      if (!alive) return;
      setProgress(p);
      setLabel(l);
    };
    building
      .then((w) => {
        if (!alive) return;
        setProgress(1);
        setLabel("Ready");
        setWorld(w);
        if (import.meta.env.DEV) (window as unknown as { __world: World }).__world = w;
      })
      .catch((e) => {
        console.error(e);
        document.documentElement.dataset.mode = "static";
        setRevealed(true);
      });
    return () => {
      alive = false;
    };
  }, [mode]);

  useEffect(() => void world?.setReduced(reduced), [world, reduced]);
  useEffect(() => {
    if (!world) return;
    const off = world.onInspect((i) => setInspect(i));
    return () => void off();
  }, [world]);
  useEffect(() => {
    if (!lenis || !world) return;
    const on = (l: { velocity: number }) => world.setVelocity(l.velocity);
    lenis.on("scroll", on);
    return () => lenis.off("scroll", on);
  }, [lenis, world]);
  // the page cannot scroll while a machine is in the hand
  useEffect(() => {
    if (inspect) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle("has-inspect", !!inspect);
    const main = document.getElementById("main");
    if (main) main.inert = !!inspect;
  }, [inspect, lenis]);
  // nor while the preloader is up
  useEffect(() => {
    if (!revealed) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle("is-loading", !revealed);
  }, [revealed, lenis]);

  // liquid route transitions: cover → navigate → the new room → uncover
  const busy = useRef(false);
  useEffect(() => {
    if (mode !== "world" || !world) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same-page anchors scroll normally
      e.preventDefault();
      if (busy.current) return;
      busy.current = true;
      document.documentElement.classList.add("is-leaving");
      world.cover().then(() => {
        navigate(url.pathname + url.search + url.hash);
        document.documentElement.classList.remove("is-leaving");
        setTimeout(() => (busy.current = false), 900);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [mode, world, navigate]);

  const value: Ctx = { mode, world, ready: !!world, revealed, progress, label, inspect, setRevealed };
  return (
    <ExperienceContext.Provider value={value}>
      {mode === "world" ? <canvas ref={canvas} className="world-canvas" aria-hidden="true" /> : null}
      {children}
    </ExperienceContext.Provider>
  );
}

/** Every page calls this once: its [data-key] sections become the camera path for this room. */
export function useRoom(dep?: unknown) {
  const { world, mode } = useExperience();
  const { lenis } = useMotion();
  const done = useCallback(() => {
    if (!world) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main [data-key]"));
    world.setRoute(sections);
    requestAnimationFrame(() => world.uncover());
  }, [world]);
  useLayoutEffect(() => {
    if (mode !== "world") return;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const t = requestAnimationFrame(done);
    return () => cancelAnimationFrame(t);
  }, [done, mode, lenis, dep]);
}
