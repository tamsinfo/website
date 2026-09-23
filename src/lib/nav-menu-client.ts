/**
 * C-24 Navigation enhancement (TASK-003, ADR-012). Runs in the browser only.
 *
 * Without this module the menus still work: desktop panels open on :hover and
 * :focus-within (global.css `menu-open` variant) and the mobile menu is a native
 * <details>. When it runs it adds, per FR-013 to FR-015:
 * - click toggling with aria-expanded, one open menu at a time;
 * - outside-click close;
 * - Escape close with focus return to the trigger;
 * - close when focus leaves the item (Tab past the last link);
 * - Escape closes the mobile <details>; following a link closes it.
 *
 * Markup contract (DesktopNav.astro, MobileNav.astro):
 * - desktop item: `li[data-menu]` > `button[data-menu-trigger][aria-controls]` + panel
 * - mobile menu: `details[data-mobile-menu]` > `summary`
 */

const MENU_SELECTOR = "[data-menu]";
const TRIGGER_SELECTOR = "[data-menu-trigger]";
const MOBILE_SELECTOR = "details[data-mobile-menu]";

export function isMenuOpen(item: HTMLElement): boolean {
  return item.hasAttribute("data-open");
}

function triggerOf(item: HTMLElement): HTMLButtonElement | null {
  return item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
}

/**
 * Open or close one desktop menu. `suppress` marks an explicit close (Escape or a
 * closing click) that must beat :hover until the pointer leaves or focus moves
 * (ADR-012 consequences).
 */
export function setMenuOpen(item: HTMLElement, open: boolean, suppress = false): void {
  item.toggleAttribute("data-open", open);
  item.toggleAttribute("data-suppressed", !open && suppress);
  triggerOf(item)?.setAttribute("aria-expanded", open ? "true" : "false");
}

function closeAll(items: readonly HTMLElement[], except?: HTMLElement): void {
  for (const item of items) {
    if (item !== except && isMenuOpen(item)) setMenuOpen(item, false);
  }
}

function enhanceDesktop(doc: Document): void {
  const items = [...doc.querySelectorAll<HTMLElement>(MENU_SELECTOR)];
  for (const item of items) {
    item.setAttribute("data-js", "");
    const trigger = triggerOf(item);
    if (trigger === null) continue;

    trigger.addEventListener("click", () => {
      const open = !isMenuOpen(item);
      closeAll(items, item);
      setMenuOpen(item, open, !open);
    });

    item.addEventListener("mouseenter", () => {
      // FR-013: hover opens; keep aria-expanded in step with what is shown.
      if (item.hasAttribute("data-suppressed")) return;
      closeAll(items, item);
      trigger.setAttribute("aria-expanded", "true");
    });

    item.addEventListener("mouseleave", () => {
      item.removeAttribute("data-suppressed");
      if (!isMenuOpen(item)) trigger.setAttribute("aria-expanded", "false");
      else if (!item.contains(doc.activeElement)) setMenuOpen(item, false);
    });

    item.addEventListener("focusout", (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && item.contains(next)) return;
      // FR-014 edge case: Tab past the last link closes the menu.
      if (isMenuOpen(item)) setMenuOpen(item, false);
      item.removeAttribute("data-suppressed");
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!isMenuOpen(item) && trigger.getAttribute("aria-expanded") !== "true") return;
      event.preventDefault();
      setMenuOpen(item, false, true);
      trigger.focus();
    });
  }

  doc.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const inside = items.find((item) => item.contains(target));
    closeAll(items, inside);
  });
}

function enhanceMobile(doc: Document): void {
  const menus = [...doc.querySelectorAll<HTMLDetailsElement>(MOBILE_SELECTOR)];
  for (const menu of menus) {
    const summary = menu.querySelector<HTMLElement>("summary");

    menu.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !menu.open) return;
      event.preventDefault();
      menu.open = false;
      summary?.focus();
    });

    // FR-015 edge case: following a link leaves the menu closed.
    menu.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("a") !== null) menu.open = false;
    });
  }

  // A page restored from the back-forward cache must not show a stale open menu.
  globalThis.addEventListener("pageshow", () => {
    for (const menu of menus) menu.open = false;
  });
}

export function initNavMenus(doc: Document = document): void {
  enhanceDesktop(doc);
  enhanceMobile(doc);
}
