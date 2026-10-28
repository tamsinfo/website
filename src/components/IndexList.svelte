<script lang="ts">
  import type { IconName } from "../lib/icons/solar";
  import { stagger } from "../lib/motion/reveal";
  import Icon from "./Icon.svelte";

  let { items }: { items: { href: string; name: string; tagline: string; summary: string; icon: IconName }[] } = $props();
</script>

<ul class="list" use:stagger={{ each: 0.05 }}>
  {#each items as item (item.href)}
    <li>
      <a href={item.href}>
        <Icon name={item.icon} size={28} class="ico" />
        <span class="head">
          <h3>{item.name}</h3>
          <span class="tag">{item.tagline}</span>
        </span>
        <span class="sum">{item.summary}</span>
        <Icon name="arrow-right" size={24} class="arrow" />
      </a>
    </li>
  {/each}
</ul>

<style>
  .list {
    list-style: none;
    border-bottom: 1px solid var(--rule-strong);
  }
  li {
    border-top: 1px solid var(--rule-strong);
  }
  a {
    display: grid;
    grid-template-columns: 40px minmax(0, 5fr) minmax(0, 6fr) 32px;
    gap: 12px clamp(20px, 3vw, 48px);
    align-items: start;
    padding: clamp(22px, 2.6vw, 34px) 0;
    text-decoration: none;
    transition: background-color var(--dur-ui) var(--ease-out);
  }
  a :global(.ico) {
    color: var(--blue);
    margin-top: 4px;
  }
  .head {
    display: grid;
    gap: 6px;
  }
  h3 {
    font-size: var(--fs-h3);
  }
  .tag {
    color: var(--ink-2);
  }
  .sum {
    color: var(--ink-2);
    max-width: 56ch;
    padding-top: 4px;
  }
  a :global(.arrow) {
    color: var(--blue);
    margin-top: 6px;
    transition: transform var(--dur-ui) var(--ease-out);
  }
  a:hover :global(.arrow) {
    transform: translateX(5px);
  }
  a:hover h3 {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.18em;
  }
  @media (max-width: 860px) {
    a {
      grid-template-columns: 32px minmax(0, 1fr) 24px;
    }
    .sum {
      grid-column: 2;
      grid-row: 2;
    }
    a :global(.arrow) {
      grid-column: 3;
      grid-row: 1;
    }
  }
</style>
