import type { World, SceneRequest } from "./world/world";

const media = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;
// development only: `?reduce-motion` previews the reduced-motion experience without changing OS settings
export const forceReduced = import.meta.env.DEV && typeof location !== "undefined" && new URLSearchParams(location.search).has("reduce-motion");

export const ui = $state({
  reducedMotion: forceReduced || media("(prefers-reduced-motion: reduce)"),
  finePointer: media("(hover: hover) and (pointer: fine)"),
  /** Theme of whatever is under the navigation bar. */
  navTheme: "night" as "night" | "paper" | "blue",
  menuOpen: false,
  /** The preloader has handed over to the page. */
  entered: false,
  world: "loading" as "loading" | "ready" | "failed",
  sound: { ambience: false, music: false },
});

/** The live world, once loaded. Pages talk to it through `scene()`. */
let world: World | null = null;
let pending: SceneRequest | null = null;

export function setWorld(w: World | null) {
  world = w;
  if (w && pending) w.setScene(pending, { snap: true });
}

export function getWorld() {
  return world;
}

/** Ask the world for a room and view. Safe to call before the world has loaded. */
export function scene(request: SceneRequest) {
  pending = request;
  world?.setScene(request);
}
