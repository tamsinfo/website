import * as THREE from "three";

/* Hero object: raymarched SDF metaballs (liquid chrome) that follow the cursor, morph into
   the TAMS beam mark, then erode into parts (the proof chapter's bolts take over).
   Shading: studio environment evaluated in the shader, three-tap dispersion through the
   body, thin-film iridescence on the fresnel. Writes gl_FragDepth so DOF and occlusion work. */

const vert = /* glsl */ `
  varying vec3 vWorld;
  void main(){
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec3 vWorld;
  uniform mat4 uInvModel, uModel, uProj;
  uniform float uTime, uMorph, uDissolve, uScale;
  uniform vec3 uMouse;           // object space
  uniform float uMouseOn;

  float sdBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
  float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
  float h31(vec3 p){ return fract(sin(dot(p, vec3(17.1, 113.7, 41.9))) * 43758.5453); }
  float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(h31(i), h31(i+vec3(1,0,0)), f.x), mix(h31(i+vec3(0,1,0)), h31(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(h31(i+vec3(0,0,1)), h31(i+vec3(1,0,1)), f.x), mix(h31(i+vec3(0,1,1)), h31(i+vec3(1,1,1)), f.x), f.y), f.z); }

  float blob(vec3 p){
    float d = 1e3;
    for (int i = 0; i < 6; i++){
      float fi = float(i);
      vec3 c = vec3(sin(uTime * (0.31 + fi * 0.07) + fi * 1.7), cos(uTime * (0.27 + fi * 0.05) + fi * 2.3) * 0.8, sin(uTime * (0.23 + fi * 0.06) + fi)) * 0.95;
      d = smin(d, length(p - c) - (0.52 + 0.12 * sin(fi * 3.1)), 0.62);
    }
    d = smin(d, length(p - uMouse) - 0.5 * uMouseOn - 0.05, 0.7);
    return d;
  }
  float mark(vec3 p){
    float flange = sdBox(p - vec3(0.0, 0.92, 0.0), vec3(1.55, 0.36, 0.4), 0.16);
    float web = sdBox(p - vec3(0.0, -0.42, 0.0), vec3(0.36, 0.86, 0.4), 0.16);
    float node = sdBox(p - vec3(1.12, -1.0, 0.0), vec3(0.32, 0.3, 0.4), 0.14);
    return min(min(flange, web), node);
  }
  float map(vec3 p){
    p /= uScale;
    float d = mix(blob(p), mark(p), smoothstep(0.0, 1.0, uMorph));
    if (uDissolve > 0.0){
      float n = n3(p * 3.2 + uTime * 0.6);
      d += uDissolve * (0.25 + n * 0.9);
    }
    return d * uScale;
  }
  vec3 nrm(vec3 p){
    const vec2 k = vec2(1.0, -1.0); float e = 0.002 * uScale;
    return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) + k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
  }
  // the studio, as a function: warm walls, a ceiling of softboxes, a cool window, a blue card
  vec3 studio(vec3 d){
    vec3 c = mix(vec3(0.80, 0.76, 0.70), vec3(0.98, 0.96, 0.92), smoothstep(-0.4, 0.6, d.y));
    c += vec3(1.6, 1.52, 1.4) * smoothstep(0.78, 0.92, d.y) * (0.6 + 0.4 * step(0.5, fract(d.x * 3.0 + 0.25)) * step(0.5, fract(d.z * 3.0 + 0.25)));
    c += vec3(1.3, 1.4, 1.65) * smoothstep(0.86, 0.97, d.x) * smoothstep(-0.2, 0.3, d.y);
    c += vec3(0.25, 0.42, 1.4) * smoothstep(0.82, 0.96, -d.z) * smoothstep(0.4, -0.2, d.y);
    c = mix(c, vec3(0.62, 0.58, 0.54), smoothstep(-0.05, -0.6, d.y));
    return c;
  }

  void main(){
    vec3 ro = cameraPosition;
    vec3 rd = normalize(vWorld - cameraPosition);
    vec3 lro = (uInvModel * vec4(ro, 1.0)).xyz;
    vec3 lrd = normalize((uInvModel * vec4(rd, 0.0)).xyz);
    float t = 0.0, d;
    bool hit = false;
    for (int i = 0; i < 84; i++){
      vec3 p = lro + lrd * t;
      d = map(p);
      if (d < 0.0015) { hit = true; break; }
      t += d * 0.95;
      if (t > 60.0) break;
    }
    if (!hit) discard;
    vec3 p = lro + lrd * t;
    vec3 n = nrm(p);
    float fres = pow(1.0 - max(dot(-lrd, n), 0.0), 3.0);
    vec3 refl = studio(reflect(lrd, n));
    vec3 refr = vec3(studio(refract(lrd, n, 1.0 / 1.42)).r, studio(refract(lrd, n, 1.0 / 1.46)).g, studio(refract(lrd, n, 1.0 / 1.51)).b);
    vec3 film = 0.5 + 0.5 * cos(6.2831 * (fres * 1.4 + vec3(0.0, 0.33, 0.67) + uTime * 0.03));
    vec3 tint = mix(vec3(0.62, 0.7, 1.0), vec3(0.16, 0.26, 0.95), 0.25 + 0.55 * uMorph);
    float ao = 0.55 + 0.45 * smoothstep(-1.2, 1.2, n.y);
    vec3 col = mix(refr * tint * 0.8 * ao, refl * 1.05, 0.35 + 0.65 * fres);
    col += film * fres * 0.42;
    col += vec3(1.2) * pow(max(dot(reflect(lrd, n), normalize(vec3(-0.4, 0.9, 0.3))), 0.0), 60.0);
    col = min(col, vec3(1.35));
    vec4 clip = uProj * viewMatrix * (uModel * vec4(p, 1.0));
    gl_FragDepth = (clip.z / clip.w) * 0.5 + 0.5;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createSdfHero() {
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uInvModel: { value: new THREE.Matrix4() },
      uModel: { value: new THREE.Matrix4() },
      uProj: { value: new THREE.Matrix4() },
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uDissolve: { value: 0 },
      uScale: { value: 1 },
      uMouse: { value: new THREE.Vector3(9, 9, 9) },
      uMouseOn: { value: 0 },
    },
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 5), mat);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = (_r, _s, camera) => {
    mesh.updateMatrixWorld();
    mat.uniforms.uModel.value.copy(mesh.matrixWorld);
    mat.uniforms.uInvModel.value.copy(mesh.matrixWorld).invert();
    mat.uniforms.uProj.value.copy(camera.projectionMatrix);
  };
  return { mesh, mat, dispose: () => (mesh.geometry.dispose(), mat.dispose()) };
}
