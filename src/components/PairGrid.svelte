<script lang="ts">
  import type { Pair } from "../lib/content/types";
  import { stagger } from "../lib/motion/reveal";

  let { items, columns = 3 }: { items: Pair[]; columns?: 2 | 3 } = $props();
</script>

<ul class="pairs cols-{columns}" use:stagger>
  {#each items as item (item.title)}
    <li>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </li>
  {/each}
</ul>

<style>
  .pairs {
    list-style: none;
    display: grid;
    gap: 0 clamp(24px, 3vw, 48px);
  }
  .cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  li {
    padding-block: 24px 32px;
    border-top: 1px solid var(--rule-strong);
  }
  h3 {
    font-size: var(--fs-h4);
    font-weight: 620;
    margin-bottom: 10px;
  }
  p {
    color: var(--ink-2);
    max-width: 46ch;
  }
  @media (max-width: 1000px) {
    .cols-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 640px) {
    .cols-3,
    .cols-2 {
      grid-template-columns: 1fr;
    }
  }
</style>
