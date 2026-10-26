/* Native-scroll conductor (after build-threejs-scroll-worlds, Appendix D), adapted:
   - anchors are measured from the [data-chapter] wrappers with getBoundingClientRect, so
     ScrollTrigger pin-spacers inside a wrapper are included in its height;
   - each chapter has a HOLD range (the section fills the viewport) and the camera only
     travels while a seam crosses the viewport (next section top from 80% → 20% of vh);
   - no RAF of its own: the world engine reads `exact` and does the damping, so there is one loop.
   Exact progress drives the DOM (chapter rail, interaction gating); the engine damps it for visuals. */

type Listener = (index: number, exact: number) => void;

export type Conductor = ReturnType<typeof createConductor>;

export function createConductor(sections: HTMLElement[], onChapter: Listener) {
  let holds: [number, number][] = [];
  let exact = 0;
  let active = -1;
  let width = innerWidth;
  let ro: ResizeObserver | null = null;

  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);

  function measure() {
    width = innerWidth;
    const vh = innerHeight;
    const y0 = scrollY;
    const tops = sections.map((s) => s.getBoundingClientRect().top + y0);
    const bottoms = sections.map((s) => s.getBoundingClientRect().bottom + y0);
    holds = sections.map((_, i) => {
      const start = i === 0 ? 0 : tops[i] - 0.2 * vh;
      const end = i === sections.length - 1 ? maxScroll() : bottoms[i] - 0.8 * vh;
      return [start, Math.max(start, end)];
    });
    // enforce monotonic ranges
    for (let i = 1; i < holds.length; i++) {
      if (holds[i][0] < holds[i - 1][1]) holds[i][0] = holds[i - 1][1];
      if (holds[i][1] < holds[i][0]) holds[i][1] = holds[i][0];
    }
    read();
  }

  function progressAt(y: number) {
    if (!holds.length) return 0;
    for (let i = 0; i < holds.length; i++) {
      const [s, e] = holds[i];
      if (y < s) {
        if (i === 0) return 0;
        const prevEnd = holds[i - 1][1];
        const span = Math.max(1, s - prevEnd);
        return i - 1 + Math.min(1, Math.max(0, (y - prevEnd) / span));
      }
      if (y <= e) return i;
    }
    return holds.length - 1;
  }

  function read() {
    exact = progressAt(scrollY);
    const idx = Math.min(sections.length - 1, Math.round(exact));
    if (idx !== active) {
      active = idx;
      onChapter(idx, exact);
    }
  }

  const onScroll = () => read();
  const onResize = () => {
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (coarse && innerWidth === width) return; // ignore URL-bar height changes
    measure();
  };

  function start() {
    measure();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => measure());
      sections.forEach((s) => ro!.observe(s));
    }
  }

  function stop() {
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
    ro?.disconnect();
    ro = null;
  }

  return {
    start,
    stop,
    measure,
    get exact() {
      return exact;
    },
    get active() {
      return active;
    },
    /** scroll position at which chapter i is fully composed */
    anchor(i: number) {
      return holds[i]?.[0] ?? 0;
    },
  };
}
