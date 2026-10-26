import * as THREE from "three";
import { products } from "../../data/site";
import { word } from "../core/flow";
import { at, cyl, frame, mesh, rbox, rng, sph, tor, tube, v3, type Ctx, type Station } from "./kit";

/* 05 — the workshop. Seven machines on ceramic plinths along a gallery; the camera trucks
   past them. Every machine is inspectable (hover leans, click lifts it into the hand). */
export const WORKSHOP_ORIGIN = v3(92, 0, -72);
export const machinePos = (i: number) => WORKSHOP_ORIGIN.clone().add(v3(i * 14, 0, (i % 2) * -1.5));

type Machine = { root: THREE.Group; update: (t: number, reduced: boolean) => void; radius: number };

function gate(ctx: Ctx): Machine {
  const g = new THREE.Group();
  g.add(at(mesh(rbox(1.1, 1.6, 1.0, 0.16), ctx.mats.ceramic), -2.3, 0.8, -0.6));
  g.add(at(mesh(rbox(0.8, 0.4, 0.04, 0.03), ctx.mats.glassBlue, false), -2.3, 1.15, -0.08));
  g.add(at(mesh(cyl(0.12, 0.14, 1.1, 24), ctx.mats.steel), -1.5, 0.55, 0.3));
  const arm = new THREE.Group();
  arm.position.set(-1.5, 1.05, 0.3);
  const bar = at(mesh(rbox(3.2, 0.12, 0.12, 0.05), ctx.mats.anodised), 1.6, 0, 0);
  arm.add(bar);
  for (let i = 0; i < 3; i++) arm.add(at(mesh(rbox(0.22, 0.13, 0.13, 0.04), ctx.mats.ceramic), 0.7 + i * 0.9, 0, 0));
  const tip = at(mesh(sph(0.07, 16), ctx.mats.signal, false), 3.2, 0.1, 0);
  arm.add(tip);
  g.add(arm);
  // plate-scan frame
  g.add(at(mesh(rbox(0.12, 2.4, 0.12, 0.04), ctx.mats.chrome), 0.4, 1.2, 1.8), at(mesh(rbox(0.12, 2.4, 0.12, 0.04), ctx.mats.chrome), 0.4, 1.2, -1.2));
  g.add(at(mesh(rbox(0.16, 0.16, 3.2, 0.05), ctx.mats.chrome), 0.4, 2.4, 0.3));
  const scan = at(mesh(rbox(0.04, 0.04, 2.8, 0.01), ctx.mats.signal, false), 0.4, 1.0, 0.3);
  g.add(scan);
  // truck
  const truck = new THREE.Group();
  truck.add(at(mesh(rbox(0.9, 0.95, 0.95, 0.18), ctx.mats.ceramicBlue), 0, 0.72, 0));
  truck.add(at(mesh(rbox(2.0, 1.15, 1.0, 0.1), ctx.mats.ceramic), 1.5, 0.82, 0));
  truck.add(at(mesh(rbox(0.5, 0.18, 0.02, 0.02), ctx.mats.chrome, false), -0.46, 0.4, 0));
  for (const x of [-0.05, 1.0, 2.0]) {
    const w = at(mesh(cyl(0.2, 0.2, 1.05, 24), ctx.mats.ceramicInk), x, 0.2, 0);
    w.rotation.x = Math.PI / 2;
    truck.add(w);
  }
  g.add(truck);
  // check-in ticks
  const ticks = [0, 1, 2].map((i) => {
    const t = at(mesh(rbox(0.34, 0.34, 0.06, 0.06), ctx.mats.glassBlue, false), -2.7 + i * 0.42, 2.0, -0.05);
    g.add(t);
    return t;
  });
  return {
    root: g,
    radius: 3.4,
    update(t, reduced) {
      const c = reduced ? 0.6 : (t * 0.18) % 1;
      const lift = c < 0.25 ? 0 : c < 0.4 ? (c - 0.25) / 0.15 : c < 0.8 ? 1 : 1 - (c - 0.8) / 0.2;
      arm.rotation.z = lift * 1.35;
      truck.position.set(reduced ? 0.6 : 4.2 - Math.min(1, c / 0.55) * 3.6 - Math.max(0, c - 0.75) * 10, 0, 0.3);
      scan.position.y = 0.6 + (reduced ? 0.5 : Math.abs(Math.sin(t * 2)) * 1.4);
      ticks.forEach((m, i) => (m.material = (reduced || c > 0.2 + i * 0.08) ? ctx.mats.anodised : ctx.mats.glassBlue));
    },
  };
}

function exim(ctx: Ctx): Machine {
  const g = new THREE.Group();
  const container = new THREE.Group();
  container.add(at(mesh(rbox(2.6, 1.1, 1.1, 0.06), ctx.mats.anodised), 0, 0, 0));
  for (let i = -5; i <= 5; i++) container.add(at(mesh(rbox(0.06, 1.0, 1.14, 0.02), ctx.mats.anodisedPale, false), i * 0.22, 0, 0));
  g.add(container);
  [-2.8, 2.8].forEach((x) => {
    g.add(at(mesh(rbox(0.14, 2.6, 0.14, 0.04), ctx.mats.steel), x, 1.3, -0.4), at(mesh(rbox(0.14, 2.6, 0.14, 0.04), ctx.mats.steel), x, 1.3, 0.4));
    g.add(at(mesh(rbox(1.4, 0.14, 1.0, 0.04), ctx.mats.steel), x, 2.6, 0));
  });
  const route = tube([v3(-2.8, 2.7, 0), v3(-1.2, 4.0, 0), v3(1.2, 4.0, 0), v3(2.8, 2.7, 0)], 0.03, ctx.mats.lineBlue);
  g.add(route.mesh);
  const docs = new THREE.Group();
  for (let i = 0; i < 6; i++) docs.add(at(mesh(rbox(0.9, 0.025, 1.2, 0.01), ctx.mats.ceramic), (i % 2) * 0.03, 0.04 + i * 0.03, (i % 3) * 0.02));
  docs.position.set(0.2, 0, 1.6);
  g.add(docs);
  const stamp = new THREE.Group();
  stamp.add(at(mesh(cyl(0.22, 0.22, 0.2, 32), ctx.mats.signalDim), 0, 0.1, 0), at(mesh(cyl(0.06, 0.06, 0.5, 16), ctx.mats.chrome), 0, 0.45, 0), at(mesh(sph(0.14, 20), ctx.mats.ceramicInk), 0, 0.75, 0));
  docs.add(stamp);
  const seal = at(mesh(cyl(0.18, 0.18, 0.006, 32), ctx.mats.signal, false), 0.1, 0.222, 0.1);
  docs.add(seal);
  return {
    root: g,
    radius: 3.4,
    update(t, reduced) {
      const u = reduced ? 0.5 : (t * 0.12) % 1;
      route.curve.getPointAt(u, container.position);
      container.position.y -= 0.6;
      const c = reduced ? 0.5 : (t * 0.5) % 1;
      stamp.position.y = 0.45 - (c < 0.5 ? Math.sin(c * Math.PI * 2) * 0.24 : 0);
      seal.visible = reduced || c > 0.25;
    },
  };
}

function signature(ctx: Ctx): Machine {
  const g = new THREE.Group();
  const slab = at(mesh(rbox(2.2, 2.9, 0.12, 0.08), ctx.mats.glass), 0, 1.7, 0);
  slab.rotation.x = -0.12;
  g.add(slab);
  g.add(at(mesh(rbox(2.6, 0.18, 0.7, 0.06), ctx.mats.ceramic), 0, 0.09, 0.1));
  for (let i = 0; i < 5; i++) g.add(at(mesh(rbox(1.4 - (i % 2) * 0.4, 0.04, 0.02, 0.01), ctx.mats.ceramicWarm, false), -0.15 - (i % 2) * 0.2, 2.6 - i * 0.22, 0.12));
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = -0.8 + i * 0.04;
    pts.push(v3(x, 1.05 + Math.sin(i * 0.7) * 0.16 + Math.sin(i * 0.23) * 0.1, 0.25 + i * 0.0005));
  }
  const sig = tube(pts, 0.022, ctx.mats.lineBlue);
  sig.mesh.rotation.x = -0.12;
  g.add(sig.mesh);
  const total = sig.geometry.index!.count;
  const seal = new THREE.Group();
  seal.add(mesh(cyl(0.42, 0.42, 0.08, 48), ctx.mats.iridescent));
  seal.add(at(mesh(tor(0.32, 0.03, 64, 10), ctx.mats.chrome), 0, 0.05, 0));
  seal.children[1].rotation.x = Math.PI / 2;
  seal.rotation.x = Math.PI / 2 - 0.12;
  seal.position.set(0.85, 0.75, 0.35);
  g.add(seal);
  return {
    root: g,
    radius: 2.4,
    update(t, reduced) {
      const c = reduced ? 1 : Math.min(1, ((t * 0.3) % 1.4) / 0.9);
      sig.geometry.setDrawRange(0, Math.floor((total * c) / 3) * 3);
      seal.scale.setScalar(reduced ? 1 : Math.max(0.001, Math.min(1, (c - 0.85) * 7)));
      seal.rotation.z = t * 0.6;
    },
  };
}

function production(ctx: Ctx): Machine {
  const g = new THREE.Group();
  g.add(at(mesh(rbox(6.4, 0.24, 0.9, 0.08), ctx.mats.ceramicInk), 0, 0.75, 0));
  for (let i = -3; i <= 3; i++) g.add(at(mesh(rbox(0.12, 0.65, 0.7, 0.03), ctx.mats.steel), i, 0.32, 0));
  const lamps = [-2.1, -0.7, 0.7, 2.1].map((x) => {
    g.add(at(mesh(rbox(0.1, 1.6, 0.1, 0.03), ctx.mats.chrome), x, 1.6, -0.55), at(mesh(rbox(0.1, 1.6, 0.1, 0.03), ctx.mats.chrome), x, 1.6, 0.55), at(mesh(rbox(0.12, 0.12, 1.2, 0.03), ctx.mats.chrome), x, 2.4, 0));
    const l = at(mesh(sph(0.09, 16), ctx.mats.signalDim, false), x, 2.55, 0);
    g.add(l);
    return l;
  });
  const pieces = new THREE.InstancedMesh(rbox(0.42, 0.32, 0.42, 0.06), ctx.mats.anodisedPale, 9);
  pieces.castShadow = true;
  g.add(pieces);
  const m = new THREE.Matrix4();
  return {
    root: g,
    radius: 3.4,
    update(t, reduced) {
      for (let i = 0; i < 9; i++) {
        const x = -3.1 + ((i * 0.7 + (reduced ? 0 : t * 0.55)) % 6.2);
        m.makeTranslation(x, 1.03, 0);
        pieces.setMatrixAt(i, m);
      }
      pieces.instanceMatrix.needsUpdate = true;
      lamps.forEach((l, i) => (l.material = reduced || Math.sin(t * 2 - i * 0.9) > 0.6 ? ctx.mats.signal : ctx.mats.signalDim));
    },
  };
}

function vendor(ctx: Ctx): Machine {
  const g = new THREE.Group();
  const hub = at(mesh(rbox(1.3, 1.3, 1.3, 0.3), ctx.mats.iridescent), 0, 1.6, 0);
  g.add(hub);
  const tokens: { m: THREE.Mesh; c: THREE.CatmullRomCurve3; o: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = v3(Math.cos(a) * 2.8, 1.0 + (i % 2) * 0.8, Math.sin(a) * 2.8);
    g.add(at(mesh(sph(0.34, 32), ctx.mats.ceramic), p.x, p.y, p.z));
    const ln = tube([p, p.clone().lerp(v3(0, 1.6, 0), 0.5).add(v3(0, 0.4, 0)), v3(0, 1.6, 0)], 0.025, ctx.mats.lineBlue);
    g.add(ln.mesh);
    const t = mesh(rbox(0.18, 0.18, 0.18, 0.04), ctx.mats.anodised, false);
    g.add(t);
    tokens.push({ m: t, c: ln.curve, o: i / 6 });
  }
  return {
    root: g,
    radius: 3.4,
    update(t, reduced) {
      hub.rotation.y = reduced ? 0.6 : t * 0.4;
      tokens.forEach((k) => k.c.getPointAt(reduced ? 0.5 : (k.o + t * 0.25) % 1, k.m.position));
    },
  };
}

function factory(ctx: Ctx): Machine {
  const g = new THREE.Group();
  const pulses: THREE.Mesh[] = [];
  [-2, 0, 2].forEach((x, i) => {
    g.add(at(mesh(rbox(1.4, 1.5 + (i % 2) * 0.4, 1.2, 0.18), ctx.mats.ceramic), x, 0.75 + (i % 2) * 0.2, 0));
    g.add(at(mesh(rbox(0.7, 0.45, 0.04, 0.04), ctx.mats.glassBlue, false), x - 0.2, 0.95, 0.61));
    const s = at(mesh(sph(0.1, 16), ctx.mats.signal, false), x + 0.4, 1.7 + (i % 2) * 0.4, 0);
    const p = at(mesh(tor(0.2, 0.015, 48, 8), ctx.mats.signal, false), x + 0.4, 1.7 + (i % 2) * 0.4, 0);
    p.rotation.x = Math.PI / 2;
    g.add(s, p);
    pulses.push(p);
    g.add(tube([v3(x + 0.4, 1.75 + (i % 2) * 0.4, 0), v3(x + 0.4, 3.0, 0), v3(2.9, 3.0, 0)], 0.025, ctx.mats.lineBlue, false).mesh);
  });
  g.add(at(mesh(rbox(0.9, 0.9, 0.9, 0.22), ctx.mats.anodised), 3.2, 3.0, 0));
  return {
    root: g,
    radius: 3.4,
    update(t, reduced) {
      pulses.forEach((p, i) => {
        const c = reduced ? 0.5 : (t * 0.8 + i * 0.33) % 1;
        p.scale.setScalar(0.6 + c * 2.4);
        (p as THREE.Mesh).visible = c < 0.95;
      });
    },
  };
}

function ai(ctx: Ctx): Machine {
  const g = new THREE.Group();
  const panel = at(mesh(rbox(3.6, 2.3, 0.14, 0.12), ctx.mats.glass), 0, 1.9, 0);
  const frameM = at(mesh(rbox(3.8, 2.5, 0.08, 0.14), ctx.mats.iridescent), 0, 1.9, -0.12);
  g.add(frameM, panel, at(mesh(rbox(0.3, 0.8, 0.3, 0.06), ctx.mats.steel), 0, 0.4, -0.1), at(mesh(rbox(1.6, 0.12, 0.8, 0.05), ctx.mats.ceramic), 0, 0.06, -0.1));
  const pts = [-1.5, -1.1, -0.7, -0.3, 0.1, 0.35, 0.6, 1.0, 1.4].map((x, i) => v3(x, 1.4 + [0.0, 0.1, 0.05, 0.2, 0.18, 1.0, 0.3, 0.35, 0.45][i], 0.12));
  g.add(tube(pts, 0.03, ctx.mats.lineBlue, false).mesh);
  const anomaly = at(mesh(sph(0.12, 20), ctx.mats.signal, false), 0.35, 2.4, 0.14);
  const halo = at(mesh(tor(0.26, 0.018, 48, 8), ctx.mats.signal, false), 0.35, 2.4, 0.14);
  g.add(anomaly, halo);
  return {
    root: g,
    radius: 2.6,
    update(t, reduced) {
      const c = reduced ? 0.4 : (t * 0.7) % 1;
      halo.scale.setScalar(1 + c * 1.6);
    },
  };
}

export function productsStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const builders = [gate, exim, signature, production, vendor, factory, ai];
  const machines = builders.map((b, i) => {
    const m = b(ctx);
    const plinth = new THREE.Group();
    plinth.position.copy(machinePos(i));
    plinth.add(at(mesh(cyl(4.2, 4.4, 0.35, 96), ctx.mats.ceramic), 0, 0.17, 0));
    plinth.add(at(mesh(tor(4.3, 0.03, 160, 8), ctx.mats.anodised), 0, 0.36, 0));
    plinth.children[1].rotation.x = Math.PI / 2;
    m.root.position.set(0, 0.35, 0);
    // pivot: lean and inspect happen around the machine's visual centre
    const pivot = new THREE.Group();
    pivot.position.set(0, 1.9, 0);
    pivot.scale.setScalar(1.45);
    m.root.position.y -= 1.25 / 1.45;
    pivot.add(m.root);
    plinth.add(pivot);
    group.add(plinth);
    return { ...m, pivot, plinth };
  });
  const num = word("04", { size: 16, color: "#E8E2D8" });
  num.position.copy(machinePos(3)).add(v3(0, 0, -16));
  group.add(num);
  const r = rng(3);
  r();

  return {
    id: "products",
    group,
    beats: 7,
    transition: "truck",
    inspectables: machines.map((m, i) => ({ id: products[i].slug, object: m.pivot, radius: m.radius, title: products[i].title, text: products[i].short })),
    pose: (k, side, mobile, sub) => {
      if (k < 0) return frame(machinePos(3).add(v3(0, 2, 0)), { dist: 34, h: 9, yaw: 0, side, mobile, shift: 0.2 });
      const i = Math.min(6, k);
      return frame(machinePos(i).add(v3(0, 2.0, 0)), { dist: 11.5, h: 1.8, yaw: 0.12 + (sub ?? 0) * 0.7, side, mobile, shift: 0.38 });
    },
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      machines.forEach((m, i) => {
        const near = Math.abs(s.local - i) < 2.2 || s.local < -0.5;
        m.plinth.visible = s.local < -5 || Math.abs(s.local - i) < 4 || s.local < 0;
        if (near) m.update(s.time, s.reduced);
      });
    },
    dispose: () => num.dispose(),
  };
}
