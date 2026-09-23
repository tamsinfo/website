import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  findFallbackCsp,
  isDirectHtmlPath,
  readFallbackCsp,
  REFERRER_POLICY,
} from "../../src/lib/http-hardening";

describe("isDirectHtmlPath", () => {
  it.each([
    "/about/index.html",
    "/index.html",
    "/404.html",
    "/about/index.HTML",
    "/page.htm",
    "/about/index%2Ehtml",
    "/about/index%2ehtml",
    "/about/index.html?utm=1",
    "/about/index.html#top",
    "/%E0%A4%A.html",
  ])("blocks %s", (url) => {
    expect(isDirectHtmlPath(url)).toBe(true);
  });

  it("blocks a path that fails to decode", () => {
    expect(isDirectHtmlPath("/about/%E0%A4%A")).toBe(true);
  });

  it.each([
    "/",
    "/about",
    "/about/",
    "/contact?a=.html",
    "/health",
    "/_astro/Base.CFoiVujJ.css",
    "/htmlpage",
    "/a.html5",
  ])("allows %s", (url) => {
    expect(isDirectHtmlPath(url)).toBe(false);
  });

  it("keeps serving a 3,000-character path decision without error", () => {
    expect(isDirectHtmlPath(`/${"a".repeat(3000)}`)).toBe(false);
  });
});

describe("findFallbackCsp", () => {
  const csp = "default-src 'self';frame-ancestors 'none'";

  it("returns the /404 policy", () => {
    const entries = [
      { pathname: "/about", headers: [{ key: "Content-Security-Policy", value: "other" }] },
      { pathname: "/404", headers: [{ key: "Content-Security-Policy", value: csp }] },
    ];
    expect(findFallbackCsp(entries)).toEqual({ ok: true, value: csp });
  });

  it("reports a non-array file as malformed", () => {
    expect(findFallbackCsp({ pathname: "/404" })).toEqual({
      ok: false,
      error: { code: "HEADERS_FILE_MALFORMED" },
    });
  });

  it("reports a /404 entry without a headers array as malformed", () => {
    expect(findFallbackCsp([{ pathname: "/404" }])).toEqual({
      ok: false,
      error: { code: "HEADERS_FILE_MALFORMED" },
    });
  });

  it("reports a missing /404 entry", () => {
    expect(findFallbackCsp([{ pathname: "/about", headers: [] }])).toEqual({
      ok: false,
      error: { code: "FALLBACK_CSP_MISSING" },
    });
  });

  it("reports an empty policy as missing", () => {
    const entries = [
      { pathname: "/404", headers: [{ key: "Content-Security-Policy", value: "" }] },
    ];
    expect(findFallbackCsp(entries)).toEqual({
      ok: false,
      error: { code: "FALLBACK_CSP_MISSING" },
    });
  });
});

describe("readFallbackCsp", () => {
  const directory = mkdtempSync(join(tmpdir(), "http-hardening-"));

  function fileWith(name: string, contents: string): URL {
    const path = join(directory, name);
    writeFileSync(path, contents);
    return pathToFileURL(path);
  }

  it("reads the policy from a headers file", () => {
    const url = fileWith(
      "valid.json",
      JSON.stringify([
        {
          pathname: "/404",
          headers: [{ key: "Content-Security-Policy", value: "default-src 'self'" }],
        },
      ]),
    );
    expect(readFallbackCsp(url)).toEqual({ ok: true, value: "default-src 'self'" });
  });

  it("reports an unreadable file", () => {
    expect(readFallbackCsp(pathToFileURL(join(directory, "absent.json")))).toEqual({
      ok: false,
      error: { code: "HEADERS_FILE_UNREADABLE" },
    });
  });

  it("reports invalid JSON as malformed", () => {
    expect(readFallbackCsp(fileWith("broken.json", "{"))).toEqual({
      ok: false,
      error: { code: "HEADERS_FILE_MALFORMED" },
    });
  });
});

describe("REFERRER_POLICY", () => {
  it("matches NFR-013", () => {
    expect(REFERRER_POLICY).toBe("strict-origin-when-cross-origin");
  });
});
