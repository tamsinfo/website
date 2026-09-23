import { getCountries, getCountryCallingCode, isSupportedCountry } from "libphonenumber-js/min";

// Server-only (ADR-006). Browser code reads the list from the data-calling-codes attribute
// instead, so the metadata bundle never ships to the client.

export const DEFAULT_CALLING_CODE = "+91";

// Returns "+<digits>" for a supported ISO 3166-1 alpha-2 value, else the India default
// (FR-024: absent header, XX, T1, or a country outside the metadata).
export function callingCodeFor(country: string | null | undefined): string {
  if (country === null || country === undefined || !isSupportedCountry(country)) {
    return DEFAULT_CALLING_CODE;
  }
  return `+${getCountryCallingCode(country)}`;
}

// Every distinct calling code as digits without "+", in ascending numeric order.
// The same form feeds validateContactSubmission and the data-calling-codes attribute.
export function listCallingCodes(): readonly string[] {
  const distinct = new Set<string>(getCountries().map((country) => getCountryCallingCode(country)));
  return [...distinct].toSorted((left, right) => Number(left) - Number(right));
}

export function callingCodeSet(): ReadonlySet<string> {
  return new Set(listCallingCodes());
}
