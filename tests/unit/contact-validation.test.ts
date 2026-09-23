import { describe, expect, it } from "vitest";
import { callingCodeSet } from "../../src/lib/calling-codes";
import { type FieldName, validateContactSubmission } from "../../src/lib/contact-validation";

const CALLING_CODES = callingCodeSet();

const VALID = {
  name: "Priya Raman",
  company: "Northaid Logistics",
  workEmail: "ops@northaid.example",
  phone: "+91 98450 12345",
  interest: "Services",
  message: "We plan to move from ECC to S/4HANA Cloud next year and need a partner.",
  turnstileToken: "XXXX.DUMMY.TOKEN.XXXX",
};

function validate(overrides: Record<string, unknown>) {
  return validateContactSubmission({ ...VALID, ...overrides }, CALLING_CODES);
}

function without(field: FieldName) {
  const copy: Record<string, unknown> = { ...VALID };
  delete copy[field];
  return validateContactSubmission(copy, CALLING_CODES);
}

function errorsOf(result: ReturnType<typeof validateContactSubmission>) {
  return result.ok ? [] : result.error.fieldErrors;
}

function expectOnlyError(
  result: ReturnType<typeof validateContactSubmission>,
  field: FieldName,
  message: string,
) {
  expect(result.ok).toBe(false);
  expect(errorsOf(result)).toEqual([{ field, message }]);
}

describe("validateContactSubmission: body shape (FR-027)", () => {
  it("accepts a valid submission and ignores unknown properties", () => {
    const result = validate({ extra: "ignored" });
    expect(result).toEqual({
      ok: true,
      value: {
        name: "Priya Raman",
        company: "Northaid Logistics",
        workEmail: "ops@northaid.example",
        phone: "+91 98450 12345",
        interest: "Services",
        message: VALID.message,
      },
    });
  });

  it.each([null, [], "text", 42, true])("returns empty fieldErrors for non-object %j", (input) => {
    expect(validateContactSubmission(input, CALLING_CODES)).toEqual({
      ok: false,
      error: { code: "VALIDATION_FAILED", fieldErrors: [] },
    });
  });

  it("reports every failing field in form order", () => {
    const result = validateContactSubmission({}, CALLING_CODES);
    expect(errorsOf(result).map((error) => error.field)).toEqual([
      "name",
      "company",
      "workEmail",
      "interest",
      "message",
    ]);
  });

  it("reports all six fields in form order when all fail", () => {
    const result = validateContactSubmission(
      { name: 1, company: 1, workEmail: 1, phone: 1, interest: 1, message: 1 },
      CALLING_CODES,
    );
    expect(errorsOf(result)).toEqual([
      { field: "name", message: "Enter your name." },
      { field: "company", message: "Enter your company name." },
      { field: "workEmail", message: "Enter a valid email address." },
      { field: "phone", message: "Enter a valid phone number." },
      { field: "interest", message: "Choose an interest." },
      { field: "message", message: "Message must be at least 20 characters." },
    ]);
  });

  it("does not validate the Turnstile token as a field", () => {
    expect(validate({ turnstileToken: undefined }).ok).toBe(true);
    expect(validate({ turnstileToken: 5 }).ok).toBe(true);
  });
});

describe("FR-020 Name", () => {
  it("trims the value", () => {
    const result = validate({ name: "  Priya  " });
    expect(result.ok && result.value.name).toBe("Priya");
  });
  it.each(["", "   ", null, 7])("rejects %j", (name) => {
    expectOnlyError(validate({ name }), "name", "Enter your name.");
  });
  it("rejects an absent name", () => {
    expectOnlyError(without("name"), "name", "Enter your name.");
  });
  it("accepts exactly 100 characters and rejects 101", () => {
    expect(validate({ name: "a".repeat(100) }).ok).toBe(true);
    expectOnlyError(validate({ name: "a".repeat(101) }), "name", "Enter your name.");
  });
  it("counts code points, not UTF-16 units", () => {
    expect(validate({ name: "\u{1F600}".repeat(100) }).ok).toBe(true);
    expect(validate({ name: "\u{1F600}".repeat(101) }).ok).toBe(false);
  });
  it.each(["Pri\u0000ya", "Pri\u001Fya", "Pri\u007Fya", "Pri\nya", "Pri\tya"])(
    "rejects control character in %j",
    (name) => {
      expectOnlyError(validate({ name }), "name", "Enter your name.");
    },
  );
});

describe("FR-021 Company", () => {
  it.each(["", "   "])("rejects %j", (company) => {
    expectOnlyError(validate({ company }), "company", "Enter your company name.");
  });
  it("accepts exactly 150 characters and rejects 151", () => {
    expect(validate({ company: "c".repeat(150) }).ok).toBe(true);
    expectOnlyError(validate({ company: "c".repeat(151) }), "company", "Enter your company name.");
  });
  it("rejects control characters", () => {
    expectOnlyError(
      validate({ company: "Acme\u0007Steel" }),
      "company",
      "Enter your company name.",
    );
  });
});

describe("FR-022 Work email", () => {
  const label = "a".repeat(63);
  // 64 + 1 + (63 + 1) * 2 + 61 = 254 code points.
  const email254 = `${"l".repeat(64)}@${label}.${label}.${"b".repeat(61)}`;

  it("accepts personal domains and trims", () => {
    const result = validate({ workEmail: "  someone@gmail.com " });
    expect(result.ok && result.value.workEmail).toBe("someone@gmail.com");
  });
  it.each([
    "",
    "name.company.com",
    "a b@example.com",
    "a@exa mple.com",
    "a@example.com\r\nBcc: x@y.z",
    "a\n@example.com",
    "@example.com",
    "a@",
    "a@-example.com",
  ])("rejects %j", (workEmail) => {
    expectOnlyError(validate({ workEmail }), "workEmail", "Enter a valid email address.");
  });
  it("accepts exactly 254 characters and rejects 255", () => {
    expect(email254.length).toBe(254);
    expect(validate({ workEmail: email254 }).ok).toBe(true);
    expectOnlyError(
      validate({ workEmail: `l${email254}` }),
      "workEmail",
      "Enter a valid email address.",
    );
  });
  it("rejects a non-string value", () => {
    expectOnlyError(
      validate({ workEmail: ["a@example.com"] }),
      "workEmail",
      "Enter a valid email address.",
    );
  });
});

describe("FR-023 Phone", () => {
  it("accepts an absent phone as not provided", () => {
    const result = without("phone");
    expect(result.ok && result.value.phone).toBe("");
  });
  it.each(["", "   "])("accepts %j as not provided", (phone) => {
    const result = validate({ phone });
    expect(result.ok && result.value.phone).toBe("");
  });
  it.each(["+91", "+65 ", " +1", "+44"])(
    "treats a calling code alone (%j) as not provided",
    (phone) => {
      const result = validate({ phone });
      expect(result.ok && result.value.phone).toBe("");
    },
  );
  it("keeps a digit sequence that is not a calling code", () => {
    const result = validate({ phone: "+999" });
    expect(result.ok && result.value.phone).toBe("+999");
  });
  it("accepts exactly 20 valid characters and rejects 21", () => {
    expect(validate({ phone: "+91 (984) 501-234567" }).ok).toBe(true);
    expectOnlyError(
      validate({ phone: "+91 (984) 501-2345678" }),
      "phone",
      "Enter a valid phone number.",
    );
  });
  it.each(["+91 98AB", "98450.12345", "+91\t9845", "ext 12"])("rejects %j", (phone) => {
    expectOnlyError(validate({ phone }), "phone", "Enter a valid phone number.");
  });
  it.each([null, 9845012345])("rejects non-string %j", (phone) => {
    expectOnlyError(validate({ phone }), "phone", "Enter a valid phone number.");
  });
});

describe("FR-025 Interest", () => {
  it.each(["Services", "Solutions", "Products", "Careers", "Other"])("accepts %s", (interest) => {
    expect(validate({ interest }).ok).toBe(true);
  });
  it.each(["", "Admin", "services", " Services", "Services ", null])("rejects %j", (interest) => {
    expectOnlyError(validate({ interest }), "interest", "Choose an interest.");
  });
  it("rejects an unselected interest", () => {
    expectOnlyError(without("interest"), "interest", "Choose an interest.");
  });
});

describe("FR-026 Message", () => {
  it("accepts exactly 20 and exactly 4000 characters", () => {
    expect(validate({ message: "m".repeat(20) }).ok).toBe(true);
    expect(validate({ message: "m".repeat(4000) }).ok).toBe(true);
  });
  it("rejects 19 and whitespace-only as too short", () => {
    expectOnlyError(
      validate({ message: "m".repeat(19) }),
      "message",
      "Message must be at least 20 characters.",
    );
    expectOnlyError(
      validate({ message: " ".repeat(40) }),
      "message",
      "Message must be at least 20 characters.",
    );
    expectOnlyError(without("message"), "message", "Message must be at least 20 characters.");
  });
  it("rejects 4001 as too long", () => {
    expectOnlyError(
      validate({ message: "m".repeat(4001) }),
      "message",
      "Message must be at most 4000 characters.",
    );
  });
  it("counts trimmed code points", () => {
    expect(validate({ message: `   ${"m".repeat(4000)}   ` }).ok).toBe(true);
    expectOnlyError(
      validate({ message: `  ${"m".repeat(19)}  ` }),
      "message",
      "Message must be at least 20 characters.",
    );
  });
  it("accepts 4000 characters of 4-byte Unicode within the 65,536-byte body limit", () => {
    const message = "\u{1F600}".repeat(4000);
    expect(validate({ message }).ok).toBe(true);
    expect(
      new TextEncoder().encode(JSON.stringify({ ...VALID, message })).length,
    ).toBeLessThanOrEqual(65_536);
  });
  it("preserves inner line breaks", () => {
    const message = "First line of the enquiry.\r\nSecond line.\n\nThird.";
    const result = validate({ message });
    expect(result.ok && result.value.message).toBe(message);
  });
});
