<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import Icon from "../components/Icon.svelte";
  import CtaBand from "../components/CtaBand.svelte";
  import { categories, company, entry, journeys } from "../lib/content";
  import { playWords, reveal, stagger, words } from "../lib/motion/reveal";
  import { worldWindow } from "../lib/motion/windows";
  import { getWorld, scene, ui } from "../lib/state.svelte";

  const machineSpots = [
    { id: "gate", label: "Gate Entry", href: "/products/gate-entry" },
    { id: "press", label: "Production Process", href: "/products/production-process" },
    { id: "cell", label: "Connected Factory", href: "/products/connected-factory" },
    { id: "dispatch", label: "EXIM", href: "/products/exim" },
  ];
  const moduleSpots = [
    { id: "finance", label: "Finance" },
    { id: "inventory", label: "Inventory" },
    { id: "production", label: "Production" },
    { id: "procurement", label: "Procurement" },
    { id: "sales", label: "Sales and distribution" },
  ];

  let chapters: HTMLElement[] = $state([]);
  let spotEls: Record<string, HTMLElement> = $state({});
  let heroTitle: HTMLElement;
  let heroSupport: HTMLElement;

  const chapterLinks = {
    machines: ["gate-entry", "production-process", "connected-factory", "exim"].map((s) => entry("products", s)),
    plant: [entry("solutions", "integration-suite"), entry("solutions", "sap-btp")],
    sap: [entry("services", "s4hana-cloud-implementation"), entry("solutions", "rise-with-sap"), entry("solutions", "grow-with-sap")],
  };

  onMount(() => {
    scene({
      room: "plant",
      view: "ch0",
      chapters,
      hotspots: [...machineSpots, ...moduleSpots].map((s) => ({ id: s.id, el: spotEls[s.id]! })),
    });

    if (ui.reducedMotion) return;
    gsap.set(heroSupport, { autoAlpha: 0, y: 18 });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      playWords(heroTitle);
      gsap.to(heroSupport, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.55 });
    };
    if (ui.entered) {
      const t = setTimeout(play, 380);
      return () => clearTimeout(t);
    }
    return $effect.root(() => {
      $effect(() => {
        if (ui.entered) play();
      });
    });
  });
</script>

<svelte:head>
  <title>TAMS Infotech · SAP S/4HANA, BTP and connected manufacturing</title>
</svelte:head>

<div class="spots" aria-hidden="true">
  {#each machineSpots as s (s.id)}
    <a
      class="spot"
      href={s.href}
      tabindex="-1"
      data-cursor="hotspot"
      bind:this={spotEls[s.id]}
      onpointerenter={() => getWorld()?.highlight(s.id)}
      onpointerleave={() => getWorld()?.highlight(null)}
    >
      <span class="pin"></span><span class="spot-label">{s.label}</span>
    </a>
  {/each}
  {#each moduleSpots as s (s.id)}
    <span class="spot module" bind:this={spotEls[s.id]}><span class="spot-label">{s.label}</span></span>
  {/each}
</div>

<section class="chapter hero" data-theme="night" bind:this={chapters[0]} use:worldWindow>
  <div class="wrap hero-inner">
    <h1 bind:this={heroTitle} use:words={{ manual: true }}>Connect the systems your plant runs on.</h1>
    <div class="hero-support" bind:this={heroSupport}>
      <p class="t-lead">
        TAMS Infotech implements and supports SAP S/4HANA for manufacturers, and builds the applications that bring
        gates, machines, suppliers and shipments into it.
      </p>
      <div class="actions">
        <a class="btn btn--light" href="/contact" data-cursor="morph" data-magnetic>
          Plan a consultation <Icon name="arrow-right" size={20} />
        </a>
        <a class="btn btn--ghost-light" href="/services" data-cursor="morph">See our services</a>
      </div>
      <p class="cue"><Icon name="alt-arrow-down" size={18} /> Scroll to follow a plant from raw material to SAP</p>
    </div>
  </div>
</section>

<section class="chapter story right" data-theme="night" bind:this={chapters[1]} use:worldWindow>
  <div class="wrap">
    <div class="copy">
      <p class="mark t-label">01 · Raw material</p>
      <h2 use:words>Every plant starts as separate parts.</h2>
      <p use:reveal={{ delay: 0.2 }}>
        A truck waits at the gate while someone checks a paper register. A production order lives in SAP; its progress
        lives on a whiteboard. Machine counts stay on the machine. Each part works. None of them knows about the others.
      </p>
    </div>
  </div>
</section>

<section class="chapter story left" data-theme="night" bind:this={chapters[2]} use:worldWindow>
  <div class="wrap">
    <div class="copy">
      <p class="mark t-label">02 · Parts and machines</p>
      <h2 use:words>Parts become machines. Records become events.</h2>
      <p use:reveal={{ delay: 0.2 }}>
        We start where the work happens: the gate, the line, the weighbridge, the dispatch bay. TAMS applications capture
        each event once, at the source, against the SAP document it belongs to.
      </p>
      <ul class="chain-links" use:stagger>
        {#each chapterLinks.machines as e (e.href)}
          <li>
            <a class="link-arrow" href={e.href}>{e.name} <Icon name="arrow-right" size={18} /></a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="chapter story right" data-theme="night" bind:this={chapters[3]} use:worldWindow>
  <div class="wrap">
    <div class="copy">
      <p class="mark t-label">03 · The plant</p>
      <h2 use:words>Machines connect into a plant.</h2>
      <p use:reveal={{ delay: 0.2 }}>
        Connections should be designed, not accumulated. SAP Integration Suite and SAP BTP carry events between the shop
        floor, partner systems and the ERP, so adding a connection doesn't mean adding another fragile script.
      </p>
      <ul class="chain-links" use:stagger>
        {#each chapterLinks.plant as e (e.href)}
          <li>
            <a class="link-arrow" href={e.href}>{e.name} <Icon name="arrow-right" size={18} /></a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="chapter story left day" data-theme="paper" bind:this={chapters[4]} use:worldWindow>
  <div class="wrap">
    <div class="copy">
      <p class="mark t-label">04 · SAP</p>
      <h2 use:words>The plant connects to SAP.</h2>
      <p use:reveal={{ delay: 0.2 }}>
        With S/4HANA as the system of record, an order, a goods receipt and an invoice describe the same physical event.
        Finance, inventory and production stop reconciling and start planning.
      </p>
      <ul class="chain-links" use:stagger>
        {#each chapterLinks.sap as e (e.href)}
          <li>
            <a class="link-arrow" href={e.href}>{e.name} <Icon name="arrow-right" size={18} /></a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="chapter outro" data-theme="paper" bind:this={chapters[5]} use:worldWindow>
  <div class="wrap">
    <h2 use:words>Find where to start.</h2>
    <p class="t-lead" use:reveal={{ delay: 0.2 }}>
      What we do, the SAP products we work with, the applications we build, and the industries we know.
    </p>
  </div>
</section>

<section class="index" data-theme="paper" aria-label="Offerings">
  <div class="wrap">
    {#each categories as c (c.key)}
      <div class="index-row">
        <div class="index-head" use:reveal>
          <h2><a href={c.href}>{c.label}</a></h2>
          <p>{c.blurb}</p>
          <a class="link-arrow" href={c.href}>{c.all} <Icon name="arrow-right" size={18} /></a>
        </div>
        <ul class="index-list" use:stagger={{ each: 0.04 }}>
          {#each c.items as item (item.slug)}
            <li>
              <a href={item.href}>
                <Icon name={item.icon} size={22} />
                <span>
                  <span class="il-name">{item.name}</span>
                  <span class="il-tag">{item.tagline}</span>
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<section class="journeys" data-theme="paper">
  <div class="wrap">
    <div class="j-head">
      <h2 use:words>Most programmes need more than one of these.</h2>
      <p use:reveal={{ delay: 0.15 }}>
        Typical routes from a business problem to the services, SAP products and applications involved. They're paths,
        not bundles: each step is scoped on its own.
      </p>
    </div>
    <ol class="j-list" use:stagger>
      {#each journeys as j (j.title)}
        <li>
          <div class="j-title">
            <h3>{j.title}</h3>
            <p>{j.problem}</p>
          </div>
          <ol class="chain">
            {#each j.chain as [cat, slug], i ([cat, slug].join("/"))}
              {@const e = entry(cat, slug)}
              <li>
                {#if i > 0}<Icon name="arrow-right" size={18} class="sep" />{/if}
                <a href={e.href}>{e.name}</a>
              </li>
            {/each}
          </ol>
        </li>
      {/each}
    </ol>
  </div>
</section>

<section class="company" data-theme="blue">
  <div class="wrap">
    <h2 use:words>An SAP partner that builds its own products.</h2>
    <dl class="facts" use:stagger>
      <div>
        <dt>SAP partner</dt>
        <dd>Implementation, support and extension work on SAP S/4HANA and SAP BTP, from blueprint to long-term support.</dd>
      </div>
      <div>
        <dt>Built on the stack we implement</dt>
        <dd>Gate Entry and EXIM run on SAP BTP with CAP services, SAPUI5 or React front ends, and SAP HANA Cloud.</dd>
      </div>
      <div>
        <dt>Over a decade of SAP work</dt>
        <dd>Across manufacturing, pharmaceuticals, automotive, mining, chemicals and retail.</dd>
      </div>
      <div>
        <dt>Three offices</dt>
        <dd>{company.offices.map((o) => o.city).join(", ").replace(/, ([^,]*)$/, " and $1")}.</dd>
      </div>
    </dl>
    <a class="link-arrow" href="/about">About TAMS Infotech <Icon name="arrow-right" size={18} /></a>
  </div>
</section>

<CtaBand
  title="Tell us where your systems disconnect."
  body="We'll look at the gap with you and suggest a first step: a fit-to-standard review, an integration assessment or a product walkthrough."
/>

<style>
  .spots {
    position: fixed;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
  }
  .spot {
    position: absolute;
    left: 0;
    top: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    translate: -50% -100%;
    color: var(--porcelain);
    text-decoration: none;
    font-size: var(--fs-small);
    font-weight: 560;
    white-space: nowrap;
    pointer-events: none;
    will-change: transform, opacity;
  }
  .spot-label {
    padding: 6px 10px;
    border-radius: var(--r-control);
    background: rgb(11 26 86 / 0.82);
    border: 1px solid rgb(251 249 245 / 0.28);
    transition: background-color var(--dur-micro) var(--ease-out);
  }
  .spot:hover .spot-label {
    background: var(--blue);
  }
  .pin {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--porcelain);
    box-shadow: 0 0 0 4px rgb(251 249 245 / 0.18);
  }
  .module .spot-label {
    background: var(--porcelain);
    color: var(--ink);
    border-color: var(--rule);
    font-family: var(--font-mono);
    font-size: var(--fs-label);
    font-weight: 500;
  }

  .chapter {
    position: relative;
    color: var(--porcelain);
  }
  .chapter[data-theme="paper"] {
    color: var(--ink);
  }
  :global(html.no-world) .chapter[data-theme="night"] {
    background: radial-gradient(120% 70% at 70% 100%, #1a2f8a 0%, var(--night) 62%);
  }
  :global(html.no-world) .chapter[data-theme="paper"] {
    background: var(--paper);
  }

  .hero {
    min-height: 100svh;
    display: flex;
    align-items: flex-end;
    padding-block: calc(var(--nav-h) + 40px) clamp(48px, 7vw, 96px);
  }
  .hero::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, rgb(11 26 86 / 0.72) 0%, rgb(11 26 86 / 0) 55%),
      linear-gradient(0deg, rgb(11 26 86 / 0.6) 0%, rgb(11 26 86 / 0) 40%);
  }
  .hero-inner {
    position: relative;
  }
  h1 {
    font-size: var(--fs-hero);
    max-width: 12ch;
    line-height: 0.98;
  }
  .hero-support {
    display: grid;
    gap: 28px;
    margin-top: clamp(22px, 2.6vw, 36px);
    max-width: 600px;
  }
  .hero-support :global(.t-lead) {
    color: var(--on-blue-2);
    max-width: 50ch;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .cue {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--on-blue-3);
    font-size: var(--fs-small);
  }

  .story {
    min-height: 150svh;
  }
  .story .wrap {
    display: flex;
    min-height: inherit;
  }
  .story.right .wrap {
    justify-content: flex-end;
  }
  .copy {
    position: sticky;
    top: 0;
    align-self: flex-start;
    display: grid;
    gap: 20px;
    width: min(500px, 100%);
    min-height: 100svh;
    align-content: center;
    padding-block: calc(var(--nav-h) + 24px) 48px;
  }
  .copy h2 {
    font-size: var(--fs-h2);
  }
  /* a soft local scrim behind the reading block, so the scene never sits under the text */
  .copy::after {
    content: "";
    position: absolute;
    inset: 12% -22% 8%;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(closest-side, rgb(11 26 86 / 0.92) 0%, rgb(11 26 86 / 0.82) 55%, rgb(11 26 86 / 0) 100%);
  }
  .day .copy::after {
    background: radial-gradient(closest-side, rgb(242 238 231 / 0.95) 0%, rgb(242 238 231 / 0.85) 55%, rgb(242 238 231 / 0) 100%);
  }
  .copy > p:not(.mark) {
    color: var(--on-blue-2);
    font-size: var(--fs-lead);
    line-height: 1.5;
  }
  .day .copy > p:not(.mark) {
    color: var(--ink-2);
  }
  .mark {
    color: var(--on-blue-3);
  }
  .day .mark {
    color: var(--ink-3);
  }
  .chain-links {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;
  }

  .outro {
    min-height: 90svh;
    display: flex;
    align-items: flex-end;
    padding-bottom: clamp(48px, 6vw, 88px);
  }
  .outro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(0deg, var(--paper) 0%, rgb(242 238 231 / 0.75) 30%, rgb(242 238 231 / 0) 62%);
  }
  .outro .wrap {
    position: relative;
  }
  .outro h2 {
    font-size: var(--fs-h1);
    max-width: 14ch;
  }
  .outro :global(.t-lead) {
    margin-top: 20px;
    color: var(--ink-2);
  }

  .index {
    background: var(--paper);
    padding-block: 24px var(--section);
  }
  .index-row {
    display: grid;
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: 24px clamp(32px, 5vw, 96px);
    padding-block: clamp(36px, 4vw, 56px);
    border-top: 1px solid var(--rule-strong);
  }
  .index-head h2 {
    font-size: var(--fs-h3);
    margin-bottom: 12px;
  }
  .index-head h2 a {
    text-decoration: none;
  }
  .index-head p {
    color: var(--ink-2);
    margin-bottom: 18px;
    max-width: 38ch;
  }
  .index-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 32px;
  }
  .index-list a {
    display: flex;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--rule);
    text-decoration: none;
  }
  .index-list a :global(.icon) {
    color: var(--blue);
    margin-top: 2px;
  }
  .il-name {
    display: block;
    font-weight: 600;
    line-height: 1.35;
  }
  .il-tag {
    display: block;
    color: var(--ink-2);
    font-size: var(--fs-small);
    line-height: 1.45;
  }
  .index-list a:hover .il-name {
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }

  .journeys {
    background: var(--porcelain);
    padding-block: var(--section);
  }
  .j-head {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 24px clamp(32px, 5vw, 96px);
    align-items: end;
    margin-bottom: clamp(40px, 5vw, 72px);
  }
  .j-head h2 {
    font-size: var(--fs-h2);
    max-width: 17ch;
  }
  .j-head p {
    color: var(--ink-2);
    font-size: var(--fs-lead);
    line-height: 1.5;
  }
  .j-list {
    list-style: none;
  }
  .j-list > li {
    display: grid;
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: 16px clamp(32px, 5vw, 96px);
    align-items: center;
    padding-block: 26px;
    border-top: 1px solid var(--rule);
  }
  .j-list > li:last-child {
    border-bottom: 1px solid var(--rule);
  }
  .j-title h3 {
    font-size: var(--fs-h4);
    font-weight: 640;
    margin-bottom: 4px;
  }
  .j-title p {
    color: var(--ink-2);
    font-size: var(--fs-small);
  }
  .chain {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .chain li {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .chain :global(.sep) {
    color: var(--ink-3);
  }
  .chain a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid var(--rule-strong);
    border-radius: var(--r-control);
    background: var(--paper);
    font-size: var(--fs-small);
    font-weight: 560;
    text-decoration: none;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out),
      border-color var(--dur-micro) var(--ease-out);
  }
  .chain a:hover {
    background: var(--blue);
    border-color: var(--blue);
    color: var(--porcelain);
  }

  .company {
    background: var(--blue);
    color: var(--porcelain);
    padding-block: var(--section);
    border-bottom: 1px solid var(--rule-blue);
  }
  .company h2 {
    font-size: var(--fs-h2);
    max-width: 16ch;
    margin-bottom: clamp(40px, 5vw, 72px);
  }
  .facts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 32px clamp(24px, 3vw, 48px);
    margin: 0 0 48px;
  }
  .facts div {
    padding-top: 20px;
    border-top: 1px solid rgb(251 249 245 / 0.4);
  }
  dt {
    font-family: var(--font-display);
    font-stretch: 110%;
    font-weight: 640;
    font-size: var(--fs-h4);
    line-height: 1.2;
    margin-bottom: 10px;
  }
  dd {
    margin: 0;
    color: var(--on-blue-2);
  }

  @media (max-width: 1000px) {
    .facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .index-row,
    .j-list > li,
    .j-head {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 767px) {
    .hero::before {
      background: linear-gradient(0deg, rgb(11 26 86 / 0.9) 0%, rgb(11 26 86 / 0.55) 50%, rgb(11 26 86 / 0) 80%);
    }
    .story {
      min-height: 130svh;
    }
    .story .wrap,
    .story.right .wrap {
      justify-content: flex-start;
    }
    .copy {
      align-content: end;
      padding-bottom: 40px;
    }
    .copy::after {
      display: none;
    }
    .copy::before {
      content: "";
      position: absolute;
      inset: 30% calc(var(--gutter) * -1) 0;
      z-index: -1;
      background: linear-gradient(0deg, rgb(11 26 86 / 0.92) 0%, rgb(11 26 86 / 0.65) 60%, rgb(11 26 86 / 0) 100%);
    }
    .day .copy::before {
      background: linear-gradient(0deg, rgb(242 238 231 / 0.95) 0%, rgb(242 238 231 / 0.7) 60%, rgb(242 238 231 / 0) 100%);
    }
    .index-list {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 560px) {
    .facts {
      grid-template-columns: 1fr;
    }
  }
</style>
