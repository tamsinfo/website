import { describe, expect, it } from "vitest";
import { MAP_TITLE, mapEmbedSrc, OFFICE_ADDRESS } from "../../src/lib/map-loader-client";
import {
  createTokenStore,
  TURNSTILE_NORMAL_WIDTH,
  TURNSTILE_SCRIPT_SRC,
  turnstileSizeFor,
} from "../../src/lib/turnstile-client";

describe("map embed URL (FR-019, ADR-010)", () => {
  it("queries the encoded office address with the keyless embed output", () => {
    const src = mapEmbedSrc();
    expect(src).toBe(
      `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`,
    );
    expect(new URL(src).searchParams.get("q")).toBe(
      "#67, 35th Main 100 Feet Road, KAS Officers Colony, BTM 2nd Stage, Bengaluru, Karnataka 560068",
    );
    expect(src).not.toMatch(/key=/);
  });

  it("titles the frame for assistive technology", () => {
    expect(MAP_TITLE).toBe("Map of the TAMS Infotech Bengaluru office");
  });
});

describe("Turnstile token store (FR-029, ADR-007)", () => {
  it("holds the latest token and clears on expiry or reset", () => {
    const tokens = createTokenStore();
    expect(tokens.read()).toBeNull();
    tokens.store("first");
    tokens.store("second");
    expect(tokens.read()).toBe("second");
    tokens.clear();
    expect(tokens.read()).toBeNull();
    tokens.store("");
    expect(tokens.read()).toBeNull();
  });

  it("loads the explicit-render script", () => {
    expect(new URL(TURNSTILE_SCRIPT_SRC).searchParams.get("render")).toBe("explicit");
  });
});

describe("Turnstile widget size (G4 revision request 2, NFR-020)", () => {
  it("uses the compact widget when the container is narrower than the normal widget", () => {
    expect(turnstileSizeFor(232)).toBe("compact");
    expect(turnstileSizeFor(TURNSTILE_NORMAL_WIDTH - 1)).toBe("compact");
  });

  it("uses the normal widget when the container can hold it", () => {
    expect(turnstileSizeFor(TURNSTILE_NORMAL_WIDTH)).toBe("normal");
    expect(turnstileSizeFor(518)).toBe("normal");
  });
});
