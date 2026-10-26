import * as THREE from "three";
import { gsap } from "gsap";
import { preloadFont } from "troika-three-text";
import { RenderPass } from "postprocessing";
import { COLORS, createEnvironment, createMaterials } from "./core/materials";
import { createComposer, createTrail } from "./core/post";
import { FONT_URL, WORDS } from "./core/flow";
import { STATION_BUILDERS } from "./stations";
import { disposeGeometryCache, type Fx, type Pose, type Side, type Station, type StationState } from "./stations/kit";
import { createConductor, type Conductor } from "../motion/conductor";

/* The persistent world. One renderer, one scene, one camera, one loop (the GSAP ticker, shared
   with Lenis). Routes supply keyframes ([data-key] sections); native scroll → exact progress →
   damped progress → camera pose between keyframes, with a transition style per chapter. */

export type Key = { station: string; k: number; sub?: number; side: Side };
export type InspectInfo = { id: string; title: string; text: string } | null;

const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const insOut = (k: number) => 1 - Math.pow(1 - k, 4.4);
const sstep = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

export function parseKey(el: HTMLElement): Key | null {
  const raw = el.dataset.key;
  if (!raw) return null;
  const [st, rest] = raw.split(":");
  const [k, sub] = (rest ?? "0").split(".");
  return { station: st, k: Number(k), sub: sub !== undefined ? Number(sub) : undefined, side: (el.dataset.side as Side) ?? "left" };
}

export async function createWorld(canvas: HTMLCanvasElement, opts: { onProgress: (p: number, label: string) => void; displayFont: string }) {
  const mobile = innerWidth < 768 || matchMedia("(pointer: coarse)").matches;
  let tPrev = performance.now();
  const report = async (p: number, label: string) => {
    if (import.meta.env.DEV) console.info(`[t] ${label} ${(performance.now() - tPrev).toFixed(0)}ms`);
    tPrev = performance.now();
    opts.onProgress(p, label);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  };

  /* ---------- renderer ---------- */
  await report(0.04, "Starting the renderer");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", stencil: false, depth: true });
  const maxDpr = Math.min(devicePixelRatio, mobile ? 1.5 : 1.75);
  let dpr = maxDpr;
  renderer.setPixelRatio(dpr);
  (renderer as unknown as { transmissionResolutionScale: number }).transmissionResolutionScale = 0.6;
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = COLORS.paper.clone();
  scene.fog = new THREE.FogExp2(COLORS.paper.getHex(), 0.0075);
  const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 600);

  await report(0.1, "Lighting the studio");
  const env = createEnvironment(renderer);
  scene.environment = env;
  scene.environmentIntensity = 0.55;
  const mats = createMaterials();

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd6d1c8, 0.45);
  const key = new THREE.DirectionalLight(0xfffaf2, 2.7);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  const sc = key.shadow.camera as THREE.OrthographicCamera;
  Object.assign(sc, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  const fill = new THREE.DirectionalLight(0xe4ebff, 0.55);
  scene.add(hemi, key, key.target, fill);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), mats.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ---------- fonts for spatial type ---------- */
  await report(0.16, "Cutting the type");
  await new Promise<void>((res) => preloadFont({ font: FONT_URL, characters: "0123456789SAP%+" }, () => res()));

  /* ---------- stations ---------- */
  const ctx = { mats, mobile, displayFont: opts.displayFont };
  const stations = new Map<string, Station>();
  for (let i = 0; i < STATION_BUILDERS.length; i++) {
    const st = STATION_BUILDERS[i](ctx);
    stations.set(st.id, st);
    scene.add(st.group);
    await report(0.2 + (i / STATION_BUILDERS.length) * 0.45, `Building the ${st.id === "hero" ? "forge" : st.id}`);
  }
  await Promise.all(WORDS.map((w) => new Promise<void>((res) => w.sync(() => res()))));

  /* ---------- post ---------- */
  await report(0.7, "Grinding the lenses");
  const trail = createTrail(renderer);
  trail.resize(innerWidth, innerHeight);
  const post = createComposer(renderer, scene, camera, trail.texture, mobile);
  post.composer.setSize(innerWidth, innerHeight);

  /* ---------- inspect: a second scene for the piece in the hand ---------- */
  const inspectScene = new THREE.Scene();
  inspectScene.environment = env;
  inspectScene.environmentIntensity = 1;
  const iHemi = new THREE.HemisphereLight(0xffffff, 0xd9d2c6, 1.0);
  const iKey = new THREE.DirectionalLight(0xfff4e8, 2.6);
  const iRim = new THREE.DirectionalLight(0xdfe7ff, 1.2);
  inspectScene.add(iHemi, iKey, iRim);
  const backdropMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: COLORS.paper.clone() }, uO: { value: 0 } },
    vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.99999, 1.0); }",
    fragmentShader: "uniform vec3 uColor; uniform float uO; void main(){ gl_FragColor = vec4(uColor, uO); }",
    transparent: true,
    depthFunc: THREE.AlwaysDepth,
    depthWrite: true,
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backdropMat);
  backdrop.frustumCulled = false;
  const backdropScene = new THREE.Scene();
  backdropScene.add(backdrop);
  const backdropPass = new RenderPass(backdropScene, camera);
  (backdropPass as unknown as { clear: boolean }).clear = false;
  backdropPass.ignoreBackground = true;
  backdropPass.enabled = false;
  const inspectPass = new RenderPass(inspectScene, camera);
  (inspectPass as unknown as { clear: boolean }).clear = false;
  inspectPass.ignoreBackground = true;
  inspectPass.enabled = false;
  post.composer.addPass(backdropPass, 1);
  post.composer.addPass(inspectPass, 2);

  /* ---------- warm every shader and every station's first frame ---------- */
  await report(0.78, "Compiling shaders");
  await renderer.compileAsync(scene, camera);
  const warmKeys = [...stations.values()];
  for (let i = 0; i < warmKeys.length; i++) {
    const st = warmKeys[i];
    const p = st.pose(0, "left", mobile);
    camera.position.copy(p.p);
    camera.lookAt(p.t);
    camera.updateMatrixWorld();
    st.update({ time: 0, dt: 0.016, local: 0, near: true, reduced: false, ray: null, hovered: null, intro: 1 });
    post.composer.render(0.016);
    if (i % 3 === 0) await report(0.8 + (i / warmKeys.length) * 0.18, "Warming the plant");
  }

  /* ---------- route state ---------- */
  let keys: Key[] = [{ station: "hero", k: 0, side: "left" }];
  let poses: Pose[] = [];
  let conductor: Conductor | null = null;
  let smooth = 0;
  let snap = true;
  const posesFor = () => keys.map((k) => stations.get(k.station)!.pose(k.k, k.side, innerWidth < 768, k.sub));
  poses = posesFor();

  function setRoute(sections: HTMLElement[]) {
    conductor?.stop();
    const ks = sections.map(parseKey).filter(Boolean) as Key[];
    const valid = sections.filter((s) => {
      const k = parseKey(s);
      return k && stations.has(k.station);
    });
    keys = ks.filter((k) => stations.has(k.station));
    if (!keys.length) keys = [{ station: "contact", k: 0, side: "left" }];
    poses = posesFor();
    conductor = valid.length ? createConductor(valid, () => {}) : null;
    conductor?.start();
    snap = true;
  }

  /* ---------- pointer ---------- */
  const ndc = new THREE.Vector2(9, 9);
  const trailPos = new THREE.Vector2(-1, -1);
  let pointerOk = false;
  let pointerTouch = false;
  const raycaster = new THREE.Raycaster();
  const interactive = (el: EventTarget | null) => !!(el as HTMLElement | null)?.closest?.("a, button, input, textarea, select, label, [role='dialog'], .mega, .mobile-menu");
  const onMove = (e: PointerEvent) => {
    pointerTouch = e.pointerType === "touch";
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    trailPos.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
    pointerOk = !interactive(e.target);
    if (hand.drag && e.pointerId === hand.drag.id) {
      const dx = e.clientX - hand.drag.x, dy = e.clientY - hand.drag.y;
      const dtm = Math.max(1, e.timeStamp - hand.drag.t);
      hand.drag.moved += Math.abs(dx) + Math.abs(dy);
      hand.yaw += dx * 0.0085;
      hand.pitch = Math.min(1.1, Math.max(-0.7, hand.pitch + dy * 0.0065));
      hand.vy = (dx * 0.0085) / (dtm / 1000);
      hand.vp = (dy * 0.0065) / (dtm / 1000);
      Object.assign(hand.drag, { x: e.clientX, y: e.clientY, t: e.timeStamp });
      hand.idle = 0;
    }
  };
  let down: { x: number; y: number; t: number } | null = null;
  const onDown = (e: PointerEvent) => {
    if (interactive(e.target)) return;
    pointerTouch = e.pointerType === "touch";
    pointerOk = true;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (hand.open) {
      hand.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, moved: 0 };
      hand.vy = hand.vp = 0;
      return;
    }
    leanHold = true;
    down = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    trail.click();
  };
  const onUp = (e: PointerEvent) => {
    if (hand.drag && e.pointerId === hand.drag.id) {
      const moved = hand.drag.moved;
      hand.drag = null;
      if (moved < 6 && !hitInspect(true)) closeInspect();
      return;
    }
    const dn = down;
    down = null;
    leanHold = false;
    if (dn && Math.hypot(e.clientX - dn.x, e.clientY - dn.y) < 6 && e.timeStamp - dn.t < 600) {
      const id = hitInspect(false);
      if (id) openInspect(id);
    }
  };
  const onWheel = (e: WheelEvent) => {
    if (!hand.open) return;
    e.preventDefault();
    hand.zoomT = Math.min(1.45, Math.max(0.7, hand.zoomT * Math.exp(-e.deltaY * 0.0012)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (!hand.open) return;
    const s = 0.14;
    if (e.key === "Escape") closeInspect();
    else if (e.key === "ArrowLeft") hand.yaw -= s;
    else if (e.key === "ArrowRight") hand.yaw += s;
    else if (e.key === "ArrowUp") hand.pitch = Math.max(-0.7, hand.pitch - s);
    else if (e.key === "ArrowDown") hand.pitch = Math.min(1.1, hand.pitch + s);
    else if (e.key === "+" || e.key === "=") hand.zoomT = Math.min(1.45, hand.zoomT * 1.15);
    else if (e.key === "-") hand.zoomT = Math.max(0.7, hand.zoomT / 1.15);
    else return;
    hand.idle = 0;
    e.preventDefault();
  };
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onDown);
  addEventListener("pointerup", onUp);
  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("keydown", onKey);

  /* ---------- inspectables: hover lean + lift into the hand ---------- */
  const inspectables = [...stations.values()].flatMap((s) => s.inspectables ?? []);
  let hovered: string | null = null;
  let leanHold = false;
  const lean = new Map<string, { az: number; el: number; g: number }>();
  inspectables.forEach((i) => lean.set(i.id, { az: 0, el: 0, g: 0 }));
  function hitInspect(inHand: boolean): string | null {
    if (!pointerOk) return null;
    raycaster.setFromCamera(ndc, camera);
    const list = inHand ? inspectables.filter((i) => i.id === hand.id) : inspectables.filter((i) => i.object.visible && isNear(i.object));
    for (const it of list) if (raycaster.intersectObject(it.object, true).length) return it.id;
    return null;
  }
  const _wp = new THREE.Vector3();
  const isNear = (o: THREE.Object3D) => o.getWorldPosition(_wp).distanceTo(camera.position) < 26;

  const hand = {
    id: null as string | null,
    open: false,
    out: false,
    k: 0,
    e0: 1,
    yaw: 0,
    pitch: 0.2,
    vy: 0.4,
    vp: 0,
    idle: 0,
    zoom: 1,
    zoomT: 1,
    drag: null as null | { id: number; x: number; y: number; t: number; moved: number },
    parent: null as THREE.Object3D | null,
    fromPos: new THREE.Vector3(),
    fromQuat: new THREE.Quaternion(),
    fromScale: new THREE.Vector3(),
    fromLocal: { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() },
    radius: 2,
  };
  const listeners = { inspect: new Set<(i: InspectInfo) => void>() };
  function openInspect(id: string) {
    const it = inspectables.find((i) => i.id === id);
    if (!it || hand.open) return;
    const o = it.object;
    hand.id = id;
    hand.parent = o.parent;
    hand.fromLocal.p.copy(o.position);
    hand.fromLocal.q.copy(o.quaternion);
    hand.fromLocal.s.copy(o.scale);
    o.getWorldPosition(hand.fromPos);
    o.getWorldQuaternion(hand.fromQuat);
    o.getWorldScale(hand.fromScale);
    inspectScene.attach(o);
    Object.assign(hand, { open: true, out: true, yaw: 0, pitch: 0.18, vy: 0.4, vp: 0, idle: 0, zoom: 1, zoomT: 1, radius: it.radius });
    if (hand.k < 0) hand.k = 0;
    inspectPass.enabled = true;
    backdropPass.enabled = true;
    listeners.inspect.forEach((f) => f({ id, title: it.title, text: it.text }));
  }
  function closeInspect() {
    if (!hand.open) return;
    hand.open = false;
    hand.e0 = insOut(hand.k);
    hand.k = 1;
    hand.zoomT = 1;
    listeners.inspect.forEach((f) => f(null));
  }
  const _q = new THREE.Quaternion();
  const _q2 = new THREE.Quaternion();
  const _v = new THREE.Vector3();
  const _to = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);
  function updateHand(dt: number, reduced: boolean) {
    if (!hand.out || !hand.id) return;
    const it = inspectables.find((i) => i.id === hand.id)!;
    const o = it.object;
    if (hand.open && !hand.drag) {
      const d = Math.exp(-dt * 2.4);
      hand.vy *= d;
      hand.vp *= d;
      hand.idle += dt;
      if (!reduced && hand.idle > 2.2) hand.vy += (0.26 - hand.vy) * Math.min(1, dt * 0.7);
      hand.yaw += hand.vy * dt;
      hand.pitch = Math.min(1.1, Math.max(-0.7, hand.pitch + hand.vp * dt));
    }
    hand.zoom += (hand.zoomT - hand.zoom) * (1 - Math.exp(-dt * 8));
    const rate = reduced ? 1000 : hand.open ? 1 / 1.0 : 1 / 0.6;
    hand.k = hand.open ? Math.min(1, hand.k + dt * rate) : Math.max(0, hand.k - dt * rate);
    const e = hand.open ? insOut(hand.k) : hand.e0 * (1 - sstep(0, 1, 1 - hand.k));
    // where the piece sits in the hand: in front of the lens, sized to fill ~55% of the height
    const D = (hand.radius / (0.5 * Math.tan(((camera.fov * Math.PI) / 180) / 2))) / hand.zoom;
    _to.set(innerWidth >= 900 ? 0.18 : 0, innerWidth >= 900 ? 0 : 0.12, 0.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(D).add(camera.position);
    o.position.lerpVectors(hand.fromPos, _to, e).addScaledVector(_up, Math.sin(Math.PI * e) * 0.6);
    _q.setFromAxisAngle(_up, hand.yaw);
    _q2.setFromAxisAngle(_v.set(1, 0, 0).applyQuaternion(camera.quaternion), hand.pitch);
    const handQ = _q2.multiply(_q).multiply(hand.fromQuat);
    o.quaternion.copy(hand.fromQuat).slerp(handQ, e);
    o.scale.copy(hand.fromScale);
    backdropMat.uniforms.uO.value = 0.86 * e;
    iKey.position.copy(camera.position).add(_v.set(-6, 8, 4));
    iRim.position.copy(camera.position).add(_v.set(8, 2, -6));
    if (!hand.open && hand.k <= 0) {
      hand.parent!.attach(o);
      o.position.copy(hand.fromLocal.p);
      o.quaternion.copy(hand.fromLocal.q);
      o.scale.copy(hand.fromLocal.s);
      hand.out = false;
      hand.id = null;
      inspectPass.enabled = false;
      backdropPass.enabled = false;
      backdropMat.uniforms.uO.value = 0;
    }
  }

  /* ---------- transitions + intro ---------- */
  const fxState = { trans: 0, intro: 0 };
  function cover() {
    return new Promise<void>((res) => gsap.to(fxState, { trans: 1, duration: 0.75, ease: "power3.in", onComplete: () => res() }));
  }
  function uncover() {
    gsap.to(fxState, { trans: 0, duration: 1.0, ease: "power3.out" });
  }
  function playIntro(duration: number) {
    gsap.fromTo(fxState, { intro: 0 }, { intro: 1, duration, ease: "power3.inOut" });
  }

  /* ---------- loop ---------- */
  let time = 0;
  let vel = 0;
  let velTarget = 0;
  let reduced = false;
  let running = true;
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const fx: Fx = { flood: 0, fog: 0.011, exposure: 1 };
  const ray = new THREE.Ray();
  const floodCol = new THREE.Color();
  const FLOOD_BG = new THREE.Color("#1638D8");
  const FLOOD_FLOOR = new THREE.Color("#2445E0");
  const FLOOD_SKY = new THREE.Color("#B9C6FF");
  const FLOOR_BASE = mats.floor.color.clone();
  const WHITE = new THREE.Color("#ffffff");
  const anchors = new Map<string, THREE.Vector3>();
  stations.forEach((s, id) => anchors.set(id, s.pose(0, "left", false).focus.clone()));

  function localFor(id: string, s: number) {
    let first = -1, last = -1;
    for (let i = 0; i < keys.length; i++) if (keys[i].station === id) (first < 0 && (first = i), (last = i));
    if (first < 0) return -9;
    if (s <= first) return keys[first].k - (first - s);
    if (s >= last) return keys[last].k + (s - last);
    const i = Math.floor(s);
    const a = keys[i], b = keys[Math.min(keys.length - 1, i + 1)];
    const t = s - i;
    const ka = a.station === id ? a.k : b.k;
    const kb = b.station === id ? b.k : a.k;
    return ka + (kb - ka) * t;
  }

  function cameraAt(s: number) {
    const i = Math.max(0, Math.min(keys.length - 1, Math.floor(s)));
    const j = Math.min(keys.length - 1, i + 1);
    const t = Math.min(1, Math.max(0, s - i));
    const A = poses[i], B = poses[j];
    const stA = stations.get(keys[i].station)!, stB = stations.get(keys[j].station)!;
    const style = stA === stB ? stA.transition : stB.transition;
    const e = easeIO(t);
    const center = stA === stB ? stA.orbitCenter : undefined;
    if ((style === "orbit" || style === "bank") && center) {
      const a0 = Math.atan2(A.p.x - center.x, A.p.z - center.z), a1 = Math.atan2(B.p.x - center.x, B.p.z - center.z);
      let da = a1 - a0;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      const r0 = Math.hypot(A.p.x - center.x, A.p.z - center.z), r1 = Math.hypot(B.p.x - center.x, B.p.z - center.z);
      const a = a0 + da * e, r = r0 + (r1 - r0) * e;
      camPos.set(center.x + Math.sin(a) * r, A.p.y + (B.p.y - A.p.y) * e, center.z + Math.cos(a) * r);
    } else camPos.lerpVectors(A.p, B.p, e);
    const span = A.p.distanceTo(B.p);
    const lift = style === "drop" ? 10 : style === "arc" ? 3 : style === "rise" ? 6 : style === "chase" ? 0.8 : 0;
    camPos.y += Math.sin(Math.PI * e) * (lift + (stA !== stB ? Math.min(30, span * 0.14) : 0));
    camTgt.lerpVectors(A.t, B.t, e);
    focus.lerpVectors(A.focus, B.focus, e);
    camera.fov = A.fov + (B.fov - A.fov) * e;
    const roll = (A.roll ?? 0) + ((B.roll ?? 0) - (A.roll ?? 0)) * e + (style === "bank" ? Math.sin(Math.PI * e) * 0.1 : 0);
    const fa = { flood: 0, fog: 0.011, ...stA.fx?.(keys[i].k) };
    const fb = { flood: 0, fog: 0.011, ...stB.fx?.(keys[j].k) };
    fx.flood = fa.flood + (fb.flood - fa.flood) * sstep(0.15, 0.85, t);
    fx.fog = fa.fog + (fb.fog - fa.fog) * e;
    return roll;
  }

  function frame(_t: number, deltaMs: number) {
    if (!running || document.hidden) return;
    const dt = Math.min(deltaMs / 1000, 1 / 30);
    time += dt;
    const exact = conductor?.exact ?? 0;
    smooth = snap || reduced ? exact : damp(smooth, exact, 3.2, dt);
    snap = false;
    const roll = cameraAt(smooth);
    // intro: the camera falls into the world from 40 m
    const drop = 1 - fxState.intro;
    camera.position.copy(camPos).add(_v.set(0, drop * drop * 40, drop * 6));
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(camTgt.x, camTgt.y - drop * 2, camTgt.z);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    // pointer ray for stations (mouse only, never while something is in the hand)
    const useRay = pointerOk && !pointerTouch && !hand.open && !reduced;
    if (useRay) {
      raycaster.setFromCamera(ndc, camera);
      ray.copy(raycaster.ray);
    }
    // hover + lean on inspectables
    const hit = !hand.open && !leanHold && useRay ? hitInspect(false) : null;
    if (hit !== hovered) {
      hovered = hit;
      document.documentElement.classList.toggle("world-hover", !!hit);
    }
    inspectables.forEach((it) => {
      if (hand.id === it.id) return;
      const L = lean.get(it.id)!;
      const target = hovered === it.id ? 1 : 0;
      L.g += (target - L.g) * (1 - Math.exp(-dt / 0.3));
      it.object.getWorldPosition(_v).project(camera);
      const tx = Math.max(-1, Math.min(1, (ndc.x - _v.x) / 0.36)) * 0.3 * L.g;
      const ty = Math.max(-1, Math.min(1, (ndc.y - _v.y) / 0.36)) * 0.09 * L.g;
      L.az += (tx - L.az) * (1 - Math.exp(-dt * 4.5));
      L.el += (-ty - L.el) * (1 - Math.exp(-dt * 4.5));
      it.object.rotation.set(L.el, L.az, 0);
    });

    const tU = performance.now();
    // stations
    stations.forEach((st, id) => {
      const local = localFor(id, smooth);
      const a = anchors.get(id)!;
      // only the stations around the current point of the route draw; others are culled
      const inPath = local > -8;
      const near = inPath ? local > -1.6 && local < st.beats + 0.6 : a.distanceTo(camera.position) < 70;
      st.group.visible = near || (hand.out && st.inspectables?.some((i) => i.id === hand.id)) === true;
      if (!st.group.visible) return;
      const state: StationState = { time, dt, local: local < -8 ? -9 : local, near, reduced, ray: useRay ? ray : null, hovered, intro: fxState.intro };
      st.update(state);
    });
    updateHand(dt, reduced);

    // shadow follows the focus
    key.position.copy(focus).add(_v.set(-14, 22, 12));
    key.target.position.copy(focus);
    fill.position.copy(focus).add(_v.set(16, 6, -10));
    (scene.fog as THREE.FogExp2).density = fx.fog;
    // the flood is physical: sky, fog and floor turn brand blue; objects keep their light
    floodCol.copy(COLORS.paper).lerp(FLOOD_BG, fx.flood);
    (scene.background as THREE.Color).copy(floodCol);
    (scene.fog as THREE.FogExp2).color.copy(floodCol);
    mats.floor.color.copy(FLOOR_BASE).lerp(FLOOD_FLOOR, fx.flood);
    hemi.color.copy(WHITE).lerp(FLOOD_SKY, fx.flood * 0.6);
    post.dof.target!.copy(hand.out ? _to : focus);

    // post uniforms
    vel = damp(vel, velTarget, 6, dt);
    velTarget *= Math.exp(-dt * 4);
    trail.update(trailPos, pointerOk && !pointerTouch && !reduced, dt);
    post.finish.set("uTime", time);
    post.finish.set("uVel", reduced ? 0 : vel);
    post.finish.set("uFlood", 0.28 * fx.flood * (1 - (hand.out ? backdropMat.uniforms.uO.value : 0)));
    post.finish.set("uTrans", fxState.trans);
    post.finish.set("uAspect", innerWidth / innerHeight);
    document.documentElement.style.setProperty("--vel", vel.toFixed(3));
    document.documentElement.style.setProperty("--flood", fx.flood.toFixed(3));
    const tR = performance.now();
    renderer.info.autoReset = false;
    renderer.info.reset();
    post.composer.render(dt);
    prof.update = prof.update * 0.9 + (tR - tU) * 0.1;
    // quality governor: sustained slow frames lower the pixel ratio (never the content)
    slow = deltaMs > 24 ? slow + 1 : Math.max(0, slow - 2);
    if (slow > 90 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      renderer.setPixelRatio(dpr);
      post.composer.setSize(innerWidth, innerHeight);
      slow = 0;
    }
    prof.render = prof.render * 0.9 + (performance.now() - tR) * 0.1;
    prof.calls = renderer.info.render.calls;
    prof.tris = renderer.info.render.triangles;
    prof.dpr = dpr;
    prof.visible = [...stations.values()].filter((s) => s.group.visible).map((s) => s.id).join(",");
  }
  const prof = { update: 0, render: 0, calls: 0, tris: 0, visible: "", dpr: 0 };
  let slow = 0;
  gsap.ticker.add(frame);

  const onResize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    post.composer.setSize(innerWidth, innerHeight);
    trail.resize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    poses = posesFor();
  };
  addEventListener("resize", onResize, { passive: true });

  return {
    renderer,
    setRoute,
    remeasure: () => conductor?.measure(),
    anchorOf: (i: number) => conductor?.anchor(i) ?? 0,
    get active() {
      return conductor?.active ?? 0;
    },
    setVelocity: (v: number) => (velTarget = Math.max(-1, Math.min(1, v / 45))),
    setReduced: (r: boolean) => (reduced = r),
    cover,
    uncover,
    playIntro,
    openInspect,
    closeInspect,
    onInspect(f: (i: InspectInfo) => void) {
      listeners.inspect.add(f);
      return () => listeners.inspect.delete(f);
    },
    debug: () => ({ prof: { ...prof }, programs: renderer.info.programs?.length, smooth, keys: keys.length, fx: { ...fx }, trans: fxState.trans, intro: fxState.intro, cam: camera.position.toArray().map((v) => +v.toFixed(2)) }),
    _internals: { post, scene, camera, fxState },
    dispose() {
      running = false;
      gsap.ticker.remove(frame);
      conductor?.stop();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      removeEventListener("resize", onResize);
      stations.forEach((s) => s.dispose?.());
      WORDS.forEach((w) => w.dispose());
      WORDS.length = 0;
      disposeGeometryCache();
      mats.dispose();
      env.dispose();
      trail.dispose();
      post.composer.dispose();
      floor.geometry.dispose();
      backdrop.geometry.dispose();
      backdropMat.dispose();
      renderer.dispose();
    },
  };
}
export type World = Awaited<ReturnType<typeof createWorld>>;
