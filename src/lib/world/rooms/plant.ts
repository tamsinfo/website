// The home room: raw material becomes parts, parts become machines, machines connect
// into a plant, and the plant connects to SAP. Every state is a pure function of story
// progress so the same scroll position always produces the same frame.
import * as THREE from "three";
import type { Kit } from "../kit";
import type { Env, FrameCtx, Room } from "../types";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const NIGHT: Env = {
  bg: "#0b1a56",
  floor: "#15266c",
  hemiSky: "#9db0ff",
  hemiGround: "#0b1a56",
  hemi: 0.75,
  key: 1.1,
  keyColor: "#c9d4ff",
  env: 0.32,
  fogNear: 13,
  fogFar: 40,
  night: 1,
};

const DAY: Env = {
  bg: "#f2eee7",
  floor: "#e8e2d7",
  hemiSky: "#ffffff",
  hemiGround: "#d3cab9",
  hemi: 0.9,
  key: 2.8,
  keyColor: "#fff4e6",
  env: 0.62,
  fogNear: 30,
  fogFar: 82,
  night: 0,
};

type Machine = {
  id: string;
  group: THREE.Group;
  status: THREE.Mesh;
  halo: THREE.Sprite;
  rack: THREE.Vector3;
  period: number;
  phase: number;
  animate(t: number, on: number): void;
  hover: number;
};

export function buildPlant(kit: Kit, { pieces = 20 }: { pieces?: number } = {}): Room {
  const group = new THREE.Group();
  group.name = "plant";
  const { mat } = kit;

  // painted aisle lines on the floor
  const lineMat = kit.track(new THREE.MeshBasicMaterial({ color: "#d9d3c8", transparent: true, opacity: 0.5 }));
  for (const [x, z, w, d] of [
    [0, 4.2, 18, 0.06],
    [0, -4.6, 18, 0.06],
    [-7.6, -0.2, 0.06, 8.8],
    [7.6, -0.2, 0.06, 8.8],
  ] as const) {
    const m = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(w, d)), lineMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.004, z);
    group.add(m);
  }

  const machines: Machine[] = [];

  function statusLight(parent: THREE.Group, x: number, y: number, z: number) {
    kit.place(parent, kit.cylinder(0.025, 0.025, y, 12), mat.graphite, x, y / 2, z);
    const status = kit.place(parent, kit.sphere(0.08), mat.signal, x, y + 0.05, z, 0, false);
    const halo = kit.glow("#ff6a2a", 0.9);
    halo.position.set(x, y + 0.05, z);
    parent.add(halo);
    return { status, halo };
  }

  // Gate: boom barrier, weighbridge deck and a waiting truck
  {
    const g = new THREE.Group();
    g.position.set(-5.4, 0, 0.9);
    g.rotation.y = 0.35;
    kit.place(g, kit.rounded(3.2, 0.08, 1.5, 0.03), mat.steel, 0.6, 0.04, 0);
    kit.place(g, kit.rounded(0.34, 1.1, 0.34, 0.05), mat.porcelain, -1.35, 0.55, 1.05);
    const boomPivot = new THREE.Group();
    boomPivot.position.set(-1.35, 0.98, 1.05);
    g.add(boomPivot);
    const boom = kit.place(boomPivot, kit.rounded(3.0, 0.08, 0.08, 0.03), mat.blueMetal, 1.5, 0, 0);
    boom.castShadow = true;
    // truck: cab and trailer
    const truck = new THREE.Group();
    truck.position.set(1.7, 0.08, 0);
    g.add(truck);
    kit.place(truck, kit.rounded(0.9, 0.9, 1.0, 0.12), mat.porcelain, -1.2, 0.62, 0);
    kit.place(truck, kit.rounded(0.5, 0.36, 0.92, 0.06), mat.glass, -1.55, 0.86, 0);
    kit.place(truck, kit.rounded(2.2, 1.05, 1.08, 0.08), mat.blueMetal, 0.45, 0.72, 0);
    for (const wx of [-1.25, 0.0, 1.1]) {
      for (const wz of [-0.5, 0.5]) {
        const w = kit.place(truck, kit.cylinder(0.2, 0.2, 0.14, 24), mat.rubber, wx, 0.2, wz);
        w.rotation.x = Math.PI / 2;
      }
    }
    const { status, halo } = statusLight(g, -1.75, 1.35, 1.05);
    group.add(g);
    machines.push({
      id: "gate",
      group: g,
      status,
      halo,
      rack: new THREE.Vector3(-5.6, 0, 2.6),
      period: 1.7,
      phase: 0.2,
      hover: 0,
      animate(t, on) {
        const cycle = (Math.sin(t * 0.55) + 1) / 2;
        boomPivot.rotation.z = THREE.MathUtils.lerp(0, 1.25, smooth(0.55, 0.9, cycle) * on);
        truck.position.x = 1.7 - smooth(0.7, 1, cycle) * 0.35 * on;
      },
    });
  }

  // Press: production process
  {
    const g = new THREE.Group();
    g.position.set(-1.7, 0, -2.3);
    g.rotation.y = 0.1;
    kit.place(g, kit.rounded(2.4, 0.42, 1.7, 0.08), mat.porcelain, 0, 0.21, 0);
    kit.place(g, kit.rounded(1.6, 0.18, 1.1, 0.04), mat.graphite, 0, 0.51, 0);
    for (const cx of [-0.85, 0.85]) {
      for (const cz of [-0.45, 0.45]) kit.place(g, kit.cylinder(0.09, 0.09, 2.2, 24), mat.steel, cx, 1.5, cz);
    }
    kit.place(g, kit.rounded(2.2, 0.55, 1.5, 0.1), mat.blueMetal, 0, 2.75, 0);
    const ram = kit.place(g, kit.rounded(1.3, 0.32, 0.9, 0.06), mat.porcelain, 0, 1.9, 0);
    const { status, halo } = statusLight(g, 1.35, 3.25, 0.6);
    group.add(g);
    machines.push({
      id: "press",
      group: g,
      status,
      halo,
      rack: new THREE.Vector3(-2.0, 0, -0.55),
      period: 2.3,
      phase: 1.1,
      hover: 0,
      animate(t, on) {
        const stroke = Math.pow(Math.abs(Math.sin(t * 1.1)), 3);
        ram.position.y = 2.05 - stroke * 1.15 * (0.35 + on * 0.65);
      },
    });
  }

  // Machining cell: connected factory
  {
    const g = new THREE.Group();
    g.position.set(2.5, 0, -1.2);
    g.rotation.y = -0.28;
    kit.place(g, kit.rounded(2.3, 1.75, 1.7, 0.16), mat.porcelain, 0, 0.875, 0);
    kit.place(g, kit.rounded(1.35, 0.9, 0.06, 0.04), mat.glass, -0.2, 1.05, 0.86);
    kit.place(g, kit.rounded(0.42, 1.1, 0.08, 0.04), mat.blueMetal, 0.82, 1.0, 0.87);
    const spindle = new THREE.Group();
    spindle.position.set(-0.2, 1.05, 0.95);
    g.add(spindle);
    const chuck = kit.place(spindle, kit.gear(0.22, 10, 0.06, 0.06), mat.steel, 0, 0, 0.02);
    chuck.rotation.set(0, 0, 0);
    kit.place(g, kit.cylinder(0.04, 0.04, 0.6, 12), mat.graphite, 0.75, 2.05, -0.4);
    kit.place(g, kit.sphere(0.09), mat.steel, 0.75, 2.38, -0.4);
    const { status, halo } = statusLight(g, -0.95, 2.2, 0.6);
    group.add(g);
    machines.push({
      id: "cell",
      group: g,
      status,
      halo,
      rack: new THREE.Vector3(1.9, 0, 0.75),
      period: 1.3,
      phase: 2.4,
      hover: 0,
      animate(t, on) {
        spindle.rotation.z = t * (1.5 + on * 4);
      },
    });
  }

  // Dispatch: containers and a gantry hoist
  {
    const g = new THREE.Group();
    g.position.set(5.9, 0, 1.2);
    g.rotation.y = -0.5;
    const ribbed = (x: number, y: number, z: number, m: THREE.Material) => {
      kit.place(g, kit.rounded(2.0, 0.85, 0.9, 0.05), m, x, y, z);
      for (let i = -3; i <= 3; i += 1) kit.place(g, kit.rounded(0.04, 0.8, 0.94, 0.01), mat.graphite, x + i * 0.27, y, z, 0, false);
    };
    ribbed(0, 0.43, -0.55, mat.blueMetal);
    ribbed(0, 0.43, 0.5, mat.porcelain);
    ribbed(0.1, 1.29, -0.5, mat.porcelain);
    for (const gx of [-1.3, 1.3]) kit.place(g, kit.rounded(0.12, 2.6, 0.12, 0.03), mat.steel, gx, 1.3, 1.25);
    kit.place(g, kit.rounded(2.8, 0.14, 0.18, 0.04), mat.steel, 0, 2.6, 1.25);
    const hoist = new THREE.Group();
    hoist.position.set(0, 2.5, 1.25);
    g.add(hoist);
    kit.place(hoist, kit.rounded(0.3, 0.22, 0.3, 0.05), mat.blueDeep, 0, 0, 0);
    kit.place(hoist, kit.cylinder(0.01, 0.01, 0.9, 6), mat.graphite, 0, -0.55, 0, 0, false);
    kit.place(hoist, kit.rounded(0.5, 0.06, 0.5, 0.02), mat.steel, 0, -1.0, 0);
    const { status, halo } = statusLight(g, -1.3, 2.9, 1.25);
    group.add(g);
    machines.push({
      id: "dispatch",
      group: g,
      status,
      halo,
      rack: new THREE.Vector3(5.0, 0, 2.95),
      period: 2.9,
      phase: 0.7,
      hover: 0,
      animate(t, on) {
        hoist.position.x = Math.sin(t * 0.45) * 1.0 * (0.4 + on * 0.6);
      },
    });
  }

  // part racks in front of each machine
  for (const m of machines) {
    kit.place(group, kit.rounded(2.3, 0.1, 0.6, 0.03), mat.graphite, m.rack.x, 0.05, m.rack.z);
  }

  // pieces: billets become gears, gears dock on racks
  const billetGeo = kit.rounded(0.95, 0.26, 0.26, 0.05, 2);
  const gearGeo = kit.gear(0.25, 12, 0.12, 0.08);
  const billets = new THREE.InstancedMesh(billetGeo, mat.porcelain, pieces);
  const gears = new THREE.InstancedMesh(gearGeo, mat.blueMetal, pieces);
  billets.castShadow = billets.receiveShadow = true;
  gears.castShadow = gears.receiveShadow = true;
  billets.frustumCulled = gears.frustumCulled = false;
  group.add(billets, gears);

  // a deterministic scatter so every visitor sees the same opening composition
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const pieceState = Array.from({ length: pieces }, (_, i) => {
    const angle = rand() * Math.PI * 2;
    const radius = 1.2 + rand() * 3.6;
    const raw = new THREE.Vector3(Math.cos(angle) * radius * 1.25, 0.13, 2.6 + Math.sin(angle) * radius * 0.65);
    const machine = machines[i % machines.length]!;
    const slot = Math.floor(i / machines.length);
    const perRack = Math.ceil(pieces / machines.length);
    const dock = machine.rack.clone().add(new THREE.Vector3((slot - (perRack - 1) / 2) * 0.42, 0.36, 0));
    return {
      raw,
      dock,
      yaw: rand() * Math.PI,
      stack: rand() > 0.75 ? 0.26 : 0,
      delay: rand() * 0.35,
      spin: 0.4 + rand() * 0.8,
      offset: new THREE.Vector3(),
    };
  });
  for (const p of pieceState) p.raw.y += p.stack;

  // data lines from every machine through a floor hub to the core
  const hub = new THREE.Vector3(0, 0.05, 1.7);
  const corePos = new THREE.Vector3(0, 0, -8.6);
  const lines = machines.map((m) => {
    const start = m.rack.clone().setY(0.05);
    const mid = start.clone().lerp(hub, 0.5).setY(0.05);
    mid.z += 0.6;
    return kit.flowLine(new THREE.CatmullRomCurve3([start, mid, hub]), 0.03);
  });
  const trunk = kit.flowLine(
    new THREE.CatmullRomCurve3([
      hub.clone(),
      new THREE.Vector3(0, 0.05, -2.8),
      new THREE.Vector3(0, 0.05, -6.6),
      corePos.clone().setY(0.05).add(new THREE.Vector3(0, 0, 0.8)),
    ]),
    0.055,
  );
  for (const l of [...lines, trunk]) group.add(l.mesh);
  const hubMesh = kit.place(group, kit.cylinder(0.32, 0.36, 0.08, 40), mat.blueMetal, hub.x, 0.04, hub.z);

  // the core: S/4HANA as the system of record, with enterprise modules around it
  const core = new THREE.Group();
  core.position.copy(corePos);
  group.add(core);
  kit.place(core, kit.rounded(3.6, 0.3, 2.0, 0.08), mat.ceramicMatte, 0, 0.15, 0);
  const monolith = new THREE.Group();
  core.add(monolith);
  kit.place(monolith, kit.rounded(2.6, 4.2, 1.2, 0.14), mat.blueMetal, 0, 2.1, 0);
  kit.place(monolith, kit.rounded(2.64, 0.12, 1.24, 0.04), mat.porcelain, 0, 3.55, 0);
  kit.place(monolith, kit.rounded(2.64, 0.12, 1.24, 0.04), mat.porcelain, 0, 0.75, 0);
  const coreLight = kit.place(monolith, kit.rounded(1.6, 0.05, 0.02, 0.01), mat.statusBlue, 0, 2.1, 0.62, 0, false);

  const moduleDefs = [
    { id: "finance", pos: new THREE.Vector3(-3.5, 1.6, 0.5), ry: 0.32 },
    { id: "inventory", pos: new THREE.Vector3(-3.2, 3.5, 0.3), ry: 0.26 },
    { id: "production", pos: new THREE.Vector3(0, 5.4, 0.1), ry: 0 },
    { id: "procurement", pos: new THREE.Vector3(3.2, 3.5, 0.3), ry: -0.26 },
    { id: "sales", pos: new THREE.Vector3(3.5, 1.6, 0.5), ry: -0.32 },
  ];
  const modules = moduleDefs.map((d) => {
    const g = new THREE.Group();
    kit.place(g, kit.rounded(2.0, 1.0, 0.22, 0.08), mat.porcelain, 0, 0, 0);
    kit.place(g, kit.rounded(1.78, 0.78, 0.06, 0.04), mat.blueDeep, 0, 0, 0.1);
    kit.place(g, kit.rounded(0.9, 0.06, 0.02, 0.01), mat.statusBlue, -0.3, 0.18, 0.14, 0, false);
    kit.place(g, kit.rounded(0.55, 0.06, 0.02, 0.01), mat.light, -0.47, 0.0, 0.14, 0, false);
    g.rotation.y = d.ry;
    core.add(g);
    return { ...d, g };
  });

  const hotspots: Record<string, THREE.Vector3> = {};
  for (const m of machines) {
    const box = new THREE.Box3().setFromObject(m.group);
    hotspots[m.id] = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y + 0.35, (box.min.z + box.max.z) / 2);
  }
  for (const d of moduleDefs) hotspots[d.id] = corePos.clone().add(d.pos).add(new THREE.Vector3(0, 0.75, 0.2));

  const dummy = new THREE.Object3D();
  const tmp = new THREE.Vector3();
  const scratch = new THREE.Vector3();
  const signal = new THREE.Color("#ff5a1f");
  const connectedColor = new THREE.Color("#7fa0ff");
  const lineNight = new THREE.Color("#5f84ff");
  const lineDay = new THREE.Color("#1638d8");
  let eventCb: ((name: string) => void) | null = null;
  let lastConnected = false;
  let lastDocked = false;
  let highlighted: string | null = null;

  const envOut: Env = { ...NIGHT };
  const ca = new THREE.Color();
  const cb = new THREE.Color();
  const mixColor = (a: string, b: string, t: number) => "#" + ca.set(a).lerp(cb.set(b), t).getHexString();

  function envAt(p: number): Env {
    const day = smooth(2.9, 4.1, p);
    envOut.bg = mixColor(NIGHT.bg, DAY.bg, day);
    envOut.floor = mixColor(NIGHT.floor, DAY.floor, day);
    envOut.hemiSky = mixColor(NIGHT.hemiSky, DAY.hemiSky, day);
    envOut.hemiGround = mixColor(NIGHT.hemiGround, DAY.hemiGround, day);
    envOut.keyColor = mixColor(NIGHT.keyColor, DAY.keyColor, day);
    envOut.hemi = THREE.MathUtils.lerp(NIGHT.hemi, DAY.hemi, day);
    envOut.key = THREE.MathUtils.lerp(NIGHT.key, DAY.key, day);
    envOut.env = THREE.MathUtils.lerp(NIGHT.env, DAY.env, day);
    envOut.fogNear = THREE.MathUtils.lerp(NIGHT.fogNear, DAY.fogNear, day);
    envOut.fogFar = THREE.MathUtils.lerp(NIGHT.fogFar, DAY.fogFar, day);
    envOut.night = 1 - day;
    return envOut;
  }

  function update({ t, dt, progress: p, reduced, pointer }: FrameCtx) {
    const toPart = smooth(1.3, 2.0, p);
    const dock = smooth(1.9, 2.8, p);
    const draw = smooth(2.5, 3.35, p);
    const rise = smooth(3.0, 3.85, p);
    const spread = smooth(3.45, 4.25, p);
    const night = 1 - smooth(2.9, 4.1, p);
    const on = smooth(2.2, 3.3, p);
    const time = reduced ? 0 : t;

    // pieces
    for (let i = 0; i < pieceState.length; i += 1) {
      const s = pieceState[i]!;
      const local = clamp01((toPart - s.delay * 0.6) / 0.65);
      const d = easeOut(clamp01((dock - s.delay * 0.5) / 0.7));

      // pointer repulsion on loose pieces only, never on docked ones
      if (pointer && !reduced && d < 0.05) {
        tmp.copy(s.raw).add(s.offset);
        const dx = tmp.x - pointer.x;
        const dz = tmp.z - pointer.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 1.4 && dist > 0.0001) {
          const push = (1.4 - dist) * 0.9 * dt * 4;
          s.offset.x += (dx / dist) * push;
          s.offset.z += (dz / dist) * push;
        }
      }
      s.offset.multiplyScalar(Math.max(0, 1 - dt * 1.6));
      if (s.offset.lengthSq() > 0.36) s.offset.setLength(0.6);

      const base = tmp.copy(s.raw).add(s.offset);
      // billet
      dummy.position.copy(base);
      dummy.rotation.set(0, s.yaw, 0);
      dummy.scale.setScalar(Math.max(0.0001, 1 - easeOut(local)));
      dummy.updateMatrix();
      billets.setMatrixAt(i, dummy.matrix);

      // gear: grows in place, lifts, then travels to its rack along an arc
      const lift = 0.45 * easeOut(local);
      const pos = scratch.copy(base).setY(base.y + lift).lerp(s.dock, d);
      pos.y += Math.sin(d * Math.PI) * 1.4;
      dummy.position.copy(pos);
      dummy.rotation.set(0, (time * s.spin + s.yaw) * (1 - d), 0);
      dummy.scale.setScalar(Math.max(0.0001, easeOut(local)));
      dummy.updateMatrix();
      gears.setMatrixAt(i, dummy.matrix);
    }
    billets.instanceMatrix.needsUpdate = true;
    gears.instanceMatrix.needsUpdate = true;

    // machines: independent and blinking at night, steady and in step once connected
    const connected = draw > 0.98;
    for (const m of machines) {
      m.animate(time, on);
      const blink = reduced ? 1 : 0.5 + 0.5 * Math.sin(time * (Math.PI * 2) / m.period + m.phase);
      const statusMat = m.status.material as THREE.MeshBasicMaterial;
      const target = connected ? connectedColor : signal;
      statusMat.color.lerp(target, 1 - Math.exp(-dt * 6));
      m.hover += ((highlighted === m.id ? 1 : 0) - m.hover) * (1 - Math.exp(-dt * 10));
      const pulse = connected ? 1 : 0.35 + blink * 0.65;
      const haloMat = m.halo.material as THREE.SpriteMaterial;
      haloMat.color.copy(statusMat.color);
      haloMat.opacity = (0.15 + night * 0.85) * pulse;
      m.halo.scale.setScalar(0.5 + night * 0.35 + m.hover * 0.8);
    }

    // lines draw in, the trunk last
    const lineColor = ca.copy(lineNight).lerp(lineDay, 1 - night);
    lines.forEach((l, i) => {
      l.material.uniforms.uDraw.value = clamp01((draw - i * 0.06) / 0.7);
      l.material.uniforms.uTime.value = time;
      l.material.uniforms.uColor.value.copy(lineColor);
      l.material.uniforms.uGlow.value = 0.4 + night * 0.6;
    });
    trunk.material.uniforms.uDraw.value = smooth(2.95, 3.7, p);
    trunk.material.uniforms.uTime.value = time;
    trunk.material.uniforms.uColor.value.copy(lineColor);
    hubMesh.scale.setScalar(0.4 + draw * 0.6);

    // core rises out of the floor; modules slide out from behind it
    monolith.position.y = THREE.MathUtils.lerp(-4.6, 0, easeOut(rise));
    (coreLight.material as THREE.MeshBasicMaterial).color.copy(rise > 0.95 ? connectedColor : lineNight);
    modules.forEach((mod, i) => {
      const local = easeOut(clamp01((spread - i * 0.08) / 0.7));
      mod.g.position.set(mod.pos.x * local, THREE.MathUtils.lerp(2.0, mod.pos.y, local), mod.pos.z * local - 0.3 * (1 - local));
      mod.g.scale.setScalar(Math.max(0.0001, local));
      mod.g.position.y += reduced ? 0 : Math.sin(time * 0.6 + i) * 0.05 * local;
    });

    if (dock > 0.98 && !lastDocked) eventCb?.("docked");
    if (connected && !lastConnected) eventCb?.("connected");
    lastDocked = dock > 0.98;
    lastConnected = connected;
  }

  function hotspotAlpha(id: string, p: number) {
    if (machines.some((m) => m.id === id)) return smooth(1.75, 2.1, p) * (1 - smooth(3.3, 3.6, p));
    return smooth(3.7, 3.95, p) * (1 - smooth(4.55, 4.85, p));
  }

  return {
    id: "plant",
    center: new THREE.Vector3(0, 0, 0),
    group,
    env: DAY,
    envAt,
    chapters: ["ch0", "ch1", "ch2", "ch3", "ch4", "ch5"],
    views: {
      ch0: {
        pos: [2.4, 2.5, 10.6],
        target: [0.4, 0.6, 0.8],
        fov: 36,
        shift: -0.14,
        mobile: { pos: [1.0, 4.4, 15.5], target: [0.2, 0.2, 0.5], fov: 52 },
      },
      ch1: {
        pos: [-6.4, 1.6, 6.2],
        target: [-2.6, 0.7, 0.2],
        fov: 40,
        shift: 0.14,
        mobile: { pos: [-5.2, 3.6, 11.5], target: [-2.4, 0.6, 0], fov: 56 },
      },
      ch2: {
        pos: [5.6, 3.8, 8.4],
        target: [1.2, 0.9, -0.6],
        fov: 40,
        shift: -0.14,
        mobile: { pos: [3.4, 5.8, 13.5], target: [0.6, 0.8, -0.6], fov: 56 },
      },
      ch3: {
        pos: [0.0, 14.5, 12.0],
        target: [0, 0, -1.8],
        fov: 42,
        shift: 0.12,
        mobile: { pos: [0, 20, 15.5], target: [0, 0, -2], fov: 56 },
      },
      ch4: {
        pos: [4.4, 6.6, 7.2],
        target: [0.5, 3.0, -8.4],
        fov: 40,
        shift: -0.16,
        mobile: { pos: [2.2, 8.4, 12.5], target: [0, 3.4, -8.4], fov: 56 },
      },
      ch5: {
        pos: [-10.5, 8.0, 15.5],
        target: [0.6, 2.2, -4.2],
        fov: 38,
        shift: 0,
        mobile: { pos: [-8.5, 10.5, 21], target: [0, 2.4, -4], fov: 54 },
      },
    },
    hotspots,
    hotspotAlpha,
    highlight(id) {
      highlighted = id;
    },
    update,
    onEvent(cb) {
      eventCb = cb;
    },
  };
}
