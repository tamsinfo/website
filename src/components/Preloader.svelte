<script lang="ts">
  // The entrance: the site opens flooded with brand blue while the studio loads, then the
  // liquid drains and the camera descends into the plant. Progress reflects completed
  // loading steps. A returning visitor in the same session gets a short drain, no dive.
  import { onMount } from "svelte";
  import { boot } from "../lib/boot.svelte";
  import { getWorld, ui } from "../lib/state.svelte";
  import type { Flood } from "../lib/world/flood";
  import Logo from "./Logo.svelte";

  let { flood }: { flood: () => Flood | null } = $props();
  let leaving = $state(false);
  let gone = $state(false);
  let entered = false;

  const SEEN = "tams:entered";
  const seen = (() => {
    try {
      return sessionStorage.getItem(SEEN) === "1";
    } catch {
      return false;
    }
  })();

  async function enter() {
    if (entered) return;
    entered = true;
    leaving = true;
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {
      /* storage can be unavailable; the intro simply plays again */
    }
    const world = getWorld();
    const dive = !seen && !ui.reducedMotion && world && location.pathname === "/";
    if (dive) world.playIntro();
    await new Promise((r) => setTimeout(r, ui.reducedMotion ? 0 : 220));
    ui.entered = true;
    await flood()?.drain(dive ? 1500 : 900);
    gone = true;
  }

  onMount(() => {
    document.getElementById("boot")?.remove();
    // never hold the visitor: after 8 s the page opens and the studio joins when ready
    const cap = setTimeout(enter, 8000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Escape") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(cap);
      window.removeEventListener("keydown", onKey);
    };
  });

  $effect(() => {
    if (boot.done) enter();
  });
</script>

{#if !gone}
  <div class="pre" class:leaving data-theme="blue" data-nav-ignore>
    <div class="inner">
      <Logo />
      <p class="line">Connecting the plant to SAP.</p>
      <div class="meter" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(boot.progress * 100)}>
        <span style:transform={`scaleX(${boot.progress})`}></span>
      </div>
      <p class="step" aria-live="polite">{boot.label}</p>
    </div>
    <button type="button" class="skip" onclick={enter}>Skip intro</button>
  </div>
{/if}

<style>
  .pre {
    position: fixed;
    inset: 0;
    z-index: 101;
    display: grid;
    place-items: center;
    color: var(--porcelain);
    padding: var(--gutter);
  }
  .inner {
    display: grid;
    justify-items: start;
    gap: 18px;
    width: min(420px, 100%);
    transition:
      opacity 260ms var(--ease-out),
      transform 400ms var(--ease-out);
  }
  .inner :global(.logo) {
    transform: scale(1.35);
    transform-origin: left center;
    margin-bottom: 10px;
  }
  .leaving .inner {
    opacity: 0;
    transform: translateY(-12px);
  }
  .line {
    font-family: var(--font-display);
    font-stretch: 112%;
    font-weight: 600;
    font-size: clamp(1.4rem, 1.1rem + 1.2vw, 2rem);
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .meter {
    width: 100%;
    height: 2px;
    background: rgb(251 249 245 / 0.25);
    overflow: hidden;
  }
  .meter span {
    display: block;
    height: 100%;
    background: var(--porcelain);
    transform-origin: left;
    transition: transform 400ms var(--ease-out);
  }
  .step {
    font-family: var(--font-mono);
    font-size: var(--fs-label);
    color: var(--on-blue-2);
  }
  .skip {
    position: absolute;
    right: var(--gutter);
    bottom: var(--gutter);
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid rgb(251 249 245 / 0.4);
    border-radius: var(--r-control);
    background: none;
    color: var(--porcelain);
    font-weight: 520;
    cursor: pointer;
    transition: opacity 200ms var(--ease-out);
  }
  .skip:hover {
    background: rgb(251 249 245 / 0.1);
  }
  .leaving .skip {
    opacity: 0;
    pointer-events: none;
  }
  .leaving {
    pointer-events: none;
  }
</style>
