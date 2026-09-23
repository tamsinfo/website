/**
 * Page-level pictograms for TASK-004 (Home product tiles, About differentiators, and
 * the Home Connected Factory data flow). Geometry is transcribed from
 * docs/03-design/paper-snapshot/desktop/home.jsx and desktop/about.jsx.
 * The shared Icon set in icons.ts belongs to TASK-003, so these live here.
 */
import type { IconShape } from "./icons";

function glyph(
  paths: readonly string[],
  circles: IconShape["circles"] = [],
  rects: IconShape["rects"] = [],
): IconShape {
  return { strokeWidth: 1.5, paths, circles, rects };
}

export const FEATURE_GLYPHS = {
  "scan-frame": glyph([
    "M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16",
    "M4 12h16",
  ]),
  globe: glyph(
    ["M3 12h18M12 3c2.3 2.5 3.5 5.6 3.5 9s-1.2 6.5-3.5 9c-2.3-2.5-3.5-5.6-3.5-9S9.7 5.5 12 3z"],
    [{ cx: 12, cy: 12, r: 9 }],
  ),
  "document-check": glyph([
    "M13.5 3H6v18h12V7.5L13.5 3z",
    "M13.5 3v4.5H18",
    "M8.5 15.5l2 2 4.5-4.5",
  ]),
  layers: glyph(["M12 3l8 4.5-8 4.5-8-4.5L12 3z", "M4 12l8 4.5 8-4.5M4 16.5L12 21l8-4.5"]),
  people: glyph(
    [
      "M3 20c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2",
      "M16 5.2a3.2 3.2 0 010 5.9M17.5 14.8c2.1.6 3.5 2.3 3.5 5.2",
    ],
    [{ cx: 9, cy: 8, r: 3.2 }],
  ),
  chip: glyph(
    ["M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"],
    [],
    [{ x: 7, y: 7, width: 10, height: 10 }],
  ),
  network: glyph(
    ["M12 7.2v4.6M10.4 13l-4 3.2M13.6 13l4 3.2"],
    [
      { cx: 12, cy: 5, r: 2.2 },
      { cx: 5, cy: 18, r: 2.2 },
      { cx: 19, cy: 18, r: 2.2 },
    ],
  ),
  "shield-check": glyph([
    "M12 3l8 3v6c0 4.4-3.2 7.9-8 9-4.8-1.1-8-4.6-8-9V6l8-3z",
    "M9 12l2.2 2.2L15.5 10",
  ]),
  factory: glyph(["M3 21V9l7-4v4l7-4v16H3z", "M7 13v4M13 13v4M17 13v4"]),
  scale: glyph(["M12 4v16M5 8h14", "M5 8l-2.5 6h5L5 8zM19 8l-2.5 6h5L19 8z"]),
  machine: glyph(["M8 8V5h8v3M9 19v2M15 19v2"], [], [{ x: 4, y: 8, width: 16, height: 11 }]),
  sensor: glyph(
    [
      "M7.5 7.5a6.4 6.4 0 000 9M16.5 7.5a6.4 6.4 0 010 9M4.5 4.5a10.6 10.6 0 000 15M19.5 4.5a10.6 10.6 0 010 15",
    ],
    [{ cx: 12, cy: 12, r: 2.5 }],
  ),
  cloud: glyph(["M6 18a4 4 0 010-8 5.5 5.5 0 0110.6-1.6A4.2 4.2 0 0119 18H6z"]),
  /* The snapshot draws the cylinder top as an ellipse (cx 12, cy 6, rx 7, ry 3);
     it is expressed here as two arcs so the shared IconShape needs no ellipse type. */
  database: glyph([
    "M5 6a7 3 0 1 0 14 0a7 3 0 1 0 -14 0",
    "M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
  ]),
  "bar-chart": glyph(["M4 20V4M4 20h16M8 16V9M12.5 16V6M17 16v-4"]),
} as const satisfies Record<string, IconShape>;

export type GlyphName = keyof typeof FEATURE_GLYPHS;
