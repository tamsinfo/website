// C-16, ENT-006. The only log writer for the contact endpoint. Entries carry no field
// value, IP address, token, reference, or error object (NFR-017).

export type ContactOutcome =
  | "sent"
  | "invalid"
  | "rate_limited"
  | "spam_check_failed"
  | "send_failed"
  | "payload_too_large"
  | "unsupported_media_type"
  | "method_not_allowed";

export interface OutcomeLogEntry {
  readonly time: string;
  readonly outcome: ContactOutcome;
  readonly detail?: string;
}

// Rebuilds the entry so no extra property can reach the log.
export function formatOutcomeLogLine(entry: OutcomeLogEntry): string {
  const line: OutcomeLogEntry =
    entry.detail === undefined
      ? { time: entry.time, outcome: entry.outcome }
      : { time: entry.time, outcome: entry.outcome, detail: entry.detail };
  return `${JSON.stringify(line)}\n`;
}

// Oxlint forbids console, and one write keeps the entry on exactly one line (NFR-018).
export function writeOutcomeLog(entry: OutcomeLogEntry): void {
  process.stdout.write(formatOutcomeLogLine(entry));
}
