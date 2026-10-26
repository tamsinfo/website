import * as THREE from "three";
import { Text } from "troika-three-text";

/* Live-looking data: thousands of points streaming one way along curves. Curves are baked into a
   float DataTexture (one row per curve) and sampled in the vertex shader, so motion is GPU-only. */

export function createFlow(curves: THREE.Curve<THREE.Vector3>[], perCurve = 900, color = new THREE.Color("#ffffff"), size = 7) {
  const S = 256;
  const data = new Float32Array(S * curves.length * 4);
  curves.forEach((c, row) => {
    for (let i = 0; i < S; i++) {
      const p = c.getPointAt(i / (S - 1));
      data.set([p.x, p.y, p.z, 1], (row * S + i) * 4);
    }
  });
  const tex = new THREE.DataTexture(data, S, curves.length, THREE.RGBAFormat, THREE.FloatType);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  const n = perCurve * curves.length;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const meta = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perCurve);
    meta.set([(row + 0.5) / curves.length, Math.random(), 0.04 + Math.random() * 0.05, Math.random()], i * 4);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
  const mat = new THREE.ShaderMaterial({
    uniforms: { tCurves: { value: tex }, uTime: { value: 0 }, uColor: { value: color }, uSize: { value: size }, uOn: { value: 0 }, uPixel: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec4 aMeta;
      uniform sampler2D tCurves; uniform float uTime, uSize, uOn, uPixel;
      varying float vA;
      void main(){
        float t = fract(aMeta.y + uTime * aMeta.z);
        vec3 p = texture2D(tCurves, vec2(t, aMeta.x)).xyz;
        p += (vec3(fract(aMeta.w * 13.1), fract(aMeta.w * 71.7), fract(aMeta.w * 37.3)) - 0.5) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixel * (0.6 + aMeta.w) * (10.0 / -mv.z);
        vA = uOn * smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.92, t);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor * 1.25, vA * smoothstep(0.5, 0.15, d));
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, mat, dispose: () => (geo.dispose(), mat.dispose(), tex.dispose()) };
}

/* Spatial type: huge SDF words that the camera passes. Decorative (the DOM carries meaning). */
export const FONT_URL = "/fonts/big-shoulders-800.woff";

/** every spatial word, so the preloader can wait for their glyphs */
export const WORDS: Text[] = [];

export function word(text: string, opts: { size: number; color?: string; material?: THREE.Material; anchorX?: "left" | "center" | "right"; letterSpacing?: number }) {
  const t = new Text();
  t.text = text;
  t.font = FONT_URL;
  t.fontSize = opts.size;
  t.anchorX = opts.anchorX ?? "center";
  t.anchorY = "bottom";
  t.letterSpacing = opts.letterSpacing ?? -0.01;
  t.color = opts.color ?? "#E6E0D6";
  if (opts.material) t.material = opts.material;
  t.sdfGlyphSize = 128;
  WORDS.push(t);
  return t;
}
