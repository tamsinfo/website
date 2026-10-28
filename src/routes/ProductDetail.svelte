<script lang="ts">
  import Compare from "../components/Compare.svelte";
  import CtaBand from "../components/CtaBand.svelte";
  import Icon from "../components/Icon.svelte";
  import PageHero from "../components/PageHero.svelte";
  import PairGrid from "../components/PairGrid.svelte";
  import Related from "../components/Related.svelte";
  import Section from "../components/Section.svelte";
  import Steps from "../components/Steps.svelte";
  import { products } from "../lib/content";
  import { reveal } from "../lib/motion/reveal";
  import { scene } from "../lib/state.svelte";
  import { route } from "../router";
  import NotFound from "./NotFound.svelte";

  const slug = $derived(route.params.slug ?? "");
  const p = $derived(products.find((x) => x.slug === slug));

  $effect(() => {
    if (p) scene({ room: "gallery", view: p.slug });
  });
</script>

<svelte:head><title>{p ? `${p.name} · TAMS Infotech` : "Page not found · TAMS Infotech"}</title></svelte:head>

{#if p}
  {#key p.slug}
    <PageHero crumbs={[{ label: "TAMS products", href: "/products" }]} title={p.name} lede={p.lede}>
      {#snippet actions()}
        <a class="btn" href={`/contact?topic=${p.slug}`} data-cursor="morph" data-magnetic>Request a walkthrough <Icon name="arrow-right" size={20} /></a>
        <a class="btn btn--ghost" href="#workflow">See the workflow</a>
      {/snippet}
      {#snippet meta()}
        <p class="evidence">
          <Icon name={p.evidence === "documented" ? "file-check" : "eye"} size={18} />
          {#if p.evidence === "documented"}
            Capabilities on this page are taken from the product's documentation.
          {:else}
            Capabilities describe the application's intended scope; we confirm them for your version in a walkthrough.
          {/if}
        </p>
      {/snippet}
    </PageHero>

    <Section tone="porcelain" title="The problem it solves">
      <div class="problem">
        <p class="lead" use:reveal>{p.problem}</p>
        <div class="env" use:reveal={{ delay: 0.15 }}>
          <h3>Where it runs</h3>
          <p>{p.environment}</p>
        </div>
      </div>
    </Section>

    <Section title="Who uses it">
      <PairGrid items={p.users} columns={p.users.length % 3 === 0 ? 3 : 2} />
    </Section>

    <Section tone="porcelain" id="workflow" title="How it works">
      <Steps
        steps={p.workflow.steps}
        caption={p.workflow.caption}
        label={p.evidence === "brief" ? "Conceptual illustration" : "Primary workflow"}
      />
    </Section>

    <Section
      title={p.evidence === "documented" ? "Capabilities" : "Scope"}
      intro={p.evidence === "documented"
        ? undefined
        : "What the application is designed to cover. Exact features depend on version and deployment."}
    >
      <PairGrid items={p.capabilities} />
    </Section>

    <Section tone="blue" title="Integration, security and deployment">
      <Compare
        left={{ who: "Integrations", title: "What it connects to", items: p.integrations.map((i) => `${i.title}: ${i.body}`) }}
        right={{ who: "Deployment", title: "Where and how it runs", items: p.deployment.map((i) => `${i.title}: ${i.body}`) }}
      />
      <p class="demo">Screenshots and live demonstrations are shared in a walkthrough, against an S/4HANA system, rather than published here.</p>
    </Section>

    <Section title="Related">
      <Related related={p.related} exclude={p.slug} />
    </Section>

    <CtaBand
      title={`See ${p.name} running.`}
      body="We'll walk through the application with your process in mind and confirm what fits your SAP release and plant."
      topic={p.slug}
      action="Request a walkthrough"
    />
  {/key}
{:else}
  <NotFound embedded />
{/if}

<style>
  .evidence {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    max-width: 52ch;
  }
  .evidence :global(.icon) {
    margin-top: 2px;
    color: var(--blue);
  }
  .problem {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
    gap: 32px clamp(32px, 5vw, 96px);
  }
  .lead {
    font-size: var(--fs-lead);
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 60ch;
  }
  .env {
    padding-top: 18px;
    border-top: 2px solid var(--blue);
  }
  .env h3 {
    font-size: var(--fs-h4);
    margin-bottom: 8px;
  }
  .env p {
    color: var(--ink-2);
  }
  .demo {
    margin-top: 36px;
    color: var(--on-blue-2);
    font-size: var(--fs-small);
    max-width: 70ch;
  }
  @media (max-width: 900px) {
    .problem {
      grid-template-columns: 1fr;
    }
  }
</style>
