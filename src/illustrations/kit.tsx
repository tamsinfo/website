import { createContext, useContext, type ReactNode, type SVGProps } from "react";

/* Illustration kit — flat-soft: flat fills plus ONE subtle surface gradient, 2px round
   strokes in --ill-stroke, the UI radii (10–16 units), a soft ground shadow. Canvas 480×360.
   Colour classes live in styles/illustrations.css so SVG and UI share tokens. */

export const UidContext = createContext("ill");
export const useUid = () => useContext(UidContext);

export function Defs() {
  const id = useUid();
  return (
    <defs>
      <linearGradient id={`${id}-surf`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e9eff8" />
      </linearGradient>
    </defs>
  );
}

/** fill for the main surfaces: the kit's one gradient */
export const useSurf = () => `url(#${useUid()}-surf)`;

/** pass-through props: motion data attributes and a few presentation hints */
type P = { [k: `data-${string}`]: string | undefined } & { className?: string; transform?: string; opacity?: number; strokeDasharray?: string; children?: ReactNode };

export const Ground = ({ cx = 240, cy = 312, rx = 170, ry = 16 }: { cx?: number; cy?: number; rx?: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="i-shadow" />
);

export function Card({ x, y, w, h, r = 14, tone = "surf", ...rest }: { x: number; y: number; w: number; h: number; r?: number; tone?: "surf" | "white" | "light" | "mid" | "blue" | "blue3" } & P) {
  const surf = useSurf();
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      style={tone === "surf" ? { fill: surf } : undefined}
      className={`i-s ${tone !== "surf" ? `i-${tone}` : ""}`}
      {...(rest as SVGProps<SVGRectElement>)}
    />
  );
}

export const Line = ({ d, kind = "s", ...rest }: { d: string; kind?: "s" | "blue" | "soft" | "dash" } & P) => (
  <path d={d} className={`i-${kind === "s" ? "s" : kind === "blue" ? "bl" : kind}`} fill="none" {...(rest as SVGProps<SVGPathElement>)} />
);

/** blue check badge */
export const Check = ({ x, y, r = 13, ...rest }: { x: number; y: number; r?: number } & P) => (
  <g {...(rest as SVGProps<SVGGElement>)}>
    <circle cx={x} cy={y} r={r} className="i-blue" />
    <path d={`M${x - r * 0.42} ${y + 0.5} l${r * 0.3} ${r * 0.3} l${r * 0.55} -${r * 0.62}`} className="i-check" />
  </g>
);

/** gear with n teeth, as a single path */
export function gearPath(cx: number, cy: number, r: number, n = 10, depth = 0.18) {
  const pts: string[] = [];
  const steps = n * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * (1 - depth);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

export const Gear = ({ cx, cy, r, n = 10, tone = "light", ...rest }: { cx: number; cy: number; r: number; n?: number; tone?: string } & P) => (
  <g {...(rest as SVGProps<SVGGElement>)}>
    <path d={gearPath(cx, cy, r, n)} className={`i-s i-${tone}`} strokeLinejoin="round" />
    <circle cx={cx} cy={cy} r={r * 0.32} className="i-s i-white" />
  </g>
);

/** isometric block: top, left and right faces. (x,y) is the top vertex of the top face. */
export function Iso({ x, y, w = 60, d = 60, h = 40, tone = "white", ...rest }: { x: number; y: number; w?: number; d?: number; h?: number; tone?: "white" | "blue" | "mid" | "light" } & P) {
  const c = 0.5;
  const top = `M${x} ${y} L${x + w * 0.866} ${y + w * c} L${x + w * 0.866 - d * 0.866} ${y + w * c + d * c} L${x - d * 0.866} ${y + d * c} Z`;
  const left = `M${x - d * 0.866} ${y + d * c} L${x + w * 0.866 - d * 0.866} ${y + w * c + d * c} L${x + w * 0.866 - d * 0.866} ${y + w * c + d * c + h} L${x - d * 0.866} ${y + d * c + h} Z`;
  const right = `M${x + w * 0.866 - d * 0.866} ${y + w * c + d * c} L${x + w * 0.866} ${y + w * c} L${x + w * 0.866} ${y + w * c + h} L${x + w * 0.866 - d * 0.866} ${y + w * c + d * c + h} Z`;
  return (
    <g {...(rest as SVGProps<SVGGElement>)}>
      <path d={left} className={`i-s i-iso-l-${tone}`} />
      <path d={right} className={`i-s i-iso-r-${tone}`} />
      <path d={top} className={`i-s i-iso-t-${tone}`} />
    </g>
  );
}

/** small sentence-case annotation pill */
export const Pill = ({ x, y, text, tone = "white", w }: { x: number; y: number; text: string; tone?: "white" | "blue" | "amber"; w?: number }) => {
  const width = w ?? text.length * 6.6 + 22;
  return (
    <g>
      <rect x={x} y={y} width={width} height={24} rx={12} className={`i-pill i-pill-${tone}`} />
      <text x={x + width / 2} y={y + 16} textAnchor="middle" className={`i-label i-label-${tone}`}>
        {text}
      </text>
    </g>
  );
};

/** document with text lines */
export const Doc = ({ x, y, w = 120, h = 150, lines = 5, ...rest }: { x: number; y: number; w?: number; h?: number; lines?: number } & P) => {
  const surf = useSurf();
  return (
    <g {...(rest as SVGProps<SVGGElement>)}>
      <path d={`M${x + 12} ${y}H${x + w - 26}L${x + w} ${y + 26}V${y + h - 12}Q${x + w} ${y + h} ${x + w - 12} ${y + h}H${x + 12}Q${x} ${y + h} ${x} ${y + h - 12}V${y + 12}Q${x} ${y} ${x + 12} ${y}Z`} style={{ fill: surf }} className="i-s" />
      <path d={`M${x + w - 26} ${y}V${y + 26}H${x + w}`} className="i-s" fill="none" />
      {Array.from({ length: lines }, (_, i) => (
        <line key={i} x1={x + 18} y1={y + 40 + i * 16} x2={x + (i % 2 ? w - 40 : w - 22)} y2={y + 40 + i * 16} className="i-soft" />
      ))}
    </g>
  );
};
