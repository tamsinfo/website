<script lang="ts">
  // A ring that replaces the native cursor on fine pointers and changes shape over what it
  // can act on. Touch devices and reduced motion keep the system cursor.
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ui } from "../lib/state.svelte";

  let ring = $state<HTMLDivElement>() as HTMLDivElement;
  let enabled = $derived(ui.finePointer && !ui.reducedMotion);

  onMount(() => {
    if (!enabled) return;
    document.documentElement.classList.add("cursor-none");
    // the ring is the only cursor, so it trails the pointer only slightly
    const xTo = gsap.quickTo(ring, "x", { duration: 0.12, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.12, ease: "power3.out" });
    const wTo = gsap.quickTo(ring, "width", { duration: 0.3, ease: "power3.out" });
    const hTo = gsap.quickTo(ring, "height", { duration: 0.3, ease: "power3.out" });
    let target: HTMLElement | null = null;
    let magnet: { el: HTMLElement; x: (v: number) => void; y: (v: number) => void } | null = null;
    let visible = false;

    const setMode = (mode: string, radius = "999px") => {
      ring.dataset.mode = mode;
      ring.style.borderRadius = radius;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set(ring, { x: e.clientX, y: e.clientY });
        ring.style.opacity = "1";
      }
      if (target && ring.dataset.mode === "morph") {
        const r = target.getBoundingClientRect();
        xTo(r.left + r.width / 2 + (e.clientX - (r.left + r.width / 2)) * 0.12);
        yTo(r.top + r.height / 2 + (e.clientY - (r.top + r.height / 2)) * 0.12);
      } else {
        xTo(e.clientX);
        yTo(e.clientY);
      }
      if (magnet) {
        const r = magnet.el.getBoundingClientRect();
        magnet.x((e.clientX - (r.left + r.width / 2)) * 0.18);
        magnet.y((e.clientY - (r.top + r.height / 2)) * 0.22);
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-cursor], a, button, summary, label, input, select, textarea",
      );
      if (el === target) return;
      release();
      target = el;
      if (!el) {
        setMode("idle");
        wTo(28);
        hTo(28);
        return;
      }
      const kind = el.dataset.cursor ?? (el.matches("input, textarea, select") ? "text" : "link");
      if (kind === "morph") {
        const r = el.getBoundingClientRect();
        setMode("morph", getComputedStyle(el).borderRadius || "6px");
        wTo(r.width + 10);
        hTo(r.height + 10);
      } else if (kind === "text") {
        setMode("text");
        wTo(4);
        hTo(4);
      } else if (kind === "hotspot") {
        setMode("hotspot");
        wTo(56);
        hTo(56);
      } else {
        setMode("link");
        wTo(44);
        hTo(44);
      }
      if (el.hasAttribute("data-magnetic")) {
        magnet = {
          el,
          x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
        };
      }
    };

    function release() {
      if (magnet) {
        magnet.x(0);
        magnet.y(0);
        magnet = null;
      }
    }

    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      release();
    };
    const onDown = () => ring.classList.add("down");
    const onUp = () => ring.classList.remove("down");

    setMode("idle");
    gsap.set(ring, { width: 28, height: 28 });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onLeave);
    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
      release();
    };
  });
</script>

{#if enabled}
  <div class="ring" bind:this={ring} aria-hidden="true"></div>
{/if}

<style>
  .ring {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 90;
    pointer-events: none;
    opacity: 0;
    translate: -50% -50%;
    border: 1.5px solid #fff;
    mix-blend-mode: difference;
    transition:
      opacity 200ms var(--ease-out),
      border-radius 240ms var(--ease-out),
      background-color 200ms var(--ease-out);
  }
  .ring:global([data-mode="text"]) {
    background: #fff;
  }
  .ring:global([data-mode="hotspot"]) {
    border-style: dashed;
  }
  .ring:global(.down) {
    scale: 0.9;
  }
</style>
