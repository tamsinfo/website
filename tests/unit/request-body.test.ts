import { describe, expect, it } from "vitest";
import {
  isJsonMediaType,
  MAX_BODY_BYTES,
  parseJsonBody,
  readRequestBody,
} from "../../src/lib/request-body";

const URL = "http://localhost/api/contact";

// A stream without Content-Length, delivered in chunks, as a chunked upload would be.
function streamedRequest(totalBytes: number, chunkBytes = 4096): Request {
  let sent = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= totalBytes) {
        controller.close();
        return;
      }
      const size = Math.min(chunkBytes, totalBytes - sent);
      sent += size;
      controller.enqueue(new Uint8Array(size).fill(0x20));
    },
  });
  return new Request(URL, { method: "POST", body, duplex: "half" } as RequestInit);
}

describe("isJsonMediaType (FR-027)", () => {
  it.each([
    ["application/json", true],
    ["application/json; charset=utf-8", true],
    ["Application/JSON;charset=UTF-8", true],
    ["  application/json  ", true],
    ["text/plain", false],
    ["application/x-www-form-urlencoded", false],
    ["multipart/form-data; boundary=x", false],
    ["application/jsonp", false],
    ["application/json-patch+json", false],
    ["", false],
  ])("%j gives %s", (contentType, expected) => {
    expect(isJsonMediaType(contentType)).toBe(expected);
  });

  it("rejects a missing Content-Type", () => {
    expect(isJsonMediaType(null)).toBe(false);
  });
});

describe("readRequestBody (NFR-007)", () => {
  it("accepts exactly 65,536 bytes", async () => {
    const result = await readRequestBody(
      new Request(URL, { method: "POST", body: "x".repeat(MAX_BODY_BYTES) }),
    );
    expect(result.ok && result.value.byteLength).toBe(MAX_BODY_BYTES);
  });

  it("rejects 65,537 bytes with Content-Length", async () => {
    const result = await readRequestBody(
      new Request(URL, { method: "POST", body: "x".repeat(MAX_BODY_BYTES + 1) }),
    );
    expect(result).toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
  });

  it("rejects a declared oversized Content-Length without reading the body", async () => {
    const request = new Request(URL, {
      method: "POST",
      headers: { "Content-Length": String(MAX_BODY_BYTES + 1) },
      body: "{}",
    });
    expect(await readRequestBody(request)).toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
    expect(request.bodyUsed).toBe(false);
  });

  it("accepts a streamed body of exactly 65,536 bytes", async () => {
    const result = await readRequestBody(streamedRequest(MAX_BODY_BYTES));
    expect(result.ok && result.value.byteLength).toBe(MAX_BODY_BYTES);
  });

  it("stops reading a streamed body at the limit and rejects 65,537 bytes", async () => {
    const result = await readRequestBody(streamedRequest(MAX_BODY_BYTES + 1));
    expect(result).toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
  });

  it("stops reading an endless stream", async () => {
    const result = await readRequestBody(streamedRequest(Number.MAX_SAFE_INTEGER));
    expect(result).toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
  });

  it("maps a stream read error to PAYLOAD_TOO_LARGE", async () => {
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error("Body size limit exceeded"));
      },
    });
    const request = new Request(URL, { method: "POST", body, duplex: "half" } as RequestInit);
    expect(await readRequestBody(request)).toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
  });

  it("returns an empty body when there is none", async () => {
    const result = await readRequestBody(new Request(URL, { method: "POST" }));
    expect(result.ok && result.value.byteLength).toBe(0);
  });
});

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

describe("parseJsonBody", () => {
  it("parses a JSON object", () => {
    expect(parseJsonBody(encode('{"a":1}'))).toEqual({ ok: true, value: { a: 1 } });
  });

  it("parses a non-object JSON value for the validator to reject", () => {
    expect(parseJsonBody(encode("[1]"))).toEqual({ ok: true, value: [1] });
  });

  it.each([[""], ["{"], ["not json"], ["{'a':1}"]])("fails on %j", (text) => {
    expect(parseJsonBody(encode(text))).toEqual({ ok: false, error: "VALIDATION_FAILED" });
  });

  it("fails on invalid UTF-8", () => {
    expect(parseJsonBody(new Uint8Array([0x22, 0xff, 0x22]))).toEqual({
      ok: false,
      error: "VALIDATION_FAILED",
    });
  });
});
