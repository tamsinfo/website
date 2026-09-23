import { randomInt } from "node:crypto";

export { REFERENCE_PATTERN } from "./api-types";

// C-17, ENT-007, FR-054. A human-readable label, not a key: collisions are allowed.

declare const enquiryReferenceBrand: unique symbol;
export type EnquiryReference = string & { readonly [enquiryReferenceBrand]: true };

// Omits 0, 1, I, and O so a reader cannot confuse them when quoting the reference.
export const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

const REFERENCE_SUFFIX_LENGTH = 4;

const KOLKATA_YEAR_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
});

export function kolkataYear(now: Date): string {
  const parts = KOLKATA_YEAR_FORMAT.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  return year.padStart(4, "0");
}

// Math.random is forbidden here: the suffix MUST come from a CSPRNG (FR-054).
export function generateEnquiryReference(now: Date): EnquiryReference {
  let suffix = "";
  for (let index = 0; index < REFERENCE_SUFFIX_LENGTH; index += 1) {
    suffix += REFERENCE_ALPHABET.charAt(randomInt(REFERENCE_ALPHABET.length));
  }
  return `TAMS-${kolkataYear(now)}-${suffix}` as EnquiryReference;
}
