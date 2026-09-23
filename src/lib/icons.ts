/**
 * Icon geometry for Icon.astro (TASK-003), transcribed from the Paper snapshot
 * (docs/03-design/paper-snapshot). All icons use a 24x24 viewBox and currentColor.
 */

export interface IconShape {
  readonly strokeWidth: number;
  readonly paths: readonly string[];
  readonly circles: readonly { readonly cx: number; readonly cy: number; readonly r: number }[];
  readonly rects: readonly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  }[];
}

function shape(
  strokeWidth: number,
  paths: readonly string[],
  circles: IconShape["circles"] = [],
  rects: IconShape["rects"] = [],
): IconShape {
  return { strokeWidth, paths, circles, rects };
}

export const ICON_PATHS = {
  /* CTA and card arrow, every screen. */
  "arrow-right": shape(2, ["M4 12h15M13.5 6.5L20 12l-6.5 5.5"]),
  /* Header dropdown indicator. */
  "chevron-down": shape(2, ["M5.5 9L12 15.5 18.5 9"]),
  /* Breadcrumb separator. */
  "chevron-right": shape(1.8, ["M9 5.5L15.5 12 9 18.5"]),
  search: shape(1.6, ["M16.2 16.2L21 21"], [{ cx: 11, cy: 11, r: 7 }]),
  menu: shape(1.8, ["M3 6h18M3 12h18M3 18h18"]),
  close: shape(1.8, ["M6 6l12 12M18 6L6 18"]),
  plus: shape(2, ["M5 12h14M12 5v14"]),
  minus: shape(2, ["M5 12h14"]),
  pin: shape(
    1.6,
    ["M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"],
    [{ cx: 12, cy: 10, r: 2.5 }],
  ),
  phone: shape(1.6, [
    "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z",
  ]),
  mail: shape(1.6, ["M3 6.5l9 6 9-6"], [], [{ x: 3, y: 5, width: 18, height: 14 }]),
} as const satisfies Record<string, IconShape>;

export type IconName = keyof typeof ICON_PATHS;
