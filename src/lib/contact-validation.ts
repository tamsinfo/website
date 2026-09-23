// C-10. Shared by the server pipeline and the browser form client, so it MUST NOT
// import any Node module or the libphonenumber metadata.

export const INTEREST_OPTIONS = ["Services", "Solutions", "Products", "Careers", "Other"] as const;
export type Interest = (typeof INTEREST_OPTIONS)[number];

export type FieldName = "name" | "company" | "workEmail" | "phone" | "interest" | "message";

export const FIELD_ERROR_MESSAGES = {
  name: "Enter your name.",
  company: "Enter your company name.",
  workEmail: "Enter a valid email address.",
  phone: "Enter a valid phone number.",
  interest: "Choose an interest.",
  messageTooShort: "Message must be at least 20 characters.",
  messageTooLong: "Message must be at most 4000 characters.",
} as const;

export interface FieldError {
  readonly field: FieldName;
  readonly message:
    | "Enter your name."
    | "Enter your company name."
    | "Enter a valid email address."
    | "Enter a valid phone number."
    | "Choose an interest."
    | "Message must be at least 20 characters."
    | "Message must be at most 4000 characters.";
}

export interface ContactSubmission {
  readonly name: string;
  readonly company: string;
  readonly workEmail: string;
  readonly phone: string;
  readonly interest: Interest;
  readonly message: string;
}

export type ValidationResult =
  | { ok: true; value: ContactSubmission }
  | { ok: false; error: { code: "VALIDATION_FAILED"; fieldErrors: readonly FieldError[] } };

export const NAME_MAX_LENGTH = 100;
export const COMPANY_MAX_LENGTH = 150;
export const WORK_EMAIL_MAX_LENGTH = 254;
export const PHONE_MAX_LENGTH = 20;
export const MESSAGE_MIN_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 4000;

// WHATWG HTML "valid email address", as stated in api-contract.yaml.
const WHATWG_EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_PATTERN = /^[0-9 +()-]*$/;

// The contract counts length in Unicode code points, not UTF-16 units.
export function codePointLength(value: string): number {
  return [...value].length;
}

// Checked by code point so the rule needs no control-character regex literal.
export function containsControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint <= 0x1f || codePoint === 0x7f) return true;
  }
  return false;
}

export function isValidEmail(value: string): boolean {
  return codePointLength(value) <= WORK_EMAIL_MAX_LENGTH && WHATWG_EMAIL_PATTERN.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type TextField =
  | { readonly present: false }
  | { readonly present: true; readonly text: string | null };

// Absent means "not in the object". A present non-string value yields text null, which
// fails every rule.
function readTextField(input: Record<string, unknown>, key: FieldName): TextField {
  if (!Object.hasOwn(input, key) || input[key] === undefined) return { present: false };
  const raw = input[key];
  return { present: true, text: typeof raw === "string" ? raw.trim() : null };
}

function isBoundedPlainText(
  field: TextField,
  maxLength: number,
): field is { present: true; text: string } {
  if (!field.present || field.text === null) return false;
  const length = codePointLength(field.text);
  return length >= 1 && length <= maxLength && !containsControlCharacter(field.text);
}

function isInterest(value: unknown): value is Interest {
  return typeof value === "string" && (INTEREST_OPTIONS as readonly string[]).includes(value);
}

// Returns the normalized phone, or null when the value fails FR-023.
function normalizePhone(field: TextField, callingCodes: ReadonlySet<string>): string | null {
  if (!field.present) return "";
  if (field.text === null) return null;
  const phone = field.text;
  if (phone === "") return "";
  // FR-023: a prefilled calling code left untouched means "not provided".
  if (phone.startsWith("+") && callingCodes.has(phone.slice(1))) return "";
  if (codePointLength(phone) > PHONE_MAX_LENGTH || !PHONE_PATTERN.test(phone)) return null;
  return phone;
}

// callingCodes holds digits without "+", as produced by listCallingCodes() or read from
// the data-calling-codes attribute.
export function validateContactSubmission(
  input: unknown,
  callingCodes: ReadonlySet<string>,
): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: { code: "VALIDATION_FAILED", fieldErrors: [] } };
  }

  const fieldErrors: FieldError[] = [];

  const name = readTextField(input, "name");
  if (!isBoundedPlainText(name, NAME_MAX_LENGTH)) {
    fieldErrors.push({ field: "name", message: FIELD_ERROR_MESSAGES.name });
  }

  const company = readTextField(input, "company");
  if (!isBoundedPlainText(company, COMPANY_MAX_LENGTH)) {
    fieldErrors.push({ field: "company", message: FIELD_ERROR_MESSAGES.company });
  }

  const workEmail = readTextField(input, "workEmail");
  const validWorkEmail =
    workEmail.present && workEmail.text !== null && isValidEmail(workEmail.text);
  if (!validWorkEmail) {
    fieldErrors.push({ field: "workEmail", message: FIELD_ERROR_MESSAGES.workEmail });
  }

  const phone = normalizePhone(readTextField(input, "phone"), callingCodes);
  if (phone === null) {
    fieldErrors.push({ field: "phone", message: FIELD_ERROR_MESSAGES.phone });
  }

  // FR-025: exact comparison, no trimming.
  const interest = input["interest"];
  if (!isInterest(interest)) {
    fieldErrors.push({ field: "interest", message: FIELD_ERROR_MESSAGES.interest });
  }

  const message = readTextField(input, "message");
  const messageText = message.present && message.text !== null ? message.text : "";
  const messageLength = codePointLength(messageText);
  if (messageLength < MESSAGE_MIN_LENGTH) {
    fieldErrors.push({ field: "message", message: FIELD_ERROR_MESSAGES.messageTooShort });
  } else if (messageLength > MESSAGE_MAX_LENGTH) {
    fieldErrors.push({ field: "message", message: FIELD_ERROR_MESSAGES.messageTooLong });
  }

  if (
    fieldErrors.length > 0 ||
    !name.present ||
    name.text === null ||
    !company.present ||
    company.text === null ||
    !workEmail.present ||
    workEmail.text === null ||
    phone === null ||
    !isInterest(interest)
  ) {
    return { ok: false, error: { code: "VALIDATION_FAILED", fieldErrors } };
  }

  return {
    ok: true,
    value: {
      name: name.text,
      company: company.text,
      workEmail: workEmail.text,
      phone,
      interest,
      message: messageText,
    },
  };
}
