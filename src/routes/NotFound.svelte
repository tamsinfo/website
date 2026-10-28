<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import PageHero from "../components/PageHero.svelte";
  import { scene } from "../lib/state.svelte";

  let { embedded = false }: { embedded?: boolean } = $props();
  scene({ room: "studio", view: "notfound" });
</script>

<svelte:head>
  {#if !embedded}<title>Page not found · TAMS Infotech</title>{/if}
</svelte:head>

<PageHero title="This page isn't on the plan." lede="The address may have changed when the site was rebuilt, or the link had a typo. These will get you back on track.">
  {#snippet actions()}
    <a class="btn" href="/" data-cursor="morph">Back to the start <Icon name="arrow-right" size={20} /></a>
    <a class="btn btn--ghost" href="/services">Services</a>
    <a class="btn btn--ghost" href="/products">Products</a>
    <a class="btn btn--ghost" href="/contact">Contact</a>
  {/snippet}
</PageHero>
