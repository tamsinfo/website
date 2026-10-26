import { useEffect, useId, useLayoutEffect, useRef, type JSX } from "react";
import { gsap } from "gsap";
import { useMotion } from "../motion/MotionProvider";
import { Defs, UidContext } from "./kit";
import { buildIntro, buildLoops } from "./motion";
import * as S from "./services";
import * as P from "./products";
import * as L from "./solutions";
import * as M from "./misc";

const REGISTRY = {
  "svc-implementation": [S.SvcImplementation, "A blueprint turning into a cloud-hosted structure with a go-live switch"],
  "svc-ams": [S.SvcAms, "A continuous-support wheel around an SLA timer"],
  "svc-build": [S.SvcBuild, "Modular blocks snapping onto a stable core block"],
  "svc-license": [S.SvcLicense, "Three of six module blocks selected"],
  "prb-agility": [S.PrbAgility, "A rigid, locked set of square gears beside a turning, flexible gear train"],
  "prb-disconnected": [S.PrbDisconnected, "A broken chain bridged by one blue link"],
  "prb-transparency": [S.PrbTransparency, "A magnifying lens passing over a flow of process steps"],
  "prb-security": [S.PrbSecurity, "A shield and padlock around a system"],
  "prb-outgrow": [S.PrbOutgrow, "A small, overflowing container emptying into a larger one"],
  gate: [P.Gate, "A truck at a raised boom barrier, its plate framed by a scanner, with three check-in ticks"],
  exim: [P.Exim, "A container travelling a route between two ports, beside a stamped document stack"],
  signature: [P.Signature, "A document being signed, with a verified seal"],
  production: [P.Production, "Work pieces moving along a production line past four stage markers"],
  vendor: [P.Vendor, "Six supplier nodes around a central portal hub, with order tokens moving along the links"],
  factory: [P.Factory, "Three machines with sensor pulses feeding a data line to SAP"],
  ai: [P.Ai, "An analytics panel with a trend line and one highlighted anomaly, tagged In production"],
  "sol-rise": [L.SolRise, "A system block rising into a cloud"],
  "sol-grow": [L.SolGrow, "Growing bars with a sprout"],
  "sol-btp": [L.SolBtp, "A layered platform with an extension block on top"],
  "sol-ai": [L.SolAi, "An intelligent core with orbiting nodes"],
  "sol-industry": [L.SolIndustry, "A factory roofline with turning gears"],
  "sol-analytics": [L.SolAnalytics, "A dashboard with bars and a ring chart"],
  "sol-integration": [L.SolIntegration, "Four systems connected to one hub"],
  "sol-automation": [L.SolAutomation, "A task moving through a three-step flow to a check"],
  "ind-automotive": [L.IndAutomotive, "A car body on an assembly line beside a robot arm"],
  "ind-metals": [L.IndMetals, "A steel coil and a rolling mill"],
  "ind-mill": [L.IndMill, "Stacked rolls and a roll unwinding"],
  "ind-pharma": [L.IndPharma, "Vials moving along a cleanroom line"],
  "ind-fabrication": [L.IndFabrication, "A steel beam being welded"],
  "ind-durables": [L.IndDurables, "Appliances moving along an assembly line"],
  "story-problem": [M.StoryProblem, "A tangled line between two points"],
  "story-how": [M.StoryHow, "Gears driving a flow into a system"],
  "story-outcome": [M.StoryOutcome, "A rising line ending in a check"],
  "story-start": [M.StoryStart, "A calendar with one date checked"],
  contact: [M.ContactArt, "A letter rising from an envelope beside a chat bubble"],
  notfound: [M.NotFoundArt, "An unplugged cable"],
  loading: [M.LoadingArt, "Loading"],
} satisfies Record<string, [() => JSX.Element, string]>;

export type IllustrationId = keyof typeof REGISTRY;
export const illustrationLabel = (id: IllustrationId) => REGISTRY[id][1];

export function Illustration({
  id,
  active = true,
  className,
  decorative,
}: {
  id: IllustrationId;
  /** intro replays whenever this turns true (presentation slides) */
  active?: boolean;
  className?: string;
  decorative?: boolean;
}) {
  const [Scene, label] = REGISTRY[id];
  const uid = `i${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const { reduced } = useMotion();

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg || reduced) return;
    let loops: gsap.core.Animation[] = [];
    const ctx = gsap.context(() => {
      intro.current = buildIntro(svg);
      loops = buildLoops(svg);
      loops.forEach((l) => l.pause());
    }, svg);
    const io = new IntersectionObserver(([e]) => loops.forEach((l) => (e.isIntersecting ? l.play() : l.pause())), { rootMargin: "80px" });
    io.observe(svg);
    return () => {
      io.disconnect();
      ctx.revert();
      intro.current = null;
    };
  }, [reduced, id]);

  useEffect(() => {
    if (active && intro.current) intro.current.restart();
  }, [active]);

  return (
    <svg
      ref={ref}
      className={`ill ${className ?? ""}`}
      viewBox="0 0 480 360"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <UidContext.Provider value={uid}>
        <Defs />
        <Scene />
      </UidContext.Provider>
    </svg>
  );
}
