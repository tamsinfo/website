<script lang="ts">
  import CtaBand from "../components/CtaBand.svelte";
  import IndexList from "../components/IndexList.svelte";
  import Matrix from "../components/Matrix.svelte";
  import PageHero from "../components/PageHero.svelte";
  import Section from "../components/Section.svelte";
  import { entry, industries } from "../lib/content";
  import { scene } from "../lib/state.svelte";

  scene({ room: "bays", view: "index" });

  const items = industries.map((i) => ({ href: `/industries/${i.slug}`, name: i.name, tagline: i.tagline, summary: i.headline, icon: i.icon }));
  const rows = industries.map((i) => ({
    label: i.short,
    cells: [i.apps.map((a) => entry("products", a.slug).name).join(", "), i.tech.map((t) => entry("solutions", t.slug).name).join(", ")],
  }));
</script>

<svelte:head><title>Industries · TAMS Infotech</title></svelte:head>

<PageHero
  title="Six ways to run a plant on SAP."
  lede="A steel plant, a pharmaceutical line and an auto-components supplier all run production in SAP, and almost nothing else about their processes is the same. Start from yours."
/>

<Section title="Industries">
  <IndexList {items} />
</Section>

<Section tone="porcelain" title="What each sector tends to need" intro="The TAMS applications and SAP solutions that come up most often in each industry. Every engagement is scoped on its own.">
  <Matrix columns={["TAMS applications", "SAP solutions"]} {rows} caption="Applications and SAP solutions by industry" />
</Section>

<CtaBand title="Your industry isn't listed?" body="These six are where we work most. If your plant runs SAP, the process questions are usually familiar; ask us." />
