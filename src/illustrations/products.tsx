import { Card, Check, Doc, Ground, Line, Pill } from "./kit";

/* Seven product scenes. Final state drawn; GSAP adds motion when allowed. */

export function Gate() {
  return (
    <>
      <Ground rx={200} />
      <line x1={24} y1={300} x2={456} y2={300} className="i-soft" />
      {/* gate hut */}
      <rect x={40} y={196} width={74} height={104} rx={12} className="i-s i-white" />
      <rect x={54} y={214} width={46} height={30} rx={6} className="i-s i-blue3" />
      {/* barrier: drawn raised; swings closed and open */}
      <rect x={124} y={244} width={16} height={56} rx={6} className="i-s i-mid" />
      <g transform="rotate(-72 132 250)" data-loop="swing" data-o="132 250" data-a0="-72" data-a1="-4" data-dur="2.8">
        <rect x={130} y={244} width={150} height={12} rx={6} className="i-s i-white" />
        {[150, 190, 230].map((x) => (
          <rect key={x} x={x} y={245} width={18} height={10} rx={3} className="i-blue" />
        ))}
      </g>
      {/* truck */}
      <g data-loop="slide" data-dx="22" data-dur="2.8">
        <path d="M232 300v-58q0-14 14-14h34v72z" className="i-s i-blue3" />
        <rect x={244} y={240} width={26} height={20} rx={5} className="i-s i-white" />
        <rect x={286} y={196} width={150} height={92} rx={12} className="i-s i-white" />
        {[262, 330, 404].map((x) => (
          <circle key={x} cx={x} cy={298} r={13} className="i-s i-mid" />
        ))}
        {/* plate + scan frame */}
        <rect x={238} y={272} width={30} height={12} rx={3} className="i-s i-white" />
        <rect x={228} y={262} width={50} height={32} rx={8} className="i-bl" fill="none" data-loop="blink" />
      </g>
      {/* check-in */}
      <Card x={300} y={52} w={150} h={112} tone="white" />
      {["Plate read", "PO matched", "Gate-in"].map((t, i) => (
        <g key={t}>
          <Check x={324} y={80 + i * 30} r={10} data-in="pop" data-d={String(0.3 + i * 0.25)} />
          <text x={342} y={85 + i * 30} className="i-label">
            {t}
          </text>
        </g>
      ))}
    </>
  );
}

export function Exim() {
  const route = "M86 196C150 70 330 70 394 196";
  return (
    <>
      <Ground rx={210} />
      <line x1={24} y1={270} x2={456} y2={270} className="i-soft" />
      {[62, 370].map((x) => (
        <g key={x}>
          <path d={`M${x} 270V170M${x + 40} 270V170M${x - 12} 170H${x + 60}`} className="i-s i-thick" fill="none" />
          <rect x={x - 4} y={232} width={56} height={38} rx={6} className="i-s i-mid" />
        </g>
      ))}
      <text x={52} y={298} className="i-label i-label-muted">Origin port</text>
      <text x={356} y={298} className="i-label i-label-muted">Destination</text>
      <path data-pid="exim-route" d={route} className="i-dash" />
      <g transform="translate(240 102)" data-loop="path" data-path="[data-pid='exim-route']" data-dur="6">
        <rect x={-30} y={-16} width={60} height={32} rx={6} className="i-s i-blue" />
        {[-16, -4, 8, 20].map((x) => (
          <line key={x} x1={x} y1={-8} x2={x} y2={8} className="i-check" />
        ))}
      </g>
      <g data-in="rise" data-d="0.2">
        <Doc x={196} y={150} w={92} h={112} lines={4} />
        <Doc x={184} y={162} w={92} h={112} lines={4} />
      </g>
      <g data-in="pop" data-d="0.7">
        <circle cx={258} cy={246} r={24} className="i-s i-blue3" />
        <circle cx={258} cy={246} r={16} className="i-bl" fill="none" />
        <path d="M250 246l6 6 10-12" className="i-bl i-thick" />
      </g>
    </>
  );
}

export function Signature() {
  return (
    <>
      <Ground rx={150} />
      <Doc x={136} y={40} w={200} h={256} lines={6} />
      <text x={156} y={214} className="i-label i-label-muted">Authorised signatory</text>
      <line x1={156} y1={262} x2={290} y2={262} className="i-soft" />
      <path
        d="M160 252c8-22 16-30 19-17s-8 22-3 19 14-30 22-27-3 24 3 24 11-19 16-19 3 16 8 16 14-11 22-14 11 3 16 0"
        className="i-bl i-thick"
        pathLength={1}
        data-loop="redraw"
        data-dur="2.4"
      />
      <g data-in="pop" data-d="0.4">
        <circle cx={340} cy={250} r={34} className="i-s i-white" />
        <circle cx={340} cy={250} r={26} className="i-blue" />
        <path d="M328 251l9 9 16-18" className="i-check i-thick" />
      </g>
      <Pill x={300} y={196} text="Verified" tone="blue" w={80} />
    </>
  );
}

export function Production() {
  const stages = [96, 192, 288, 384];
  return (
    <>
      <Ground rx={210} />
      <rect x={36} y={214} width={408} height={22} rx={11} className="i-s i-mid" />
      {Array.from({ length: 13 }, (_, i) => (
        <circle key={i} cx={54 + i * 31} cy={225} r={4} className="i-white" />
      ))}
      <path d="M70 236v54M410 236v54" className="i-s i-thick" />
      {stages.map((x, i) => (
        <g key={x}>
          <path d={`M${x - 34} 214V140q0-12 12-12h44q12 0 12 12v74`} className="i-s" fill="none" />
          <circle cx={x} cy={112} r={9} className="i-blue" data-loop="blink" data-d={String(i * 0.3)} />
          <text x={x} y={90} textAnchor="middle" className="i-label">
            Stage {i + 1}
          </text>
        </g>
      ))}
      {stages.map((x, i) => (
        <rect key={i} x={x - 16} y={178} width={32} height={32} rx={8} className="i-s i-white" data-loop="travel" data-dx="96" data-dur="2.6" />
      ))}
      <Pill x={170} y={262} text="Confirmed to SAP" tone="blue" w={140} />
    </>
  );
}

export function Vendor() {
  const cx = 240;
  const cy = 176;
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [cx + Math.cos(a) * 160, cy + Math.sin(a) * 112] as const;
  });
  return (
    <>
      <Ground rx={190} cy={316} />
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <path data-pid={`v-l${i}`} d={`M${x} ${y}L${cx} ${cy}`} className="i-soft i-thick" />
          <circle cx={x} cy={y} r={24} className="i-s i-white" data-in="pop" data-d={String(i * 0.08)} />
          <text x={x} y={y + 4} textAnchor="middle" className="i-label">
            S{i + 1}
          </text>
          <rect x={-7} y={-7} width={14} height={14} rx={4} transform={`translate(${(x + cx) / 2} ${(y + cy) / 2})`} className="i-blue" data-loop="path" data-path={`[data-pid='v-l${i}']`} data-dur="2.8" data-d={String(i * 0.45)} />
        </g>
      ))}
      <rect x={cx - 46} y={cy - 38} width={92} height={76} rx={16} className="i-s i-blue" />
      <text x={cx} y={cy + 5} textAnchor="middle" className="i-label i-label-white">
        Portal
      </text>
    </>
  );
}

export function Factory() {
  const ms = [70, 180, 290];
  return (
    <>
      <Ground rx={210} />
      <line x1={24} y1={290} x2={456} y2={290} className="i-soft" />
      <path d="M100 76H410" className="i-bl i-thick" />
      <path d="M100 76H410" className="i-dash-light" data-loop="flow" data-dist="24" />
      {ms.map((x, i) => (
        <g key={x}>
          <path d={`M${x + 30} 172V76`} className="i-bl" />
          <rect x={x} y={172} width={88} height={118} rx={14} className="i-s i-white" />
          <rect x={x + 14} y={190} width={42} height={28} rx={6} className="i-s i-blue3" />
          <circle cx={x + 30} cy={172} r={7} className="i-blue" />
          <circle cx={x + 30} cy={172} r={14} className="i-bl" fill="none" data-loop="pulse" data-d={String(i * 0.6)} />
        </g>
      ))}
      <rect x={402} y={52} width={60} height={48} rx={12} className="i-s i-blue" />
      <text x={432} y={81} textAnchor="middle" className="i-label i-label-white">
        SAP
      </text>
      <text x={90} y={58} className="i-label i-label-muted">Read-only data line</text>
    </>
  );
}

export function Ai() {
  const pts = "70,238 108,226 146,232 184,214 222,220 260,200 288,108 318,196 356,186 394,190 420,176";
  return (
    <>
      <Ground rx={200} />
      <Card x={40} y={52} w={400} h={236} tone="white" />
      <path d="M70 110V258H420" className="i-soft" />
      {[150, 190, 230].map((y) => (
        <line key={y} x1={70} y1={y} x2={420} y2={y} className="i-grid-soft" />
      ))}
      <rect x={270} y={96} width={36} height={162} rx={8} className="i-band" />
      <polyline points={pts} className="i-bl i-thick" pathLength={1} data-loop="redraw" data-dur="2.6" />
      <circle cx={288} cy={108} r={7} className="i-blue" />
      <circle cx={288} cy={108} r={16} className="i-bl" fill="none" data-loop="pulse" />
      <Pill x={312} y={94} text="Anomaly" tone="blue" w={76} />
      <Pill x={56} y={66} text="In production" tone="amber" w={108} />
      <Line d="M70 270h40" kind="soft" />
    </>
  );
}
