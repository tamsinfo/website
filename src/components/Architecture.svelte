<script lang="ts">
  // A layered architecture diagram: columns of responsibility joined by labelled connectors.
  import type { Diagram } from "../lib/content/diagrams";
  import { draw } from "../lib/motion/reveal";

  let { diagram }: { diagram: Diagram } = $props();
  const template = $derived(
    ["minmax(0, 1fr)", ...Array(diagram.columns.length - 1).fill("minmax(88px, 0.42fr) minmax(0, 1fr)")].join(" "),
  );
</script>

<figure class="arch" aria-label={diagram.title} style:--template={template}>
  <div class="grid" use:draw>
    {#each diagram.columns as col, i (col.label)}
      <div class="col" class:emphasis={col.emphasis} data-node>
        <p class="owner t-label">{col.owner}</p>
        <h3>{col.label}</h3>
        <ul>
          {#each col.nodes as n (n)}<li>{n}</li>{/each}
        </ul>
      </div>
      {#if i < diagram.links.length}
        <div class="link" data-node>
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 6 H96" data-draw />
            <path d="M90 1 L97 6 L90 11" class="head" />
          </svg>
          <span>{diagram.links[i]}</span>
        </div>
      {/if}
    {/each}
  </div>
  <figcaption>{diagram.caption}</figcaption>
</figure>

<style>
  .arch {
    margin: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: var(--template);
    align-items: stretch;
  }
  .col {
    padding: 22px 22px 24px;
    background: var(--porcelain);
    border: 1px solid var(--rule);
    border-radius: var(--r-panel);
    color: var(--ink);
  }
  .col.emphasis {
    background: var(--blue);
    border-color: var(--blue);
    color: var(--porcelain);
  }
  :global(.tone-blue) .col.emphasis,
  :global(.tone-night) .col.emphasis {
    background: var(--blue-deep);
    border-color: rgb(251 249 245 / 0.3);
  }
  .owner {
    color: var(--ink-3);
    margin-bottom: 8px;
  }
  .emphasis .owner {
    color: var(--on-blue-2);
  }
  h3 {
    font-size: var(--fs-h4);
    font-weight: 640;
    margin-bottom: 16px;
  }
  ul {
    list-style: none;
    display: grid;
    gap: 8px;
  }
  li {
    padding: 9px 12px;
    border-radius: var(--r-control);
    background: var(--paper);
    font-size: var(--fs-small);
    line-height: 1.35;
  }
  .emphasis li {
    background: rgb(251 249 245 / 0.12);
  }
  .link {
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 10px;
    padding: 0 8px;
    text-align: center;
  }
  .link svg {
    width: 100%;
    height: 12px;
    overflow: visible;
  }
  .link path {
    fill: none;
    stroke: var(--blue);
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
  }
  :global(.tone-blue) .link path,
  :global(.tone-night) .link path {
    stroke: var(--porcelain);
  }
  .link span {
    font-family: var(--font-mono);
    font-size: var(--fs-label);
    color: var(--ink-2);
    line-height: 1.35;
  }
  figcaption {
    margin-top: 24px;
    color: var(--ink-3);
    font-size: var(--fs-small);
    max-width: 75ch;
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
    .link {
      grid-auto-flow: column;
      justify-content: start;
      align-items: center;
      gap: 14px;
      padding: 6px 0 6px 28px;
    }
    .link svg {
      display: none;
    }
    .link::before {
      content: "";
      width: 2px;
      height: 36px;
      background: var(--blue);
    }
    :global(.tone-blue) .link::before,
    :global(.tone-night) .link::before {
      background: var(--porcelain);
    }
  }
</style>
