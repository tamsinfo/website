declare module "troika-three-text" {
  import { Mesh, Material, Color } from "three";
  export class Text extends Mesh {
    text: string;
    font: string;
    fontSize: number;
    anchorX: number | string;
    anchorY: number | string;
    letterSpacing: number;
    color: string | number | Color;
    material: Material;
    sdfGlyphSize: number;
    fillOpacity: number;
    outlineWidth: number | string;
    sync(cb?: () => void): void;
    dispose(): void;
  }
  export function preloadFont(opts: { font: string; characters?: string | string[]; sdfGlyphSize?: number }, cb: () => void): void;
}
