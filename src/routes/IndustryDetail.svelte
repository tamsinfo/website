<script lang="ts">
  import Compare from "../components/Compare.svelte";
  import CtaBand from "../components/CtaBand.svelte";
  import Icon from "../components/Icon.svelte";
  import PageHero from "../components/PageHero.svelte";
  import PairGrid from "../components/PairGrid.svelte";
  import Related from "../components/Related.svelte";
  import Section from "../components/Section.svelte";
  import Steps from "../components/Steps.svelte";
  import { entry, industries } from "../lib/content";
  import { reveal, stagger } from "../lib/motion/reveal";
  import { scene } from "../lib/state.svelte";
  import { route } from "../router";
  import NotFound from "./NotFound.svelte";

  const slug = $derived(route.params.slug ?? "");
  const ind = $derived(industries.find((x) => x.slug === slug));

  $effect(() => {
    if (ind) scene({ room: "bays", view: ind.slug });
  });
</script>

<svelte:head><title>{ind ? `${ind.name} · TAMS Infotech` : "Page not found · TAMS Infotech"}</title></svelte:head>

{#if ind}
  {#key ind.slug}
    <PageHero crumbs={[{ label: "Industries", href: "/industries" }, { label: ind.name }]} title={ind.headline} lede={ind.tagline}>
      {#snippet actions()}
        <a class="btn" href={`/contact?topic=${ind.slug}`} data-cursor="morph" data-magnetic>Talk to an industry lead <Icon name="arrow-right" size={20} /></a>
        <a class="btn btn--ghost" href="#process">See the process</a>
      {/snippet}
    </PageHero>

    <Section tone="porcelain" title={`How ${ind.short.toLowerCase()} operations run`}>
      <p class="context" use:reveal>{ind.context}</p>
    </Section>

    <Section title="Where it gets hard">
      <PairGrid items={ind.challenges} columns={2} />
    </Section>

    <Section tone="porcelain" id="process" title="The process, step by step">
      <Steps steps={ind.flow.steps} caption={ind.flow.caption} label="Illustrative process" />
    </Section>

    <Section title="Standard SAP, and where it stops" intro="What S/4HANA covers out of the box for this sector, and what needs one of our applications or a custom build.">
      <Compare
        left={{ who: "Standard SAP", title: "Covered by S/4HANA", items: ind.standard }}
        right={{ who: "Additional", title: "Needs an application or integration", items: ind.extended }}
      />
    </Section>

    <Section tone="blue" title="Applications and SAP technology">
      <div class="uses" use:stagger={{ selector: "li" }}>
        <div>
          <h3>TAMS applications</h3>
          <ul>
            {#each ind.apps as a (a.slug)}
              {@const e = entry("products", a.slug)}
              <li>
                <a href={e.href}><span>{e.name}</span><Icon name="arrow-right" size={20} /></a>
                <p>{a.why}</p>
              </li>
            {/each}
          </ul>
        </div>
        <div>
          <h3>SAP solutions</h3>
          <ul>
            {#each ind.tech as t (t.slug)}
              {@const e = entry("solutions", t.slug)}
              <li>
                <a href={e.href}><span>{e.name}</span><Icon name="arrow-right" size={20} /></a>
                <p>{t.why}</p>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </Section>

    <Section title="Related">
      <Related related={ind.related} />
    </Section>

    <CtaBand title={ind.cta} body={`Ask us for references from ${ind.short.toLowerCase()} projects, or bring a process you'd like us to look at.`} topic={ind.slug} />
  {/key}
{:else}
  <NotFound embedded />
{/if}

<style>
  .context {
    font-size: var(--fs-lead);
    line-height: 1.55;
    max-width: 64ch;
    color: var(--ink-2);
  }
  .uses {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px clamp(24px, 4vw, 64px);
  }
  .uses h3 {
    font-size: var(--fs-h3);
    margin-bottom: 18px;
  }
  .uses ul {
    list-style: none;
  }
  .uses li {
    padding: 16px 0 18px;
    border-top: 1px solid var(--rule-blue);
  }
  .uses a {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-weight: 600;
    font-size: 1.125rem;
    text-decoration: none;
  }
  .uses a:hover span {
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }
  .uses p {
    margin-top: 6px;
    color: var(--on-blue-2);
  }
  @media (max-width: 760px) {
    .uses {
      grid-template-columns: 1fr;
    }
  }
</style>
