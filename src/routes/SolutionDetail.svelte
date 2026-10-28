<script lang="ts">
  import Architecture from "../components/Architecture.svelte";
  import Compare from "../components/Compare.svelte";
  import CtaBand from "../components/CtaBand.svelte";
  import Icon from "../components/Icon.svelte";
  import PageHero from "../components/PageHero.svelte";
  import PairGrid from "../components/PairGrid.svelte";
  import Related from "../components/Related.svelte";
  import Section from "../components/Section.svelte";
  import { solutions } from "../lib/content";
  import { diagrams } from "../lib/content/diagrams";
  import { scene } from "../lib/state.svelte";
  import { route } from "../router";
  import NotFound from "./NotFound.svelte";

  const slug = $derived(route.params.slug ?? "");
  const s = $derived(solutions.find((x) => x.slug === slug));

  $effect(() => {
    if (s) scene({ room: "core", view: s.slug });
  });
</script>

<svelte:head><title>{s ? `${s.name} · TAMS Infotech` : "Page not found · TAMS Infotech"}</title></svelte:head>

{#if s}
  {#key s.slug}
    <PageHero theme="blue" crumbs={[{ label: "SAP solutions", href: "/solutions" }]} title={s.name} lede={s.lede}>
      {#snippet actions()}
        <a class="btn btn--light" href={`/contact?topic=${s.slug}`} data-cursor="morph" data-magnetic>Talk to an architect <Icon name="arrow-right" size={20} /></a>
        <a class="btn btn--ghost-light" href="#architecture">See the architecture</a>
      {/snippet}
    </PageHero>

    <Section tone="porcelain" title="What SAP provides, and what we do">
      <Compare
        left={{ who: "From SAP", title: "The product", items: s.fromSap }}
        right={{ who: "From TAMS", title: "The work around it", items: s.fromTams }}
        caveat={s.caveat}
      />
    </Section>

    <Section title="Where it applies">
      <PairGrid items={s.covers} />
    </Section>

    <Section tone="porcelain" id="architecture" title={diagrams[s.diagram].title}>
      <Architecture diagram={diagrams[s.diagram]} />
    </Section>

    {#if s.fit}
      <Section title="Is it the right fit?">
        <Compare
          left={{ who: "Usually suits", title: "Good starting points", items: s.fit.suits }}
          right={{ who: "Worth weighing", title: "Questions to settle first", items: s.fit.consider }}
        />
      </Section>
    {/if}

    <Section tone={s.fit ? "porcelain" : "paper"} title="Related">
      <Related related={s.related} exclude={s.slug} />
    </Section>

    <CtaBand
      title={`Plan your next step with ${s.name}.`}
      body="An architect will go through your landscape with you and tell you plainly where this fits and where it doesn't."
      topic={s.slug}
    />
  {/key}
{:else}
  <NotFound embedded />
{/if}
