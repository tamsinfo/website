import { Card, Check, Gear, Ground, Iso, Line, Pill } from "./kit";

/* Services + problems. Final state is drawn; data-in / data-loop add GSAP motion. */

const cloud = (x: number, y: number) =>
  `M${x - 46} ${y + 18}a22 22 0 0 1 6-43a30 30 0 0 1 56-8a24 24 0 0 1 32 26a18 18 0 0 1-4 35H${x - 40}a18 18 0 0 1-6-10z`;

export function SvcImplementation() {
  return (
    <>
      <Ground />
      <g data-in="rise">
        <Card x={36} y={92} w={176} h={158} tone="blue3" />
        {[124, 156, 188, 220].map((y) => (
          <line key={y} x1={50} y1={y} x2={198} y2={y} className="i-grid" />
        ))}
        {[80, 120, 160].map((x) => (
          <line key={x} x1={x} y1={106} x2={x} y2={236} className="i-grid" />
        ))}
        <path d="M60 222V150h56v36h64v-54" pathLength={1} className="i-bl" data-in="draw" data-d="0.2" />
        <circle cx={180} cy={132} r={6} className="i-blue" />
      </g>
      <Line d="M226 180h40m-10-10 10 10-10 10" kind="blue" data-in="fade" data-d="0.6" />
      <g data-in="pop" data-d="0.7">
        <Iso x={356} y={196} w={64} d={64} h={30} tone="mid" />
        <Iso x={356} y={160} w={64} d={64} h={30} tone="white" />
        <Iso x={356} y={124} w={64} d={64} h={30} tone="blue" />
      </g>
      <path d={cloud(366, 70)} className="i-s i-white" data-loop="float" data-amp="5" />
      <g data-in="rise" data-d="1">
        <text x={286} y={300} className="i-label">Go-live</text>
        <rect x={338} y={282} width={58} height={28} rx={14} className="i-blue" />
        <circle cx={381} cy={296} r={10} className="i-white" data-loop="slide" data-dx="-28" data-dur="1.6" />
      </g>
    </>
  );
}

export function SvcAms() {
  const ring = [0, 90, 180, 270];
  return (
    <>
      <Ground rx={150} />
      <circle cx={240} cy={178} r={112} className="i-soft" strokeDasharray="4 10" />
      <g data-loop="spin" data-o="240 178" data-dur="24">
        {ring.map((a) => {
          const r = (a * Math.PI) / 180;
          return <circle key={a} cx={240 + Math.cos(r) * 112} cy={178 + Math.sin(r) * 112} r={14} className="i-s i-blue3" />;
        })}
        <circle cx={240 + 112} cy={178} r={14} className="i-s i-blue" />
      </g>
      <g data-in="pop">
        <circle cx={240} cy={178} r={70} className="i-s i-white" />
        <circle cx={240} cy={178} r={58} className="i-soft" />
        <path d="M240 120a58 58 0 0 1 50 87" className="i-bl i-thick" pathLength={1} data-in="draw" data-d="0.3" />
        <line x1={240} y1={178} x2={240} y2={136} className="i-s" data-loop="spin" data-o="240 178" data-dur="8" />
        <circle cx={240} cy={178} r={6} className="i-blue" />
      </g>
      <Pill x={204} y={262} text="SLA timer" tone="blue" w={72} />
    </>
  );
}

export function SvcBuild() {
  return (
    <>
      <Ground rx={160} />
      <Iso x={240} y={118} w={90} d={90} h={78} tone="white" data-in="pop" />
      <text x={204} y={258} className="i-label i-label-muted">Clean core</text>
      <g data-loop="slide" data-dx="-14" data-dy="-8" data-dur="1.8">
        <Iso x={142} y={152} w={40} d={40} h={30} tone="blue" />
      </g>
      <g data-loop="slide" data-dx="14" data-dy="-8" data-dur="1.8" data-d="0.6">
        <Iso x={338} y={152} w={40} d={40} h={30} tone="blue" />
      </g>
      <g data-loop="slide" data-dy="-16" data-dur="1.8" data-d="1.2">
        <Iso x={240} y={64} w={40} d={40} h={26} tone="blue" />
      </g>
    </>
  );
}

export function SvcLicense() {
  const mods = [0, 1, 2, 3, 4, 5];
  const chosen = new Set([0, 2, 3]);
  return (
    <>
      <Ground rx={180} />
      {mods.map((i) => {
        const x = 70 + (i % 3) * 120;
        const y = 70 + Math.floor(i / 3) * 104;
        const on = chosen.has(i);
        return (
          <g key={i} data-in="rise" data-d={String(i * 0.08)}>
            <Card x={x} y={y} w={100} h={84} tone={on ? "blue3" : "white"} />
            <rect x={x + 16} y={y + 18} width={30} height={30} rx={8} className={on ? "i-blue" : "i-mid"} />
            <line x1={x + 16} y1={y + 62} x2={x + 76} y2={y + 62} className="i-soft" />
            {on ? <Check x={x + 82} y={y + 18} r={11} data-in="pop" data-d={String(0.5 + i * 0.12)} /> : null}
          </g>
        );
      })}
      <Pill x={176} y={286} text="3 of 6 modules" tone="white" />
    </>
  );
}

/* ---------------- problems ---------------- */

export function PrbAgility() {
  return (
    <>
      <Ground rx={190} />
      <g opacity={0.9}>
        <rect x={52} y={120} width={64} height={64} rx={10} className="i-s i-mid" />
        <rect x={108} y={166} width={52} height={52} rx={10} className="i-s i-mid" />
        <rect x={70} y={210} width={44} height={44} rx={10} className="i-s i-mid" />
        <rect x={74} y={86} width={22} height={18} rx={4} className="i-s i-white" />
        <path d="M78 86v-8a7 7 0 0 1 14 0v8" className="i-s" fill="none" />
      </g>
      <text x={62} y={290} className="i-label i-label-muted">Rigid</text>
      <line x1={204} y1={100} x2={204} y2={270} className="i-soft" strokeDasharray="4 8" />
      <Gear cx={300} cy={150} r={50} n={12} tone="blue3" data-loop="spin" data-o="300 150" data-dur="10" />
      <Gear cx={376} cy={214} r={36} n={9} tone="blue" data-loop="spin" data-o="376 214" data-dur="7.5" data-dir="-1" />
      <Gear cx={292} cy={244} r={26} n={8} tone="white" data-loop="spin" data-o="292 244" data-dur="5.4" data-dir="-1" />
      <text x={318} y={290} className="i-label">Flexible</text>
    </>
  );
}

export function PrbDisconnected() {
  const link = (x: number, cls = "i-white") => <rect x={x} y={160} width={92} height={44} rx={22} className={`i-s ${cls}`} />;
  return (
    <>
      <Ground />
      <g data-loop="swing" data-o="146 182" data-a0="-4" data-a1="3" data-dur="2.6">
        {link(38)}
        {link(100)}
      </g>
      <g data-loop="swing" data-o="334 182" data-a0="4" data-a1="-3" data-dur="2.6">
        {link(288)}
        {link(350)}
      </g>
      <rect x={194} y={160} width={92} height={44} rx={22} className="i-bl i-thick" strokeDasharray="6 7" data-loop="flow" data-dist="26" />
      <path d="M228 120l8 16m16-20-2 18m22-10-12 14" className="i-bl" data-loop="blink" />
      <Pill x={176} y={238} text="One data model" tone="blue" w={128} />
    </>
  );
}

export function PrbTransparency() {
  return (
    <>
      <Ground rx={190} />
      <path d="M48 186H432" className="i-soft i-thick" />
      {[70, 150, 230, 310, 390].map((x, i) => (
        <rect key={x} x={x - 22} y={164} width={44} height={44} rx={10} className={`i-s ${i === 2 ? "i-blue" : "i-white"}`} />
      ))}
      <g data-loop="slide" data-dx="-160" data-dur="3.2">
        <circle cx={310} cy={168} r={58} className="i-lens" />
        <circle cx={310} cy={168} r={58} className="i-s i-thick" fill="none" />
        <line x1={352} y1={210} x2={392} y2={252} className="i-s i-xthick" />
      </g>
      <Pill x={162} y={264} text="Every step visible" tone="white" />
    </>
  );
}

export function PrbSecurity() {
  return (
    <>
      <Ground rx={140} />
      <path d="M240 46l104 36v74c0 70-46 116-104 140C182 272 136 226 136 156V82z" className="i-s i-blue3" data-in="pop" />
      <path d="M240 46l104 36v74c0 70-46 116-104 140C182 272 136 226 136 156V82z" className="i-bl i-thick" fill="none" pathLength={1} data-in="draw" data-d="0.2" />
      <g data-in="rise" data-d="0.4">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={196} y={118 + i * 34} width={88} height={26} rx={8} className="i-s i-white" />
            <circle cx={212} cy={131 + i * 34} r={4} className="i-blue" />
          </g>
        ))}
      </g>
      <g data-loop="float" data-amp="4">
        <rect x={300} y={206} width={52} height={42} rx={10} className="i-s i-blue" />
        <path d="M312 206v-12a14 14 0 0 1 28 0v12" className="i-s i-thick" fill="none" />
        <circle cx={326} cy={226} r={5} className="i-white" />
      </g>
      <g data-loop="spin" data-o="240 170" data-dur="16">
        <circle cx={240} cy={40} r={6} className="i-blue" />
      </g>
    </>
  );
}

export function PrbOutgrow() {
  return (
    <>
      <Ground rx={200} />
      <path data-pid="o-spill" d="M150 112C190 70 250 74 290 128" className="i-soft" strokeDasharray="3 8" />
      <path d="M52 130h112v120a12 12 0 0 1-12 12H64a12 12 0 0 1-12-12z" className="i-s i-white" />
      {[0, 1, 2].map((r) =>
        [0, 1].map((c) => <rect key={`${r}${c}`} x={64 + c * 46} y={210 - r * 40} width={40} height={34} rx={8} className="i-s i-mid" />),
      )}
      <rect x={86} y={96} width={40} height={34} rx={8} className="i-s i-mid" />
      <path d="M256 104h176v150a14 14 0 0 1-14 14H270a14 14 0 0 1-14-14z" className="i-s i-blue3" data-in="pop" />
      {[0, 1, 2, 3].map((c) => (
        <rect key={c} x={270 + c * 40} y={228} width={34} height={28} rx={8} className="i-s i-white" />
      ))}
      <rect x={270} y={194} width={34} height={28} rx={8} className="i-s i-blue" />
      <rect x={-17} y={-14} width={34} height={28} rx={8} transform="translate(222 86)" className="i-s i-blue" data-loop="path" data-path="[data-pid='o-spill']" data-dur="2.6" />
    </>
  );
}
