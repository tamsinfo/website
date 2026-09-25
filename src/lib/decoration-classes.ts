/**
 * Decorative line drawings that are wider than a phone on purpose (G4 revision
 * request 2). This is the only place a fixed width above the Mobile content box
 * may appear at the base breakpoint. tests/unit/fixed-width-guard.test.ts exempts
 * exactly these strings, and checks that every element using one is aria-hidden.
 *
 * Every entry MUST stay absolutely positioned inside a section with overflow-clip,
 * so the drawing is clipped and can never widen the page.
 * Tailwind scans this file, so each class is written out in full.
 */
export const DECORATION_CLASSES = {
  /* Detail-page hero watermark: 380px at 35% opacity on Mobile, 620px on Desktop. */
  heroWatermark:
    "pointer-events-none absolute -top-13.75 -right-38.5 size-95 opacity-35 xl:-top-22.5 xl:-right-45 xl:size-155",
  /* not-found.jsx: Desktop left 960 of 1440 at 620 wide, Mobile left 150 of 390 at
     380 wide. Both leave the drawing 140px past the right edge. */
  notFoundWatermark:
    "pointer-events-none absolute -top-10 -right-35 size-95 opacity-35 xl:-top-22.5 xl:-right-35 xl:size-155",
  /* home.jsx: 760px at top -120 / left 920 of 1440; Mobile 380px at top -60 /
     left 164 of 390. */
  homeHeroWatermark:
    "pointer-events-none absolute -top-15 -right-38.5 size-95 opacity-35 xl:-top-30 xl:-right-60 xl:size-190",
  /* about.jsx grid band: 1280x180 at the content edge, 50% opacity; Mobile 380x53
     at left 80 (60px past the 20px gutter). */
  aboutGridBand:
    "pointer-events-none absolute top-0 left-15 h-13.25 w-95 opacity-50 xl:left-0 xl:h-45 xl:w-320",
} as const;
