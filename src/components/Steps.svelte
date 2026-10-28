<script lang="ts">
  // A process diagram: numbered stages joined by a connector that draws in on scroll.
  import type { Step } from "../lib/content/types";
  import { draw } from "../lib/motion/reveal";

  let {
    steps,
    caption,
    label,
    highlight,
  }: { steps: Step[]; caption?: string; label?: string; highlight?: number } = $props();
</script>

<figure class="steps" style:--count={steps.length}>
  {#if label}<p class="label t-label">{label}</p>{/if}
  <div class="track" use:draw>
  <svg class="rail" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" y1="1" x2="100" y2="1" data-draw />
  </svg>
  <ol>
    {#each steps as s, i (s.title)}
      <li data-node class:active={highlight === i}>
        <span class="dot" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
        <h3>{s.title}</h3>
        <p>{s.body}</p>
      </li>
    {/each}
  </ol>
  </div>
  {#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
  .steps {
    margin: 0;
  }
  .label {
    color: var(--ink-3);
    margin-bottom: 20px;
  }
  .track {
    position: relative;
  }
  ol {
    position: relative;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(var(--count), minmax(0, 1fr));
    gap: 20px;
  }
  .rail {
    position: absolute;
    top: 21px;
    left: 22px;
    right: 22px;
    width: calc(100% - 44px);
    height: 2px;
    overflow: visible;
  }
  .rail line {
    stroke: var(--blue);
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
  }
  :global(.tone-blue) .rail line,
  :global(.tone-night) .rail line {
    stroke: var(--porcelain);
  }
  li {
    position: relative;
  }
  .dot {
    position: relative;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    margin-bottom: 20px;
    border-radius: 50%;
    background: var(--porcelain);
    border: 2px solid var(--blue);
    color: var(--blue);
    font-family: var(--font-mono);
    font-size: var(--fs-label);
    font-weight: 500;
  }
  li.active .dot {
    background: var(--blue);
    color: var(--porcelain);
  }
  :global(.tone-blue) .dot {
    background: var(--blue);
    border-color: var(--porcelain);
    color: var(--porcelain);
  }
  h3 {
    font-size: var(--fs-h4);
    font-weight: 620;
    margin-bottom: 8px;
  }
  p {
    color: var(--ink-2);
    font-size: var(--fs-small);
    line-height: 1.55;
  }
  figcaption {
    margin-top: 32px;
    color: var(--ink-3);
    font-size: var(--fs-small);
    max-width: 70ch;
  }
  @media (max-width: 960px) {
    ol {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .rail {
      display: none;
    }
    li {
      display: grid;
      grid-template-columns: 44px 1fr;
      column-gap: 18px;
      padding-bottom: 26px;
    }
    li::before {
      content: "";
      position: absolute;
      left: 21px;
      top: 44px;
      bottom: 0;
      width: 2px;
      background: var(--blue);
      opacity: 0.35;
    }
    li:last-child::before {
      display: none;
    }
    .dot {
      grid-row: span 2;
      margin-bottom: 0;
    }
    h3 {
      padding-top: 10px;
    }
  }
</style>
