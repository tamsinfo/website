import { describe, expect, it } from "vitest";
import {
  handlesEscape,
  INITIAL_MENU_STATE,
  isMenuVisible,
  reduceMenu,
  type MenuEvent,
  type MenuState,
} from "../../src/lib/nav-menu-state";

function run(...events: MenuEvent[]): MenuState {
  return events.reduce(reduceMenu, INITIAL_MENU_STATE);
}

const click: MenuEvent = { type: "trigger", pointer: true };
const key: MenuEvent = { type: "trigger", pointer: false };

describe("pointer behaviour (FR-013)", () => {
  it("shows the panel on hover and hides it when the pointer leaves", () => {
    const hovered = run({ type: "pointer-enter" });
    expect(isMenuVisible(hovered)).toBe(true);
    expect(isMenuVisible(reduceMenu(hovered, { type: "pointer-leave" }))).toBe(false);
  });

  it("opens on click", () => {
    const state = run({ type: "pointer-enter" }, click);
    expect(state.open).toBe(true);
    expect(state.source).toBe("pointer");
  });

  it("closes a click-opened menu on pointer leave even though the trigger keeps focus", () => {
    const state = run({ type: "pointer-enter" }, click, { type: "pointer-leave" });
    expect(state.open).toBe(false);
    expect(isMenuVisible(state)).toBe(false);
  });

  it("closes on a second click and keeps it closed while the pointer stays", () => {
    const state = run({ type: "pointer-enter" }, click, click);
    expect(state.open).toBe(false);
    expect(state.suppressed).toBe(true);
    expect(isMenuVisible(state)).toBe(false);
  });

  it("lets hover reopen after a closing click once the pointer has left", () => {
    const state = run(
      { type: "pointer-enter" },
      click,
      click,
      { type: "pointer-leave" },
      { type: "pointer-enter" },
    );
    expect(isMenuVisible(state)).toBe(true);
  });

  it("closes on an outside click or when another menu opens", () => {
    expect(run(click, { type: "close" }).open).toBe(false);
  });
});

describe("keyboard behaviour (FR-014)", () => {
  it("opens with Enter or Space", () => {
    const state = run(key);
    expect(state.open).toBe(true);
    expect(state.source).toBe("keyboard");
  });

  it("keeps a keyboard-opened menu open when the pointer passes over and leaves", () => {
    const state = run(key, { type: "pointer-enter" }, { type: "pointer-leave" });
    expect(state.open).toBe(true);
  });

  it("closes on Escape and suppresses hover until the pointer leaves", () => {
    const opened = run({ type: "pointer-enter" }, key);
    expect(handlesEscape(opened)).toBe(true);
    const escaped = reduceMenu(opened, { type: "escape" });
    expect(escaped.open).toBe(false);
    expect(isMenuVisible(escaped)).toBe(false);
    expect(escaped.suppressed).toBe(true);
    expect(isMenuVisible(reduceMenu(escaped, { type: "pointer-leave" }))).toBe(false);
  });

  it("closes a hover-shown panel on Escape", () => {
    const state = run({ type: "pointer-enter" }, { type: "escape" });
    expect(isMenuVisible(state)).toBe(false);
  });

  it("ignores Escape when nothing is shown", () => {
    expect(handlesEscape(INITIAL_MENU_STATE)).toBe(false);
    expect(reduceMenu(INITIAL_MENU_STATE, { type: "escape" })).toEqual(INITIAL_MENU_STATE);
  });

  it("closes when focus leaves the item (Tab past the last link)", () => {
    const state = run(key, { type: "focus-leave" });
    expect(state.open).toBe(false);
    expect(state.suppressed).toBe(false);
  });

  it("opens again with the keyboard after a close", () => {
    expect(run(key, key, key).open).toBe(true);
  });
});
