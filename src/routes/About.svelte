<script lang="ts">
  import CtaBand from "../components/CtaBand.svelte";
  import Icon from "../components/Icon.svelte";
  import PageHero from "../components/PageHero.svelte";
  import PairGrid from "../components/PairGrid.svelte";
  import Section from "../components/Section.svelte";
  import { categories, company } from "../lib/content";
  import { stagger } from "../lib/motion/reveal";
  import { scene } from "../lib/state.svelte";

  scene({ room: "studio", view: "about" });

  const principles = [
    { title: "Standard first", body: "Every requirement is tested against SAP's standard process before anyone writes code. Most gaps close there." },
    { title: "Keep the core clean", body: "When an extension is right, it's built beside S/4HANA on released APIs, so upgrades stay routine." },
    { title: "One team, start to finish", body: "The people who design your system support it after go-live. Knowledge doesn't leave with a handover document." },
    { title: "Own the integration", body: "Interfaces are where programmes fail. We design them early, monitor them in production and fix them at the cause." },
  ];
  const services = categories.find((c) => c.key === "services")!;
  const products = categories.find((c) => c.key === "products")!;
</script>

<svelte:head><title>About · TAMS Infotech</title></svelte:head>

<PageHero
  title="We implement SAP, and build what it needs around it."
  lede="TAMS Infotech is an SAP partner. We implement S/4HANA, support it after go-live, and build the applications that connect plants, suppliers and shipments to it."
/>

<Section tone="porcelain" title="Two halves of one job">
  <div class="halves" use:stagger={{ selector: ".half" }}>
    {#each [services, products] as c (c.key)}
      <div class="half">
        <h3>{c.key === "services" ? "SAP services" : "Our own products"}</h3>
        <p>{c.blurb}</p>
        <ul>
          {#each c.items as item (item.href)}
            <li><a href={item.href}>{item.name}</a></li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</Section>

<Section tone="blue" title="How we work">
  <PairGrid items={principles} columns={2} />
</Section>

<Section title="Offices">
  <div class="offices" use:stagger>
    {#each company.offices as o (o.city)}
      <address>
        <Icon name="map-point" size={24} />
        <span class="city">{o.city}, {o.country}</span>
        {#each o.lines as line (line)}<span>{line}</span>{/each}
      </address>
    {/each}
  </div>
  <p class="direct">
    <a class="link-arrow" href={company.phoneHref}><Icon name="phone" size={18} />{company.phone}</a>
    <a class="link-arrow" href={`mailto:${company.email}`}><Icon name="letter" size={18} />{company.email}</a>
  </p>
</Section>

<CtaBand title="Work with a team that stays." body="Tell us about your system and your plans for it. We'll tell you honestly where we can help." />

<style>
  .halves {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px clamp(24px, 4vw, 64px);
  }
  .half {
    padding-top: 22px;
    border-top: 2px solid var(--blue);
  }
  .half h3 {
    font-size: var(--fs-h3);
    margin-bottom: 12px;
  }
  .half p {
    color: var(--ink-2);
    margin-bottom: 18px;
    max-width: 44ch;
  }
  .half ul {
    list-style: none;
  }
  .half li a {
    display: block;
    padding: 11px 0;
    border-top: 1px solid var(--rule);
    font-weight: 560;
    text-decoration: none;
  }
  .half li a:hover {
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }
  .offices {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 32px clamp(24px, 3vw, 48px);
  }
  address {
    display: grid;
    gap: 2px;
    font-style: normal;
    color: var(--ink-2);
    padding-top: 20px;
    border-top: 1px solid var(--rule-strong);
  }
  address :global(.icon) {
    color: var(--blue);
    margin-bottom: 10px;
  }
  .city {
    color: var(--ink);
    font-weight: 620;
    font-size: var(--fs-h4);
    margin-bottom: 6px;
  }
  .direct {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 32px;
    margin-top: 40px;
  }
  @media (max-width: 860px) {
    .halves,
    .offices {
      grid-template-columns: 1fr;
    }
  }
</style>
