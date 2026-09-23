/**
 * C-30 Map loader (TASK-005, ADR-010, FR-017 to FR-019). Browser only.
 *
 * Nothing contacts Google until the visitor activates "Load map". The embed needs no
 * key and loads no script into the page. No choice is stored (FR-018), so every page
 * load starts with the placeholder.
 */

/** FR-019. */
export const OFFICE_ADDRESS =
  "#67, 35th Main 100 Feet Road, KAS Officers Colony, BTM 2nd Stage, Bengaluru, Karnataka 560068";

export const MAP_TITLE = "Map of the TAMS Infotech Bengaluru office";

export function mapEmbedSrc(address: string = OFFICE_ADDRESS): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/** Wires the "Load map" button. The frame keeps its fixed token height (NFR-003). */
export function initMapLoader(): void {
  const frame = document.querySelector<HTMLElement>("[data-map-frame]");
  const button = document.querySelector<HTMLButtonElement>("[data-map-load]");
  if (frame === null || button === null) return;

  button.addEventListener(
    "click",
    () => {
      const iframe = document.createElement("iframe");
      iframe.src = mapEmbedSrc();
      iframe.title = MAP_TITLE;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.className = "block size-full border-0";
      frame.replaceChildren(iframe);
      // The button that held focus is gone; keep keyboard users in place.
      iframe.focus();
    },
    { once: true },
  );
}
