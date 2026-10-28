<script lang="ts">
  import CtaBand from "../components/CtaBand.svelte";
  import Icon from "../components/Icon.svelte";
  import Matrix from "../components/Matrix.svelte";
  import PageHero from "../components/PageHero.svelte";
  import PairGrid from "../components/PairGrid.svelte";
  import Related from "../components/Related.svelte";
  import Section from "../components/Section.svelte";
  import Steps from "../components/Steps.svelte";
  import { services } from "../lib/content";
  import { reveal } from "../lib/motion/reveal";
  import { scene } from "../lib/state.svelte";
  import { route } from "../router";
  import NotFound from "./NotFound.svelte";

  const slug = $derived(route.params.slug ?? "");
  const s = $derived(services.find((x) => x.slug === slug));

  $effect(() => {
    if (s) scene({ room: "workshop", view: s.slug });
  });
</script>

<svelte:head><title>{s ? `${s.name} · TAMS Infotech` : "Page not found · TAMS Infotech"}</title></svelte:head>

{#if s}
  {#key s.slug}
    <PageHero
      crumbs={[{ label: "Services", href: "/services" }]}
      title={s.name}
      lede={s.lede}
    >
      {#snippet actions()}
        <a class="btn" href={`/contact?topic=${s.slug}`} data-cursor="morph" data-magnetic>Discuss your programme <Icon name="arrow-right" size={20} /></a>
        <a class="btn btn--ghost" href="#process">How it runs</a>
      {/snippet}
    </PageHero>

    <Section tone="porcelain" title={s.problem.title}>
      <p class="problem" use:reveal>{s.problem.body}</p>
    </Section>

    <Section title="What's covered">
      <PairGrid items={s.covers} />
    </Section>

    <Section tone="porcelain" id="process" title={s.process.title}>
      <Steps steps={s.process.steps} caption={s.process.caption} />
    </Section>

    {#if s.matrix}
      <Section title={s.matrix.title} intro={s.matrix.intro}>
        <Matrix columns={s.matrix.columns} rows={s.matrix.rows} caption={s.matrix.title} />
      </Section>
    {/if}

    <Section tone="blue" title="How we work">
      <PairGrid items={s.role} columns={s.role.length === 2 ? 2 : 3} />
      {#if s.note}<p class="note">{s.note}</p>{/if}
    </Section>

    <Section title="Related">
      <Related related={s.related} exclude={s.slug} />
    </Section>

    <CtaBand
      title={`Talk to us about ${s.name}.`}
      body="Tell us where your programme stands and what's worrying you about it. We'll come back with a first view and the people who would do the work."
      topic={s.slug}
    />
  {/key}
{:else}
  <NotFound embedded />
{/if}

<style>
  .problem {
    font-size: var(--fs-lead);
    line-height: 1.55;
    max-width: 62ch;
    color: var(--ink-2);
  }
  .note {
    margin-top: 32px;
    color: var(--on-blue-2);
    font-size: var(--fs-small);
  }
</style>
