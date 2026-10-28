// One renderer, one scene, one camera for the whole site. Pages ask for a room and a
// view; the home page also hands over its chapter sections so native scroll can drive
// the story. Scroll is the source of truth; the camera only smooths toward it.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createKit } from "./kit";
import { createComposite, createFlow } from "./flow";
import { buildPlant } from "./rooms/plant";
import { roomBuilders } from "./rooms/rooms";
import type { Env, Room, RoomId, View } from "./types";

export type SceneRequest = {
  room: RoomId;
  view: string;
  chapters?: HTMLElement[];
  hotspots?: { id: string; el: HTMLElement }[];
};

export type WorldOptions = {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  finePointer: boolean;
  onProgress?: (step: string, done: number) => void;
};

export type World = Awaited<ReturnType<typeof createWorld>>;

const KEY_OFFSET = new THREE.Vector3(7, 14, 9);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export async function createWorld({ canvas, reducedMotion, finePointer, onProgress }: WorldOptions) {
  const mobile = () => window.innerWidth < 768 || window.innerWidth / window.innerHeight < 0.8;
  const coarse = !finePointer;
  const dprCap = coarse ? 1.35 : 1.75;
  let dpr = Math.min(window.devicePixelRatio || 1, dprCap);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
  });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  onProgress?.("renderer", 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  scene.background = new THREE.Color("#0b1a56");
  scene.fog = new THREE.Fog("#0b1a56", 14, 42);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envMap = pmrem.fromScene(roomEnv, 0.04).texture;
  scene.environment = envMap;
  roomEnv.dispose();
  pmrem.dispose();
  onProgress?.("environment", 1);

  const hemi = new THREE.HemisphereLight("#ffffff", "#d8d0c2", 1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight("#ffffff", 2.4);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(coarse ? 1024 : 2048);
  key.shadow.camera.left = -15;
  key.shadow.camera.right = 15;
  key.shadow.camera.top = 15;
  key.shadow.camera.bottom = -15;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 4;
  scene.add(key, key.target);

  const kit = createKit();
  const floorMat = new THREE.MeshStandardMaterial({ color: "#ece7de", roughness: 0.94, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const rooms = new Map<RoomId, Room>();
  const eventListeners = new Set<(name: string) => void>();
  const storyListeners = new Set<(p: number) => void>();

  function getRoom(id: RoomId) {
    let room = rooms.get(id);
    if (!room) {
      room = id === "plant" ? buildPlant(kit, { pieces: coarse ? 14 : 20 }) : roomBuilders[id](kit);
      room.onEvent?.((name) => eventListeners.forEach((cb) => cb(name)));
      room.group.visible = false;
      scene.add(room.group);
      rooms.set(id, room);
    }
    return room;
  }

  getRoom("plant");
  onProgress?.("plant", 1);

  // ---- render targets and post ----
  const size = new THREE.Vector2();
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: coarse ? 2 : 4,
  });
  const flow = !reducedMotion && finePointer ? createFlow(renderer) : null;
  const composite = createComposite();
  composite.material.uniforms.tScene.value = sceneTarget.texture;
  composite.material.uniforms.uFlow.value = flow ? 1 : 0;
  composite.material.uniforms.tFlow.value = flow ? flow.texture : sceneTarget.texture;

  function resize() {
    for (const hs of hotspots) hs.half = 0;
    // a background tab or collapsed frame can report 0 x 0; never size a target to nothing
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(size);
    sceneTarget.setSize(size.x, size.y);
    composite.material.uniforms.uRes.value.set(size.x, size.y);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    measure();
    dirty = true;
  }

  // ---- scene request and scroll story ----
  let request: SceneRequest = { room: "plant", view: "ch0" };
  let active: Room = getRoom("plant");
  active.group.visible = true;
  let anchors: number[] = [];
  let exact = 0;
  let smoothP = 0;
  let snapNext = true;
  let dirty = true;

  type Curves = { pos: THREE.CatmullRomCurve3; target: THREE.CatmullRomCurve3; views: View[] };
  let curves: Curves | null = null;

  function viewFor(room: Room, name: string): View {
    return room.views[name] ?? room.views.index ?? Object.values(room.views)[0]!;
  }

  function resolved(v: View) {
    const m = mobile() && v.mobile;
    return {
      pos: new THREE.Vector3(...(m ? v.mobile!.pos : v.pos)),
      target: new THREE.Vector3(...(m ? v.mobile!.target : v.target)),
      fov: m ? v.mobile!.fov : v.fov,
      shift: m ? 0 : (v.shift ?? 0),
      shiftY: m ? (v.mobile!.shiftY ?? 0) : 0,
    };
  }

  function buildCurves() {
    const names = request.chapters?.length ? active.chapters : undefined;
    if (!names) {
      curves = null;
      return;
    }
    const views = names.map((n) => viewFor(active, n));
    const r = views.map(resolved);
    curves = {
      pos: new THREE.CatmullRomCurve3(r.map((x) => x.pos), false, "centripetal"),
      target: new THREE.CatmullRomCurve3(r.map((x) => x.target), false, "centripetal"),
      views,
    };
  }

  function measure() {
    const chapters = request.chapters;
    if (!chapters?.length) {
      anchors = [];
      buildCurves();
      return;
    }
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    anchors = chapters.map((el, i) => {
      if (i === 0) return 0;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      return clamp(top + rect.height * 0.5 - window.innerHeight * 0.5, 0, max);
    });
    for (let i = 1; i < anchors.length; i += 1) anchors[i] = Math.max(anchors[i]!, anchors[i - 1]! + 1);
    buildCurves();
  }

  function progressAt(y: number) {
    if (!anchors.length) return clamp(y / (window.innerHeight * 0.9), 0, 1);
    if (y <= anchors[0]!) return 0;
    for (let i = 0; i < anchors.length - 1; i += 1) {
      if (y <= anchors[i + 1]!) return i + clamp((y - anchors[i]!) / Math.max(1, anchors[i + 1]! - anchors[i]!), 0, 1);
    }
    return anchors.length - 1;
  }

  const resizeObserver = new ResizeObserver(() => {
    measure();
    dirty = true;
  });
  resizeObserver.observe(document.body);

  function setScene(next: SceneRequest, opts: { snap?: boolean } = {}) {
    request = next;
    const room = getRoom(next.room);
    if (room !== active) {
      active.group.visible = false;
      active = room;
      active.group.visible = true;
    }
    measure();
    exact = progressAt(window.scrollY);
    if (opts.snap || snapNext) {
      smoothP = reducedMotion && anchors.length ? Math.round(exact) : exact;
      snapNext = true;
    }
    bindHotspots(next.hotspots ?? []);
    // a page just asked for this view, so its opening viewport shows the world
    visible = true;
    dirty = true;
  }

  // ---- hotspots: DOM links pinned to 3D anchors ----
  let hotspots: { id: string; el: HTMLElement; world: THREE.Vector3; half: number }[] = [];
  function bindHotspots(list: { id: string; el: HTMLElement }[]) {
    hotspots = list
      .filter(({ id }) => active.hotspots?.[id])
      .map(({ id, el }) => ({ id, el, world: active.hotspots![id]!.clone().add(active.center), half: el.offsetWidth / 2 }));
  }

  // ---- camera rig ----
  const cam = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 38, shift: 0, shiftY: 0 };
  const want = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 38, shift: 0, shiftY: 0 };
  const intro = { t: 1, from: new THREE.Vector3(), fromTarget: new THREE.Vector3() };
  const pointerNdc = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  let pointerInside = false;

  function computeWant(p: number) {
    if (curves && anchors.length) {
      const n = curves.views.length - 1;
      const u = clamp(p / n, 0, 1);
      curves.pos.getPoint(u, want.pos);
      curves.target.getPoint(u, want.target);
      const i = Math.min(n - 1, Math.floor(p));
      const t = clamp(p - i, 0, 1);
      const e = t * t * (3 - 2 * t);
      const a = resolved(curves.views[i]!);
      const b = resolved(curves.views[Math.min(n, i + 1)]!);
      want.fov = THREE.MathUtils.lerp(a.fov, b.fov, e);
      want.shift = THREE.MathUtils.lerp(a.shift, b.shift, e);
      want.shiftY = THREE.MathUtils.lerp(a.shiftY, b.shiftY, e);
    } else {
      const v = viewFor(active, request.view);
      const r = resolved(v);
      want.pos.copy(r.pos);
      want.target.copy(r.target);
      want.fov = r.fov;
      want.shift = r.shift;
      want.shiftY = r.shiftY;
      if (v.drift && !mobile()) {
        const d = p * p * (3 - 2 * p);
        want.pos.lerp(new THREE.Vector3(...v.drift.pos), d);
        want.target.lerp(new THREE.Vector3(...v.drift.target), d);
      }
    }
    want.pos.add(active.center);
    want.target.add(active.center);
    if (intro.t < 1) {
      const e = 1 - Math.pow(1 - intro.t, 3);
      want.pos.lerpVectors(intro.from, want.pos, e);
      want.target.lerpVectors(intro.fromTarget, want.target, e);
    }
  }

  // ---- environment ----
  const envNow = {
    bg: new THREE.Color(),
    floor: new THREE.Color(),
    sky: new THREE.Color(),
    ground: new THREE.Color(),
    keyColor: new THREE.Color(),
    hemi: 1,
    key: 2,
    env: 0.8,
    near: 14,
    far: 42,
  };
  const tmpColor = new THREE.Color();
  function applyEnv(env: Env, k: number) {
    envNow.bg.lerp(tmpColor.set(env.bg), k);
    envNow.floor.lerp(tmpColor.set(env.floor), k);
    envNow.sky.lerp(tmpColor.set(env.hemiSky), k);
    envNow.ground.lerp(tmpColor.set(env.hemiGround), k);
    envNow.keyColor.lerp(tmpColor.set(env.keyColor), k);
    envNow.hemi += (env.hemi - envNow.hemi) * k;
    envNow.key += (env.key - envNow.key) * k;
    envNow.env += (env.env - envNow.env) * k;
    envNow.near += (env.fogNear - envNow.near) * k;
    envNow.far += (env.fogFar - envNow.far) * k;
    (scene.background as THREE.Color).copy(envNow.bg);
    const fog = scene.fog as THREE.Fog;
    fog.color.copy(envNow.bg);
    fog.near = envNow.near;
    fog.far = envNow.far;
    floorMat.color.copy(envNow.floor);
    hemi.color.copy(envNow.sky);
    hemi.groundColor.copy(envNow.ground);
    hemi.intensity = envNow.hemi;
    key.color.copy(envNow.keyColor);
    key.intensity = envNow.key;
    scene.environmentIntensity = envNow.env;
  }

  // ---- input ----
  const raycaster = new THREE.Raycaster();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.15);
  const pointerWorld = new THREE.Vector3();
  let pointerOnFloor = false;
  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    pointerInside = true;
    pointerNdc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    flow?.move(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  }
  function onPointerLeave() {
    pointerInside = false;
  }
  if (finePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
  }

  function onScroll() {
    exact = progressAt(window.scrollY);
    dirty = true;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);

  // ---- loop ----
  let visible = true;
  let running = false;
  let destroyed = false;
  let last = 0;
  let elapsed = 0;
  let slowFrames = 0;
  let fastFrames = 0;

  let frames = 0;
  let lastError: unknown = null;
  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    frames += 1;
    try {
      render(now);
    } catch (error) {
      if (!lastError) console.error("World frame failed", error);
      lastError = error;
    }
  }

  function render(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    const frameMs = last ? now - last : 16;
    last = now;
    if (!visible || document.hidden || window.innerWidth < 1 || window.innerHeight < 1) return;
    if (size.x !== Math.floor(window.innerWidth * dpr)) resize();

    const animating = !reducedMotion;
    if (!animating && !dirty && !snapNext) return;
    elapsed += dt;

    // story progress
    const target = reducedMotion && anchors.length ? Math.round(exact) : exact;
    smoothP = snapNext ? target : damp(smoothP, target, 4.2, dt);
    if (Math.abs(smoothP - target) < 0.0005) smoothP = target;
    storyListeners.forEach((cb) => cb(smoothP));

    if (intro.t < 1 && !reducedMotion) intro.t = Math.min(1, intro.t + dt / 2.6);
    computeWant(smoothP);

    // pointer parallax, blended out on touch and reduced motion
    if (pointerInside && !reducedMotion) pointerSmooth.lerp(pointerNdc, 1 - Math.exp(-dt * 3));
    else pointerSmooth.multiplyScalar(Math.exp(-dt * 3));
    want.pos.x += pointerSmooth.x * 0.32;
    want.pos.y += pointerSmooth.y * 0.18;

    if (snapNext) {
      cam.pos.copy(want.pos);
      cam.target.copy(want.target);
      cam.fov = want.fov;
      cam.shift = want.shift;
      cam.shiftY = want.shiftY;
    } else {
      const k = 1 - Math.exp(-dt * 6);
      cam.pos.lerp(want.pos, k);
      cam.target.lerp(want.target, k);
      cam.fov += (want.fov - cam.fov) * k;
      cam.shift += (want.shift - cam.shift) * k;
      cam.shiftY += (want.shiftY - cam.shiftY) * k;
    }
    camera.position.copy(cam.pos);
    camera.lookAt(cam.target);
    camera.fov = cam.fov;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.setViewOffset(w, h, cam.shift * w, cam.shiftY * h, w, h);
    camera.updateProjectionMatrix();

    // environment follows the story in the plant, the room elsewhere
    const env = active.envAt ? active.envAt(smoothP) : active.env;
    applyEnv(env, snapNext ? 1 : 1 - Math.exp(-dt * 5));

    // key light and its shadow frustum stay centred on what the camera looks at
    key.target.position.copy(cam.target).setY(0);
    key.position.copy(key.target.position).add(KEY_OFFSET);

    // pointer on the floor, in room coordinates
    pointerOnFloor = false;
    if (pointerInside && !reducedMotion) {
      raycaster.setFromCamera(pointerNdc, camera);
      if (raycaster.ray.intersectPlane(floorPlane, pointerWorld)) {
        pointerWorld.sub(active.center);
        pointerOnFloor = true;
      }
    }

    active.update({
      t: elapsed,
      dt,
      progress: smoothP,
      reduced: reducedMotion,
      view: request.view,
      pointer: pointerOnFloor ? pointerWorld : null,
    });

    updateHotspots();

    if (flow) flow.step(dt, w / h);
    composite.material.uniforms.uTime.value = elapsed;
    renderer.setRenderTarget(sceneTarget);
    renderer.render(scene, camera);
    composite.render(renderer);

    snapNext = false;
    dirty = false;

    // quality governor: lower resolution before anything authored disappears
    if (frameMs > 24) slowFrames += 1;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (frameMs < 13) fastFrames += 1;
    else fastFrames = 0;
    if (slowFrames > 90 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      slowFrames = 0;
      resize();
    } else if (fastFrames > 600 && dpr < Math.min(window.devicePixelRatio, dprCap)) {
      dpr = Math.min(dprCap, dpr + 0.25);
      fastFrames = 0;
      resize();
    }
  }

  const projected = new THREE.Vector3();
  function updateHotspots() {
    if (!hotspots.length) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const hs of hotspots) {
      projected.copy(hs.world).project(camera);
      const alpha = (active.hotspotAlpha?.(hs.id, smoothP) ?? 1) * (projected.z < 1 ? 1 : 0);
      if (!hs.half) hs.half = hs.el.offsetWidth / 2;
      // keep labels inside the viewport; the anchor can sit near an edge on narrow screens
      const x = clamp((projected.x * 0.5 + 0.5) * w, hs.half + 12, w - hs.half - 12);
      const y = (-projected.y * 0.5 + 0.5) * h;
      hs.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      hs.el.style.opacity = alpha.toFixed(3);
      hs.el.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
    }
  }

  function onContextLost(e: Event) {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
    eventListeners.forEach((cb) => cb("context-lost"));
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  let raf = 0;
  resize();
  setScene(request, { snap: true });

  // compile every material the opening room uses before the first visible frame
  computeWant(0);
  camera.position.copy(want.pos);
  camera.lookAt(want.target);
  await renderer.compileAsync(scene, camera);
  onProgress?.("shaders", 1);

  function start() {
    if (running || destroyed) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  return {
    canvas,
    start,
    setScene,
    /** Jump instead of travelling on the next frame: used under the route transition. */
    snap() {
      snapNext = true;
      dirty = true;
    },
    /** Descend into the plant from above. */
    playIntro() {
      if (reducedMotion) return;
      computeWant(smoothP);
      intro.from.copy(want.pos).add(new THREE.Vector3(-2, 22, 9));
      intro.fromTarget.copy(want.target).add(new THREE.Vector3(0, 0, -2));
      intro.t = 0;
      snapNext = true;
    },
    /** Prepare a room before it's needed, so its first frame doesn't compile shaders. */
    async warm(id: RoomId) {
      const room = getRoom(id);
      const was = room.group.visible;
      room.group.visible = true;
      await renderer.compileAsync(scene, camera);
      room.group.visible = was && room === active;
    },
    highlight(id: string | null) {
      active.highlight?.(id);
    },
    setVisible(v: boolean) {
      visible = v;
      if (v) dirty = true;
    },
    onEvent(cb: (name: string) => void) {
      eventListeners.add(cb);
      return () => eventListeners.delete(cb);
    },
    onStory(cb: (p: number) => void) {
      storyListeners.add(cb);
      return () => storyListeners.delete(cb);
    },
    get storyProgress() {
      return smoothP;
    },
    /** Run frames synchronously; for automated checks in a background tab, where rAF is paused. */
    step(count = 60) {
      let t = (last || performance.now()) + 16.7;
      for (let i = 0; i < count; i += 1) {
        render(t);
        t += 16.7;
      }
    },
    /** The raw scene, for debugging in development only. */
    get debugScene() {
      return import.meta.env.DEV ? scene : null;
    },
    /** Debug snapshot of the camera and story state. */
    inspect() {
      return { exact, smooth: smoothP, anchors: [...anchors], room: active.id, view: request.view, visible, running, frames, lastError: lastError instanceof Error ? lastError.message : lastError ? "unknown error" : "", cam: cam.pos.toArray(), target: cam.target.toArray() };
    },
    destroy() {
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      resizeObserver.disconnect();
      flow?.dispose();
      composite.dispose();
      sceneTarget.dispose();
      envMap.dispose();
      floor.geometry.dispose();
      floorMat.dispose();
      kit.dispose();
      renderer.dispose();
    },
  };
}
