/**
 * C-24 Navigation enhancement (TASK-003, ADR-012). Runs in the browser only.
 *
 * Without this module the menus still work: desktop panels open on :hover and
 * :focus-within (global.css `menu-open` variant) and the mobile menu is a native
 * <details>. When it runs it adds, per FR-013 to FR-015:
 * - click toggling with aria-expanded, one open menu at a time;
 * - a click-opened menu closes when the pointer leaves; a keyboard-opened one
 *   stays open until focus leaves (decision rules in nav-menu-state.ts);
 * - outside-click close;
 * - Escape close with focus return to the trigger;
 * - close when focus leaves the item (Tab past the last link);
 * - Escape closes the mobile <details>; following a link closes it.
 *
 * Markup contract (DesktopNav.astro, MobileNav.astro):
 * - desktop item: `li[data-menu]` > `button[data-menu-trigger][aria-controls]` + panel
 * - mobile menu: `details[data-mobile-menu]` > `summary`
 */

import {
  INITIAL_MENU_STATE,
  handlesEscape,
  isMenuVisible,
  reduceMenu,
  type MenuEvent,
  type MenuState,
} from "./nav-menu-state";

const MENU_SELECTOR = "[data-menu]";
const TRIGGER_SELECTOR = "[data-menu-trigger]";
const MOBILE_SELECTOR = "details[data-mobile-menu]";

interface DesktopMenu {
  readonly item: HTMLElement;
  readonly trigger: HTMLButtonElement;
  state: MenuState;
}

/** Write a menu's state to the markup: data-open, data-suppressed, aria-expanded. */
function render(menu: DesktopMenu): void {
  menu.item.toggleAttribute("data-open", menu.state.open);
  menu.item.toggleAttribute("data-suppressed", menu.state.suppressed);
  menu.trigger.setAttribute("aria-expanded", isMenuVisible(menu.state) ? "true" : "false");
}

function dispatch(menu: DesktopMenu, event: MenuEvent): void {
  menu.state = reduceMenu(menu.state, event);
  render(menu);
}

function closeOthers(menus: readonly DesktopMenu[], keep?: DesktopMenu): void {
  for (const menu of menus) {
    if (menu !== keep) dispatch(menu, { type: "close" });
  }
}

function enhanceDesktop(doc: Document): void {
  const menus: DesktopMenu[] = [];
  for (const item of doc.querySelectorAll<HTMLElement>(MENU_SELECTOR)) {
    const trigger = item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
    if (trigger === null) continue;
    item.setAttribute("data-js", "");
    menus.push({ item, trigger, state: INITIAL_MENU_STATE });
  }

  for (const menu of menus) {
    const { item, trigger } = menu;

    trigger.addEventListener("click", (event) => {
      // detail > 0 for a mouse or touch click; 0 for Enter or Space on the button.
      dispatch(menu, { type: "trigger", pointer: event.detail > 0 });
      if (menu.state.open) closeOthers(menus, menu);
    });

    item.addEventListener("mouseenter", () => {
      dispatch(menu, { type: "pointer-enter" });
      if (isMenuVisible(menu.state)) closeOthers(menus, menu);
    });

    item.addEventListener("mouseleave", () => {
      dispatch(menu, { type: "pointer-leave" });
    });

    item.addEventListener("focusout", (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && item.contains(next)) return;
      // FR-014 edge case: Tab past the last link closes the menu.
      dispatch(menu, { type: "focus-leave" });
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !handlesEscape(menu.state)) return;
      event.preventDefault();
      dispatch(menu, { type: "escape" });
      trigger.focus();
    });
  }

  doc.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    closeOthers(
      menus,
      menus.find((menu) => menu.item.contains(target)),
    );
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
