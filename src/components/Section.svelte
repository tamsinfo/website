<script lang="ts">
  import type { Snippet } from "svelte";
  import { reveal, words } from "../lib/motion/reveal";

  let {
    id,
    tone = "paper",
    title,
    intro,
    children,
    wide = false,
  }: {
    id?: string;
    tone?: "paper" | "porcelain" | "blue" | "night";
    title?: string;
    intro?: string;
    children: Snippet;
    wide?: boolean;
  } = $props();

  const theme = $derived(tone === "porcelain" ? "paper" : tone);
</script>

<section class="section tone-{tone}" {id} data-theme={theme}>
  <div class="wrap">
    {#if title}
      <div class="head" class:wide>
        <h2 use:words>{title}</h2>
        {#if intro}<p class="intro" use:reveal={{ delay: 0.15 }}>{intro}</p>{/if}
      </div>
    {/if}
    {@render children()}
  </div>
</section>

<style>
  .section {
    position: relative;
    padding-block: var(--section);
  }
  .tone-paper {
    background: var(--paper);
  }
  .tone-porcelain {
    background: var(--porcelain);
  }
  .tone-blue {
    background: var(--blue);
    color: var(--porcelain);
    --ink-2: var(--on-blue-2);
    --ink-3: var(--on-blue-3);
    --rule: var(--rule-blue);
    --rule-strong: rgb(251 249 245 / 0.4);
  }
  .tone-night {
    background: var(--night);
    color: var(--porcelain);
    --ink-2: var(--on-blue-2);
    --ink-3: var(--on-blue-3);
    --rule: var(--rule-blue);
    --rule-strong: rgb(251 249 245 / 0.4);
  }
  .head {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 24px clamp(32px, 5vw, 96px);
    align-items: end;
    margin-bottom: clamp(40px, 5vw, 72px);
  }
  .head.wide {
    grid-template-columns: minmax(0, 1fr);
  }
  h2 {
    font-size: var(--fs-h2);
    max-width: 18ch;
  }
  .intro {
    color: var(--ink-2);
    font-size: var(--fs-lead);
    line-height: 1.5;
    max-width: 48ch;
  }
  @media (max-width: 900px) {
    .head {
      grid-template-columns: 1fr;
    }
  }
</style>
