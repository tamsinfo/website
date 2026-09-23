/**
 * Desktop dropdown decision rules (C-24, ADR-012, FR-013, FR-014). Pure: no DOM, so
 * Vitest covers every rule. nav-menu-client.ts feeds browser events in and writes
 * the resulting state back to the markup.
 */

/** How an open menu was opened. Pointer and keyboard menus close on different rules. */
export type OpenSource = "pointer" | "keyboard";

export interface MenuState {
  /** Explicitly opened (by a trigger click or key press). Maps to data-open. */
  readonly open: boolean;
  readonly source: OpenSource | null;
  /** The pointer is over the item or its panel. */
  readonly hovered: boolean;
  /** An explicit close beats :hover until the pointer leaves or focus moves (ADR-012). */
  readonly suppressed: boolean;
}

export type MenuEvent =
  /* Trigger activated. `pointer` is true for a mouse or touch click (click.detail > 0)
     and false for Enter or Space on the focused button (click.detail === 0). */
  | { readonly type: "trigger"; readonly pointer: boolean }
  | { readonly type: "pointer-enter" }
  | { readonly type: "pointer-leave" }
  /* Focus moved to an element outside the item (Tab past the last link). */
  | { readonly type: "focus-leave" }
  | { readonly type: "escape" }
  /* Another menu opened, or a click landed outside every menu. */
  | { readonly type: "close" };

export const INITIAL_MENU_STATE: MenuState = {
  open: false,
  source: null,
  hovered: false,
  suppressed: false,
};

function closed(state: MenuState, suppressed: boolean): MenuState {
  return { ...state, open: false, source: null, suppressed };
}

/** True when the panel is shown: opened explicitly, or hovered and not suppressed. */
export function isMenuVisible(state: MenuState): boolean {
  return state.open || (state.hovered && !state.suppressed);
}

export function reduceMenu(state: MenuState, event: MenuEvent): MenuState {
  switch (event.type) {
    case "trigger":
      if (state.open) return closed(state, true);
      return {
        ...state,
        open: true,
        source: event.pointer ? "pointer" : "keyboard",
        suppressed: false,
      };
    case "pointer-enter":
      return { ...state, hovered: true };
    case "pointer-leave": {
      // FR-013 edge case: a pointer-opened menu closes when the pointer leaves, even
      // though the clicked button keeps focus. A keyboard-opened menu stays open
      // until focus leaves (FR-014).
      const left = { ...state, hovered: false, suppressed: false };
      return state.open && state.source === "pointer" ? closed(left, false) : left;
    }
    case "focus-leave":
      return closed(state, false);
    case "escape":
      return isMenuVisible(state) ? closed(state, true) : state;
    case "close":
      return state.open ? closed(state, false) : state;
  }
}

/** Escape is handled (and focus returned to the trigger) only when a panel is shown. */
export function handlesEscape(state: MenuState): boolean {
  return isMenuVisible(state);
}
