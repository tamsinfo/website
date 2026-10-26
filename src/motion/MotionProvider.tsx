import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 0.85 });

type Motion = { reduced: boolean; lenis: Lenis | null };
const MotionContext = createContext<Motion>({ reduced: true, lenis: null });

export const useMotion = () => useContext(MotionContext);

const query = "(prefers-reduced-motion: reduce)";

/** Lenis is the only smooth-scroll engine. It is driven by the GSAP ticker so
 *  ScrollTrigger, Lenis and the WebGL world share a single animation frame. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reduced);
    if (reduced) {
      setLenis(null);
      return;
    }
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9, anchors: { offset: -72 } });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <MotionContext.Provider value={{ reduced, lenis }}>{children}</MotionContext.Provider>;
}
