<script lang="ts">
  import Architecture from "../components/Architecture.svelte";
  import Compare from "../components/Compare.svelte";
  import CtaBand from "../components/CtaBand.svelte";
  import IndexList from "../components/IndexList.svelte";
  import PageHero from "../components/PageHero.svelte";
  import Section from "../components/Section.svelte";
  import { solutions } from "../lib/content";
  import { diagrams } from "../lib/content/diagrams";
  import { scene } from "../lib/state.svelte";

  scene({ room: "core", view: "index" });

  const items = solutions.map((s) => ({ href: `/solutions/${s.slug}`, name: s.name, tagline: s.tagline, summary: s.summary, icon: s.icon }));
</script>

<svelte:head><title>SAP solutions · TAMS Infotech</title></svelte:head>

<PageHero
  theme="blue"
  title="The SAP products we help you adopt."
  lede="Cloud ERP, the platform around it, and the integration, analytics, automation and AI that make it useful. SAP builds the products; we design, implement and support what you do with them."
/>

<Section title="SAP solutions">
  <IndexList {items} />
</Section>

<Section tone="porcelain" title="SAP's product, our work">
  <Compare
    left={{
      who: "From SAP",
      title: "Products and platforms",
      items: ["Software, subscriptions and their terms", "Infrastructure and technical operations, where contracted", "Product roadmaps and releases"],
    }}
    right={{
      who: "From TAMS",
      title: "Design, delivery and support",
      items: ["Architecture and fit-to-standard design", "Configuration, extension and integration", "Migration, testing and cutover", "Support after go-live"],
    }}
  />
</Section>

<Section title="How the pieces fit">
  <Architecture diagram={diagrams.btp} />
</Section>

<CtaBand title="Choosing between RISE and GROW?" body="We'll compare both against your processes and your roadmap, and tell you which one we'd pick and why." topic="rise-with-sap" />
