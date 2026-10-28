// Loads what the first frame needs and reports progress by completed work, weighted by
// how long each step usually takes. There is no timer-driven percentage: if a step
// hasn't finished, the bar hasn't moved.
import { getWorld, setWorld, ui } from "./state.svelte";
import { sound } from "./audio/engine";

const steps = {
  fonts: { weight: 1, label: "Loading type" },
  module: { weight: 3, label: "Loading the studio" },
  renderer: { weight: 0.5, label: "Starting the renderer" },
  environment: { weight: 0.5, label: "Lighting the studio" },
  plant: { weight: 1.5, label: "Building the plant" },
  shaders: { weight: 2, label: "Compiling shaders" },
} as const;
type StepKey = keyof typeof steps;

const total = Object.values(steps).reduce((s, v) => s + v.weight, 0);

export const boot = $state({ label: steps.fonts.label as string, progress: 0, done: false });

const doneSteps = new Set<StepKey>();
function mark(step: StepKey) {
  if (doneSteps.has(step)) return;
  doneSteps.add(step);
  let sum = 0;
  for (const s of doneSteps) sum += steps[s].weight;
  boot.progress = sum / total;
  const next = (Object.keys(steps) as StepKey[]).find((k) => !doneSteps.has(k));
  if (next) boot.label = steps[next].label;
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export async function runBoot(canvas: HTMLCanvasElement) {
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  mark("fonts");

  if (!webglAvailable()) {
    ui.world = "failed";
    boot.progress = 1;
    boot.done = true;
    return;
  }

  try {
    const { createWorld } = await import("./world/world");
    mark("module");
    const world = await createWorld({
      canvas,
      reducedMotion: ui.reducedMotion,
      finePointer: ui.finePointer,
      onProgress: (step) => mark(step as StepKey),
    });
    setWorld(world);
    if (import.meta.env.DEV) (window as unknown as { __world: typeof world }).__world = world;
    world.onStory((p) => sound.setCohesion(p / 4));
    world.onEvent((name) => {
      if (name === "docked") sound.cue("click");
      if (name === "connected") sound.cue("connect");
      if (name === "context-lost") ui.world = "failed";
    });
    world.start();
    ui.world = "ready";
  } catch (error) {
    console.error("The 3D studio could not start; showing the static version.", error);
    ui.world = "failed";
    getWorld()?.destroy();
    setWorld(null);
  }
  boot.progress = 1;
  boot.done = true;
}
