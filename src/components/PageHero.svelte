<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
  import { playWords, words } from "../lib/motion/reveal";
  import { worldWindow } from "../lib/motion/windows";
  import { ui } from "../lib/state.svelte";
  import { gsap } from "gsap";

  let {
    theme = "paper",
    crumbs = [],
    title,
    lede,
    actions,
    meta,
  }: {
    theme?: "paper" | "blue" | "night";
    crumbs?: { label: string; href?: string }[];
    title: string;
    lede?: string;
    actions?: Snippet;
    meta?: Snippet;
  } = $props();

  let heading: HTMLElement;
  let support: HTMLElement;

  onMount(() => {
    if (ui.reducedMotion) return;
    gsap.set(support, { autoAlpha: 0, y: 16 });
    const play = () => {
      playWords(heading);
      gsap.to(support, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.35 });
    };
    if (ui.entered) {
      // route change: wait for the flood to start draining
      const t = setTimeout(play, 380);
      return () => clearTimeout(t);
    }
    const stop = $effect.root(() => {
      $effect(() => {
        if (ui.entered) play();
      });
    });
    return stop;
  });
</script>

<section class="hero" data-theme={theme} use:worldWindow>
  <div class="scrim" aria-hidden="true"></div>
  <div class="wrap inner">
    {#if crumbs.length}
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          {#each crumbs as c (c.label)}
            <li>
              {#if c.href}<a href={c.href}>{c.label}</a>{:else}<span aria-current="page">{c.label}</span>{/if}
            </li>
          {/each}
        </ol>
      </nav>
    {/if}
    <h1 bind:this={heading} use:words={{ manual: true }}>{title}</h1>
    <div class="support" bind:this={support}>
      {#if lede}<p class="t-lead">{lede}</p>{/if}
      {#if actions}<div class="actions">{@render actions()}</div>{/if}
      {#if meta}<div class="meta">{@render meta()}</div>{/if}
    </div>
  </div>
</section>

<style>
  .hero {
    --fg: var(--ink);
    --fg-2: var(--ink-2);
    --scrim: var(--paper);
    --window-fallback: var(--paper);
    position: relative;
    min-height: max(620px, 92svh);
    display: flex;
    align-items: flex-end;
    color: var(--fg);
    padding-block: calc(var(--nav-h) + 48px) clamp(48px, 7vw, 104px);
  }
  .hero[data-theme="blue"] {
    --fg: var(--porcelain);
    --fg-2: var(--on-blue-2);
    --scrim: var(--blue);
    --window-fallback: var(--blue);
  }
  .hero[data-theme="night"] {
    --fg: var(--porcelain);
    --fg-2: var(--on-blue-2);
    --scrim: var(--night);
    --window-fallback: var(--night);
  }
  :global(html.no-world) .hero {
    background: var(--window-fallback);
  }
  /* local contrast for the reading block only, not a blanket over the scene */
  .scrim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--scrim) 78%, transparent) 0%, transparent 58%),
      linear-gradient(0deg, color-mix(in srgb, var(--scrim) 70%, transparent) 0%, transparent 45%);
  }
  .inner {
    position: relative;
  }
  .crumbs ol {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    margin-bottom: 22px;
    font-size: var(--fs-small);
    color: var(--fg-2);
  }
  .crumbs li + li::before {
    content: "/";
    margin-right: 6px;
    opacity: 0.6;
  }
  .crumbs a {
    text-decoration: none;
  }
  .crumbs a:hover {
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }
  h1 {
    font-size: var(--fs-h1);
    max-width: 15ch;
  }
  .support {
    display: grid;
    gap: 28px;
    margin-top: clamp(20px, 2.4vw, 32px);
    max-width: 640px;
  }
  .support :global(.t-lead) {
    color: var(--fg-2);
    max-width: 52ch;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .meta {
    color: var(--fg-2);
    font-size: var(--fs-small);
  }
  @media (max-width: 767px) {
    .hero {
      min-height: max(560px, 88svh);
    }
    .scrim {
      background: linear-gradient(0deg, color-mix(in srgb, var(--scrim) 92%, transparent) 0%, color-mix(in srgb, var(--scrim) 60%, transparent) 55%, transparent 85%);
    }
  }
</style>
