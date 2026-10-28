<script lang="ts">
  import { solar, type IconName } from "../lib/icons/solar";

  let {
    name,
    size = 24,
    label,
    class: className = "",
  }: { name: IconName; size?: number | string; label?: string; class?: string } = $props();
</script>

<svg
  class={["icon", className]}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  role={label ? "img" : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : "true"}
  focusable="false"
>
  {@html solar[name]}
</svg>

<style>
  .icon {
    flex: none;
  }
</style>
