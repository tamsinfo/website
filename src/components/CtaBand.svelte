<script lang="ts">
  import Icon from "./Icon.svelte";
  import { words, reveal } from "../lib/motion/reveal";
  import { company } from "../lib/content";

  let {
    title,
    body,
    topic,
    action = "Plan a consultation",
  }: { title: string; body?: string; topic?: string; action?: string } = $props();

  const href = $derived(topic ? `/contact?topic=${encodeURIComponent(topic)}` : "/contact");
</script>

<section class="cta" data-theme="blue">
  <div class="wrap grid">
    <h2 use:words>{title}</h2>
    <div class="side" use:reveal={{ delay: 0.2 }}>
      {#if body}<p>{body}</p>{/if}
      <div class="actions">
        <a class="btn btn--light" {href} data-cursor="morph" data-magnetic>{action} <Icon name="arrow-right" size={20} /></a>
        <a class="link-arrow" href={company.phoneHref}>{company.phone}</a>
      </div>
    </div>
  </div>
</section>

<style>
  .cta {
    background: var(--blue);
    color: var(--porcelain);
    padding-block: clamp(72px, 9vw, 140px);
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 32px clamp(32px, 5vw, 96px);
    align-items: end;
  }
  h2 {
    font-size: var(--fs-h2);
    max-width: 16ch;
  }
  .side {
    display: grid;
    gap: 28px;
  }
  p {
    color: var(--on-blue-2);
    font-size: var(--fs-lead);
    line-height: 1.5;
    max-width: 44ch;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 28px;
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
