import { afterEach, describe, expect, it, vi } from "vitest";
import { formatOutcomeLogLine, writeOutcomeLog } from "../../src/lib/outcome-log";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("outcome log (NFR-018, ENT-006)", () => {
  it("formats one JSON line with time and outcome only", () => {
    const line = formatOutcomeLogLine({ time: "2026-09-22T12:00:00.000Z", outcome: "sent" });
    expect(line).toBe('{"time":"2026-09-22T12:00:00.000Z","outcome":"sent"}\n');
  });

  it("includes detail only when given", () => {
    const line = formatOutcomeLogLine({
      time: "2026-09-22T12:00:00.000Z",
      outcome: "send_failed",
      detail: "missing: SMTP_HOST",
    });
    expect(JSON.parse(line)).toEqual({
      time: "2026-09-22T12:00:00.000Z",
      outcome: "send_failed",
      detail: "missing: SMTP_HOST",
    });
  });

  it("drops properties outside the entry shape", () => {
    const entry = { time: "t", outcome: "sent", workEmail: "leak@example.com" } as const;
    expect(formatOutcomeLogLine(entry)).not.toContain("leak@example.com");
  });

  it("writes exactly one line to standard output", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    writeOutcomeLog({ time: "2026-09-22T12:00:00.000Z", outcome: "invalid" });
    expect(write).toHaveBeenCalledTimes(1);
    expect(String(write.mock.calls[0]?.[0]).split("\n")).toHaveLength(2);
  });
});
