<script lang="ts">
  import CtaBand from "../components/CtaBand.svelte";
  import IndexList from "../components/IndexList.svelte";
  import PageHero from "../components/PageHero.svelte";
  import PairGrid from "../components/PairGrid.svelte";
  import Section from "../components/Section.svelte";
  import { products } from "../lib/content";
  import { scene } from "../lib/state.svelte";

  scene({ room: "gallery", view: "index" });

  const items = products.map((p) => ({ href: `/products/${p.slug}`, name: p.name, tagline: p.tagline, summary: p.summary, icon: p.icon }));
  const stack = [
    { title: "SAP BTP, Cloud Foundry", body: "Applications run beside S/4HANA on SAP's platform, not inside its core." },
    { title: "CAP services", body: "Business logic in the SAP Cloud Application Programming Model with Node.js and TypeScript." },
    { title: "SAPUI5 and React", body: "Fiori-style apps for SAP users, and web front ends where the users sit outside SAP." },
    { title: "SAP HANA Cloud", body: "Application data in SAP's own database service." },
    { title: "Released SAP APIs", body: "Purchase orders, billing documents, deliveries and business partners read through S/4HANA's OData services." },
    { title: "Role-based access", body: "Separate roles, and often separate apps, for each group of users through SAP BTP authorisation." },
  ];
</script>

<svelte:head><title>TAMS products · TAMS Infotech</title></svelte:head>

<PageHero
  title="Applications for the steps SAP leaves to paper."
  lede="Gate registers, weighbridge slips, export files, supplier emails and shop-floor whiteboards. Each TAMS application replaces one of them with a workflow that ends in an SAP document."
/>

<Section title="TAMS products">
  <IndexList {items} />
</Section>

<Section tone="porcelain" title="Built on the stack we implement" intro="Gate Entry and EXIM are built this way. Each product page says whether its capabilities come from product documentation or are confirmed in a walkthrough.">
  <PairGrid items={stack} />
</Section>

<CtaBand title="See an application running against S/4HANA." body="Pick a workflow and we'll show it end to end, from the first screen to the SAP document it creates." action="Request a walkthrough" />
