// A small velocity field that the cursor stirs and that decays on its own. The final
// composite pass offsets the scene by it, which reads as a faint disturbance in the lens
// around the pointer. It never touches the DOM, so text selection and clicks are unaffected.
import * as THREE from "three";

const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function createFlow(renderer: THREE.WebGLRenderer, size = 128) {
  const options: THREE.RenderTargetOptions = {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  };
  let read = new THREE.WebGLRenderTarget(size, size, options);
  let write = new THREE.WebGLRenderTarget(size, size, options);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tPrev: { value: read.texture },
      uPoint: { value: new THREE.Vector2(-10, -10) },
      uForce: { value: new THREE.Vector2() },
      uAspect: { value: 1 },
      uDecay: { value: 0.94 },
      uRadius: { value: 0.0035 },
    },
    vertexShader: quadVert,
    fragmentShader: /* glsl */ `
      uniform sampler2D tPrev;
      uniform vec2 uPoint;
      uniform vec2 uForce;
      uniform float uAspect;
      uniform float uDecay;
      uniform float uRadius;
      varying vec2 vUv;
      void main() {
        vec2 vel = texture2D(tPrev, vUv).xy;
        // self-advection gives the trail its curl
        vec2 advected = texture2D(tPrev, vUv - vel * 0.012).xy;
        vec2 d = vUv - uPoint;
        d.x *= uAspect;
        float splat = exp(-dot(d, d) / uRadius);
        vec2 next = advected * uDecay + uForce * splat;
        gl_FragColor = vec4(clamp(next, -1.0, 1.0), 0.0, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const pointer = new THREE.Vector2(-10, -10);
  const last = new THREE.Vector2(-10, -10);
  let moved = false;
  let energy = 0;

  function move(nx: number, ny: number) {
    pointer.set(nx, ny);
    moved = true;
  }

  function step(dt: number, aspect: number) {
    const force = material.uniforms.uForce.value as THREE.Vector2;
    if (moved && last.x > -5) {
      force.set(pointer.x - last.x, pointer.y - last.y).multiplyScalar(14);
      if (force.length() > 1) force.setLength(1);
      energy = 1;
    } else {
      force.set(0, 0);
    }
    last.copy(pointer);
    moved = false;
    energy *= Math.exp(-dt * 1.2);

    material.uniforms.uPoint.value.copy(pointer);
    material.uniforms.uAspect.value = aspect;
    material.uniforms.tPrev.value = read.texture;
    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(write);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prevTarget);
    const swap = read;
    read = write;
    write = swap;
  }

  return {
    move,
    step,
    get texture() {
      return read.texture;
    },
    /** Whether the field still has visible motion; lets the loop sleep when idle. */
    get active() {
      return energy > 0.01;
    },
    dispose() {
      read.dispose();
      write.dispose();
      material.dispose();
      quad.geometry.dispose();
    },
  };
}

export function createComposite() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: null },
      tFlow: { value: null },
      uFlow: { value: 0 },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uGrain: { value: 0.012 },
    },
    vertexShader: quadVert,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene;
      uniform sampler2D tFlow;
      uniform float uFlow;
      uniform float uTime;
      uniform float uGrain;
      uniform vec2 uRes;
      varying vec2 vUv;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      void main() {
        vec2 v = texture2D(tFlow, vUv).xy * uFlow;
        vec2 uv = vUv - v * 0.02;
        float split = length(v) * 0.0035;
        vec3 col;
        col.r = texture2D(tScene, uv + v * split * 40.0).r;
        col.g = texture2D(tScene, uv).g;
        col.b = texture2D(tScene, uv - v * split * 40.0).b;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        gl_FragColor.rgb += (hash(vUv * uRes + fract(uTime) * 61.0) - 0.5) * uGrain;
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
  return {
    material,
    render(renderer: THREE.WebGLRenderer) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    },
    dispose() {
      material.dispose();
      quad.geometry.dispose();
    },
  };
}
