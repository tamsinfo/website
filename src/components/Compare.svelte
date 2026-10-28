<script lang="ts">
  // Two lists side by side: what SAP supplies against what TAMS does, or standard SAP
  // against what needs an application. The right-hand list is the one we're accountable for.
  import { stagger } from "../lib/motion/reveal";

  type List = { who: string; title: string; items: string[] };
  let { left, right, caveat }: { left: List; right: List; caveat?: string } = $props();
</script>

<div class="split" use:stagger={{ selector: ".col" }}>
  {#each [left, right] as list, i (list.who)}
    <div class="col" class:ours={i === 1}>
      <h3><span class="who t-label">{list.who}</span>{list.title}</h3>
      <ul>
        {#each list.items as line (line)}<li>{line}</li>{/each}
      </ul>
    </div>
  {/each}
</div>
{#if caveat}<p class="caveat">{caveat}</p>{/if}

<style>
  .split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(24px, 4vw, 64px);
  }
  .col {
    padding-top: 22px;
    border-top: 2px solid var(--rule-strong);
  }
  .col.ours {
    border-top-color: var(--blue);
  }
  :global(.tone-blue) .col.ours,
  :global(.tone-night) .col.ours {
    border-top-color: var(--porcelain);
  }
  h3 {
    display: grid;
    gap: 8px;
    font-size: var(--fs-h3);
    margin-bottom: 22px;
  }
  .who {
    font-weight: 400;
    font-stretch: 100%;
    color: var(--ink-3);
  }
  ul {
    list-style: none;
    display: grid;
  }
  li {
    position: relative;
    padding: 12px 0 12px 22px;
    border-top: 1px solid var(--rule);
    color: var(--ink-2);
  }
  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 1.3em;
    width: 8px;
    height: 2px;
    background: currentColor;
    opacity: 0.6;
  }
  .caveat {
    margin-top: 32px;
    max-width: 75ch;
    color: var(--ink-3);
    font-size: var(--fs-small);
  }
  @media (max-width: 760px) {
    .split {
      grid-template-columns: 1fr;
    }
  }
</style>
