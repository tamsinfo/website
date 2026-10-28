// The rooms behind the inner pages. Each is a place in the same building, far enough
// apart that fog hides one from another; the route transition carries the camera
// between them under the blue flood.
import * as THREE from "three";
import type { Kit } from "../kit";
import type { Env, FrameCtx, Room, RoomId, View } from "../types";

const STUDIO_DAY: Env = {
  bg: "#f2eee7",
  floor: "#ebe6dc",
  hemiSky: "#ffffff",
  hemiGround: "#d6cebf",
  hemi: 1.05,
  key: 2.6,
  keyColor: "#fff3e4",
  env: 0.72,
  fogNear: 28,
  fogFar: 74,
  night: 0,
};

const BLUE_ROOM: Env = {
  bg: "#1638d8",
  floor: "#1534c8",
  hemiSky: "#ffffff",
  hemiGround: "#1638d8",
  hemi: 1.0,
  key: 2.3,
  keyColor: "#ffffff",
  env: 0.7,
  fogNear: 14,
  fogFar: 42,
  night: 0.35,
};

/** Inner-page views share one composition rule: subject right of the headline. */
function view(pos: [number, number, number], target: [number, number, number], fov = 38, pull = 1.3, mobileBack = 1.45): View {
  const [tx, ty, tz] = target;
  // pull authored close-ups back a little so the subject keeps its surroundings
  const dir = new THREE.Vector3(pos[0] - tx, pos[1] - ty, pos[2] - tz).multiplyScalar(pull);
  const [px, py, pz] = [tx + dir.x, ty + dir.y, tz + dir.z];
  const mob = new THREE.Vector3(tx, ty, tz).add(dir.clone().multiplyScalar(mobileBack));
  const drift = new THREE.Vector3(tx, ty, tz).add(dir.clone().multiplyScalar(0.82));
  return {
    pos: [px, py, pz],
    target,
    fov,
    shift: -0.17,
    mobile: { pos: [mob.x, mob.y + 0.6, mob.z], target: [tx, ty - 0.2, tz], fov: fov + 14, shiftY: 0.24 },
    drift: { pos: [drift.x, drift.y - 0.3, drift.z], target: [tx, ty - 0.15, tz] },
  };
}

type Builder = (kit: Kit) => Room;

const timeOf = (ctx: FrameCtx) => (ctx.reduced ? 0 : ctx.t);

function workshop(kit: Kit): Room {
  const { mat } = kit;
  const group = new THREE.Group();
  const center = new THREE.Vector3(60, 0, 0);
  group.position.copy(center);

  // back wall and pendant lamps
  kit.place(group, kit.rounded(18, 6, 0.3, 0.05), mat.ceramicMatte, 0, 3, -3.4);
  kit.place(group, kit.rounded(18, 0.5, 0.34, 0.04), mat.blueDeep, 0, 0.25, -3.38);
  for (const x of [-4.2, -1.4, 1.4, 4.2]) {
    kit.place(group, kit.cylinder(0.008, 0.008, 2.2, 6), mat.graphite, x, 4.9, 0, 0, false);
    kit.place(group, kit.cylinder(0.18, 0.42, 0.34, 32), mat.blueMetal, x, 3.65, 0);
    kit.place(group, kit.cylinder(0.38, 0.38, 0.02, 32), mat.light, x, 3.47, 0, 0, false);
  }

  // bench
  kit.place(group, kit.rounded(12.4, 0.14, 1.8, 0.04), mat.graphite, 0, 1.0, 0);
  for (const x of [-5.8, -2, 2, 5.8]) {
    kit.place(group, kit.rounded(0.1, 0.95, 1.5, 0.02), mat.steel, x, 0.47, 0);
  }

  // implementation: a press being assembled, crown waiting on a hoist
  const crown = kit.place(group, kit.rounded(1.4, 0.36, 0.9, 0.08), mat.blueMetal, -4.2, 2.65, 0);
  kit.place(group, kit.rounded(1.6, 0.28, 1.1, 0.06), mat.porcelain, -4.2, 1.21, 0);
  for (const cx of [-0.55, 0.55]) kit.place(group, kit.cylinder(0.06, 0.06, 1.0, 20), mat.steel, -4.2 + cx, 1.85, -0.3);
  kit.place(group, kit.cylinder(0.006, 0.006, 1.6, 6), mat.graphite, -4.2, 3.6, 0, 0, false);
  const sheet = kit.place(group, kit.rounded(0.9, 0.012, 0.62, 0.004), mat.light, -5.3, 1.08, 0.35, 0.2, false);
  sheet.receiveShadow = true;
  kit.place(group, kit.rounded(0.5, 0.014, 0.012, 0.002), mat.blueMetal, -5.3, 1.092, 0.3, 0.2, false);
  kit.place(group, kit.rounded(0.32, 0.014, 0.012, 0.002), mat.blueMetal, -5.36, 1.092, 0.42, 0.2, false);

  // managed services: a running cell with a steady status light
  kit.place(group, kit.rounded(1.5, 1.1, 1.1, 0.12), mat.porcelain, -1.4, 1.62, 0);
  kit.place(group, kit.rounded(0.8, 0.5, 0.04, 0.03), mat.glass, -1.55, 1.7, 0.56);
  const amsLight = kit.place(group, kit.sphere(0.07), mat.statusBlue, -0.85, 2.3, 0.3, 0, false);
  const amsHalo = kit.glow("#7fa0ff", 0.5);
  amsHalo.position.copy(amsLight.position);
  group.add(amsHalo);
  kit.place(group, kit.rounded(0.5, 0.34, 0.03, 0.03), mat.graphite, -0.6, 1.32, 0.55, -0.4);

  // custom build: a side-car module docking beside the core block
  kit.place(group, kit.rounded(1.1, 1.0, 1.0, 0.12), mat.porcelain, 1.1, 1.57, 0);
  kit.place(group, kit.rounded(1.4, 0.04, 0.12, 0.02), mat.steel, 2.0, 1.1, 0.3);
  kit.place(group, kit.rounded(1.4, 0.04, 0.12, 0.02), mat.steel, 2.0, 1.1, -0.3);
  const sidecar = kit.place(group, kit.rounded(0.6, 0.7, 0.8, 0.1), mat.blueMetal, 2.1, 1.47, 0);

  // licensing: a cabinet of module slots, filled only where needed
  kit.place(group, kit.rounded(1.6, 1.5, 0.8, 0.06), mat.ceramicMatte, 4.2, 1.82, -0.2);
  const filled = [1, 0, 1, 1, 1, 0, 0, 1, 0];
  filled.forEach((f, i) => {
    const x = 4.2 + ((i % 3) - 1) * 0.46;
    const y = 2.28 - Math.floor(i / 3) * 0.44;
    kit.place(group, kit.rounded(0.38, 0.34, 0.05, 0.02), mat.graphite, x, y, 0.2, 0, false);
    if (f) kit.place(group, kit.rounded(0.34, 0.3, 0.34, 0.05), mat.blueMetal, x, y, 0.16);
  });

  return {
    id: "workshop",
    center,
    group,
    env: STUDIO_DAY,
    views: {
      index: view([2.6, 4.6, 10.5], [-0.2, 1.4, 0], 40, 1),
      "s4hana-cloud-implementation": view([-2.6, 2.6, 4.6], [-4.3, 1.8, 0], 36),
      "s4hana-managed-services": view([0.3, 2.5, 4.4], [-1.3, 1.6, 0], 36),
      "custom-application-build": view([3.4, 2.5, 4.3], [1.6, 1.5, 0], 36),
      "license-procurement": view([6.0, 2.6, 4.3], [4.2, 1.8, 0], 36),
    },
    update(ctx) {
      const t = timeOf(ctx);
      crown.position.y = 2.6 + Math.sin(t * 0.6) * 0.12;
      sidecar.position.x = 2.1 - (Math.sin(t * 0.7) * 0.5 + 0.5) * 0.25;
      (amsHalo.material as THREE.SpriteMaterial).opacity = 0.55;
    },
  };
}

function core(kit: Kit): Room {
  const { mat } = kit;
  const group = new THREE.Group();
  const center = new THREE.Vector3(0, 0, -70);
  group.position.copy(center);

  // S/4HANA core at the centre
  kit.place(group, kit.rounded(3.4, 0.3, 2.0, 0.08), mat.ceramicMatte, 0, 0.15, 0);
  kit.place(group, kit.rounded(2.4, 3.8, 1.1, 0.14), mat.porcelain, 0, 2.2, 0);
  kit.place(group, kit.rounded(2.44, 0.1, 1.14, 0.04), mat.blueDeep, 0, 3.5, 0);
  kit.place(group, kit.rounded(2.44, 0.1, 1.14, 0.04), mat.blueDeep, 0, 0.95, 0);

  // RISE: the managed canopy above the core
  const canopy = kit.place(group, kit.rounded(4.2, 0.16, 2.6, 0.08), mat.porcelain, 0, 5.5, 0);
  for (const [x, z] of [
    [-1.9, -1.1],
    [1.9, -1.1],
    [-1.9, 1.1],
    [1.9, 1.1],
  ]) {
    kit.place(group, kit.cylinder(0.012, 0.012, 1.3, 6), mat.steel, x!, 4.8, z!, 0, false);
  }

  // BTP: a platform ring around the core with side-car extensions docked on it
  const ring = kit.lathe("btp-ring", [
    [3.6, 0],
    [4.6, 0],
    [4.6, 0.12],
    [3.6, 0.12],
    [3.6, 0],
  ], 96);
  kit.place(group, ring, mat.ceramicMatte, 0, 0, 0);
  const sidecars = new THREE.Group();
  group.add(sidecars);
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const m = kit.place(sidecars, kit.rounded(0.7, 0.55, 0.7, 0.1), i % 2 ? mat.porcelain : mat.blueDeep, Math.cos(a) * 4.1, 0.4, Math.sin(a) * 4.1, -a);
    m.castShadow = true;
  }

  // integration: partner and plant systems on the perimeter, joined to the ring
  const outer = [
    { x: -8.5, z: -3 },
    { x: -7.5, z: 4.5 },
    { x: 8.5, z: -3 },
    { x: 7.5, z: 4.5 },
  ];
  const lines: ReturnType<Kit["flowLine"]>[] = [];
  for (const o of outer) {
    kit.place(group, kit.rounded(1.4, 1.2, 1.4, 0.1), mat.porcelain, o.x, 0.6, o.z);
    const start = new THREE.Vector3(o.x * 0.86, 0.06, o.z * 0.86);
    const end = new THREE.Vector3(o.x, 0, o.z).setLength(4.65).setY(0.06);
    const mid = start.clone().lerp(end, 0.5);
    mid.y = 0.06;
    const line = kit.flowLine(new THREE.CatmullRomCurve3([start, mid, end]), 0.035, "#fbf9f5");
    line.material.uniforms.uDraw.value = 1;
    line.material.uniforms.uPulse.value.set("#ff9a6a");
    group.add(line.mesh);
    lines.push(line);
  }

  // GROW: standard process blocks, identical by design
  for (let i = 0; i < 4; i += 1) kit.place(group, kit.rounded(0.9, 0.9, 0.9, 0.1), mat.porcelain, -5.2 + i * 1.05, 0.45, -6.2);

  // Business AI: a faceted prism hovering beside the core
  const prism = kit.place(group, new THREE.IcosahedronGeometry(0.62, 0), mat.porcelain, -2.9, 3.4, 1.8);
  kit.track(prism.geometry);

  // analytics: columns of different heights
  const bars: THREE.Mesh[] = [];
  [0.8, 1.4, 1.1, 1.9, 1.6].forEach((h, i) => {
    const b = kit.place(group, kit.rounded(0.42, 1, 0.42, 0.06), i === 3 ? mat.blueDeep : mat.porcelain, 2.4 + i * 0.55, h / 2, 2.6);
    b.scale.y = h;
    b.position.y = h / 2;
    bars.push(b);
  });

  // workflow: approval tiles travelling a short path
  const tiles: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i += 1) tiles.push(kit.place(group, kit.rounded(0.5, 0.1, 0.5, 0.04), mat.porcelain, 0, 0.32, 5.4));
  kit.place(group, kit.rounded(6, 0.26, 0.8, 0.06), mat.blueDeep, 0, 0.13, 5.4);

  // industry: a miniature plant to the back right
  for (const [x, z, h] of [
    [5.4, -6, 1.1],
    [6.6, -6.4, 0.7],
    [6.0, -5.0, 0.9],
  ] as const) {
    kit.place(group, kit.rounded(0.9, h, 0.9, 0.08), mat.porcelain, x, h / 2, z);
  }

  return {
    id: "core",
    center,
    group,
    env: BLUE_ROOM,
    views: {
      index: view([7.5, 6.4, 13.5], [0, 2.0, 0], 40, 1),
      "rise-with-sap": view([3.4, 4.4, 8.5], [0, 3.4, 0], 38),
      "grow-with-sap": view([-1.8, 2.4, -0.6], [-3.6, 0.8, -6.0], 38),
      "sap-btp": view([5.2, 6.5, 7.4], [0, 0.6, 0.4], 40),
      "sap-business-ai": view([-0.6, 3.9, 6.0], [-2.9, 3.3, 1.8], 34),
      "industry-solutions": view([8.4, 2.6, -1.5], [5.9, 0.8, -5.8], 36),
      "analytics-reporting": view([5.4, 2.4, 7.4], [3.4, 1.0, 2.6], 36),
      "integration-suite": view([0, 11, 9.5], [0, 0, 0.5], 46),
      "automation-workflow": view([2.6, 2.0, 9.6], [0.2, 0.4, 5.4], 36),
    },
    update(ctx) {
      const t = timeOf(ctx);
      prism.rotation.y = t * 0.35;
      prism.rotation.x = Math.sin(t * 0.3) * 0.25;
      prism.position.y = 3.4 + Math.sin(t * 0.8) * 0.12;
      sidecars.rotation.y = t * 0.05;
      canopy.position.y = 5.5 + Math.sin(t * 0.5) * 0.05;
      for (const l of lines) l.material.uniforms.uTime.value = t;
      tiles.forEach((tile, i) => {
        const u = (t * 0.12 + i / tiles.length) % 1;
        tile.position.x = -2.6 + u * 5.2;
        tile.position.y = 0.32 + Math.sin(u * Math.PI) * 0.06;
      });
      bars.forEach((b, i) => {
        const h = [0.8, 1.4, 1.1, 1.9, 1.6][i]! * (1 + Math.sin(t * 0.5 + i) * 0.04);
        b.scale.y = h;
        b.position.y = h / 2;
      });
    },
  };
}

function gallery(kit: Kit): Room {
  const { mat } = kit;
  const group = new THREE.Group();
  const center = new THREE.Vector3(-60, 0, 0);
  group.position.copy(center);

  const slugs = [
    "gate-entry",
    "digital-signature",
    "vendor-portal",
    "exim",
    "production-process",
    "connected-factory",
    "digital-manufacturing-ai",
  ];
  const views: Record<string, View> = { index: view([1.6, 4.2, 8.6], [0.2, 1.1, 0.4], 44, 1) };
  const animated: ((t: number) => void)[] = [];

  slugs.forEach((slug, i) => {
    const a = THREE.MathUtils.lerp(-0.9, 0.9, i / (slugs.length - 1));
    const x = Math.sin(a) * 6.6;
    const z = 5.0 - Math.cos(a) * 6.6;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = -a;
    group.add(g);
    kit.place(g, kit.rounded(1.9, 0.84, 1.9, 0.08), mat.graphite, 0, 0.42, 0);
    kit.place(g, kit.rounded(1.96, 0.06, 1.96, 0.03), mat.porcelain, 0, 0.87, 0);
    const top = 0.9;

    switch (slug) {
      case "gate-entry": {
        kit.place(g, kit.rounded(0.16, 0.6, 0.16, 0.03), mat.porcelain, -0.7, top + 0.3, 0.5);
        const pivot = new THREE.Group();
        pivot.position.set(-0.7, top + 0.55, 0.5);
        g.add(pivot);
        kit.place(pivot, kit.rounded(1.4, 0.05, 0.05, 0.02), mat.blueMetal, 0.7, 0, 0);
        kit.place(g, kit.rounded(0.45, 0.42, 0.5, 0.07), mat.porcelain, -0.1, top + 0.25, -0.3);
        kit.place(g, kit.rounded(0.9, 0.5, 0.52, 0.05), mat.blueMetal, 0.62, top + 0.29, -0.3);
        animated.push((t) => (pivot.rotation.z = (Math.sin(t * 0.8) * 0.5 + 0.5) * 1.2));
        break;
      }
      case "digital-signature": {
        const doc = kit.place(g, kit.rounded(0.9, 1.2, 0.03, 0.01), mat.light, 0, top + 0.62, -0.1);
        doc.rotation.x = -0.18;
        kit.place(g, kit.rounded(0.55, 0.03, 0.012, 0.004), mat.graphite, -0.1, top + 0.95, -0.06, 0, false).rotation.x = -0.18;
        kit.place(g, kit.rounded(0.4, 0.03, 0.012, 0.004), mat.graphite, -0.17, top + 0.82, -0.04, 0, false).rotation.x = -0.18;
        const seal = kit.place(g, kit.cylinder(0.2, 0.2, 0.05, 40), mat.blueMetal, 0.22, top + 0.32, 0.02);
        seal.rotation.x = Math.PI / 2 - 0.18;
        const sealRing = kit.place(g, kit.torus(0.2, 0.025), mat.steel, 0.22, top + 0.32, 0.05);
        sealRing.rotation.x = -0.18;
        break;
      }
      case "vendor-portal": {
        kit.place(g, kit.rounded(1.3, 0.95, 0.08, 0.05), mat.porcelain, 0, top + 0.6, 0.1);
        kit.place(g, kit.rounded(1.1, 0.75, 0.04, 0.03), mat.glass, 0, top + 0.6, 0.15, 0, false);
        for (let k = 0; k < 3; k += 1) kit.place(g, kit.rounded(0.7, 0.04, 0.5, 0.01), mat.light, 0.1 * k - 0.1, top + 0.03 + k * 0.05, -0.45);
        break;
      }
      case "exim": {
        kit.place(g, kit.rounded(1.5, 0.62, 0.66, 0.04), mat.blueMetal, 0, top + 0.31, 0);
        for (let k = -4; k <= 4; k += 1) kit.place(g, kit.rounded(0.03, 0.58, 0.7, 0.01), mat.blueDeep, k * 0.16, top + 0.31, 0, 0, false);
        kit.place(g, kit.rounded(0.5, 0.4, 0.5, 0.04), mat.porcelain, 0.3, top + 0.82, 0.05);
        break;
      }
      case "production-process": {
        kit.place(g, kit.rounded(1.7, 0.12, 0.5, 0.04), mat.graphite, 0, top + 0.06, 0);
        const stages: THREE.Mesh[] = [];
        for (let k = 0; k < 4; k += 1) {
          stages.push(kit.place(g, kit.rounded(0.3, 0.3, 0.3, 0.05), k < 2 ? mat.blueMetal : mat.porcelain, -0.6 + k * 0.4, top + 0.27, 0));
        }
        const lamp = kit.place(g, kit.sphere(0.06), mat.signal, -0.6 + 2 * 0.4, top + 0.55, 0, 0, false);
        animated.push((t) => {
          lamp.scale.setScalar(0.85 + Math.sin(t * 3) * 0.15);
        });
        break;
      }
      case "connected-factory": {
        kit.place(g, kit.rounded(0.8, 0.8, 0.8, 0.1), mat.porcelain, 0, top + 0.4, 0);
        kit.place(g, kit.cylinder(0.02, 0.02, 0.5, 8), mat.graphite, 0.2, top + 1.05, 0.2);
        const nodes: [number, number, number][] = [
          [-0.7, top + 0.12, 0.55],
          [0.75, top + 0.12, 0.45],
          [0.1, top + 0.12, -0.75],
        ];
        for (const [nx, ny, nz] of nodes) {
          kit.place(g, kit.cylinder(0.09, 0.09, 0.12, 20), mat.blueMetal, nx, ny, nz);
          const l = kit.flowLine(new THREE.LineCurve3(new THREE.Vector3(nx, ny, nz), new THREE.Vector3(0, top + 0.1, 0)), 0.012);
          l.material.uniforms.uDraw.value = 1;
          g.add(l.mesh);
          animated.push((t) => (l.material.uniforms.uTime.value = t));
        }
        break;
      }
      case "digital-manufacturing-ai": {
        const heights = [0.35, 0.42, 0.38, 0.9, 0.4, 0.44];
        heights.forEach((h, k) => {
          const m = kit.place(g, kit.rounded(0.18, h, 0.18, 0.03), k === 3 ? mat.signalWarm : mat.porcelain, -0.55 + k * 0.22, top + h / 2, 0);
          m.castShadow = true;
        });
        break;
      }
    }

    const front = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)).multiplyScalar(-1);
    const camPos = new THREE.Vector3(x, 0, z).add(front.clone().multiplyScalar(-4.6)).add(new THREE.Vector3(0, 2.4, 0));
    views[slug] = view([camPos.x + 0.9, camPos.y, camPos.z], [x, 1.2, z], 36);
  });

  return {
    id: "gallery",
    center,
    group,
    env: STUDIO_DAY,
    views,
    update(ctx) {
      const t = timeOf(ctx);
      for (const fn of animated) fn(t);
    },
  };
}

function bays(kit: Kit): Room {
  const { mat } = kit;
  const group = new THREE.Group();
  const center = new THREE.Vector3(0, 0, 70);
  group.position.copy(center);
  const animated: ((t: number) => void)[] = [];

  const layout: Record<string, [number, number]> = {
    automotive: [-7, -3.5],
    "metals-steel": [0, -3.5],
    "mill-products": [7, -3.5],
    pharmaceuticals: [-7, 3.5],
    "engineering-fabrication": [0, 3.5],
    "consumer-durables": [7, 3.5],
  };
  const views: Record<string, View> = { index: view([3.5, 10.5, 13.5], [0.6, 0.4, 0.4], 44, 1) };

  for (const [slug, [bx, bz]] of Object.entries(layout)) {
    const g = new THREE.Group();
    g.position.set(bx, 0, bz);
    group.add(g);
    kit.place(g, kit.rounded(5.4, 0.05, 5.4, 0.02), mat.ceramicMatte, 0, 0.025, 0);

    switch (slug) {
      case "automotive": {
        const jig = kit.place(g, kit.rounded(3.0, 0.3, 1.4, 0.05), mat.graphite, 0, 0.2, 0);
        jig.receiveShadow = true;
        kit.place(g, kit.rounded(2.8, 0.55, 1.3, 0.22), mat.blueMetal, 0, 0.72, 0);
        kit.place(g, kit.rounded(1.5, 0.5, 1.16, 0.2), mat.porcelain, -0.15, 1.18, 0);
        kit.place(g, kit.rounded(1.3, 0.36, 1.18, 0.12), mat.glass, -0.15, 1.2, 0, 0, false);
        for (const wx of [-0.95, 0.95]) {
          for (const wz of [-0.68, 0.68]) {
            const w = kit.place(g, kit.cylinder(0.3, 0.3, 0.2, 32), mat.rubber, wx, 0.48, wz);
            w.rotation.x = Math.PI / 2;
          }
        }
        for (let k = 0; k < 3; k += 1) {
          const hub = kit.place(g, kit.torus(0.34, 0.12), mat.steel, 1.9, 0.12 + k * 0.25, 1.6);
          hub.rotation.x = Math.PI / 2;
        }
        break;
      }
      case "metals-steel": {
        const ladle = kit.place(
          g,
          kit.lathe("ladle", [
            [0.01, 0],
            [0.75, 0],
            [0.95, 1.3],
            [0.98, 1.42],
            [0.86, 1.42],
            [0.84, 1.3],
            [0.01, 1.3],
          ]),
          mat.graphite,
          -1.1,
          0,
          -0.6,
        );
        ladle.rotation.z = 0.18;
        const melt = kit.place(g, kit.cylinder(0.84, 0.84, 0.04, 40), mat.signalWarm, -1.1 + 0.22, 1.32, -0.6, 0, false);
        melt.rotation.z = 0.18;
        const halo = kit.glow("#ff6a2a", 2.6);
        halo.position.set(-0.85, 1.6, -0.6);
        group.add(halo);
        halo.position.add(g.position);
        for (let k = 0; k < 5; k += 1) {
          kit.place(g, kit.rounded(1.6, 0.26, 0.26, 0.04), k < 2 ? mat.signalWarm : mat.porcelain, 0.9, 0.16, -1.2 + k * 0.38);
        }
        const coil = kit.place(g, kit.torus(0.5, 0.26), mat.steel, -0.8, 0.76, 1.5);
        coil.rotation.y = 0.6;
        animated.push((t) => ((halo.material as THREE.SpriteMaterial).opacity = 0.45 + Math.sin(t * 2.2) * 0.08));
        break;
      }
      case "mill-products": {
        for (let k = 0; k < 3; k += 1) {
          const reel = kit.place(g, kit.cylinder(0.62, 0.62, 1.5, 48), mat.porcelain, -1.4 + k * 1.35, 0.67, -0.8);
          reel.rotation.x = Math.PI / 2;
          const coreTube = kit.place(g, kit.cylinder(0.16, 0.16, 1.52, 24), mat.blueMetal, -1.4 + k * 1.35, 0.67, -0.8);
          coreTube.rotation.x = Math.PI / 2;
        }
        for (let k = 0; k < 4; k += 1) {
          kit.place(g, kit.cylinder(0.36, 0.36, 0.34, 40), k % 2 ? mat.porcelain : mat.ceramicMatte, -1.2 + k * 0.82, 0.2, 1.3);
        }
        break;
      }
      case "pharmaceuticals": {
        const vial = kit.lathe("vial", [
          [0.001, 0],
          [0.11, 0],
          [0.12, 0.02],
          [0.12, 0.3],
          [0.07, 0.36],
          [0.07, 0.42],
          [0.001, 0.42],
        ]);
        kit.place(g, kit.rounded(2.4, 0.1, 1.6, 0.03), mat.steel, -0.4, 0.75, 0);
        kit.place(g, kit.rounded(2.4, 0.7, 0.1, 0.03), mat.graphite, -0.4, 0.35, 0.7);
        for (let r = 0; r < 4; r += 1) {
          for (let c = 0; c < 7; c += 1) {
            const vx = -1.4 + c * 0.32;
            const vz = -0.5 + r * 0.32;
            kit.place(g, vial, mat.porcelain, vx, 0.8, vz);
            kit.place(g, kit.cylinder(0.075, 0.075, 0.06, 16), mat.blueMetal, vx, 1.25, vz, 0, false);
          }
        }
        kit.place(g, kit.rounded(1.1, 1.9, 1.0, 0.08), mat.porcelain, 1.6, 0.95, -0.6);
        break;
      }
      case "engineering-fabrication": {
        for (const cx of [-1.6, 1.6]) {
          const col = kit.place(g, kit.ibeam(2.6), mat.blueMetal, cx, 1.3, -1.2);
          col.rotation.x = Math.PI / 2;
        }
        const beam = kit.place(g, kit.ibeam(3.6), mat.blueMetal, 0, 2.6, -1.2);
        beam.rotation.y = Math.PI / 2;
        const vessel = kit.place(g, new THREE.CapsuleGeometry(0.55, 1.8, 8, 32), mat.porcelain, 0, 0.85, 0.9);
        kit.track(vessel.geometry);
        vessel.rotation.z = Math.PI / 2;
        for (const sx of [-0.7, 0.7]) kit.place(g, kit.rounded(0.24, 0.4, 0.9, 0.04), mat.graphite, sx, 0.2, 0.9);
        break;
      }
      case "consumer-durables": {
        for (let k = 0; k < 3; k += 1) {
          const x = -1.3 + k * 1.05;
          kit.place(g, kit.rounded(0.9, 1.0, 0.85, 0.1), mat.porcelain, x, 0.5, -0.4);
          const door = kit.place(g, kit.torus(0.27, 0.05), mat.graphite, x, 0.5, 0.03);
          door.castShadow = false;
          kit.place(g, kit.cylinder(0.24, 0.24, 0.02, 32), mat.glass, x, 0.5, 0.02, 0, false).rotation.x = Math.PI / 2;
          kit.place(g, kit.rounded(0.6, 0.06, 0.02, 0.01), mat.blueMetal, x - 0.1, 0.9, 0.03, 0, false);
        }
        for (let k = 0; k < 4; k += 1) {
          kit.place(g, kit.rounded(0.9, 0.7, 0.9, 0.03), mat.ceramicMatte, 1.6, 0.35 + (k % 2) * 0.72, 0.8 - Math.floor(k / 2) * 0.95);
        }
        break;
      }
    }
    views[slug] = view([bx + 3.4, 3.6, bz + 5.6], [bx + 0.2, 0.9, bz], 38);
  }

  return {
    id: "bays",
    center,
    group,
    env: STUDIO_DAY,
    views,
    update(ctx) {
      const t = timeOf(ctx);
      for (const fn of animated) fn(t);
    },
  };
}

function studio(kit: Kit): Room {
  const { mat } = kit;
  const group = new THREE.Group();
  const center = new THREE.Vector3(60, 0, -70);
  group.position.copy(center);

  // back wall with a gridded window of light
  kit.place(group, kit.rounded(16, 7, 0.3, 0.05), mat.paperPanel, 0, 3.5, -4);
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      kit.place(group, kit.rounded(1.5, 1.7, 0.04, 0.02), mat.light, -2.4 + c * 1.6, 2.4 + r * 1.8, -3.83, 0, false);
    }
  }

  // the TAMS mark as an object: two bars and a stem
  kit.place(group, kit.rounded(2.4, 0.5, 2.4, 0.08), mat.ceramicMatte, -2.6, 0.25, 0);
  kit.place(group, kit.rounded(0.95, 0.5, 0.5, 0.08), mat.blueMetal, -3.12, 2.35, 0);
  kit.place(group, kit.rounded(0.95, 0.5, 0.5, 0.08), mat.blueMetal, -2.08, 2.35, 0);
  kit.place(group, kit.rounded(0.55, 1.5, 0.5, 0.08), mat.porcelain, -2.6, 1.3, 0);

  // a desk for the contact page
  kit.place(group, kit.rounded(3.2, 0.1, 1.4, 0.04), mat.ceramicMatte, 3.0, 1.0, 0.2);
  for (const x of [1.6, 4.4]) kit.place(group, kit.rounded(0.08, 1.0, 1.2, 0.02), mat.graphite, x, 0.5, 0.2);
  kit.place(group, kit.rounded(0.9, 0.02, 0.62, 0.01), mat.light, 2.7, 1.06, 0.3, 0.2, false);
  kit.place(group, kit.rounded(0.16, 0.12, 0.16, 0.03), mat.blueMetal, 3.7, 1.11, 0.1);
  kit.place(group, kit.cylinder(0.08, 0.06, 0.18, 24), mat.porcelain, 4.1, 1.14, 0.5);

  // one billet left on the floor, for the page that doesn't exist
  kit.place(group, kit.rounded(0.95, 0.26, 0.26, 0.05, 2), mat.porcelain, 0.4, 0.13, 2.2, 0.6);

  return {
    id: "studio",
    center,
    group,
    env: STUDIO_DAY,
    views: {
      about: view([0.2, 3.0, 6.6], [-2.6, 1.6, 0], 36),
      contact: view([5.6, 2.6, 5.2], [3.0, 1.2, 0.2], 36),
      notfound: view([2.4, 1.6, 4.8], [0.4, 0.2, 2.2], 34),
    },
    update() {},
  };
}

export const roomBuilders: Record<Exclude<RoomId, "plant">, Builder> = {
  workshop,
  core,
  gallery,
  bays,
  studio,
};
