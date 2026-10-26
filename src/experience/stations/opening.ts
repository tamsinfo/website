import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createSdfHero } from "../core/sdfHero";
import { createParts, sampleText, sphereCloud } from "../core/parts";
import { word } from "../core/flow";
import { at, cyl, frame, mesh, rayOnPlane, rbox, smooth, tor, v3, type Ctx, type Station } from "./kit";

/* 01 — the forge. Liquid chrome follows the cursor; it starts as the TAMS mark (the preloader
   hands it over), melts into metaballs, and on leaving re-forms the mark and erodes into parts. */
export const HERO_FOCUS = v3(0, 2.5, 0);

export function heroStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const hero = createSdfHero();
  hero.mesh.position.copy(HERO_FOCUS);
  hero.mesh.scale.setScalar(1.15);
  group.add(hero.mesh);
  const dais = at(mesh(cyl(3.4, 3.6, 0.28, 96), ctx.mats.ceramic), 0, 0.14, 0);
  const ring = at(mesh(tor(3.75, 0.035, 160, 12), ctx.mats.anodised), 0, 0.3, 0);
  ring.rotation.x = Math.PI / 2;
  const lamp = at(mesh(rbox(0.24, 0.07, 0.07, 0.03), ctx.mats.signal, false), 3.1, 0.33, 1.2);
  group.add(dais, ring, lamp);
  const num = word("01", { size: 16, color: "#E8E2D8" });
  num.position.set(9, 0, -16);
  group.add(num);

  const target = new THREE.Vector3();
  const drift = new THREE.Vector3();
  const local = new THREE.Vector3();
  let mouseOn = 0;

  return {
    id: "hero",
    group,
    beats: 1,
    transition: "drop",
    pose: (_k, side, mobile) => frame(HERO_FOCUS, { dist: 9.6, h: 0.7, yaw: -0.08, side, mobile, shift: 0.3 }),
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      const u = hero.mat.uniforms;
      u.uTime.value = s.reduced ? 2 : s.time;
      const leave = Math.max(0, s.local);
      const meltIn = 1 - smooth(0, 1, s.intro);
      u.uMorph.value = Math.max(meltIn, smooth(0.08, 0.5, leave));
      u.uDissolve.value = smooth(0.5, 0.85, leave) * 1.3;
      hero.mesh.visible = s.local < 0.98 && s.local > -1.5;
      // follow the cursor: an attractor ball in object space + a gentle drift of the whole body
      const hit = rayOnPlane(s.ray, HERO_FOCUS, v3(0, 0, 1), target);
      mouseOn += ((hit ? 1 : 0) - mouseOn) * Math.min(1, s.dt * 4);
      if (hit) {
        local.copy(hit).sub(hero.mesh.position).divideScalar(hero.mesh.scale.x);
        local.clampLength(0, 2.4);
        (u.uMouse.value as THREE.Vector3).lerp(local, Math.min(1, s.dt * 6));
        drift.set(local.x * 0.12, local.y * 0.08, 0);
      } else drift.set(0, 0, 0);
      u.uMouseOn.value = mouseOn;
      hero.mesh.position.lerp(drift.add(HERO_FOCUS), Math.min(1, s.dt * 2));
      hero.mesh.rotation.y = s.reduced ? 0.3 : Math.sin(s.time * 0.2) * 0.3 + (u.uMouse.value as THREE.Vector3).x * 0.08;
    },
    dispose: () => {
      hero.dispose();
      num.dispose();
    },
  };
}

/* 02 — the counting floor. 4,000 parts burst out of the eroding hero and assemble each figure. */
export const PROOF_ORIGIN = v3(-20, 0, -26);
const FIGURES = ["14+", "25", "25+", "5", "7"];

export function proofStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const center = PROOF_ORIGIN.clone().add(v3(0, 3.6, 0));
  const font = ctx.displayFont;
  const make = (count: number, seed: number) => [
    sphereCloud(count, 1.3, HERO_FOCUS, seed),
    ...FIGURES.map((f, i) => sampleText(f, count, f.length * 3.1, font, seed + i * 7).map((p) => p.add(center))),
  ];
  const boltGeo = mergeGeometries([new THREE.CylinderGeometry(0.03, 0.03, 0.26, 10).translate(0, -0.1, 0), new THREE.CylinderGeometry(0.075, 0.075, 0.06, 6).translate(0, 0.04, 0)])!;
  const nutGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.055, 6);
  const plateGeo = rbox(0.24, 0.022, 0.16, 0.01);
  const n = ctx.mobile ? 0.6 : 1;
  const bolts = createParts(boltGeo, ctx.mats.steel, make(Math.round(1800 * n), 11));
  const nuts = createParts(nutGeo, ctx.mats.steel, make(Math.round(1100 * n), 23));
  const plates = createParts(plateGeo, ctx.mats.anodised, make(Math.round(1100 * n), 37));
  const sets = [bolts, nuts, plates];
  sets.forEach((p) => group.add(p.mesh));
  boltGeo.dispose();
  nutGeo.dispose();
  // a shallow ceramic stage under the figures
  group.add(at(mesh(rbox(16, 0.3, 5, 0.12), ctx.mats.ceramic), PROOF_ORIGIN.x, 0.15, PROOF_ORIGIN.z));
  group.add(at(mesh(rbox(16.2, 0.04, 0.06, 0.02), ctx.mats.anodised), PROOF_ORIGIN.x, 0.31, PROOF_ORIGIN.z + 2.5));
  const mouse = new THREE.Vector3();

  return {
    id: "proof",
    group,
    beats: 5,
    transition: "dolly",
    pose: (k, side, mobile) => frame(center, { dist: 24, h: 0.8, yaw: 0.14 - Math.max(0, k) * 0.06, side, mobile, shift: 0.27 }),
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      const morph = s.reduced ? Math.max(1, s.local + 1) : s.local + 1;
      const visible = s.local > -0.96 && s.local < 5.6;
      const hit = rayOnPlane(s.ray, center, v3(0, 0, 1), mouse);
      sets.forEach((p) => {
        p.mesh.visible = visible;
        p.uniforms.uMorph.value = Math.min(5, Math.max(0, morph));
        p.uniforms.uTime.value = s.time;
        p.uniforms.uRepel.value = s.reduced ? 0 : 1;
        p.uniforms.uMouse.value.copy(hit ?? v3(999, 999, 999));
      });
    },
    dispose: () => sets.forEach((p) => p.dispose()),
  };
}
