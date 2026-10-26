import * as THREE from "three";
import { word } from "../core/flow";
import { at, cyl, frame, mesh, rbox, rng, smooth, sph, tor, tube, v3, type Ctx, type Station } from "./kit";

/* 10 — the path. One glass puck travels through seven stations; the camera chases it. */
export const PATH_ORIGIN = v3(372, 0, -170);
const pathPts = [v3(0, 0, 0), v3(10, 0, -6), v3(20, 0, 2), v3(31, 0, -4), v3(42, 0, 4), v3(52, 0, -3), v3(62, 0, 3)].map((p) => p.add(PATH_ORIGIN));

export function processStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(pathPts.map((p) => p.clone().setY(0.34)), false, "centripetal");
  const trackGeo = new THREE.TubeGeometry(curve, 600, 0.5, 4, false);
  const track = mesh(trackGeo, ctx.mats.ceramicWarm, false, true);
  track.scale.y = 0.12;
  track.position.y = 0.3;
  const lineGeo = new THREE.TubeGeometry(curve, 600, 0.04, 8, false);
  group.add(track, mesh(lineGeo, ctx.mats.lineBlue, false, false));
  const lamps = pathPts.map((p, i) => {
    group.add(at(mesh(cyl(1.4, 1.6, 0.5, 64), ctx.mats.ceramic), p.x, 0.25, p.z));
    const l = at(mesh(tor(1.45, 0.06, 96, 10), ctx.mats.signalDim, false), p.x, 0.52, p.z);
    l.rotation.x = Math.PI / 2;
    group.add(l);
    const n = word(String(i + 1), { size: 2.6, color: "#1638D8" });
    n.rotation.x = -Math.PI / 2;
    n.position.set(p.x + 2.4, 0.04, p.z + 1.2);
    group.add(n);
    return { l, n };
  });
  const puck = mesh(cyl(0.8, 0.8, 0.5, 64), ctx.mats.glassBlue);
  const puckCore = mesh(cyl(0.3, 0.3, 0.52, 32), ctx.mats.signal, false);
  const pk = new THREE.Group();
  pk.add(puck, puckCore);
  group.add(pk);
  let u = 0;
  const tmp = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const at01 = (k: number) => Math.min(1, Math.max(0, k / 6));
  const num = word("08", { size: 16, color: "#E8E2D8" });
  num.position.copy(pathPts[3]).add(v3(0, 0, -18));
  group.add(num);

  return {
    id: "process",
    group,
    beats: 7,
    transition: "chase",
    pose: (k, side, mobile) => {
      const kk = Math.max(0, Math.min(6, k));
      curve.getPointAt(at01(kk), tmp);
      curve.getTangentAt(Math.max(0.001, Math.min(0.999, at01(kk))), tan);
      const focus = tmp.clone().add(v3(0, 0.8, 0));
      const p = focus.clone().addScaledVector(tan, mobile ? -11 : -8.5).add(v3(0, mobile ? 5.5 : 3.6, 0));
      const right = new THREE.Vector3().crossVectors(tan, v3(0, 1, 0)).normalize();
      p.addScaledVector(right, side === "left" ? -3 : 3);
      const t = focus.clone().addScaledVector(tan, 4);
      if (!mobile) t.addScaledVector(right, side === "left" ? -2.6 : 2.6);
      else t.y -= 2;
      return { p, t, focus, fov: mobile ? 54 : 40 };
    },
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      const target = Math.max(0, Math.min(6, s.local));
      u += (target - u) * Math.min(1, s.dt * (s.reduced ? 100 : 3));
      curve.getPointAt(at01(u), pk.position);
      pk.position.y = 0.62 + (s.reduced ? 0 : Math.sin(s.time * 2.4) * 0.06);
      pk.rotation.y = u * 2;
      lamps.forEach((x, i) => (x.l.material = u > i - 0.15 ? ctx.mats.signal : ctx.mats.signalDim));
    },
    dispose: () => {
      trackGeo.dispose();
      lineGeo.dispose();
      lamps.forEach((x) => x.n.dispose());
      num.dispose();
    },
  };
}

/* 11 — the light room. Calm, slow glass forms in a whiteout. Contact, legal and sitemap live here. */
export const LIGHT_ROOM = v3(470, 0, -150);
export function contactStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const r = rng(4);
  const forms = Array.from({ length: 7 }, (_, i) => {
    const m = mesh(rbox(1.6 + r() * 1.6, 3 + r() * 3, 1.6 + r() * 1.2, 0.8), i % 3 === 0 ? ctx.mats.glassBlue : ctx.mats.glass);
    m.userData.o = v3((r() - 0.5) * 16, 2.5 + r() * 3, (r() - 0.5) * 10 - 4);
    m.userData.s = 0.2 + r() * 0.3;
    group.add(m);
    return m;
  });
  group.position.copy(LIGHT_ROOM);
  group.add(at(mesh(cyl(9, 9.4, 0.3, 128), ctx.mats.ceramic), 0, 0.15, 0));
  const focus = LIGHT_ROOM.clone().add(v3(0, 3, 0));
  return {
    id: "contact",
    group,
    beats: 1,
    transition: "rise",
    pose: (_k, side, mobile, sub) => frame(focus, { dist: 15, h: 3, yaw: 0.1 + (sub ?? 0) * 0.3, side, mobile, shift: 0.34 }),
    fx: () => ({ fog: 0.028, flood: 0, exposure: 1.1 }),
    update(s) {
      forms.forEach((m, i) => {
        m.position.copy(m.userData.o);
        if (!s.reduced) {
          m.position.y += Math.sin(s.time * m.userData.s + i) * 0.5;
          m.rotation.set(Math.sin(s.time * 0.1 + i) * 0.3, s.time * 0.05 * m.userData.s + i, Math.cos(s.time * 0.12 + i) * 0.2);
        }
      });
    },
  };
}

/* About — a glass globe with five highlighted country nodes and arcs between them. */
export const GLOBE_ROOM = v3(470, 0, -70);
export function globeStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  group.position.copy(GLOBE_ROOM);
  const globe = new THREE.Group();
  globe.position.y = 4;
  group.add(globe, at(mesh(cyl(2.2, 2.8, 0.6, 96), ctx.mats.ceramic), 0, 0.3, 0));
  globe.add(mesh(sph(3, 96), ctx.mats.glass));
  const dots = new THREE.InstancedMesh(sph(0.045, 8), ctx.mats.anodisedPale, 600);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 600; i++) {
    const y = 1 - (i / 599) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    m4.makeTranslation(Math.cos(th) * rr * 3.04, y * 3.04, Math.sin(th) * rr * 3.04);
    dots.setMatrixAt(i, m4);
  }
  globe.add(dots);
  const ll = [
    [0.32, 1.35],
    [0.45, 0.9],
    [0.05, 1.8],
    [0.6, 0.2],
    [-0.2, 2.1],
  ].map(([lat, lon]) => v3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)).multiplyScalar(3.08));
  ll.forEach((p) => globe.add(at(mesh(sph(0.14, 20), ctx.mats.signal, false), p.x, p.y, p.z)));
  const arcs = ll.slice(1).map((p, i) => {
    const a = ll[0];
    const mid = a.clone().add(p).multiplyScalar(0.5).normalize().multiplyScalar(4.1 + i * 0.2);
    const t = tube([a, mid, p], 0.025, ctx.mats.lineBlue);
    globe.add(t.mesh);
    return t.geometry;
  });
  const focus = GLOBE_ROOM.clone().add(v3(0, 4, 0));
  return {
    id: "globe",
    group,
    beats: 4,
    transition: "orbit",
    orbitCenter: focus,
    pose: (k, side, mobile) => frame(focus, { dist: 12, h: 1.4, yaw: 0.2 + Math.max(0, k) * 0.7, side, mobile, shift: 0.32 }),
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      if (!s.reduced) globe.rotation.y = s.time * 0.12;
      globe.rotation.x = 0.25;
    },
    dispose: () => {
      dots.dispose();
      arcs.forEach((g) => g.dispose());
    },
  };
}

/* Careers — building blocks stacking into a structure, again and again. */
export const ASSEMBLY_ROOM = v3(520, 0, -110);
export function blocksStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  group.position.copy(ASSEMBLY_ROOM);
  group.add(at(mesh(cyl(5, 5.3, 0.3, 96), ctx.mats.ceramic), 0, 0.15, 0));
  const layout: [number, number, number][] = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4 - y; x++) for (let z = 0; z < 2; z++) layout.push([x - (3 - y) / 2, y, z - 0.5]);
  const mats = [ctx.mats.anodised, ctx.mats.ceramic, ctx.mats.iridescent, ctx.mats.anodisedPale];
  const blocks = layout.map(([x, y, z], i) => {
    const b = mesh(rbox(1, 1, 1, 0.2), mats[i % 4]);
    b.userData.home = v3(x * 1.04, 0.8 + y * 1.04, z * 1.04);
    b.userData.d = i * 0.18;
    group.add(b);
    return b;
  });
  const focus = ASSEMBLY_ROOM.clone().add(v3(0, 2.2, 0));
  return {
    id: "blocks",
    group,
    beats: 4,
    transition: "orbit",
    orbitCenter: focus,
    pose: (k, side, mobile) => frame(focus, { dist: 12, h: 3, yaw: -0.3 + Math.max(0, k) * 0.6, side, mobile, shift: 0.32 }),
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      const c = s.reduced ? 99 : s.time % 8;
      blocks.forEach((b) => {
        const k = Math.min(1, Math.max(0, (c - b.userData.d) / 0.7));
        const e = 1 - Math.pow(1 - k, 3);
        const out = c > 7.2 ? smooth(7.2, 8, c) : 0;
        b.position.copy(b.userData.home);
        b.position.y += (1 - e) * 5 + out * 0.4;
        b.scale.setScalar(Math.max(0.001, e * (1 - out)));
      });
    },
  };
}

/* Brand — the material library: one sphere per material, on ceramic pedestals. */
export const LIBRARY = v3(520, 0, -40);
export function libraryStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  group.position.copy(LIBRARY);
  const list = [ctx.mats.glass, ctx.mats.frosted, ctx.mats.anodised, ctx.mats.steel, ctx.mats.iridescent, ctx.mats.ceramic, ctx.mats.ceramicBlue];
  const spheres = list.map((m, i) => {
    const x = (i - 3) * 2.6;
    group.add(at(mesh(cyl(0.8, 0.9, 1.2, 64), ctx.mats.ceramic), x, 0.6, 0));
    const s = at(mesh(sph(0.95, 96), m), x, 2.2, 0);
    group.add(s);
    return s;
  });
  group.add(at(mesh(sph(0.2, 24), ctx.mats.signal, false), 0, 4.2, -1));
  const focus = LIBRARY.clone().add(v3(0, 2, 0));
  return {
    id: "library",
    group,
    beats: 6,
    transition: "truck",
    pose: (k, side, mobile) => frame(focus.clone().add(v3((Math.max(0, k) - 2.5) * 1.6, 0, 0)), { dist: 11, h: 1.6, yaw: 0, side, mobile, shift: 0.28 }),
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      if (!s.reduced) spheres.forEach((m, i) => (m.rotation.y = s.time * 0.3 + i));
    },
  };
}

/* 404 — the unplugged cable. */
export const UNPLUGGED = v3(560, 0, -170);
export function unpluggedStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  group.position.copy(UNPLUGGED);
  group.add(at(mesh(rbox(1.6, 2, 0.6, 0.2), ctx.mats.ceramic), -3, 1.6, 0));
  group.add(at(mesh(rbox(0.12, 0.4, 0.2, 0.04), ctx.mats.ceramicInk), -2.15, 1.75, 0.1), at(mesh(rbox(0.12, 0.4, 0.2, 0.04), ctx.mats.ceramicInk), -2.15, 1.35, 0.1));
  const swing = new THREE.Group();
  swing.position.set(4, 4.5, 0);
  const cable = tube([v3(0, 0, 0), v3(-1.2, -2.2, 0.4), v3(-3.2, -3.0, 0), v3(-4.6, -2.8, 0)], 0.09, ctx.mats.ceramicInk);
  const plug = at(mesh(rbox(0.9, 0.7, 0.6, 0.18), ctx.mats.anodised), -5.0, -2.8, 0);
  swing.add(cable.mesh, plug, at(mesh(rbox(0.3, 0.08, 0.08, 0.02), ctx.mats.chrome), -5.55, -2.6, 0), at(mesh(rbox(0.3, 0.08, 0.08, 0.02), ctx.mats.chrome), -5.55, -3.0, 0));
  group.add(swing, at(mesh(sph(0.18, 20), ctx.mats.signal, false), -3, 2.9, 0.3));
  const focus = UNPLUGGED.clone().add(v3(0, 2, 0));
  return {
    id: "unplugged",
    group,
    beats: 1,
    transition: "rise",
    pose: (_k, side, mobile) => frame(focus, { dist: 11, h: 1.2, yaw: 0, side, mobile, shift: 0.3 }),
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      swing.rotation.z = s.reduced ? 0 : Math.sin(s.time * 1.2) * 0.08;
    },
    dispose: () => cable.geometry.dispose(),
  };
}
