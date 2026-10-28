<script lang="ts">
  import CtaBand from "../components/CtaBand.svelte";
  import IndexList from "../components/IndexList.svelte";
  import PageHero from "../components/PageHero.svelte";
  import Section from "../components/Section.svelte";
  import Steps from "../components/Steps.svelte";
  import { services } from "../lib/content";
  import { scene } from "../lib/state.svelte";

  scene({ room: "workshop", view: "index" });

  const items = services.map((s) => ({ href: `/services/${s.slug}`, name: s.name, tagline: s.tagline, summary: s.summary, icon: s.icon }));
  const bySlug = (slug: string) => services.find((s) => s.slug === slug)!;
  const lifecycle = [
    { title: "Size", body: `${bySlug("license-procurement").name}: the modules and subscriptions your design needs.` },
    { title: "Implement", body: `${bySlug("s4hana-cloud-implementation").name}: from blueprint to a stable first close.` },
    { title: "Run", body: `${bySlug("s4hana-managed-services").name}: incidents, changes and release readiness.` },
    { title: "Extend", body: `${bySlug("custom-application-build").name}: what standard SAP doesn't cover, outside the core.` },
  ];
</script>

<svelte:head><title>Services · TAMS Infotech</title></svelte:head>

<PageHero
  title="Implement it, run it, extend it."
  lede="Four services that cover the life of an SAP S/4HANA system, delivered by one team that stays with it from the first workshop to the tenth release."
/>

<Section title="Services">
  <IndexList {items} />
</Section>

<Section tone="porcelain" title="Across the life of the system" intro="Most clients start with one service and add the others as the system matures. The same people carry knowledge from one to the next.">
  <Steps steps={lifecycle} />
</Section>

<CtaBand title="Not sure where your programme should start?" body="Tell us what you run today and what has to change. We'll suggest the smallest useful first step." />
