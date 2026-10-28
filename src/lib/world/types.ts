import type * as THREE from "three";

export type V3 = [number, number, number];

export type View = {
  pos: V3;
  target: V3;
  fov: number;
  /** Horizontal lens shift as a fraction of the viewport. Negative moves the subject right. */
  shift?: number;
  /** shiftY lifts the subject on tall screens so it clears the headline (fraction of height). */
  mobile?: { pos: V3; target: V3; fov: number; shiftY?: number };
  /** Where the camera eases to as the page's opening viewport scrolls away. */
  drift?: { pos: V3; target: V3 };
};

export type Env = {
  bg: string;
  floor: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  key: number;
  keyColor: string;
  env: number;
  fogNear: number;
  fogFar: number;
  /** 0 = daylight studio, 1 = night. Drives halos and status-light blinking. */
  night: number;
};

export type RoomId = "plant" | "workshop" | "core" | "gallery" | "bays" | "studio";

export type FrameCtx = {
  t: number;
  dt: number;
  /** Story progress for chaptered rooms; scroll drift (0..1) elsewhere. */
  progress: number;
  reduced: boolean;
  view: string;
  /** Pointer position on the floor plane in room coordinates, when a fine pointer is over the scene. */
  pointer: THREE.Vector3 | null;
};

export interface Room {
  id: RoomId;
  center: THREE.Vector3;
  group: THREE.Group;
  views: Record<string, View>;
  env: Env;
  /** Chaptered rooms interpolate their environment along the story. */
  envAt?(progress: number): Env;
  /** Chapter keyframe names in order, for rooms that tell a scroll story. */
  chapters?: string[];
  hotspots?: Record<string, THREE.Vector3>;
  hotspotAlpha?(id: string, progress: number): number;
  highlight?(id: string | null): void;
  update(ctx: FrameCtx): void;
  /** Called once when the story crosses a meaningful event, for sound cues. */
  onEvent?: (cb: (name: string) => void) => void;
}
