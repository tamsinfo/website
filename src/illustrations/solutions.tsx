import { Card, Check, Gear, Ground, Iso, Pill } from "./kit";

/* Eight solution motifs + six industry scenes. One simple idea each. */

const cloudPath = (x: number, y: number, s = 1) =>
  `M${x - 70 * s} ${y + 26 * s}a32 32 0 0 1 8-62a44 44 0 0 1 82-12a36 36 0 0 1 48 38a26 26 0 0 1-6 50H${x - 60 * s}a26 26 0 0 1-10-14z`;

export function SolRise() {
  return (
    <>
      <Ground rx={150} />
      <path d={cloudPath(248, 92)} className="i-s i-white" data-loop="float" data-amp="5" />
      <g data-loop="slide" data-dy="-10" data-dur="2.4">
        <Iso x={240} y={170} w={70} d={70} h={46} tone="blue" />
        <path d="M240 150v-26m-12 12 12-12 12 12" className="i-bl i-thick" />
      </g>
      <Iso x={240} y={222} w={96} d={96} h={22} tone="mid" />
    </>
  );
}

export function SolGrow() {
  const bars = [60, 96, 132, 172];
  return (
    <>
      <Ground rx={170} />
      {bars.map((h, i) => (
        <rect key={i} x={110 + i * 70} y={280 - h} width={46} height={h} rx={10} className={`i-s ${i === 3 ? "i-blue" : "i-white"}`} data-in="rise" data-d={String(i * 0.12)} />
      ))}
      <g data-loop="swing" data-o="343 104" data-a0="-6" data-a1="6" data-dur="2.6">
        <path d="M343 108V66" className="i-s i-thick" />
        <path d="M343 82c-22 0-32-14-32-30 20 0 32 12 32 30zM343 74c0-20 12-32 32-32 0 18-12 32-32 32z" className="i-s i-blue3" />
      </g>
    </>
  );
}

export function SolBtp() {
  return (
    <>
      <Ground rx={170} />
      <Iso x={240} y={212} w={130} d={130} h={16} tone="mid" />
      <Iso x={240} y={176} w={130} d={130} h={16} tone="light" />
      <Iso x={240} y={140} w={130} d={130} h={16} tone="white" />
      <g data-loop="slide" data-dy="-14" data-dur="2">
        <Iso x={240} y={96} w={50} d={50} h={28} tone="blue" />
      </g>
      <Pill x={330} y={84} text="Extension" tone="white" />
    </>
  );
}

export function SolAi() {
  return (
    <>
      <Ground rx={130} />
      <circle cx={240} cy={176} r={104} className="i-soft" strokeDasharray="3 9" />
      <g data-loop="spin" data-o="240 176" data-dur="18">
        {[0, 72, 144, 216, 288].map((a) => {
          const r = (a * Math.PI) / 180;
          const x = 240 + Math.cos(r) * 104;
          const y = 176 + Math.sin(r) * 104;
          return (
            <g key={a}>
              <line x1={240} y1={176} x2={x} y2={y} className="i-soft" />
              <circle cx={x} cy={y} r={12} className={`i-s ${a === 0 ? "i-blue" : "i-white"}`} />
            </g>
          );
        })}
      </g>
      <rect x={198} y={134} width={84} height={84} rx={22} className="i-s i-blue" data-in="pop" />
      <path d="M222 176h8l6-14 8 28 6-14h8" className="i-check i-thick" />
    </>
  );
}

export function SolIndustry() {
  return (
    <>
      <Ground rx={190} />
      <path d="M70 290V180l70-40v40l70-40v40l70-40v150z" className="i-s i-white" data-in="rise" />
      <rect x={92} y={230} width={36} height={60} rx={6} className="i-s i-blue3" />
      <Gear cx={352} cy={180} r={62} n={12} tone="blue" data-loop="spin" data-o="352 180" data-dur="12" />
      <Gear cx={286} cy={110} r={30} n={8} tone="white" data-loop="spin" data-o="286 110" data-dur="6" data-dir="-1" />
    </>
  );
}

export function SolAnalytics() {
  return (
    <>
      <Ground rx={200} />
      <Card x={48} y={60} w={384} h={228} tone="white" />
      {[70, 110, 90, 140, 120].map((h, i) => (
        <rect key={i} x={80 + i * 38} y={250 - h} width={24} height={h} rx={6} className={`i-s ${i === 3 ? "i-blue" : "i-blue3"}`} data-in="rise" data-d={String(i * 0.08)} />
      ))}
      <circle cx={350} cy={170} r={50} className="i-s i-light" />
      <path d="M350 120a50 50 0 0 1 47 66" className="i-bl i-xthick" data-loop="spin" data-o="350 170" data-dur="9" />
      <circle cx={350} cy={170} r={30} className="i-s i-white" />
      <line x1={80} y1={84} x2={190} y2={84} className="i-soft i-thick" />
    </>
  );
}

export function SolIntegration() {
  const ends = [
    [80, 96],
    [400, 96],
    [80, 256],
    [400, 256],
  ];
  return (
    <>
      <Ground rx={200} />
      {ends.map(([x, y], i) => (
        <g key={i}>
          <path data-pid={`i-l${i}`} d={`M${x} ${y}C${(x + 240) / 2} ${y} ${(x + 240) / 2} 176 240 176`} className="i-soft i-thick" />
          <rect x={x - 30} y={y - 22} width={60} height={44} rx={12} className="i-s i-white" />
          <circle cx={-6} cy={0} r={6} transform={`translate(${(x + 240) / 2} ${(y + 176) / 2})`} className="i-blue" data-loop="path" data-path={`[data-pid='i-l${i}']`} data-dur="2.4" data-d={String(i * 0.6)} />
        </g>
      ))}
      <circle cx={240} cy={176} r={42} className="i-s i-blue" data-in="pop" />
      <path d="M226 176h28m-10-10 10 10-10 10" className="i-check i-thick" />
    </>
  );
}

export function SolAutomation() {
  return (
    <>
      <Ground rx={200} />
      <path data-pid="au-flow" d="M98 176H382" className="i-soft i-thick" />
      {[98, 240].map((x) => (
        <rect key={x} x={x - 44} y={140} width={88} height={72} rx={16} className="i-s i-white" />
      ))}
      <rect x={338} y={140} width={88} height={72} rx={16} className="i-s i-blue3" />
      <Check x={382} y={176} r={18} data-in="pop" data-d="0.5" />
      <rect x={-9} y={-9} width={18} height={18} rx={5} transform="translate(170 176)" className="i-blue" data-loop="path" data-path="[data-pid='au-flow']" data-dur="3" />
      <Pill x={176} y={238} text="No chasing" tone="white" />
    </>
  );
}

/* ---------------- industries ---------------- */

export function IndAutomotive() {
  return (
    <>
      <Ground rx={210} />
      <rect x={30} y={262} width={420} height={18} rx={9} className="i-s i-mid" />
      <g data-loop="travel" data-dx="40" data-dur="3">
        <path d="M120 262v-26q0-10 10-12l40-8 30-28h96l34 30 40 8q10 2 10 12v24z" className="i-s i-white" />
        <path d="M206 200h40v24h-62zM256 200h36l24 24h-60z" className="i-s i-blue3" />
        <circle cx={172} cy={264} r={18} className="i-s i-mid" />
        <circle cx={330} cy={264} r={18} className="i-s i-mid" />
      </g>
      <g data-loop="swing" data-o="420 120" data-a0="-14" data-a1="10" data-dur="2.4">
        <path d="M420 262V120" className="i-s i-xthick" />
        <path d="M420 120l-60 34" className="i-s i-xthick" />
        <circle cx={420} cy={120} r={12} className="i-s i-blue" />
        <circle cx={360} cy={154} r={9} className="i-s i-white" />
      </g>
    </>
  );
}

export function IndMetals() {
  return (
    <>
      <Ground rx={210} />
      <g data-loop="spin" data-o="120 200" data-dur="10">
        {[64, 50, 36, 22].map((r) => (
          <circle key={r} cx={120} cy={200} r={r} className="i-s i-white" />
        ))}
      </g>
      <circle cx={120} cy={200} r={10} className="i-blue" />
      <path d="M184 222H440" className="i-s i-xthick" />
      <path d="M184 222H440" className="i-dash-light" data-loop="flow" data-dist="24" data-dur="1" />
      {[296, 380].map((x) => (
        <g key={x}>
          <circle cx={x} cy={196} r={24} className="i-s i-mid" data-loop="spin" data-o={`${x} 196`} data-dur="3" />
          <circle cx={x} cy={248} r={24} className="i-s i-mid" />
          <path d={`M${x - 24} 196h48`} className="i-s" />
        </g>
      ))}
      <rect x={260} y={140} width={156} height={20} rx={8} className="i-s i-blue" />
    </>
  );
}

export function IndMill() {
  return (
    <>
      <Ground rx={200} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx={92 + i * 62} cy={252} rx={30} ry={30} className="i-s i-white" />
          <circle cx={92 + i * 62} cy={252} r={10} className="i-s i-mid" />
        </g>
      ))}
      <ellipse cx={154} cy={196} rx={30} ry={30} className="i-s i-blue3" />
      <circle cx={154} cy={196} r={10} className="i-s i-white" />
      <g>
        <circle cx={330} cy={150} r={52} className="i-s i-white" data-loop="spin" data-o="330 150" data-dur="8" strokeDasharray="20 6" />
        <circle cx={330} cy={150} r={16} className="i-s i-blue" />
        <path d="M330 202h110v80H300" className="i-s i-light" />
        <path d="M330 202h110" className="i-bl i-thick" />
      </g>
    </>
  );
}

export function IndPharma() {
  return (
    <>
      <Ground rx={210} />
      <Card x={44} y={72} w={392} h={200} tone="light" />
      <rect x={60} y={232} width={360} height={14} rx={7} className="i-s i-mid" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} data-loop="travel" data-dx="70" data-dur="2.6">
          <rect x={80 + i * 70} y={160} width={34} height={72} rx={10} className="i-s i-white" />
          <rect x={80 + i * 70} y={148} width={34} height={18} rx={5} className="i-s i-blue" />
          <rect x={86 + i * 70} y={196} width={22} height={28} rx={4} className="i-blue3" />
        </g>
      ))}
      <Pill x={64} y={92} text="Batch released" tone="blue" w={124} />
    </>
  );
}

export function IndFabrication() {
  return (
    <>
      <Ground rx={200} />
      <path d="M60 180h300v20H222v52h138v20H60v-20h138v-52H60z" className="i-s i-white" />
      <path d="M380 124l40 40-24 24-40-40z" className="i-s i-blue" />
      <path d="M356 148l-24 24" className="i-s i-xthick" />
      <g data-loop="blink" data-dur="0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M330 174l${-14 - i * 6} ${-20 + i * 10}`} className="i-bl i-thick" />
        ))}
      </g>
      <circle cx={330} cy={174} r={8} className="i-blue" />
    </>
  );
}

export function IndDurables() {
  return (
    <>
      <Ground rx={210} />
      <rect x={30} y={266} width={420} height={16} rx={8} className="i-s i-mid" />
      <g data-loop="travel" data-dx="30" data-dur="2.4">
        <rect x={70} y={110} width={96} height={156} rx={14} className="i-s i-white" />
        <line x1={70} y1={164} x2={166} y2={164} className="i-s" />
        <line x1={152} y1={124} x2={152} y2={150} className="i-s i-thick" />
        <rect x={204} y={150} width={116} height={116} rx={16} className="i-s i-white" />
        <circle cx={262} cy={214} r={34} className="i-s i-blue3" />
        <circle cx={262} cy={214} r={20} className="i-s i-white" data-loop="spin" data-o="262 214" data-dur="2" strokeDasharray="10 6" />
        <rect x={352} y={176} width={84} height={90} rx={14} className="i-s i-blue" />
      </g>
    </>
  );
}
