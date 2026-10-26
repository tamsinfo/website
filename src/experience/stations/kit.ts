import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Materials } from "../core/materials";

export type V3 = THREE.Vector3;
export const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export type Side = "left" | "right" | "center";
export type Pose = { p: V3; t: V3; focus: V3; fov: number; roll?: number };
export type Fx = { flood: number; fog: number; exposure: number };
export type Transition = "arc" | "orbit" | "truck" | "drop" | "bank" | "chase" | "rise" | "dolly";

export type StationState = {
  time: number;
  dt: number;
  /** continuous beat index within this station along the current route (dormant: < -5) */
  local: number;
  near: boolean;
  reduced: boolean;
  /** pointer ray in world space (null when the pointer is over DOM controls or touch) */
  ray: THREE.Ray | null;
  hovered: string | null;
  /** 0 → 1 over the preloader reveal */
  intro: number;
};

export interface Station {
  id: string;
  group: THREE.Group;
  beats: number;
  /** k: beat index (or -1 for the room's establishing shot), sub: orbit step on detail pages */
  pose(k: number, side: Side, mobile: boolean, sub?: number): Pose;
  fx?(k: number): Partial<Fx>;
  transition: Transition;
  orbitCenter?: V3;
  update(s: StationState): void;
  inspectables?: { id: string; object: THREE.Object3D; radius: number; title: string; text: string }[];
  dispose?(): void;
}

export type Ctx = { mats: Materials; mobile: boolean; displayFont: string };

/* ---------- cached geometry ---------- */
const cache = new Map<string, THREE.BufferGeometry>();
export const geo = <T extends THREE.BufferGeometry>(key: string, make: () => T): T => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
};
export const rbox = (w: number, h: number, d: number, r = Math.min(w, h, d) * 0.15) => geo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 4, r));
export const cyl = (rt: number, rb: number, h: number, s = 48) => geo(`cy${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
export const sph = (r: number, s = 40) => geo(`sp${r},${s}`, () => new THREE.SphereGeometry(r, s, Math.round(s * 0.66)));
export const tor = (r: number, t: number, s = 96, rs = 20) => geo(`to${r},${t},${s},${rs}`, () => new THREE.TorusGeometry(r, t, rs, s));
export const disposeGeometryCache = () => {
  cache.forEach((g) => g.dispose());
  cache.clear();
};

export function mesh(g: THREE.BufferGeometry, m: THREE.Material, cast = true, receive = true) {
  const o = new THREE.Mesh(g, m);
  o.castShadow = cast;
  o.receiveShadow = receive;
  return o;
}
export const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => (o.position.set(x, y, z), o);

export function tube(points: V3[], radius: number, m: THREE.Material, curved = true) {
  const curve = curved ? new THREE.CatmullRomCurve3(points, false, "centripetal") : new THREE.CatmullRomCurve3(points, false, "chordal", 0);
  const g = new THREE.TubeGeometry(curve, Math.max(32, points.length * 24), radius, 12, false);
  const o = mesh(g, m, true, false);
  return { mesh: o, curve, geometry: g };
}

/* ---------- framing ----------
   Places the camera around `focus` at yaw/distance/height, then shifts the look target so the
   object lands opposite the type (desktop) or above it (mobile). */
export function frame(focus: V3, o: { dist: number; h: number; yaw: number; fov?: number; side: Side; mobile: boolean; roll?: number; shift?: number }): Pose {
  const dist = o.mobile ? o.dist * 1.55 : o.dist;
  const dir = v3(Math.sin(o.yaw), 0, Math.cos(o.yaw));
  const p = focus.clone().addScaledVector(dir, dist).add(v3(0, o.mobile ? o.h * 1.25 : o.h, 0));
  const fwd = focus.clone().sub(p).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, v3(0, 1, 0)).normalize();
  const t = focus.clone();
  const k = (o.shift ?? 0.3) * dist;
  if (o.mobile) t.y -= dist * 0.2;
  else if (o.side === "left") t.addScaledVector(right, -k);
  else if (o.side === "right") t.addScaledVector(right, k);
  return { p, t, focus: focus.clone(), fov: o.fov ?? (o.mobile ? 50 : 36), roll: o.roll };
}

/** seeded random */
export function rng(seed = 1) {
  let s = seed * 9973 + 7;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** intersect a pointer ray with the vertical plane through `p` facing +Z (or a given normal) */
const _plane = new THREE.Plane();
export function rayOnPlane(ray: THREE.Ray | null, p: V3, normal = v3(0, 0, 1), out = new THREE.Vector3()) {
  if (!ray) return null;
  _plane.setFromNormalAndCoplanarPoint(normal, p);
  return ray.intersectPlane(_plane, out);
}
