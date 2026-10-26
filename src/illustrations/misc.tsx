import { Card, Check, Gear, Ground, Pill } from "./kit";

/* Generic story motifs (detail-page slides) + contact, 404 and loading scenes. */

export function StoryProblem() {
  return (
    <>
      <Ground rx={180} />
      <path d="M60 180c60-90 100 90 160 0s110 70 70 70-80-160-30-110 120 40 160 10" className="i-s i-thick" fill="none" />
      <circle cx={60} cy={180} r={12} className="i-s i-white" />
      <circle cx={420} cy={150} r={12} className="i-s i-mid" />
      <circle cx={246} cy={168} r={22} className="i-bl" fill="none" data-loop="pulse" />
      <Pill x={160} y={262} text="Where it breaks" tone="white" />
    </>
  );
}

export function StoryHow() {
  return (
    <>
      <Ground rx={190} />
      <Gear cx={170} cy={170} r={64} n={12} tone="blue3" data-loop="spin" data-o="170 170" data-dur="12" />
      <Gear cx={268} cy={220} r={40} n={9} tone="white" data-loop="spin" data-o="268 220" data-dur="7.5" data-dir="-1" />
      <path d="M318 150h110" className="i-bl i-thick" />
      <path d="M318 150h110" className="i-dash-light" data-loop="flow" />
      <rect x={360} y={176} width={70} height={56} rx={14} className="i-s i-blue" />
    </>
  );
}

export function StoryOutcome() {
  return (
    <>
      <Ground rx={190} />
      <Card x={60} y={70} w={360} h={210} tone="white" />
      <path d="M90 240l70-40 60 20 70-70 90-40" className="i-bl i-xthick" pathLength={1} data-in="draw" />
      <Check x={380} y={110} r={18} data-in="pop" data-d="0.9" />
      <path d="M90 250H390" className="i-soft" />
    </>
  );
}

export function StoryStart() {
  return (
    <>
      <Ground rx={170} />
      <Card x={110} y={70} w={260} h={210} tone="white" />
      <rect x={110} y={70} width={260} height={46} rx={14} className="i-s i-blue" />
      {[148, 216, 284].map((x) => (
        <line key={x} x1={x} y1={56} x2={x} y2={86} className="i-s i-xthick" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={134 + (i % 4) * 56} y={134 + Math.floor(i / 4) * 44} width={40} height={30} rx={8} className={`i-s ${i === 6 ? "i-blue3" : "i-light"}`} />
      ))}
      <Check x={266} y={222} r={13} data-in="pop" data-d="0.4" />
    </>
  );
}

export function ContactArt() {
  return (
    <>
      <Ground rx={170} />
      <g data-loop="slide" data-dy="-18" data-dur="2.4">
        <Card x={154} y={70} w={172} h={128} tone="white" />
        <line x1={176} y1={102} x2={286} y2={102} className="i-soft i-thick" />
        <line x1={176} y1={126} x2={304} y2={126} className="i-soft" />
        <line x1={176} y1={146} x2={262} y2={146} className="i-soft" />
      </g>
      <path d="M120 170l120 84 120-84v116a12 12 0 0 1-12 12H132a12 12 0 0 1-12-12z" className="i-s i-blue3" />
      <path d="M120 286l94-66M360 286l-94-66" className="i-s" />
      <g data-loop="float" data-amp="6">
        <path d="M352 70h76a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-46l-22 18v-18h-8a14 14 0 0 1-14-14V84a14 14 0 0 1 14-14z" className="i-s i-blue" />
        {[376, 394, 412].map((x) => (
          <circle key={x} cx={x} cy={104} r={4} className="i-white" />
        ))}
      </g>
    </>
  );
}

export function NotFoundArt() {
  return (
    <>
      <Ground rx={170} />
      <path d="M40 200h90" className="i-s i-xthick" />
      <rect x={128} y={174} width={56} height={52} rx={12} className="i-s i-white" />
      <path d="M184 188h20M184 212h20" className="i-s i-xthick" />
      <g data-loop="swing" data-o="440 200" data-a0="-8" data-a1="4" data-dur="2.2">
        <path d="M440 200h-90" className="i-s i-xthick" />
        <rect x={290} y={170} width={62} height={60} rx={12} className="i-s i-blue" />
        <path d="M300 186h8M300 214h8" className="i-check i-thick" />
      </g>
      <path d="M228 166l8 14m14-18-2 16m20-8-12 12" className="i-bl" data-loop="blink" />
    </>
  );
}

export function LoadingArt() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={186 + i * 40} y={160} width={28} height={28} rx={8} className={i === 1 ? "i-blue" : "i-blue3"} data-loop="slide" data-dy="-16" data-dur="0.6" data-d={String(i * 0.2)} />
      ))}
    </>
  );
}
