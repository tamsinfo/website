<script lang="ts">
  import { onMount } from "svelte";
  import { categories, company } from "../lib/content";
  import { startScroll, stopScroll } from "../lib/motion/scroll";
  import { ui } from "../lib/state.svelte";
  import { route } from "../router";
  import Icon from "./Icon.svelte";
  import Logo from "./Logo.svelte";
  import SoundControl from "./SoundControl.svelte";

  let open = $state<string | null>(null);
  let scrolled = $state(false);
  let nav: HTMLElement;
  let closeTimer = 0;
  let openTimer = 0;

  const active = (href: string) => route.pathname === href || route.pathname.startsWith(href + "/");

  function detectTheme() {
    scrolled = window.scrollY > 24;
    const els = document.elementsFromPoint(window.innerWidth / 2, 36);
    for (const el of els) {
      if (nav.contains(el)) continue;
      const host = (el as HTMLElement).closest<HTMLElement>("[data-theme]");
      if (host) {
        ui.navTheme = (host.dataset.theme as typeof ui.navTheme) ?? "paper";
        return;
      }
    }
  }

  onMount(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(detectTheme);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("tams:layout", schedule);
    const interval = window.setInterval(detectTheme, 600);
    detectTheme();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        const key = open;
        open = null;
        nav.querySelector<HTMLButtonElement>(`[data-menu="${key}"]`)?.focus();
      }
      if (ui.menuOpen) ui.menuOpen = false;
    };
    const onDown = (e: PointerEvent) => {
      if (open && !nav.contains(e.target as Node)) open = null;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    nav.addEventListener("pointerleave", hoverClose);
    return () => {
      nav.removeEventListener("pointerleave", hoverClose);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("tams:layout", schedule);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      clearInterval(interval);
    };
  });

  $effect(() => {
    // close menus whenever the route changes
    void route.pathname;
    open = null;
    ui.menuOpen = false;
  });

  $effect(() => {
    if (ui.menuOpen) stopScroll();
    else startScroll();
  });

  function hoverOpen(key: string) {
    if (!ui.finePointer) return;
    clearTimeout(closeTimer);
    clearTimeout(openTimer);
    openTimer = window.setTimeout(() => (open = key), open ? 0 : 90);
  }
  function hoverClose() {
    if (!ui.finePointer) return;
    clearTimeout(openTimer);
    closeTimer = window.setTimeout(() => (open = null), 220);
  }

  let mobileOpenGroup = $state<string | null>(null);
</script>

<header
  class="nav"
  class:scrolled
  class:has-panel={open !== null}
  class:menu-open={ui.menuOpen}
  data-nav-theme={open || ui.menuOpen ? "paper" : ui.navTheme}
  bind:this={nav}
>
  <div class="bar wrap">
    <a class="brand" href="/" aria-label="TAMS Infotech home" data-cursor="link">
      <Logo />
    </a>

    <nav class="primary" aria-label="Primary">
      <ul>
        {#each categories as c (c.key)}
          <li onpointerenter={() => hoverOpen(c.key)}>
            <button
              type="button"
              class="item"
              class:current={active(c.href)}
              data-menu={c.key}
              aria-expanded={open === c.key}
              aria-controls={`panel-${c.key}`}
              onclick={() => (open = open === c.key ? null : c.key)}
            >
              {c.label}
              <Icon name="alt-arrow-down" size={16} class="chev" />
            </button>
          </li>
        {/each}
        <li onpointerenter={hoverClose}>
          <a class="item" class:current={active("/about")} href="/about" aria-current={active("/about") ? "page" : undefined}>About</a>
        </li>
      </ul>
    </nav>

    <div class="tools">
      <SoundControl />
      <a class="btn cta" href="/contact" data-cursor="morph" data-magnetic>Plan a consultation</a>
      <button
        type="button"
        class="menu-btn"
        aria-expanded={ui.menuOpen}
        aria-controls="mobile-menu"
        onclick={() => (ui.menuOpen = !ui.menuOpen)}
      >
        <Icon name={ui.menuOpen ? "close-circle" : "hamburger-menu"} size={22} />
        <span>{ui.menuOpen ? "Close" : "Menu"}</span>
      </button>
    </div>
  </div>

  {#each categories as c (c.key)}
    <div
      class="panel"
      id={`panel-${c.key}`}
      hidden={open !== c.key}
      onpointerenter={() => clearTimeout(closeTimer)}
      role="region"
      aria-label={c.label}
    >
      <div class="panel-inner wrap">
        <div class="panel-intro">
          <p class="panel-title">{c.label}</p>
          <p class="panel-blurb">{c.blurb}</p>
          <a class="link-arrow" href={c.href}>Overview <Icon name="arrow-right" size={18} /></a>
        </div>
        <ul class="panel-list" class:dense={c.items.length > 6}>
          {#each c.items as item (item.slug)}
            <li>
              <a href={item.href} class:current={route.pathname === item.href} aria-current={route.pathname === item.href ? "page" : undefined}>
                <Icon name={item.icon} size={22} />
                <span class="pl-text">
                  <span class="pl-name">{item.name}</span>
                  <span class="pl-tag">{item.tagline}</span>
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/each}
</header>

<div class="sheet" id="mobile-menu" hidden={!ui.menuOpen} data-lenis-prevent>
  <nav aria-label="Mobile">
    <ul class="sheet-list">
      {#each categories as c (c.key)}
        <li>
          <button
            type="button"
            class="sheet-group"
            aria-expanded={mobileOpenGroup === c.key}
            onclick={() => (mobileOpenGroup = mobileOpenGroup === c.key ? null : c.key)}
          >
            {c.label}
            <Icon name="alt-arrow-down" size={20} class="chev" />
          </button>
          {#if mobileOpenGroup === c.key}
            <ul class="sheet-sub">
              <li><a href={c.href}>Overview</a></li>
              {#each c.items as item (item.slug)}
                <li><a href={item.href}>{item.name}</a></li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
      <li><a class="sheet-group" href="/about">About</a></li>
      <li><a class="sheet-group" href="/contact">Contact</a></li>
    </ul>
    <div class="sheet-foot">
      <a class="btn" href="/contact">Plan a consultation <Icon name="arrow-right" size={20} /></a>
      <p><a href={company.phoneHref}>{company.phone}</a><br /><a href={`mailto:${company.email}`}>{company.email}</a></p>
    </div>
  </nav>
</div>

<style>
  .nav {
    --fg: var(--porcelain);
    --fg-2: var(--on-blue-2);
    --bar-bg: transparent;
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    color: var(--fg);
    transition: color var(--dur-ui) var(--ease-out);
  }
  .nav[data-nav-theme="paper"] {
    --fg: var(--ink);
    --fg-2: var(--ink-2);
  }
  .nav.scrolled[data-nav-theme="paper"],
  .nav.has-panel {
    --bar-bg: rgb(242 238 231 / 0.86);
  }
  .nav.scrolled[data-nav-theme="night"] {
    --bar-bg: rgb(11 26 86 / 0.72);
  }
  .nav.scrolled[data-nav-theme="blue"] {
    --bar-bg: rgb(22 56 216 / 0.78);
  }
  .nav.has-panel,
  .nav.menu-open {
    --bar-bg: var(--porcelain);
  }

  .bar {
    position: relative;
    display: flex;
    align-items: center;
    gap: 24px;
    height: var(--nav-h);
  }
  .bar::before {
    content: "";
    position: absolute;
    inset: 0 calc(50% - 50vw);
    background: var(--bar-bg);
    backdrop-filter: blur(14px) saturate(1.2);
    -webkit-backdrop-filter: blur(14px) saturate(1.2);
    transition: background-color var(--dur-ui) var(--ease-out);
    z-index: -1;
  }
  .nav:not(.scrolled):not(.has-panel):not(.menu-open) .bar::before {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .brand {
    display: inline-flex;
    text-decoration: none;
    margin-right: auto;
  }

  .primary ul {
    display: flex;
    gap: 4px;
    list-style: none;
  }
  .item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 40px;
    padding: 0 12px;
    border: 0;
    border-radius: var(--r-control);
    background: none;
    color: var(--fg);
    font-size: 0.96875rem;
    font-weight: 520;
    text-decoration: none;
    cursor: pointer;
    position: relative;
  }
  .item :global(.chev) {
    opacity: 0.7;
    transition: transform var(--dur-ui) var(--ease-out);
  }
  .item[aria-expanded="true"] :global(.chev) {
    transform: rotate(180deg);
  }
  .item::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 6px;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--dur-ui) var(--ease-out);
  }
  .item:hover::after,
  .item.current::after,
  .item[aria-expanded="true"]::after {
    transform: scaleX(1);
  }

  .tools {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cta {
    min-height: 42px;
    font-size: 0.9375rem;
  }
  .nav[data-nav-theme="blue"] .cta {
    --btn-bg: var(--porcelain);
    --btn-fg: var(--blue-deep);
    --btn-bd: var(--porcelain);
  }

  .menu-btn {
    display: none;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 14px;
    border: 1px solid color-mix(in srgb, var(--fg) 30%, transparent);
    border-radius: var(--r-control);
    background: none;
    color: var(--fg);
    font-weight: 560;
    cursor: pointer;
  }

  /* mega panel */
  .panel {
    position: absolute;
    left: 0;
    right: 0;
    top: var(--nav-h);
    background: var(--porcelain);
    color: var(--ink);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    box-shadow: 0 24px 48px -24px rgb(16 24 38 / 0.25);
    animation: panel-in 260ms var(--ease-out);
  }
  @keyframes panel-in {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  .panel-inner {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 3fr;
    gap: clamp(24px, 4vw, 64px);
    padding-block: 36px 40px;
  }
  .panel-title {
    font-family: var(--font-display);
    font-stretch: 112%;
    font-weight: 640;
    font-size: 1.5rem;
    line-height: 1.1;
    margin-bottom: 10px;
  }
  .panel-blurb {
    color: var(--ink-2);
    max-width: 34ch;
    margin-bottom: 18px;
  }
  .panel-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 24px;
  }
  .panel-list.dense {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .panel-list a {
    display: flex;
    gap: 12px;
    padding: 12px;
    margin-inline: -12px;
    border-radius: var(--r-control);
    text-decoration: none;
    transition: background-color var(--dur-micro) var(--ease-out);
  }
  .panel-list a :global(.icon) {
    color: var(--blue);
    margin-top: 1px;
  }
  .panel-list a:hover,
  .panel-list a.current {
    background: var(--paper);
  }
  .pl-text {
    display: grid;
    gap: 2px;
  }
  .pl-name {
    font-weight: 600;
    line-height: 1.3;
  }
  .pl-tag {
    color: var(--ink-2);
    font-size: var(--fs-small);
    line-height: 1.4;
  }

  /* mobile sheet */
  .sheet {
    position: fixed;
    inset: var(--nav-h) 0 0 0;
    z-index: 49;
    background: var(--porcelain);
    color: var(--ink);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 8px var(--gutter) 40px;
  }
  .sheet-list {
    list-style: none;
    border-top: 1px solid var(--rule);
  }
  .sheet-list > li {
    border-bottom: 1px solid var(--rule);
  }
  .sheet-group {
    display: flex;
    padding: 0;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 60px;
    border: 0;
    background: none;
    font-family: var(--font-display);
    font-stretch: 112%;
    font-weight: 620;
    font-size: 1.375rem;
    text-decoration: none;
    text-align: left;
    cursor: pointer;
  }
  .sheet-group[aria-expanded="true"] :global(.chev) {
    transform: rotate(180deg);
  }
  .sheet-sub {
    list-style: none;
    padding-bottom: 14px;
  }
  .sheet-sub a {
    display: block;
    padding: 10px 0;
    color: var(--ink-2);
    text-decoration: none;
  }
  .sheet-foot {
    display: grid;
    gap: 20px;
    padding-top: 28px;
    justify-items: start;
  }
  .sheet-foot p {
    color: var(--ink-2);
    line-height: 1.8;
  }

  @media (max-width: 1180px) {
    .primary .item {
      padding: 0 9px;
      font-size: 0.9375rem;
    }
  }
  @media (max-width: 1080px) {
    .primary,
    .cta {
      display: none;
    }
    .menu-btn {
      display: inline-flex;
    }
  }
  @media (min-width: 1081px) {
    .sheet {
      display: none;
    }
  }
  @media (max-width: 420px) {
    .menu-btn span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
    .menu-btn {
      padding: 0 11px;
    }
  }
</style>
