import * as THREE from "three";
import {
  BlendFunction,
  BloomEffect,
  DepthOfFieldEffect,
  Effect,
  EffectAttribute,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
} from "postprocessing";

/* ---------------------------------------------------------------------------------------
   Cursor flow field (after the add-shader-cursor-trail skill: a flow field drives a dot-grid
   mask, plus ripples and grain — rebuilt in the single WebGL context instead of a second
   WebGPU canvas). Ping-pong half-float target: rg = velocity, b = intensity.
   --------------------------------------------------------------------------------------- */
const quadVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const trailFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tPrev;
  uniform vec2 uMouse, uMouseVel;
  uniform float uAspect, uDecay, uRadius, uActive, uRipple;
  void main(){
    vec4 prev = texture2D(tPrev, vUv - texture2D(tPrev, vUv).rg * 0.012);
    vec2 d = vUv - uMouse; d.x *= uAspect;
    float r2 = dot(d, d);
    float splat = exp(-r2 / (uRadius * uRadius)) * uActive;
    float ring = uRipple * exp(-pow((sqrt(r2) - (1.0 - uRipple) * 0.25) * 28.0, 2.0));
    vec2 vel = prev.rg * uDecay + uMouseVel * splat * 6.0 + normalize(d + 1e-5) * ring * 0.6;
    float ink = prev.b * uDecay + splat * min(1.0, length(uMouseVel) * 40.0) + ring;
    gl_FragColor = vec4(clamp(vel, -1.0, 1.0), clamp(ink, 0.0, 1.0), 1.0);
  }
`;

export function createTrail(renderer: THREE.WebGLRenderer) {
  const opts = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  let a = new THREE.WebGLRenderTarget(256, 256, opts);
  let b = new THREE.WebGLRenderTarget(256, 256, opts);
  const mat = new THREE.ShaderMaterial({
    vertexShader: quadVert,
    fragmentShader: trailFrag,
    uniforms: {
      tPrev: { value: a.texture },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uMouseVel: { value: new THREE.Vector2() },
      uAspect: { value: 1 },
      uDecay: { value: 0.955 },
      uRadius: { value: 0.06 },
      uActive: { value: 0 },
      uRipple: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const last = new THREE.Vector2(-1, -1);
  let ripple = 0;
  return {
    get texture() {
      return a.texture;
    },
    resize(w: number, h: number) {
      const s = 0.25;
      a.setSize(Math.max(64, Math.round(w * s)), Math.max(64, Math.round(h * s)));
      b.setSize(Math.max(64, Math.round(w * s)), Math.max(64, Math.round(h * s)));
      mat.uniforms.uAspect.value = w / h;
    },
    click() {
      ripple = 1;
    },
    update(mouse: THREE.Vector2, active: boolean, dt: number) {
      const u = mat.uniforms;
      const vel = new THREE.Vector2().subVectors(mouse, last.x < 0 ? mouse : last);
      last.copy(mouse);
      u.uMouse.value.copy(mouse);
      u.uMouseVel.value.lerp(vel, 0.6);
      u.uActive.value = active ? 1 : 0;
      ripple = Math.max(0, ripple - dt * 1.6);
      u.uRipple.value = ripple;
      u.tPrev.value = a.texture;
      const prevTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(b);
      renderer.render(scene, cam);
      renderer.setRenderTarget(prevTarget);
      [a, b] = [b, a];
    },
    dispose() {
      a.dispose();
      b.dispose();
      mat.dispose();
      quad.geometry.dispose();
    },
  };
}

/* ---------------------------------------------------------------------------------------
   TAMS finishing effect: trail displacement + halftone, scroll-velocity distortion,
   motion-only chromatic fringe, brand-blue flood, liquid route transition, film grain.
   --------------------------------------------------------------------------------------- */
const finishFrag = /* glsl */ `
  uniform sampler2D tTrail;
  uniform float uVel, uTime, uFlood, uTrans, uGrain, uAspect;
  uniform vec3 uBlue, uBlueDeep, uPorcelain;

  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }

  vec2 displace(vec2 uv){
    vec4 t = texture2D(tTrail, uv);
    uv -= t.rg * 0.03 * t.b;                                   // the cursor disturbs the world
    uv.y += sin(uv.x * 7.0 + uTime * 1.3) * uVel * 0.006;       // scroll velocity waves the image
    uv.x += sin(uv.y * 5.0 - uTime) * uVel * 0.002;
    float liquid = uTrans * (1.0 - uTrans) * 4.0;               // strongest mid-transition
    uv += (vec2(fbm(uv * 3.0 + uTime * 0.4), fbm(uv * 3.0 - uTime * 0.4)) - 0.5) * 0.08 * liquid;
    return uv;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv0, out vec4 outputColor){
    vec2 uv = displace(uv0);
    vec4 t = texture2D(tTrail, uv0);
    float fringe = abs(uVel) * 0.006 + t.b * 0.004;
    vec2 dir = normalize(uv - 0.5 + 1e-4) * fringe;
    vec3 c = vec3(texture2D(inputBuffer, uv + dir).r, texture2D(inputBuffer, uv).g, texture2D(inputBuffer, uv - dir).b);

    // halftone where the trail is: a dot grid masks a faint blue
    vec2 g = uv * vec2(uAspect, 1.0) * 90.0;
    float dotR = 0.5 * smoothstep(0.02, 0.9, t.b);
    float dots = 1.0 - smoothstep(dotR - 0.08, dotR, length(fract(g) - 0.5));
    c = mix(c, c * mix(vec3(1.0), uBlue * 1.6, 0.35), dots * smoothstep(0.03, 0.4, t.b));

    // brand-blue flood: the world becomes a blue duotone, emissive data stays bright
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 duo = mix(uBlueDeep, uBlue * 1.05, smoothstep(0.05, 0.72, l));
    duo = mix(duo, uPorcelain, smoothstep(0.9, 1.0, l));
    c = mix(c, duo, uFlood);

    // liquid transition: blue rises with a living edge, then drains
    float edge = uv.y + (fbm(vec2(uv.x * 3.0, uTime * 0.6)) - 0.5) * 0.35;
    float level = uTrans * 1.5 - 0.25;
    float cover = smoothstep(level + 0.02, level - 0.02, edge);
    float rim = smoothstep(0.05, 0.0, abs(edge - level)) * (1.0 - cover);
    c = mix(c, uBlue, cover);
    c += rim * 0.25 * uPorcelain;

    // a touch of contrast so the studio never goes milky
    c = clamp((c - 0.5) * 1.07 + 0.5, 0.0, 10.0);

    // film grain, multiplied so whites stay white-ish and ink stays crisp
    float n = h21(uv * vec2(1931.0, 1173.0) + fract(uTime * 0.0)) - 0.5;
    c *= 1.0 + n * uGrain;
    outputColor = vec4(c, inputColor.a);
  }
`;

export class FinishEffect extends Effect {
  constructor(trail: THREE.Texture) {
    super("FinishEffect", finishFrag, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, THREE.Uniform>([
        ["tTrail", new THREE.Uniform(trail)],
        ["uVel", new THREE.Uniform(0)],
        ["uTime", new THREE.Uniform(0)],
        ["uFlood", new THREE.Uniform(0)],
        ["uTrans", new THREE.Uniform(0)],
        ["uGrain", new THREE.Uniform(0.06)],
        ["uAspect", new THREE.Uniform(1)],
        ["uBlue", new THREE.Uniform(new THREE.Color("#1638D8"))],
        ["uBlueDeep", new THREE.Uniform(new THREE.Color("#081659"))],
        ["uPorcelain", new THREE.Uniform(new THREE.Color("#EEF1FF"))],
      ]),
    });
  }
  set(name: string, v: number) {
    (this.uniforms.get(name) as THREE.Uniform).value = v;
  }
}

export function createComposer(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, trail: THREE.Texture, mobile: boolean) {
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: mobile || devicePixelRatio > 1.4 ? 0 : 4 });
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const dof = new DepthOfFieldEffect(camera, { worldFocusDistance: 12, worldFocusRange: 14, bokehScale: mobile ? 1.2 : 2.2, resolutionScale: 0.5 });
  dof.target = new THREE.Vector3();
  const bloom = new BloomEffect({ luminanceThreshold: 3.2, luminanceSmoothing: 0.3, intensity: 1.0, mipmapBlur: true, radius: 0.7 });
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
  composer.addPass(new EffectPass(camera, dof, bloom, tone));
  const finish = new FinishEffect(trail);
  composer.addPass(new EffectPass(camera, finish));
  return { composer, dof, bloom, finish, renderPass };
}
