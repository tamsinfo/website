import * as THREE from "three";
import { word } from "../core/flow";
import { at, clamp01, cyl, ease, frame, mesh, rbox, rng, smooth, v3, type Ctx, type Station } from "./kit";

/* 04 — the lifecycle. One set of 48 anodised blocks re-forms four times while the camera
   orbits a single spot: blueprint → structure, support wheel with SLA hand, core with snapping
   modules, right-sized selection. */
export const SERVICES_ORIGIN = v3(44, 0, -94);
const N = 48;
const S = 0.72; // block size

type F = { p: THREE.Vector3; q: THREE.Quaternion }[];
const Q = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

function formations(): F[] {
  const tower: F = [];
  for (let i = 0; i < N; i++) {
    const x = i % 4, z = Math.floor(i / 4) % 3, l = Math.floor(i / 12);
    tower.push({ p: v3((x - 1.5) * 0.76, 0.42 + l * 0.76, (z - 1) * 0.76), q: Q() });
  }
  const wheel: F = [];
  for (let i = 0; i < N; i++) {
    const outer = i < 28;
    const n = outer ? 28 : 20;
    const a = ((outer ? i : i - 28) / n) * Math.PI * 2;
    const r = outer ? 3.0 : 2.05;
    wheel.push({ p: v3(Math.cos(a) * r, 3.4 + Math.sin(a) * r, 0), q: Q(0, 0, a) });
  }
  const core: F = [];
  const faces: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
    [v3(0, 1, 0), v3(1, 0, 0), v3(0, 0, 1)],
    [v3(1, 0, 0), v3(0, 1, 0), v3(0, 0, 1)],
    [v3(-1, 0, 0), v3(0, 1, 0), v3(0, 0, 1)],
    [v3(0, 0, 1), v3(1, 0, 0), v3(0, 1, 0)],
    [v3(0, 0, -1), v3(1, 0, 0), v3(0, 1, 0)],
  ];
  const c = v3(0, 1.6, 0);
  for (let i = 0; i < 45; i++) {
    const [n, a, b] = faces[Math.floor(i / 9)];
    const u = (i % 3) - 1, w = Math.floor((i % 9) / 3) - 1;
    core.push({ p: c.clone().addScaledVector(n, 1.1 + S / 2 + 0.02).addScaledVector(a, u * 0.74).addScaledVector(b, w * 0.74), q: Q() });
  }
  for (let i = 45; i < N; i++) core.push({ p: c.clone().add(v3(-2.4 + (i - 45) * 0.9, 3.6, 1.6)), q: Q(0.3, 0.4, 0) });
  const pick: F = [];
  for (let i = 0; i < N; i++) {
    const x = i % 8, z = Math.floor(i / 8);
    const chosen = i < 12;
    pick.push({ p: v3((x - 3.5) * 0.9, chosen ? 1.05 : 0.38, (z - 2.5) * 0.9), q: chosen ? Q(0, 0.25, 0) : Q() });
  }
  return [tower, wheel, core, pick];
}

export function servicesStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  group.position.copy(SERVICES_ORIGIN);
  const g = rbox(S, S, S, 0.12);
  const blue = new THREE.InstancedMesh(g, ctx.mats.anodised, 24);
  const pale = new THREE.InstancedMesh(g, ctx.mats.anodisedPale, 24);
  [blue, pale].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  });
  const F = formations();
  const r = rng(17);
  const delay = Array.from({ length: N }, () => r());
  // index map: anodised blocks are the even indices (so selections and towers mix both)
  const meshOf = (i: number) => (i < 12 || (i >= 24 && i % 2 === 0) ? blue : pale);
  const slots: number[] = [];
  let bi = 0, pi = 0;
  for (let i = 0; i < N; i++) slots.push(meshOf(i) === blue && bi < 24 ? bi++ : meshOf(i) === pale && pi < 24 ? pi++ : bi < 24 ? bi++ : pi++);
  const owner: THREE.InstancedMesh[] = [];
  bi = 0;
  pi = 0;
  for (let i = 0; i < N; i++) {
    const want = meshOf(i);
    if ((want === blue && bi < 24) || pi >= 24) {
      owner.push(blue);
      slots[i] = bi++;
    } else {
      owner.push(pale);
      slots[i] = pi++;
    }
  }

  // formation props
  const plate = at(mesh(rbox(5.4, 0.05, 4.2, 0.02), ctx.mats.glassBlue, false), 0, 0.03, 0);
  const lines = new THREE.Group();
  for (let i = -3; i <= 3; i++) lines.add(at(mesh(rbox(0.02, 0.012, 4.0, 0.005), ctx.mats.lineBlue, false, false), i * 0.75, 0.07, 0));
  for (let i = -2; i <= 2; i++) lines.add(at(mesh(rbox(5.2, 0.012, 0.02, 0.005), ctx.mats.lineBlue, false, false), 0, 0.07, i * 0.75));
  const hand = new THREE.Group();
  hand.add(at(mesh(rbox(0.12, 1.6, 0.12, 0.05), ctx.mats.chrome), 0, 0.8, 0.2));
  hand.add(at(mesh(cyl(0.22, 0.22, 0.2, 32), ctx.mats.steel), 0, 0, 0.2));
  hand.position.set(0, 3.4, 0);
  hand.children[1].rotation.x = Math.PI / 2;
  const sla = at(mesh(rbox(0.3, 0.08, 0.08, 0.03), ctx.mats.signal, false), 0, 6.55, 0);
  const coreBox = at(mesh(rbox(2.2, 2.2, 2.2, 0.28), ctx.mats.ceramic), 0, 1.6, 0);
  const tray = at(mesh(rbox(7.6, 0.12, 5.8, 0.06), ctx.mats.ceramicWarm), 0, 0.06, 0);
  group.add(plate, lines, hand, sla, coreBox, tray);
  const num = word("03", { size: 16, color: "#E8E2D8" });
  num.position.set(-9, 0, -12);
  num.rotation.y = 0.4;
  group.add(num);

  const m4 = new THREE.Matrix4();
  const qa = new THREE.Quaternion();
  const pa = new THREE.Vector3();
  const one = v3(1, 1, 1);
  const center = SERVICES_ORIGIN.clone().add(v3(0, 1.8, 0));

  return {
    id: "services",
    group,
    beats: 4,
    transition: "orbit",
    orbitCenter: center,
    pose: (k, side, mobile, sub) => {
      const kk = Math.max(0, k);
      const focus = center.clone().add(v3(0, kk === 1 ? 1.4 : 0, 0));
      return frame(focus, { dist: kk === 1 ? 12.5 : 10.5, h: 2.6, yaw: kk * (Math.PI / 2) + 0.35 + (sub ?? 0) * 0.5, side, mobile, shift: 0.32 });
    },
    fx: () => ({ fog: 0.0075, flood: 0 }),
    update(s) {
      const f = Math.min(3, Math.max(0, s.local));
      const a = Math.floor(f);
      const b = Math.min(3, a + 1);
      const t = f - a;
      const spin = s.reduced ? 0 : s.time * 0.25;
      for (let i = 0; i < N; i++) {
        const e = ease(clamp01((t - delay[i] * 0.4) / 0.6));
        const A = F[a][i], B = F[b][i];
        pa.lerpVectors(A.p, B.p, e);
        pa.y += Math.sin(Math.PI * e) * (1.2 + delay[i]);
        qa.slerpQuaternions(A.q, B.q, e);
        // the support wheel turns while it is formed
        const wheelW = (a === 1 ? 1 - e : 0) + (b === 1 ? e : 0);
        if (wheelW > 0 && !s.reduced) {
          const ang = spin * wheelW * (i < 28 ? 1 : -1.3);
          const cx = pa.x, cy = pa.y - 3.4;
          pa.x = cx * Math.cos(ang) - cy * Math.sin(ang);
          pa.y = 3.4 + cx * Math.sin(ang) + cy * Math.cos(ang);
        }
        m4.compose(pa, qa, one);
        owner[i].setMatrixAt(slots[i], m4);
      }
      blue.instanceMatrix.needsUpdate = true;
      pale.instanceMatrix.needsUpdate = true;
      const w = (k: number) => Math.max(0.0001, 1 - Math.min(1, Math.abs(f - k) * 1.6));
      plate.scale.setScalar(w(0));
      lines.scale.setScalar(w(0));
      hand.scale.setScalar(w(1));
      hand.rotation.z = s.reduced ? -0.8 : -s.time * 0.9;
      sla.scale.setScalar(w(1));
      coreBox.scale.setScalar(smooth(0, 1, w(2)));
      tray.scale.set(w(3), 1, w(3));
    },
    dispose: () => {
      blue.dispose();
      pale.dispose();
      num.dispose();
    },
  };
}
