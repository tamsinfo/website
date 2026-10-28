// Shared materials and geometry for every room in the studio, so the whole building
// reads as one material language: porcelain parts, anodised blue metal, paper floor,
// and rare signal-orange status lights.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const palette = {
  paper: new THREE.Color("#f2eee7"),
  porcelain: new THREE.Color("#fbf9f5"),
  ink: new THREE.Color("#101826"),
  blue: new THREE.Color("#1638d8"),
  blueDeep: new THREE.Color("#0b1e78"),
  night: new THREE.Color("#0b1a56"),
  signal: new THREE.Color("#ff5a1f"),
  navy: new THREE.Color("#0a1633"),
};

export type Kit = ReturnType<typeof createKit>;

export function createKit() {
  const geometries = new Map<string, THREE.BufferGeometry>();
  const disposables: { dispose(): void }[] = [];

  const track = <T extends { dispose(): void }>(thing: T) => {
    disposables.push(thing);
    return thing;
  };

  const mat = {
    porcelain: track(
      new THREE.MeshPhysicalMaterial({
        color: palette.porcelain,
        roughness: 0.42,
        clearcoat: 0.35,
        clearcoatRoughness: 0.45,
      }),
    ),
    ceramicMatte: track(new THREE.MeshStandardMaterial({ color: "#ece7de", roughness: 0.78 })),
    blueMetal: track(new THREE.MeshStandardMaterial({ color: palette.blue, metalness: 0.55, roughness: 0.32 })),
    blueDeep: track(new THREE.MeshStandardMaterial({ color: palette.blueDeep, metalness: 0.5, roughness: 0.38 })),
    steel: track(new THREE.MeshStandardMaterial({ color: "#aab2c0", metalness: 0.85, roughness: 0.28 })),
    graphite: track(new THREE.MeshStandardMaterial({ color: "#232c40", metalness: 0.4, roughness: 0.5 })),
    glass: track(new THREE.MeshStandardMaterial({ color: "#16224a", metalness: 0.2, roughness: 0.12 })),
    rubber: track(new THREE.MeshStandardMaterial({ color: "#1b2131", roughness: 0.9 })),
    signal: track(new THREE.MeshBasicMaterial({ color: palette.signal, toneMapped: false })),
    signalWarm: track(
      new THREE.MeshStandardMaterial({
        color: "#ff7a3d",
        emissive: new THREE.Color("#ff5a1f"),
        emissiveIntensity: 1.4,
        roughness: 0.6,
      }),
    ),
    statusBlue: track(new THREE.MeshBasicMaterial({ color: "#7fa0ff", toneMapped: false })),
    light: track(new THREE.MeshBasicMaterial({ color: "#fffdf8", toneMapped: false })),
    paperPanel: track(new THREE.MeshStandardMaterial({ color: palette.paper, roughness: 0.9 })),
  };

  function rounded(w: number, h: number, d: number, r = 0.06, segments = 3) {
    const key = `rb:${w}:${h}:${d}:${r}:${segments}`;
    let geo = geometries.get(key);
    if (!geo) {
      geo = new RoundedBoxGeometry(w, h, d, segments, Math.min(r, w / 2, h / 2, d / 2));
      geometries.set(key, geo);
    }
    return geo;
  }

  function cylinder(rt: number, rb: number, h: number, seg = 40) {
    const key = `cy:${rt}:${rb}:${h}:${seg}`;
    let geo = geometries.get(key);
    if (!geo) {
      geo = new THREE.CylinderGeometry(rt, rb, h, seg);
      geometries.set(key, geo);
    }
    return geo;
  }

  function torus(r: number, tube: number, seg = 48) {
    const key = `to:${r}:${tube}:${seg}`;
    let geo = geometries.get(key);
    if (!geo) {
      geo = new THREE.TorusGeometry(r, tube, 18, seg);
      geometries.set(key, geo);
    }
    return geo;
  }

  function sphere(r: number) {
    const key = `sp:${r}`;
    let geo = geometries.get(key);
    if (!geo) {
      geo = new THREE.SphereGeometry(r, 24, 16);
      geometries.set(key, geo);
    }
    return geo;
  }

  /** A machined spur gear with a bore, bevelled so its edges catch the key light. */
  function gear(radius = 0.42, teeth = 14, depth = 0.16, bore = 0.13) {
    const key = `gear:${radius}:${teeth}:${depth}:${bore}`;
    let geo = geometries.get(key);
    if (!geo) {
      const shape = new THREE.Shape();
      const inner = radius * 0.82;
      const steps = teeth * 4;
      for (let i = 0; i <= steps; i += 1) {
        const a = (i / steps) * Math.PI * 2;
        const phase = i % 4;
        const r = phase === 1 || phase === 2 ? radius : inner;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      const hole = new THREE.Path();
      hole.absarc(0, 0, bore, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.02,
        bevelSegments: 2,
        curveSegments: 6,
      });
      geo.center();
      geometries.set(key, geo);
    }
    return geo;
  }

  /** An I-beam section extruded to length, for fabrication props. */
  function ibeam(length: number, h = 0.32, w = 0.2, t = 0.04) {
    const key = `ib:${length}:${h}:${w}:${t}`;
    let geo = geometries.get(key);
    if (!geo) {
      const s = new THREE.Shape();
      const hw = w / 2;
      const hh = h / 2;
      const ht = t / 2;
      s.moveTo(-hw, -hh);
      s.lineTo(hw, -hh);
      s.lineTo(hw, -hh + t);
      s.lineTo(ht, -hh + t);
      s.lineTo(ht, hh - t);
      s.lineTo(hw, hh - t);
      s.lineTo(hw, hh);
      s.lineTo(-hw, hh);
      s.lineTo(-hw, hh - t);
      s.lineTo(-ht, hh - t);
      s.lineTo(-ht, -hh + t);
      s.lineTo(-hw, -hh + t);
      s.closePath();
      geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
      geo.translate(0, 0, -length / 2);
      geometries.set(key, geo);
    }
    return geo;
  }

  /** A turned profile (ladles, vials, vessels) from [radius, height] pairs. */
  function lathe(id: string, points: [number, number][], seg = 40) {
    const key = `la:${id}`;
    let geo = geometries.get(key);
    if (!geo) {
      geo = new THREE.LatheGeometry(
        points.map(([x, y]) => new THREE.Vector2(x, y)),
        seg,
      );
      geometries.set(key, geo);
    }
    return geo;
  }

  function mesh(geo: THREE.BufferGeometry, material: THREE.Material, shadows = true) {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = shadows;
    m.receiveShadow = shadows;
    return m;
  }

  /** Add a mesh to a parent at a position, with optional yaw. */
  function place(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
    shadows = true,
  ) {
    const m = mesh(geo, material, shadows);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    parent.add(m);
    return m;
  }

  /** A soft additive halo for emissive status lights. It is only visible at night. */
  const glowTexture = (() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return track(tex);
  })();

  function glow(color: THREE.ColorRepresentation, scale = 0.6) {
    const material = track(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      }),
    );
    const sprite = new THREE.Sprite(material);
    sprite.scale.setScalar(scale);
    sprite.renderOrder = 2;
    return sprite;
  }

  /** A flowing data line along a curve. Draws in with `uDraw`, pulses travel along it. */
  function flowLine(curve: THREE.Curve<THREE.Vector3>, radius = 0.028, color = "#3d63ff") {
    const geo = track(new THREE.TubeGeometry(curve, 96, radius, 8, false));
    const material = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDraw: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uPulse: { value: new THREE.Color("#ffffff") },
          uLength: { value: curve.getLength() },
          uGlow: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uDraw;
          uniform float uLength;
          uniform float uGlow;
          uniform vec3 uColor;
          uniform vec3 uPulse;
          varying vec2 vUv;
          void main() {
            float along = vUv.x;
            if (along > uDraw) discard;
            float head = smoothstep(uDraw - 0.06, uDraw, along) * step(uDraw, 0.999);
            float d = fract(along * uLength * 0.35 - uTime * 0.55);
            float pulse = smoothstep(0.0, 0.08, d) * (1.0 - smoothstep(0.08, 0.32, d));
            vec3 col = mix(uColor, uPulse, clamp(pulse * 0.75 * uGlow + head, 0.0, 1.0));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    );
    const m = new THREE.Mesh(geo, material);
    m.renderOrder = 1;
    return { mesh: m, material };
  }

  function dispose() {
    for (const geo of geometries.values()) geo.dispose();
    geometries.clear();
    for (const d of disposables) d.dispose();
    for (const m of Object.values(mat)) m.dispose();
  }

  return { mat, rounded, cylinder, torus, sphere, gear, ibeam, lathe, mesh, place, glow, flowLine, track, dispose };
}
