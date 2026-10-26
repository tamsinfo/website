import * as THREE from "three";
import { word } from "../core/flow";
import { at, clamp01, frame, mesh, rbox, rng, smooth, sph, tor, cyl, v3, type Ctx, type Station } from "./kit";

/* 03 — the strain rail. Five physical metaphors along a curved rail. Each strains as the camera
   arrives (f → 0) and resolves as it moves on (f → 1). f = local − index. */
export const PROBLEMS_ORIGIN = v3(-52, 0, -64);
export const problemPos = (i: number) => PROBLEMS_ORIGIN.clone().add(v3(i * 15, 0, -Math.sin(i * 0.9) * 5));

type Piece = { group: THREE.Group; update: (strain: number, resolve: number, t: number, reduced: boolean) => void; dispose?: () => void };

function agility(ctx: Ctx): Piece {
  const g = new THREE.Group();
  const segs = Array.from({ length: 9 }, () => {
    const s = mesh(rbox(0.66, 0.46, 0.5, 0.08), ctx.mats.steel);
    g.add(s);
    return s;
  });
  const hinges = Array.from({ length: 8 }, () => {
    const h = mesh(sph(0.13, 24), ctx.mats.anodised);
    g.add(h);
    return h;
  });
  const press = at(mesh(rbox(2.4, 0.7, 1.0, 0.14), ctx.mats.ceramicBlue), 0, 3.2, 0);
  const rodL = at(mesh(cyl(0.05, 0.05, 3.4, 16), ctx.mats.chrome), -1.0, 3.9, 0);
  const rodR = at(mesh(cyl(0.05, 0.05, 3.4, 16), ctx.mats.chrome), 1.0, 3.9, 0);
  g.add(press, rodL, rodR, at(mesh(rbox(0.8, 0.9, 0.9, 0.1), ctx.mats.ceramic), -3.4, 0.45, 0), at(mesh(rbox(0.8, 0.9, 0.9, 0.1), ctx.mats.ceramic), 3.4, 0.45, 0));
  return {
    group: g,
    update(strain, resolve, t, reduced) {
      const shake = reduced ? 0 : Math.sin(t * 38) * 0.02 * strain;
      segs.forEach((s, i) => {
        const u = (i - 4) / 4;
        const gap = 0.72 + resolve * 0.22;
        const bend = strain * 0.55 * (1 - u * u);
        const wave = reduced ? 0 : Math.sin(t * 1.8 + i * 0.75) * 0.22 * resolve;
        s.position.set((i - 4) * gap + shake, 1.15 - bend + wave, 0);
        s.rotation.z = strain * u * 0.35 + (reduced ? 0 : Math.cos(t * 1.8 + i * 0.75) * 0.25 * resolve);
      });
      hinges.forEach((h, i) => {
        h.position.lerpVectors(segs[i].position, segs[i + 1].position, 0.5);
        h.scale.setScalar(Math.max(0.001, resolve));
      });
      press.position.y = 3.2 - strain * 0.75 + resolve * 1.6;
    },
  };
}

function chain(ctx: Ctx): Piece {
  const g = new THREE.Group();
  const links = Array.from({ length: 6 }, (_, i) => {
    const l = mesh(tor(0.42, 0.085, 64, 16), i % 2 ? ctx.mats.glass : ctx.mats.steel);
    l.scale.set(1.45, 1, 1);
    g.add(l);
    return l;
  });
  const bridge = mesh(tor(0.42, 0.095, 64, 16), ctx.mats.anodised);
  bridge.scale.set(1.45, 1, 1);
  g.add(bridge);
  return {
    group: g,
    update(strain, resolve, t, reduced) {
      links.forEach((l, i) => {
        const side = i < 3 ? -1 : 1;
        const base = (i - 2.5) * (1.02 - resolve * 0.22);
        const pull = side * (strain * 0.9 + 0.5) * (1 - resolve);
        l.position.set(base + pull, 1.5 + (reduced ? 0 : Math.sin(t * 9 + i) * 0.03 * strain), 0);
        l.rotation.x = (i % 2) * Math.PI * 0.5;
        l.rotation.z = (reduced ? 0 : Math.sin(t * 7 + i) * 0.08 * strain) * side;
      });
      bridge.position.set(0, 1.5 + (1 - resolve) * 2.2, 0);
      bridge.rotation.x = Math.PI * 0.5;
      bridge.scale.setScalar(Math.max(0.001, resolve));
      bridge.scale.x *= 1.45;
    },
  };
}

function transparency(ctx: Ctx): Piece {
  const g = new THREE.Group();
  const mat = ctx.mats.frosted.clone();
  const block = at(mesh(rbox(3.4, 2.1, 2.1, 0.3), mat), 0, 1.35, 0);
  g.add(block);
  for (const [x, y] of [[-1.7, 0.3], [1.7, 0.3], [-1.7, 2.4], [1.7, 2.4]]) g.add(at(mesh(rbox(0.1, 0.1, 2.2, 0.04), ctx.mats.steel), x, y, 0));
  for (const y of [0.3, 2.4]) for (const z of [-1.05, 1.05]) g.add(at(mesh(rbox(3.5, 0.1, 0.1, 0.04), ctx.mats.steel), 0, y, z));
  const flow = Array.from({ length: 22 }, (_, i) => {
    const b = mesh(sph(i % 4 ? 0.16 : 0.24, 20), ctx.mats.anodised, false);
    g.add(b);
    return b;
  });
  g.add(at(mesh(rbox(3.8, 0.24, 2.5, 0.08), ctx.mats.ceramic), 0, 0.12, 0));
  return {
    group: g,
    update(strain, resolve, t, reduced) {
      mat.roughness = 0.9 - 0.86 * resolve;
      mat.thickness = 2 - resolve * 1.2;
      const speed = 0.2 + resolve * 0.9 - strain * 0.15;
      flow.forEach((b, i) => {
        const a = (reduced ? i / 22 : (i / 22 + t * speed * 0.15) % 1) * Math.PI * 2;
        b.position.set(Math.cos(a) * 1.15, 1.35 + Math.sin(a * 2) * 0.45, Math.sin(a) * 0.55);
      });
    },
    dispose: () => mat.dispose(),
  };
}

function security(ctx: Ctx): Piece {
  const g = new THREE.Group();
  g.add(at(mesh(cyl(0.7, 0.8, 1.6, 64), ctx.mats.ceramic), 0, 0.8, 0));
  g.add(at(mesh(cyl(0.5, 0.5, 0.12, 48), ctx.mats.ceramicBlue), 0, 1.66, 0));
  const r = rng(5);
  const plates: { m: THREE.Mesh; dir: THREE.Vector3; spin: THREE.Euler }[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const cols = 6;
  const rows = 3;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const pg = new THREE.SphereGeometry(2.1, 12, 8, (i / cols) * Math.PI * 2 + 0.03, (Math.PI * 2) / cols - 0.06, (j / rows) * Math.PI * 0.5 + 0.03, (Math.PI * 0.5) / rows - 0.05);
      geos.push(pg);
      const m = mesh(pg, j === rows - 1 ? ctx.mats.anodisedPale : ctx.mats.anodised);
      m.material.side = THREE.DoubleSide;
      const mid = new THREE.Vector3().setFromSphericalCoords(2.1, ((j + 0.5) / rows) * Math.PI * 0.5, ((i + 0.5) / cols) * Math.PI * 2);
      plates.push({ m, dir: mid.normalize(), spin: new THREE.Euler((r() - 0.5) * 1.6, (r() - 0.5) * 1.6, (r() - 0.5) * 1.6) });
      g.add(m);
    }
  return {
    group: g,
    update(strain, resolve, t, reduced) {
      const open = 1 - resolve;
      plates.forEach((p, i) => {
        const rattle = reduced ? 0 : Math.sin(t * 22 + i * 1.7) * 0.05 * strain;
        p.m.position.copy(p.dir).multiplyScalar(open * 2.4 + rattle).add(v3(0, 0.05 + open * 0.4, 0));
        p.m.rotation.set(p.spin.x * open, p.spin.y * open, p.spin.z * open);
      });
    },
    dispose: () => geos.forEach((x) => x.dispose()),
  };
}

function outgrow(ctx: Ctx): Piece {
  const g = new THREE.Group();
  const boxOf = (s: number, m: THREE.Material) => {
    const b = new THREE.Group();
    const w = 0.07;
    b.add(at(mesh(rbox(s, w, s, 0.03), m), 0, w / 2, 0));
    [
      [0, s / 2, s / 2, s, s, w],
      [0, s / 2, -s / 2, s, s, w],
      [s / 2, s / 2, 0, w, s, s],
      [-s / 2, s / 2, 0, w, s, s],
    ].forEach(([x, y, z, a, bb, c]) => b.add(at(mesh(rbox(a, bb, c, 0.03), m), x, y, z)));
    return b;
  };
  const small = boxOf(1.3, ctx.mats.ceramicWarm);
  const big = boxOf(3.2, ctx.mats.glass);
  g.add(small, big);
  const r = rng(9);
  const cubes = Array.from({ length: 48 }, (_, i) => {
    const c = mesh(rbox(0.3, 0.3, 0.3, 0.06), i % 3 ? ctx.mats.anodisedPale : ctx.mats.anodised);
    c.userData.spill = v3((r() - 0.5) * 3.2, 0.15 + r() * 2.2, (r() - 0.5) * 3.2);
    c.userData.home = v3(((i % 6) - 2.5) * 0.42, 0.2 + Math.floor(i / 36) * 0.34, ((Math.floor(i / 6) % 6) - 2.5) * 0.42);
    c.userData.rot = r() * 3;
    g.add(c);
    return c;
  });
  return {
    group: g,
    update(strain, resolve, t, reduced) {
      big.scale.setScalar(Math.max(0.001, 0.35 + resolve * 0.65));
      big.visible = resolve > 0.02;
      small.visible = resolve < 0.98;
      small.scale.setScalar(1 - resolve * 0.4);
      cubes.forEach((c, i) => {
        const bob = reduced ? 0 : Math.sin(t * 3 + i) * 0.04 * strain;
        c.position.lerpVectors(c.userData.spill, c.userData.home, resolve).y += bob;
        c.rotation.set(c.userData.rot * (1 - resolve), c.userData.rot * 0.5 * (1 - resolve), 0);
      });
    },
  };
}

export function problemsStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const pieces = [agility(ctx), chain(ctx), transparency(ctx), security(ctx), outgrow(ctx)];
  pieces[1].group.scale.setScalar(1.7);
  pieces[1].group.position.y = -1.0;
  pieces.forEach((p, i) => {
    p.group.position.add(problemPos(i));
    group.add(p.group);
  });
  // the rail: a long anodised line the camera cranes along
  const pts = Array.from({ length: 30 }, (_, i) => problemPos(i / 6.0 - 0.5).add(v3(0, 0.02, 3.2)));
  const railCurve = new THREE.CatmullRomCurve3(pts);
  const railGeo = new THREE.TubeGeometry(railCurve, 300, 0.05, 10, false);
  group.add(mesh(railGeo, ctx.mats.anodised, false, false));
  const num = word("02", { size: 16, color: "#E8E2D8" });
  num.position.copy(problemPos(2)).add(v3(-2, 0, -14));
  group.add(num);

  return {
    id: "problems",
    group,
    beats: 5,
    transition: "arc",
    pose: (k, side, mobile, sub) => {
      const i = Math.max(0, Math.min(4, k));
      const yaw = (i % 2 ? -0.32 : 0.28) + (sub ?? 0) * 0.6;
      return frame(problemPos(i).add(v3(0, 1.6, 0)), { dist: 10.5, h: 1.3, yaw, side, mobile, shift: 0.27 });
    },
    fx: () => ({ fog: 0.008, flood: 0 }),
    update(s) {
      pieces.forEach((p, i) => {
        const f = s.local - i;
        if (Math.abs(f) > 3 && s.local > -5) {
          p.group.visible = Math.abs(f) < 6;
        }
        const strain = smooth(-0.9, -0.05, f) * (1 - smooth(0.05, 0.55, f));
        const resolve = s.local < -5 ? 1 : clamp01(smooth(0.05, 0.75, f));
        p.update(strain, resolve, s.time, s.reduced);
      });
    },
    dispose: () => {
      pieces.forEach((p) => p.dispose?.());
      railGeo.dispose();
      num.dispose();
    },
  };
}
