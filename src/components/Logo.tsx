/* TAMS identity, authored as SVG.
   Mark — "the joint": a T-beam (top flange + web) with a 4-unit stencil gap, and one Ember
   square where the beam meets the floor: the connected data point.
   Wordmark — chamfered, monoline-weight capitals on a 32-unit cap height, 6-unit stroke,
   with 45° cuts that echo the mark. */

export const MARK_PATHS = {
  flange: "M0 0H32V8H0Z",
  web: "M12 12H20V32H12Z",
  node: "M24 24H32V32H24Z",
};

export const WORD_PATHS = {
  T: "M0 0H22V6H14V32H8V6H0Z",
  A: "M26 32V6L32 0H42L48 6V32H42V21H32V32ZM32 15H42V8.5L40 6H34L32 8.5Z",
  M: "M52 32V0H58L64 10L70 0H76V32H70V13L64 23L58 13V32Z",
  S: "M80 32V26H96V19H86L80 13V6L86 0H102V6H86V13H96L102 19V26L96 32Z",
};

export function Mark({ size = 32, title }: { size?: number; title?: string }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d={MARK_PATHS.flange} fill="currentColor" />
      <path d={MARK_PATHS.web} fill="currentColor" />
      <path d={MARK_PATHS.node} fill="var(--blue)" />
    </svg>
  );
}

export function Wordmark({ height = 20 }: { height?: number }) {
  return (
    <svg className="logo-word" height={height} viewBox="0 0 102 32" aria-hidden="true">
      {Object.values(WORD_PATHS).map((d) => (
        <path key={d} d={d} fill="currentColor" fillRule="evenodd" />
      ))}
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark + mono descriptor. */
export function Logo({ descriptor = true, size = 30 }: { descriptor?: boolean; size?: number }) {
  return (
    <span className="logo">
      <Mark size={size} />
      <span className="logo__type">
        <Wordmark height={Math.round(size * 0.6)} />
        {descriptor ? <span className="logo__desc">Infotech</span> : null}
      </span>
    </span>
  );
}
