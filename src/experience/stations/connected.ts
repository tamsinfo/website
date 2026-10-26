import * as THREE from "three";
import { createFlow, word } from "../core/flow";
import { at, cyl, frame, mesh, rbox, sph, tor, v3, type Ctx, type Station } from "./kit";

/* 06 — the data hall (the centrepiece). The world floods brand blue; the camera flies through
   the IIoT ring and past the glass intelligence core while live particles stream one way,
   from machine sensors to SAP. */
export const HALL_ORIGIN = v3(196, 0, -74);
export const NODE = {
  sensors: HALL_ORIGIN.clone().add(v3(0, 1.6, 0)),
  iiot: HALL_ORIGIN.clone().add(v3(18, 4.2, -2)),
  intel: HALL_ORIGIN.clone().add(v3(36, 5, 0)),
  sap: HALL_ORIGIN.clone().add(v3(54, 4.6, -2)),
};

export function connectedStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  // machine sensors: five machines, each with a status light
  const sensorLights: THREE.Vector3[] = [];
  for (let i = 0; i < 5; i++) {
    const x = NODE.sensors.x - 4 + i * 2.1;
    const z = NODE.sensors.z + (i % 2 ? -1.8 : 1.4);
    group.add(at(mesh(rbox(1.6, 1.8 + (i % 3) * 0.5, 1.4, 0.2), ctx.mats.ceramic), x, 0.9 + (i % 3) * 0.25, z));
    const ly = 2.0 + (i % 3) * 0.5;
    group.add(at(mesh(sph(0.12, 16), ctx.mats.signal, false), x, ly, z));
    sensorLights.push(v3(x, ly, z));
  }
  // IIoT platform: a ring to fly through
  const ring = at(mesh(tor(4.6, 0.32, 200, 32), ctx.mats.anodised), NODE.iiot.x, NODE.iiot.y, NODE.iiot.z);
  ring.rotation.y = Math.PI / 2;
  const ring2 = at(mesh(tor(3.8, 0.06, 200, 10), ctx.mats.chrome), NODE.iiot.x + 0.8, NODE.iiot.y, NODE.iiot.z);
  ring2.rotation.y = Math.PI / 2;
  group.add(ring, ring2, at(mesh(cyl(0.4, 0.6, NODE.iiot.y - 4.6 + 0.4, 32), ctx.mats.steel), NODE.iiot.x, (NODE.iiot.y - 4.6) / 2, NODE.iiot.z));
  // TAMS Industry Intelligence: a dispersive glass core with an iridescent heart
  const core = at(mesh(new THREE.IcosahedronGeometry(3, 1), ctx.mats.glass), NODE.intel.x, NODE.intel.y, NODE.intel.z);
  (core.geometry as THREE.BufferGeometry).computeVertexNormals();
  const heart = at(mesh(sph(1.2, 64), ctx.mats.iridescent), NODE.intel.x, NODE.intel.y, NODE.intel.z);
  group.add(core, heart, at(mesh(cyl(0.3, 0.9, 1.6, 32), ctx.mats.ceramic), NODE.intel.x, 0.8, NODE.intel.z));
  // SAP: a tall ceramic monolith
  const mono = at(mesh(rbox(3.6, 9.2, 2.2, 0.4), ctx.mats.ceramic), NODE.sap.x, 4.6, NODE.sap.z);
  group.add(mono);
  const label = word("SAP", { size: 2.6, color: "#1638D8" });
  label.position.set(NODE.sap.x, 5.6, NODE.sap.z + 1.12);
  group.add(label);

  // one-way data lines
  const curves = sensorLights.map(
    (s, i) =>
      new THREE.CatmullRomCurve3([
        s,
        s.clone().add(v3(3, 2.2, 0)),
        NODE.iiot.clone().add(v3(-1, (i - 2) * 0.6, (i - 2) * 0.6)),
        NODE.iiot.clone().add(v3(4, (i - 2) * 0.3, 0)),
        NODE.intel.clone().add(v3(-3.4, 0, (i - 2) * 0.5)),
        NODE.intel.clone().add(v3(3.4, 0, (i - 2) * 0.4)),
        NODE.sap.clone().add(v3(-2.2, (i - 2) * 0.7, 0)),
      ]),
  );
  const flow = createFlow(curves, ctx.mobile ? 500 : 1100, new THREE.Color("#FFFFFF"), 6);
  group.add(flow.points);
  const guide = curves.map((c) => {
    const g = new THREE.TubeGeometry(c, 300, 0.018, 8, false);
    const m = mesh(g, ctx.mats.lineBlue, false, false);
    group.add(m);
    return g;
  });
  const num = word("05", { size: 18, color: "#E8E2D8" });
  num.position.copy(NODE.iiot).add(v3(0, -4.2, -16));
  group.add(num);

  const poses = [NODE.sensors, NODE.iiot, NODE.intel, NODE.sap];

  return {
    id: "connected",
    group,
    beats: 4,
    transition: "chase",
    pose: (k, side, mobile, sub) => {
      const i = Math.max(0, Math.min(3, k));
      if (i === 1 && sub === undefined && !mobile) {
        // inside the ring, looking down the line toward the core
        const p = NODE.iiot.clone().add(v3(-1.5, 0.3, mobile ? 0 : 0.6));
        return { p, t: NODE.intel.clone().add(v3(0, mobile ? 2.4 : -0.6, side === "left" ? -5 : 5)), focus: NODE.intel.clone(), fov: mobile ? 62 : 48 };
      }
      return frame(poses[i], { dist: i === 3 ? 19 : 11, h: 1.5, yaw: -0.9 + (sub ?? 0) * 0.6, side, mobile, shift: i === 3 ? 0.4 : 0.3 });
    },
    fx: (k) => ({ flood: k < 0 ? 0.6 : 1, fog: 0.006 }),
    update(s) {
      const on = s.local > -1.2 && s.local < 4.2 ? 1 : 0;
      flow.mat.uniforms.uOn.value += (on - flow.mat.uniforms.uOn.value) * Math.min(1, s.dt * 2);
      flow.mat.uniforms.uTime.value = s.reduced ? 0.3 : s.time;
      flow.mat.uniforms.uPixel.value = Math.min(devicePixelRatio, 2);
      if (!s.reduced) {
        ring2.rotation.x = s.time * 0.4;
        core.rotation.y = s.time * 0.15;
        core.rotation.x = s.time * 0.08;
        heart.rotation.y = -s.time * 0.3;
      }
    },
    dispose: () => {
      flow.dispose();
      guide.forEach((g) => g.dispose());
      label.dispose();
      num.dispose();
    },
  };
}

/* 07 — the overlook. The flood drains; an 85% gauge lies in space. */
export const OVERLOOK = v3(262, 0, -52);
export function calloutStation(ctx: Ctx): Station {
  const group = new THREE.Group();
  const c = OVERLOOK.clone().add(v3(0, 3.2, 0));
  const arc = mesh(new THREE.TorusGeometry(3.2, 0.36, 32, 200, Math.PI * 2 * 0.85), ctx.mats.anodised);
  const rest = mesh(new THREE.TorusGeometry(3.2, 0.2, 24, 80, Math.PI * 2 * 0.15), ctx.mats.glass);
  rest.rotation.z = Math.PI * 2 * 0.85;
  const gauge = new THREE.Group();
  gauge.add(arc, rest);
  gauge.position.copy(c);
  gauge.rotation.z = Math.PI / 2;
  group.add(gauge, at(mesh(cyl(1.0, 1.4, 0.4, 64), ctx.mats.ceramic), c.x, 0.2, c.z));
  const geos = [arc.geometry, rest.geometry];
  return {
    id: "callout",
    group,
    beats: 1,
    transition: "rise",
    pose: (_k, side, mobile) => frame(c, { dist: 12, h: 1.2, yaw: 0.2, side, mobile, shift: 0.34 }),
    fx: () => ({ flood: 0, fog: 0.0075 }),
    update(s) {
      const show = Math.max(0, Math.min(1, 1 - Math.abs(s.local)));
      gauge.rotation.x = s.reduced ? 0.3 : 0.3 + Math.sin(s.time * 0.3) * 0.15;
      gauge.scale.setScalar(0.6 + show * 0.4);
    },
    dispose: () => geos.forEach((g) => g.dispose()),
  };
}
