<script lang="ts">
  import { sound } from "../lib/audio/engine";
  import { ui } from "../lib/state.svelte";
  import Icon from "./Icon.svelte";

  let { inline = false }: { inline?: boolean } = $props();
  let open = $state(false);
  let root: HTMLElement;
  const uid = Math.random().toString(36).slice(2, 7);

  const anyOn = $derived(ui.sound.ambience || ui.sound.music);

  async function toggle(layer: "ambience" | "music") {
    const next = !ui.sound[layer];
    ui.sound[layer] = next;
    try {
      await sound.set(layer, next);
      if (next && layer === "ambience") sound.cue("click");
    } catch {
      ui.sound[layer] = false;
    }
  }

  function onWindowDown(e: PointerEvent) {
    if (open && root && !root.contains(e.target as Node)) open = false;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      open = false;
      root.querySelector<HTMLButtonElement>(".sound-btn")?.focus();
    }
  }
</script>

<svelte:window onpointerdown={onWindowDown} onkeydown={onKey} />

<div class="sound" class:inline bind:this={root}>
  {#if !inline}
    <button
      type="button"
      class="sound-btn"
      aria-expanded={open}
      aria-controls={`sound-${uid}`}
      onclick={() => (open = !open)}
      data-cursor="link"
    >
      <Icon name={anyOn ? "volume-loud" : "volume-cross"} size={20} />
      <span class="label">Sound {anyOn ? "on" : "off"}</span>
    </button>
  {/if}
  <div class="pop" id={`sound-${uid}`} hidden={!inline && !open}>
    <p class="pop-title">Sound</p>
    <label class="switch">
      <input type="checkbox" role="switch" checked={ui.sound.ambience} onchange={() => toggle("ambience")} />
      <span class="track" aria-hidden="true"></span>
      <span>Ambience and effects</span>
    </label>
    <label class="switch">
      <input type="checkbox" role="switch" checked={ui.sound.music} onchange={() => toggle("music")} />
      <span class="track" aria-hidden="true"></span>
      <span>Music</span>
    </label>
    <p class="pop-note">Off by default. The site works the same without it.</p>
  </div>
</div>

<style>
  .sound {
    position: relative;
  }
  .sound-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
    border-radius: var(--r-control);
    background: none;
    color: inherit;
    font-size: 0.9375rem;
    font-weight: 520;
    cursor: pointer;
  }
  .sound-btn:hover {
    border-color: currentColor;
  }
  .pop {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    width: 260px;
    padding: 16px 18px;
    background: var(--porcelain);
    color: var(--ink);
    border: 1px solid var(--rule);
    border-radius: var(--r-panel);
    box-shadow: 0 18px 40px -18px rgb(16 24 38 / 0.35);
    display: grid;
    gap: 12px;
  }
  .inline .pop {
    position: static;
    width: auto;
    padding: 0;
    border: 0;
    box-shadow: none;
    background: none;
  }
  .pop-title {
    font-weight: 600;
  }
  .pop-note {
    font-size: var(--fs-small);
    color: var(--ink-2);
    line-height: 1.45;
  }
  .switch {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    min-height: 32px;
  }
  .switch input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
  .track {
    position: relative;
    flex: none;
    width: 40px;
    height: 24px;
    border-radius: 12px;
    background: var(--rule-strong);
    transition: background-color var(--dur-ui) var(--ease-out);
  }
  .track::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--porcelain);
    box-shadow: 0 1px 2px rgb(16 24 38 / 0.3);
    transition: transform var(--dur-ui) var(--ease-out);
  }
  .switch input:checked + .track {
    background: var(--blue);
  }
  .switch input:checked + .track::after {
    transform: translateX(16px);
  }
  .switch input:focus-visible + .track {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }
  /* icon-only at every size; the label stays for screen readers */
  .label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
