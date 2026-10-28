// Sections marked as windows onto the world keep the renderer awake. When none of them is
// on screen the canvas is fully covered by page content, so the world stops rendering.
import { getWorld } from "../state.svelte";

const open = new Set<Element>();
let io: IntersectionObserver | null = null;

function sync() {
  getWorld()?.setVisible(open.size > 0);
}

export function worldWindow(node: HTMLElement) {
  io ??= new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) open.add(e.target);
      else open.delete(e.target);
    }
    sync();
  });
  io.observe(node);
  return {
    destroy() {
      io?.unobserve(node);
      open.delete(node);
    },
  };
}
