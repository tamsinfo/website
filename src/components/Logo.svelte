<script lang="ts">
  let { compact = false }: { compact?: boolean } = $props();
</script>

<span class="logo" class:compact>
  <svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="12" height="7.5" rx="1.6" />
    <rect x="17" y="5" width="12" height="7.5" rx="1.6" />
    <rect class="stem" x="12.25" y="14.5" width="7.5" height="13.5" rx="1.6" />
  </svg>
  <span class="word">TAMS<span class="sub">Infotech</span></span>
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: inherit;
  }
  .mark {
    width: 30px;
    height: 30px;
    fill: currentColor;
  }
  .mark .stem {
    opacity: 0.55;
  }
  .word {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    font-family: var(--font-display);
    font-stretch: 118%;
    font-weight: 720;
    font-size: 1.1875rem;
    letter-spacing: 0.01em;
    line-height: 1;
  }
  .sub {
    font-weight: 460;
    font-stretch: 100%;
    letter-spacing: 0;
    opacity: 0.8;
  }
  .compact .sub {
    display: none;
  }
</style>
