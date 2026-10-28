<script lang="ts">
  import { categoryLabel, entry, type Category } from "../lib/content";
  import type { Related } from "../lib/content/types";
  import { stagger } from "../lib/motion/reveal";
  import Icon from "./Icon.svelte";

  let { related, exclude }: { related: Related; exclude?: string } = $props();

  const groups = $derived(
    (["services", "solutions", "products", "industries"] as Category[])
      .map((c) => ({
        key: c,
        label: categoryLabel(c),
        items: (related[c] ?? []).filter((s) => s !== exclude).map((s) => entry(c, s)),
      }))
      .filter((g) => g.items.length),
  );
</script>

<div class="related" use:stagger={{ selector: ".group" }}>
  {#each groups as g (g.key)}
    <div class="group">
      <p class="g-label">{g.label}</p>
      <ul>
        {#each g.items as item (item.href)}
          <li>
            <a href={item.href}>
              <span class="name">{item.name}</span>
              <span class="tag">{item.tagline}</span>
              <Icon name="arrow-right" size={20} class="arrow" />
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<style>
  .related {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: 40px clamp(24px, 3vw, 48px);
  }
  .g-label {
    font-weight: 600;
    margin-bottom: 12px;
  }
  ul {
    list-style: none;
  }
  li {
    border-top: 1px solid var(--rule);
  }
  li:last-child {
    border-bottom: 1px solid var(--rule);
  }
  a {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2px 16px;
    padding: 16px 0;
    text-decoration: none;
  }
  .name {
    font-weight: 600;
  }
  .tag {
    grid-column: 1;
    color: var(--ink-2);
    font-size: var(--fs-small);
  }
  a :global(.arrow) {
    grid-row: 1 / span 2;
    grid-column: 2;
    align-self: center;
    color: var(--blue);
    transition: transform var(--dur-ui) var(--ease-out);
  }
  a:hover :global(.arrow) {
    transform: translateX(4px);
  }
  a:hover .name {
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }
</style>
