<script lang="ts">
  import { onMount } from "svelte";
  import { Router } from "sv-router";
  import "./router";
  import Cursor from "./components/Cursor.svelte";
  import Footer from "./components/Footer.svelte";
  import Nav from "./components/Nav.svelte";
  import Preloader from "./components/Preloader.svelte";
  import { runBoot } from "./lib/boot.svelte";
  import { initScroll } from "./lib/motion/scroll";
  import { forceReduced, ui } from "./lib/state.svelte";
  import { setFlood } from "./lib/transition";
  import { createFlood, type Flood } from "./lib/world/flood";

  let worldCanvas: HTMLCanvasElement;
  let floodCanvas: HTMLCanvasElement;
  let flood: Flood | null = null;

  onMount(() => {
    flood = createFlood(floodCanvas, { reducedMotion: ui.reducedMotion });
    setFlood(flood);
    initScroll(ui.reducedMotion);
    void runBoot(worldCanvas);

    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onMotion = () => (ui.reducedMotion = mqMotion.matches || forceReduced);
    const onPointer = () => (ui.finePointer = mqPointer.matches);
    mqMotion.addEventListener("change", onMotion);
    mqPointer.addEventListener("change", onPointer);
    return () => {
      mqMotion.removeEventListener("change", onMotion);
      mqPointer.removeEventListener("change", onPointer);
      flood?.destroy();
    };
  });

  $effect(() => {
    document.documentElement.classList.toggle("no-world", ui.world === "failed");
    document.documentElement.classList.toggle("world-ready", ui.world === "ready");
  });
</script>

<a class="skip-link" href="#main">Skip to content</a>

<div class="stage" aria-hidden="true">
  <canvas class="world" bind:this={worldCanvas}></canvas>
</div>

<Nav />

<main id="main" tabindex="-1">
  <Router />
</main>

<Footer />
<Cursor />

<canvas class="flood" bind:this={floodCanvas} aria-hidden="true"></canvas>
<Preloader flood={() => flood} />
<div id="route-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>

<style>
  .stage {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
  .world {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 600ms var(--ease-out);
  }
  :global(html.world-ready) .world {
    opacity: 1;
  }
  main {
    position: relative;
    z-index: 1;
    outline: none;
    /* clip decorative bleed (scrims, word masks) without creating a scroll container,
       so sticky chapter copy keeps working */
    overflow-x: clip;
  }
  .flood {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    pointer-events: none;
  }
  :global(.flood--fallback) {
    background: linear-gradient(180deg, #1536d0, #0e2490);
  }
  :global(footer) {
    position: relative;
    z-index: 1;
  }
</style>
