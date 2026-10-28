// The brand-blue liquid that fills the lens between rooms. It is a separate, tiny WebGL
// canvas above the page so it can cover DOM content too, and it is the preloader's
// surface: the site opens flooded and drains into the plant.
// Without WebGL it falls back to a plain blue panel that wipes vertically.

const vert = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

const frag = `
precision highp float;
uniform float uLevel;
uniform float uTime;
uniform float uWave;
uniform vec2 uRes;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  float x = uv.x * aspect;
  // a surface that sloshes more while it is moving
  float surface = uLevel * 1.24 - 0.12
    + uWave * (0.045 * sin(x * 3.1 + uTime * 2.3) + 0.03 * sin(x * 7.7 - uTime * 3.1) + 0.05 * (noise(vec2(x * 2.2, uTime * 0.7)) - 0.5));
  float edge = 1.5 / uRes.y;
  float inside = 1.0 - smoothstep(surface - edge, surface + edge, uv.y);
  if (inside <= 0.0) discard;

  vec3 blue = vec3(0.0863, 0.2196, 0.8471);
  vec3 deep = vec3(0.0431, 0.1176, 0.4706);
  float depth = clamp((surface - uv.y) * 1.6, 0.0, 1.0);
  vec3 col = mix(blue, deep, smoothstep(0.0, 1.0, depth) * 0.75);
  // caustic ripples, faint and only near the surface
  float c = noise(vec2(x * 9.0, uv.y * 9.0 - uTime * 0.6)) * noise(vec2(x * 5.0 + uTime * 0.3, uv.y * 6.0));
  col += vec3(0.08, 0.1, 0.2) * c * (1.0 - depth) * uWave;
  // the meniscus: a thin light band at the surface
  float band = smoothstep(0.012, 0.0, abs(uv.y - (surface - 0.006)));
  col = mix(col, vec3(0.984, 0.976, 0.961), band * 0.35 * uWave);
  gl_FragColor = vec4(col, inside);
}
`;

export type Flood = ReturnType<typeof createFlood>;

export function createFlood(canvas: HTMLCanvasElement, { reducedMotion }: { reducedMotion: boolean }) {
  let level = 1;
  let wave = 0;
  let raf = 0;
  let start = performance.now();
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, alpha: true });

  let uLevel: WebGLUniformLocation | null = null;
  let uTime: WebGLUniformLocation | null = null;
  let uWave: WebGLUniformLocation | null = null;
  let uRes: WebGLUniformLocation | null = null;

  if (gl) {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uLevel = gl.getUniformLocation(prog, "uLevel");
    uTime = gl.getUniformLocation(prog, "uTime");
    uWave = gl.getUniformLocation(prog, "uWave");
    uRes = gl.getUniformLocation(prog, "uRes");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  } else {
    canvas.classList.add("flood--fallback");
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    draw();
  }

  function draw() {
    if (!gl) {
      canvas.style.clipPath = `inset(${(1 - level) * 100}% 0 0 0)`;
      canvas.style.visibility = level <= 0.001 ? "hidden" : "visible";
      return;
    }
    canvas.style.visibility = level <= 0.001 ? "hidden" : "visible";
    if (!canvas.width || !canvas.height) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (level <= 0.001) return;
    gl.uniform1f(uLevel, level);
    gl.uniform1f(uTime, (performance.now() - start) / 1000);
    gl.uniform1f(uWave, wave);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function animate(to: number, duration: number, ease: (t: number) => number): Promise<void> {
    cancelAnimationFrame(raf);
    const from = level;
    if (reducedMotion) {
      // no sloshing: a short opacity change instead of a moving surface
      return new Promise((resolve) => {
        wave = 0;
        if (to > 0) {
          level = 1;
          draw();
          canvas.style.transition = "none";
          canvas.style.opacity = "0";
          requestAnimationFrame(() => {
            canvas.style.transition = "opacity 160ms linear";
            canvas.style.opacity = "1";
          });
          setTimeout(resolve, 190);
        } else {
          canvas.style.transition = "opacity 200ms linear";
          canvas.style.opacity = "0";
          setTimeout(() => {
            level = 0;
            draw();
            canvas.style.transition = "none";
            canvas.style.opacity = "1";
            resolve();
          }, 220);
        }
      });
    }
    return new Promise((resolve) => {
      const t0 = performance.now();
      start = t0 - 1000 * Math.random();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = ease(t);
        level = from + (to - from) * e;
        wave = Math.sin(t * Math.PI) * 0.9 + (to > 0 ? 0 : 0.1 * (1 - t));
        draw();
        if (t < 1) raf = requestAnimationFrame(tick);
        else {
          wave = 0;
          draw();
          resolve();
        }
      };
      raf = requestAnimationFrame(tick);
    });
  }

  const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  window.addEventListener("resize", resize);
  resize();

  return {
    get covered() {
      return level >= 0.999;
    },
    cover: () => animate(1, 720, inOut),
    drain: (duration = 950) => animate(0, duration, outCubic),
    set(v: number) {
      level = v;
      draw();
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
  };
}
