import * as THREE from "three";
import { word } from "../core/flow";
import { at, cyl, frame, mesh, rbox, rng, sph, tor, v3, type Ctx, type Station } from "./kit";

/* 08 — the districts. Eight solution blocks on a 4×2 grid, each with its own material identity.
   The camera rises over the roofs and drops into each one. */
export const DISTRICT_ORIGIN = v3(300, 0, -10);
export const districtPos = (i: number) => DISTRICT_ORIGIN.clone().add(v3((i % 4) * 20, 0, -Math.floor(i / 4) * 22));

type Block = { g: THREE.Group; update: (t: number, reduced: boolean) => void };

function base(ctx: Ctx, m: THREE.Material = ctx.mats.ceramic) {
  const g = new THREE.Group();
  g.add(at(mesh(rbox(12, 0.3, 12, 0.15), m), 0, 0.15, 0));
  return g;
}

const BUILDERS: ((ctx: Ctx) => Block)[] = [
  // RISE with SAP: glass spheres rising into a cloud
  (ctx) => {
    const g = base(ctx);
    const r = rng(1);
    const balls = Array.from({ length: 18 }, () => {
      const b = mesh(sph(0.35 + r() * 0.55, 40), ctx.mats.glass);
      b.userData.o = v3((r() - 0.5) * 6, r() * 6, (r() - 0.5) * 6);
      b.userData.s = 0.2 + r() * 0.4;
      g.add(b);
      return b;
    });
    g.add(at(mesh(rbox(2.4, 1.4, 2.4, 0.3), ctx.mats.anodised), 0, 1.0, 0));
    return {
      g,
      update: (t, red) =>
        balls.forEach((b) => {
          const y = red ? b.userData.o.y : (b.userData.o.y + t * b.userData.s) % 6;
          b.position.set(b.userData.o.x, 2 + y, b.userData.o.z);
        }),
    };
  },
  // GROW with SAP: stepped towers
  (ctx) => {
    const g = base(ctx);
    const towers = Array.from({ length: 9 }, (_, i) => {
      const h = 0.8 + i * 0.55;
      const m = at(mesh(rbox(1.3, h, 1.3, 0.14), i === 8 ? ctx.mats.anodised : ctx.mats.anodisedPale), ((i % 3) - 1) * 1.9, 0.3 + h / 2, (Math.floor(i / 3) - 1) * 1.9);
      m.userData.h = h;
      g.add(m);
      return m;
    });
    return { g, update: (t, red) => towers.forEach((m, i) => (m.scale.y = red ? 1 : 0.85 + 0.15 * Math.sin(t * 0.8 + i * 0.6))) };
  },
  // SAP BTP: layered plates with a module plugged on top
  (ctx) => {
    const g = base(ctx);
    [0, 1, 2].forEach((i) => g.add(at(mesh(rbox(7 - i * 1.4, 0.3, 7 - i * 1.4, 0.12), i === 1 ? ctx.mats.glassBlue : ctx.mats.ceramic), 0, 1.2 + i * 1.2, 0)));
    const mod = at(mesh(rbox(1.4, 1.4, 1.4, 0.3), ctx.mats.iridescent), 0, 5.2, 0);
    g.add(mod);
    return { g, update: (t, red) => (mod.position.y = red ? 5.0 : 5.0 + Math.sin(t * 1.2) * 0.35) };
  },
  // SAP Business AI: a glass core with orbiting modules
  (ctx) => {
    const g = base(ctx);
    g.add(at(mesh(sph(1.6, 64), ctx.mats.glass), 0, 3, 0), at(mesh(sph(0.6, 48), ctx.mats.signal, false), 0, 3, 0));
    const orb = new THREE.Group();
    orb.position.y = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      orb.add(at(mesh(rbox(0.45, 0.45, 0.45, 0.1), ctx.mats.anodised), Math.cos(a) * 3, Math.sin(a * 2) * 0.4, Math.sin(a) * 3));
    }
    g.add(orb);
    return { g, update: (t, red) => (orb.rotation.y = red ? 0.4 : t * 0.4) };
  },
  // industry-specific: a gear field beside a sawtooth hall
  (ctx) => {
    const g = base(ctx);
    const shape = new THREE.Shape();
    const teeth = 14;
    for (let i = 0; i <= teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 ? 1.6 : 2.0;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.5, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const gg = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
    const gear = at(mesh(gg, ctx.mats.steel), -1.6, 2.6, 0);
    const gear2 = at(mesh(gg, ctx.mats.anodised), 1.6, 2.6, 0.2);
    gear2.scale.setScalar(0.8);
    g.add(gear, gear2);
    for (let i = 0; i < 4; i++) {
      const roof = at(mesh(rbox(1.4, 0.2, 3, 0.05), ctx.mats.ceramicWarm), -3 + i * 1.5, 1.2, -3.5);
      roof.rotation.z = 0.5;
      g.add(roof);
    }
    return { g, update: (t, red) => ((gear.rotation.z = red ? 0 : t * 0.5), (gear2.rotation.z = red ? 0 : -t * 0.5 * 1.25 + 0.2)) };
  },
  // analytics and reporting: a bar city
  (ctx) => {
    const g = base(ctx);
    const bars = new THREE.InstancedMesh(rbox(0.7, 1, 0.7, 0.08), ctx.mats.anodised, 36);
    bars.castShadow = true;
    g.add(bars);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    return {
      g,
      update: (t, red) => {
        for (let i = 0; i < 36; i++) {
          const x = (i % 6) - 2.5, z = Math.floor(i / 6) - 2.5;
          const h = 0.6 + 3.2 * (0.5 + 0.5 * Math.sin((red ? 1 : t * 0.7) + x * 0.8 + z * 0.5)) * (1 - Math.hypot(x, z) / 6);
          s.set(1, h, 1);
          p.set(x * 0.95, 0.3 + h / 2, z * 0.95);
          m.compose(p, q, s);
          bars.setMatrixAt(i, m);
        }
        bars.instanceMatrix.needsUpdate = true;
      },
    };
  },
  // Integration Suite: interlinked rings
  (ctx) => {
    const g = base(ctx);
    const rings = [0, 1, 2, 3].map((i) => {
      const r = at(mesh(tor(1.4, 0.16, 96, 20), i % 2 ? ctx.mats.iridescent : ctx.mats.steel), -2.1 + i * 1.4, 3, 0);
      r.rotation.y = (i % 2) * Math.PI * 0.5;
      g.add(r);
      return r;
    });
    return { g, update: (t, red) => rings.forEach((r, i) => (r.rotation.x = red ? 0 : Math.sin(t * 0.6 + i) * 0.3)) };
  },
  // automation and workflow: a conveyor loop with tokens
  (ctx) => {
    const g = base(ctx);
    const loop = at(mesh(tor(3, 0.22, 160, 16), ctx.mats.ceramicInk), 0, 1.2, 0);
    loop.rotation.x = Math.PI / 2;
    loop.scale.set(1.3, 1, 1);
    g.add(loop);
    const tokens = Array.from({ length: 10 }, () => {
      const t = mesh(rbox(0.5, 0.4, 0.5, 0.1), ctx.mats.anodised);
      g.add(t);
      return t;
    });
    const check = at(mesh(rbox(1.2, 1.2, 1.2, 0.3), ctx.mats.ceramicBlue), 0, 1.0, 0);
    g.add(check);
    return {
      g,
      update: (t, red) =>
        tokens.forEach((k, i) => {
          const a = (i / 10) * Math.PI * 2 + (red ? 0 : t * 0.4);
          k.position.set(Math.cos(a) * 3.9, 1.55, Math.sin(a) * 3);
          k.rotation.y = -a;
        }),
    };
  },
];

export function solutionsStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const blocks = BUILDERS.map((b, i) => {
    const blk = b(ctx);
    blk.g.position.copy(districtPos(i));
    group.add(blk.g);
    return blk;
  });
  const num = word("06", { size: 18, color: "#E8E2D8" });
  num.position.copy(DISTRICT_ORIGIN).add(v3(30, 0, -48));
  group.add(num);
  return {
    id: "solutions",
    group,
    beats: 8,
    transition: "drop",
    pose: (k, side, mobile, sub) => {
      if (k < 0) return frame(DISTRICT_ORIGIN.clone().add(v3(30, 0, -11)), { dist: 44, h: 26, yaw: 0.3, side, mobile, shift: 0.16 });
      const i = Math.min(7, k);
      return frame(districtPos(i).add(v3(0, 2.6, 0)), { dist: 14, h: 5.5, yaw: (i % 2 ? -0.45 : 0.45) + (sub ?? 0) * 0.6, side, mobile, shift: 0.38 });
    },
    fx: () => ({ fog: 0.007, flood: 0 }),
    update(s) {
      blocks.forEach((b, i) => {
        if (s.local < -5 || Math.abs(s.local - i) < 2.5) b.update(s.time, s.reduced);
      });
    },
    dispose: () => num.dispose(),
  };
}

/* 09 — the ring road. Six industry dioramas on a turntable; the camera banks around it. */
export const RING_CENTER = v3(330, 0, -118);
const RING_R = 15;
export const dioramaPos = (i: number) => RING_CENTER.clone().add(v3(Math.cos((i / 6) * Math.PI * 2) * RING_R, 0, Math.sin((i / 6) * Math.PI * 2) * RING_R));

const DIORAMAS: ((ctx: Ctx) => Block)[] = [
  // automotive: a body shell on the line beside an articulated arm
  (ctx) => {
    const g = new THREE.Group();
    g.add(at(mesh(rbox(6, 0.2, 1.6, 0.06), ctx.mats.ceramicInk), 0, 0.5, 0));
    const body = new THREE.Group();
    body.add(at(mesh(rbox(3.2, 0.8, 1.5, 0.35), ctx.mats.anodised), 0, 1.1, 0), at(mesh(rbox(1.8, 0.7, 1.3, 0.32), ctx.mats.glassBlue), -0.2, 1.75, 0));
    g.add(body);
    const arm = new THREE.Group();
    arm.position.set(2.6, 0.4, -1.6);
    const up = at(mesh(rbox(0.3, 2.2, 0.3, 0.1), ctx.mats.steel), 0, 1.1, 0);
    const elbow = new THREE.Group();
    elbow.position.y = 2.2;
    elbow.add(at(mesh(rbox(1.8, 0.24, 0.24, 0.08), ctx.mats.steel), -0.9, 0, 0), at(mesh(sph(0.2, 20), ctx.mats.signal, false), -1.8, 0, 0));
    arm.add(at(mesh(cyl(0.45, 0.5, 0.4, 32), ctx.mats.ceramicInk), 0, 0, 0), up, elbow);
    g.add(arm);
    return { g, update: (t, red) => ((body.position.x = red ? 0 : Math.sin(t * 0.4) * 1.2), (elbow.rotation.z = red ? -0.3 : -0.3 + Math.sin(t * 1.1) * 0.35), (arm.rotation.y = red ? 0 : Math.sin(t * 0.7) * 0.4)) };
  },
  // metals and steel: a coil and glowing rollers
  (ctx) => {
    const g = new THREE.Group();
    const coil = at(mesh(cyl(1.4, 1.4, 1.2, 64), ctx.mats.steel), -1.8, 1.4, 0);
    coil.rotation.x = Math.PI / 2;
    g.add(coil, at(mesh(cyl(0.45, 0.45, 1.25, 32), ctx.mats.ceramicInk), -1.8, 1.4, 0));
    (g.children[1] as THREE.Mesh).rotation.x = Math.PI / 2;
    const rollers = [0.6, 1.6].flatMap((x) =>
      [0.6, 1.7].map((y) => {
        const r = at(mesh(cyl(0.45, 0.45, 1.4, 32), ctx.mats.chrome), x, y, 0);
        r.rotation.x = Math.PI / 2;
        g.add(r);
        return r;
      }),
    );
    const slab = at(mesh(rbox(3, 0.12, 1.0, 0.03), ctx.mats.signal, false), 2.4, 1.15, 0);
    g.add(slab);
    return { g, update: (t, red) => ((coil.rotation.y = red ? 0 : t * 0.5), rollers.forEach((r, i) => (r.rotation.y = red ? 0 : t * (i % 2 ? -2 : 2)))) };
  },
  // mill products: stacked rolls and one unwinding
  (ctx) => {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const r = at(mesh(cyl(0.6, 0.6, 1.8, 48), ctx.mats.ceramic), -1.6 + (i % 3) * 1.25, 0.6 + Math.floor(i / 3) * 1.15, 0);
      r.rotation.x = Math.PI / 2;
      g.add(r);
    }
    const big = at(mesh(cyl(1.1, 1.1, 1.8, 64), ctx.mats.iridescent), 2.2, 1.3, 0);
    big.rotation.x = Math.PI / 2;
    const sheet = at(mesh(rbox(2.6, 0.02, 1.7, 0.005), ctx.mats.ceramic), 3.6, 0.25, 0);
    g.add(big, sheet);
    return { g, update: (t, red) => (big.rotation.y = red ? 0 : t * 0.8) };
  },
  // pharmaceuticals: glass vials moving on a clean line
  (ctx) => {
    const g = new THREE.Group();
    g.add(at(mesh(rbox(6, 0.2, 1.2, 0.06), ctx.mats.ceramic), 0, 0.6, 0));
    const vials = Array.from({ length: 9 }, () => {
      const v = new THREE.Group();
      v.add(at(mesh(cyl(0.2, 0.2, 0.8, 32), ctx.mats.glass), 0, 0.4, 0), at(mesh(cyl(0.21, 0.21, 0.16, 32), ctx.mats.anodised), 0, 0.88, 0), at(mesh(cyl(0.17, 0.17, 0.3, 24), ctx.mats.glassBlue), 0, 0.2, 0));
      g.add(v);
      return v;
    });
    return {
      g,
      update: (t, red) =>
        vials.forEach((v, i) => {
          v.position.set(-2.8 + ((i * 0.65 + (red ? 0 : t * 0.5)) % 5.8), 0.7, 0);
        }),
    };
  },
  // engineering and fabrication: an I-beam and a welding spark
  (ctx) => {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    [[-0.6, -0.8], [0.6, -0.8], [0.6, -0.62], [0.12, -0.62], [0.12, 0.62], [0.6, 0.62], [0.6, 0.8], [-0.6, 0.8], [-0.6, 0.62], [-0.12, 0.62], [-0.12, -0.62], [-0.6, -0.62]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    const beam = at(mesh(new THREE.ExtrudeGeometry(s, { depth: 5, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), ctx.mats.steel), 0, 1.0, -2.5);
    const beam2 = at(mesh(beam.geometry, ctx.mats.anodised), 1.4, 2.6, 0);
    beam2.rotation.y = Math.PI / 2;
    beam2.position.set(-2.5, 2.6, 0);
    const spark = at(mesh(sph(0.16, 16), ctx.mats.signal, false), 0.6, 1.8, 0.2);
    g.add(beam, beam2, spark);
    return { g, update: (t, red) => (spark.scale.setScalar(red ? 1 : 0.6 + Math.abs(Math.sin(t * 17) * Math.sin(t * 5)) * 1.4)) };
  },
  // consumer durables: appliances on an assembly line
  (ctx) => {
    const g = new THREE.Group();
    g.add(at(mesh(rbox(6.4, 0.2, 1.6, 0.06), ctx.mats.ceramicInk), 0, 0.4, 0));
    const fridge = at(mesh(rbox(1.2, 2.4, 1.1, 0.16), ctx.mats.ceramic), -2, 1.7, 0);
    const washer = new THREE.Group();
    washer.add(at(mesh(rbox(1.3, 1.3, 1.2, 0.18), ctx.mats.ceramic), 0, 0, 0), at(mesh(cyl(0.42, 0.42, 0.06, 48), ctx.mats.glassBlue), 0, 0, 0.6));
    (washer.children[1] as THREE.Mesh).rotation.x = Math.PI / 2;
    washer.position.set(0.2, 1.15, 0);
    const box = at(mesh(rbox(1.2, 1.2, 1.2, 0.2), ctx.mats.anodised), 2.2, 1.1, 0);
    g.add(fridge, washer, box);
    return { g, update: (t, red) => (washer.children[1].rotation.z = red ? 0 : t * 3) };
  },
];

export function industriesStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const table = at(mesh(cyl(RING_R + 5, RING_R + 5.4, 0.3, 160), ctx.mats.ceramic), RING_CENTER.x, 0.15, RING_CENTER.z);
  const road = at(mesh(tor(RING_R, 0.05, 240, 8), ctx.mats.anodised), RING_CENTER.x, 0.32, RING_CENTER.z);
  road.rotation.x = Math.PI / 2;
  group.add(table, road);
  const blocks = DIORAMAS.map((b, i) => {
    const blk = b(ctx);
    blk.g.position.copy(dioramaPos(i)).add(v3(0, 0.3, 0));
    blk.g.lookAt(RING_CENTER.x, 0.3, RING_CENTER.z);
    blk.g.rotateY(Math.PI);
    group.add(blk.g);
    return blk;
  });
  const num = word("07", { size: 14, color: "#E8E2D8" });
  num.position.copy(RING_CENTER).add(v3(0, 0.3, 0));
  group.add(num);
  return {
    id: "industries",
    group,
    beats: 6,
    transition: "bank",
    orbitCenter: RING_CENTER.clone().add(v3(0, 2, 0)),
    pose: (k, side, mobile, sub) => {
      if (k < 0) return frame(RING_CENTER.clone().add(v3(0, 2, 0)), { dist: 40, h: 22, yaw: 0.6, side, mobile, shift: 0.16 });
      const i = Math.min(5, k);
      const a = (i / 6) * Math.PI * 2;
      const focus = dioramaPos(i).add(v3(0, 1.6, 0));
      // camera outside the ring, looking in at the diorama; roll leans into the curve
      const yaw = Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI / 2 + (sub ?? 0) * 0.6;
      const pose = frame(focus, { dist: 9, h: 2.4, yaw: -a + Math.PI / 2 + 0.0 * yaw, side, mobile, shift: 0.3 });
      // put the camera outside the ring
      const out = focus.clone().sub(RING_CENTER).setY(0).normalize();
      pose.p.copy(focus).addScaledVector(out, mobile ? 13 : 8.5).add(v3(0, mobile ? 3 : 2.2, 0));
      const right = new THREE.Vector3().crossVectors(focus.clone().sub(pose.p).normalize(), v3(0, 1, 0)).normalize();
      pose.t.copy(focus);
      if (mobile) pose.t.y -= 3;
      else pose.t.addScaledVector(right, side === "left" ? -3.2 : 3.2);
      pose.roll = (i % 2 ? 1 : -1) * 0.04;
      return pose;
    },
    fx: () => ({ fog: 0.007, flood: 0 }),
    update(s) {
      blocks.forEach((b, i) => {
        if (s.local < -5 || Math.abs(s.local - i) < 2.5 || s.local < 0) b.update(s.time, s.reduced);
      });
    },
    dispose: () => num.dispose(),
  };
}
