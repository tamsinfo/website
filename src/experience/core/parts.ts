import * as THREE from "three";

/* GPU-driven instanced parts. Each instance carries up to 6 target positions (aT0..aT5) and a
   seed; the vertex shader morphs between consecutive targets with a per-part delay, an arc and
   a spin, and pushes parts away from the cursor. Material stays physically lit (patched
   MeshPhysicalMaterial), so bolts read as brushed steel and plates as anodised blue. */

export type PartSet = THREE.Vector3[][]; // sets[k][i] = target k for instance i

export function sampleText(text: string, count: number, width: number, font: string, seed = 1): THREE.Vector3[] {
  const c = document.createElement("canvas");
  const H = 260;
  const ctx = c.getContext("2d")!;
  ctx.font = `800 ${H}px ${font}`;
  const W = Math.ceil(ctx.measureText(text).width) + 20;
  c.width = W;
  c.height = H + 20;
  ctx.font = `800 ${H}px ${font}`;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";
  ctx.fillText(text, 10, 10);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const filled: number[] = [];
  for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (data[(y * c.width + x) * 4 + 3] > 128) filled.push(x, y);
  let s = seed * 9973;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const scale = width / Math.max(W, 1);
  const out: THREE.Vector3[] = [];
  const n = filled.length / 2;
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rnd() * n) * 2;
    out.push(new THREE.Vector3((filled[k] - c.width / 2) * scale, (c.height / 2 - filled[k + 1]) * scale, (rnd() - 0.5) * 0.7));
  }
  return out;
}

export function sphereCloud(count: number, r: number, center = new THREE.Vector3(), seed = 3) {
  let s = seed * 7919;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: count }, () => {
    const u = rnd() * 2 - 1;
    const a = rnd() * Math.PI * 2;
    const rr = r * Math.cbrt(rnd());
    const q = Math.sqrt(1 - u * u);
    return new THREE.Vector3(Math.cos(a) * q * rr, u * rr, Math.sin(a) * q * rr).add(center);
  });
}

const header = /* glsl */ `
  attribute vec3 aT0; attribute vec3 aT1; attribute vec3 aT2; attribute vec3 aT3; attribute vec3 aT4; attribute vec3 aT5;
  attribute vec4 aSeed;
  uniform float uMorph, uTime, uRepel, uSpin;
  uniform vec3 uMouse;
  vec3 pick(float k){
    if (k < 0.5) return aT0; if (k < 1.5) return aT1; if (k < 2.5) return aT2;
    if (k < 3.5) return aT3; if (k < 4.5) return aT4; return aT5;
  }
  mat3 rotAxis(vec3 a, float r){ a = normalize(a); float s = sin(r), c = cos(r), oc = 1.0 - c;
    return mat3(oc*a.x*a.x + c, oc*a.x*a.y + a.z*s, oc*a.z*a.x - a.y*s,
                oc*a.x*a.y - a.z*s, oc*a.y*a.y + c, oc*a.y*a.z + a.x*s,
                oc*a.z*a.x + a.y*s, oc*a.y*a.z - a.x*s, oc*a.z*a.z + c); }
  vec3 gOffset; mat3 gRot;
  void computePart(){
    float m = clamp(uMorph, 0.0, 5.0);
    float k = floor(m); float f = m - k;
    float delay = aSeed.x * 0.45;
    float e = clamp((f - delay) / 0.55, 0.0, 1.0);
    e = e < 0.5 ? 4.0*e*e*e : 1.0 - pow(-2.0*e + 2.0, 3.0) / 2.0;
    vec3 a = pick(k), b = pick(min(k + 1.0, 5.0));
    vec3 p = mix(a, b, e);
    p += (vec3(aSeed.y - 0.5, 0.6 + aSeed.z, aSeed.w - 0.5) * 3.2) * sin(3.14159 * e);
    p += vec3(sin(uTime * 0.7 + aSeed.x * 40.0), cos(uTime * 0.6 + aSeed.y * 30.0), 0.0) * 0.03;
    vec3 d = p - uMouse; float dist = length(d);
    p += normalize(d + 1e-4) * max(0.0, 1.8 - dist) * 0.9 * uRepel;
    gOffset = p;
    gRot = rotAxis(vec3(aSeed.y, aSeed.z, aSeed.w) - 0.5, aSeed.x * 6.28 + e * 6.28 * uSpin + uTime * 0.2 * aSeed.z);
  }
`;

export function createParts(geometry: THREE.BufferGeometry, material: THREE.MeshPhysicalMaterial, sets: PartSet) {
  const count = sets[0].length;
  const geo = geometry.clone();
  const mesh = new THREE.InstancedMesh(geo, material.clone(), count);
  for (let k = 0; k < 6; k++) {
    const src = sets[Math.min(k, sets.length - 1)];
    const arr = new Float32Array(count * 3);
    src.forEach((v, i) => v.toArray(arr, i * 3));
    geo.setAttribute(`aT${k}`, new THREE.InstancedBufferAttribute(arr, 3));
  }
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  const uniforms = {
    uMorph: { value: 0 },
    uTime: { value: 0 },
    uRepel: { value: 1 },
    uSpin: { value: 1 },
    uMouse: { value: new THREE.Vector3(999, 999, 999) },
  };
  const mat = mesh.material as THREE.MeshPhysicalMaterial;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${header}`)
      .replace("#include <beginnormal_vertex>", "computePart();\nvec3 objectNormal = gRot * vec3( normal );\n#ifdef USE_TANGENT\nvec3 objectTangent = gRot * vec3( tangent.xyz );\n#endif")
      .replace("#include <begin_vertex>", "vec3 transformed = gRot * vec3( position ) + gOffset;");
  };
  mat.customProgramCacheKey = () => "tams-parts";
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return {
    mesh,
    uniforms,
    dispose() {
      geo.dispose();
      mat.dispose();
      mesh.dispose();
    },
  };
}
