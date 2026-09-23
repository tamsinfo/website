import { afterEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES, ERROR_STATUS, type ErrorCode } from "../../src/lib/api-types";
import {
  bannerMessage,
  CONTACT_ENDPOINT,
  createContactFormController,
  errorIdFor,
  fieldSummaryText,
  INITIAL_FORM_STATE,
  interpretResponse,
  parseCallingCodes,
  postEnquiry,
  RATE_LIMIT_MESSAGE,
  SEND_FAILURE_MESSAGE,
  SUBMIT_TIMEOUT_MS,
  type ContactFormDependencies,
  type FetchLike,
  type FormState,
  type FormValues,
} from "../../src/lib/contact-form-state";

const CALLING_CODES: ReadonlySet<string> = new Set(["1", "65", "91"]);

const INITIAL_VALUES: FormValues = {
  name: "",
  company: "",
  workEmail: "",
  phone: "+65 ",
  interest: "",
  message: "",
};

const VALID_VALUES: FormValues = {
  name: "  Priya Raman ",
  company: "Northaid Logistics",
  workEmail: "  ops@northaid.example  ",
  phone: "+65 ",
  interest: "Products",
  message: "We plan to move from ECC to S/4HANA Cloud next year and need a partner.",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorBody(code: ErrorCode): unknown {
  return code === "VALIDATION_FAILED" ? { code, fieldErrors: [] } : { code };
}

interface Harness {
  readonly states: FormState[];
  readonly fetchMock: ReturnType<typeof vi.fn<FetchLike>>;
  readonly resetToken: ReturnType<typeof vi.fn<() => void>>;
  readonly controller: ReturnType<typeof createContactFormController>;
}

function setup(respond: FetchLike, token: string | null = "TOKEN-1"): Harness {
  const states: FormState[] = [];
  const fetchMock = vi.fn<FetchLike>(respond);
  const resetToken = vi.fn<() => void>();
  const dependencies: ContactFormDependencies = {
    fetch: fetchMock,
    readToken: () => token,
    resetToken,
    callingCodes: CALLING_CODES,
  };
  const controller = createContactFormController(dependencies, INITIAL_VALUES, (state) => {
    states.push(state);
  });
  return { states, fetchMock, resetToken, controller };
}

/** A fetch that never settles until its signal aborts, like a hung server. */
const hangingFetch: FetchLike = (_input, init) =>
  new Promise<Response>((_resolve, reject) => {
    init.signal?.addEventListener("abort", () => {
      reject(new DOMException("The operation was aborted.", "AbortError"));
    });
  });

afterEach(() => {
  vi.useRealTimers();
});

describe("interpretResponse (ui-specification.md section 7.1)", () => {
  it("accepts a 200 with a contract reference", () => {
    expect(interpretResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" })).toEqual({
      kind: "accepted",
      reference: "TAMS-2026-7K3Q",
    });
  });

  it("treats a 200 without a valid reference as unexpected", () => {
    expect(interpretResponse(200, { status: "sent", reference: "TAMS-2026-0412" }).kind).toBe(
      "send-failure",
    );
    expect(interpretResponse(200, { status: "sent" }).kind).toBe("send-failure");
    expect(interpretResponse(200, undefined).kind).toBe("send-failure");
  });

  it("renders VALIDATION_FAILED field entries in field order", () => {
    const outcome = interpretResponse(400, {
      code: "VALIDATION_FAILED",
      fieldErrors: [
        { field: "message", message: "Message must be at least 20 characters." },
        { field: "workEmail", message: "Enter a valid email address." },
      ],
    });
    expect(outcome).toEqual({
      kind: "field-errors",
      fieldErrors: [
        { field: "workEmail", message: "Enter a valid email address." },
        { field: "message", message: "Message must be at least 20 characters." },
      ],
    });
  });

  it("falls back to the send-failure message for VALIDATION_FAILED with no usable entries", () => {
    expect(interpretResponse(400, { code: "VALIDATION_FAILED", fieldErrors: [] })).toEqual({
      kind: "send-failure",
      reason: "unexpected",
    });
    expect(
      interpretResponse(400, {
        code: "VALIDATION_FAILED",
        fieldErrors: [{ field: "admin", message: "Enter your name." }],
      }).kind,
    ).toBe("send-failure");
  });

  it("maps RATE_LIMITED to the rate-limit message", () => {
    expect(interpretResponse(429, { code: "RATE_LIMITED" })).toEqual({ kind: "rate-limited" });
  });

  it.each([
    "SPAM_CHECK_FAILED",
    "SEND_FAILED",
    "PAYLOAD_TOO_LARGE",
    "UNSUPPORTED_MEDIA_TYPE",
    "METHOD_NOT_ALLOWED",
  ] as const)("maps %s to the send-failure message", (code) => {
    expect(interpretResponse(ERROR_STATUS[code], { code })).toEqual({
      kind: "send-failure",
      reason: code,
    });
  });

  it("branches on code, not on status", () => {
    expect(interpretResponse(403, { code: "RATE_LIMITED" })).toEqual({ kind: "rate-limited" });
  });

  it("treats an unknown code, a missing body, and status 500 as unexpected", () => {
    expect(interpretResponse(500, { code: "INTERNAL" })).toEqual({
      kind: "send-failure",
      reason: "unexpected",
    });
    expect(interpretResponse(500, undefined).kind).toBe("send-failure");
    expect(interpretResponse(502, "SEND_FAILED").kind).toBe("send-failure");
  });

  it("covers every code in the contract enum", () => {
    for (const code of ERROR_CODES) {
      expect(interpretResponse(ERROR_STATUS[code], errorBody(code)).kind).not.toBe("accepted");
    }
  });
});

describe("postEnquiry (submitContactEnquiry caller)", () => {
  it("POSTs JSON to the contract path", async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    const payload = {
      name: "Priya Raman",
      company: "Northaid Logistics",
      workEmail: "ops@northaid.example",
      phone: "",
      interest: "Services" as const,
      message: "We plan to move from ECC to S/4HANA Cloud next year and need a partner.",
      turnstileToken: "TOKEN-1",
    };
    await postEnquiry(payload, fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(input).toBe(CONTACT_ENDPOINT);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it("reports a network failure as send-failure", async () => {
    const outcome = await postEnquiry({ ...validPayload(), turnstileToken: "T" }, async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(outcome).toEqual({ kind: "send-failure", reason: "network" });
  });

  it("reports a non-JSON error body as unexpected", async () => {
    const outcome = await postEnquiry(
      { ...validPayload(), turnstileToken: "T" },
      async () => new Response("<html>Bad gateway</html>", { status: 502 }),
    );
    expect(outcome).toEqual({ kind: "send-failure", reason: "unexpected" });
  });

  it("abandons the request after 15 seconds (FR-039)", async () => {
    vi.useFakeTimers();
    let settled = false;
    const pending = postEnquiry({ ...validPayload(), turnstileToken: "T" }, hangingFetch).then(
      (outcome) => {
        settled = true;
        return outcome;
      },
    );
    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual({ kind: "send-failure", reason: "timeout" });
  });
});

function validPayload(): {
  name: string;
  company: string;
  workEmail: string;
  phone: string;
  interest: "Services";
  message: string;
} {
  return {
    name: "Priya Raman",
    company: "Northaid Logistics",
    workEmail: "ops@northaid.example",
    phone: "",
    interest: "Services",
    message: "We plan to move from ECC to S/4HANA Cloud next year and need a partner.",
  };
}

describe("controller: client validation (FR-020 to FR-026, FR-037)", () => {
  it("starts in state A", () => {
    const { controller } = setup(async () => jsonResponse(500, {}));
    expect(controller.getState()).toEqual(INITIAL_FORM_STATE);
  });

  it("shows every field error at once, sends nothing, and focuses the first invalid field", async () => {
    const { controller, fetchMock } = setup(async () => jsonResponse(500, {}));
    const effect = await controller.submit(INITIAL_VALUES);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(effect).toEqual({ sent: false, focus: "name" });
    const state = controller.getState();
    expect(state.phase).toBe("editing");
    if (state.phase !== "editing") return;
    expect(state.fieldErrors.map((error) => error.field)).toEqual([
      "name",
      "company",
      "workEmail",
      "interest",
      "message",
    ]);
    expect(state.fieldErrors.find((error) => error.field === "interest")?.message).toBe(
      "Choose an interest.",
    );
  });

  it("treats the untouched calling-code prefill as an empty phone", async () => {
    const { controller, fetchMock } = setup(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    await controller.submit(VALID_VALUES);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1].body)) as Record<string, unknown>;
    expect(body["phone"]).toBe("");
    expect(body["name"]).toBe("Priya Raman");
    expect(body["workEmail"]).toBe("ops@northaid.example");
    expect(body["turnstileToken"]).toBe("TOKEN-1");
  });

  it("clears a corrected field's error on the next submit", async () => {
    const { controller } = setup(async () => jsonResponse(500, {}));
    await controller.submit({ ...VALID_VALUES, workEmail: "ops@northaid" });
    const fixed = await controller.submit({ ...VALID_VALUES, name: "" });
    expect(fixed.focus).toBe("name");
    const state = controller.getState();
    if (state.phase !== "editing") throw new Error("expected editing");
    expect(state.fieldErrors.map((error) => error.field)).toEqual(["name"]);
  });

  it("sends an empty token when Turnstile has none, so the server answers 403", async () => {
    const { controller, fetchMock } = setup(
      async () => jsonResponse(403, { code: "SPAM_CHECK_FAILED" }),
      null,
    );
    await controller.submit(VALID_VALUES);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1].body)) as Record<string, unknown>;
    expect(body["turnstileToken"]).toBe("");
    const state = controller.getState();
    expect(state.phase === "editing" && state.banner).toBe("send-failure");
  });
});

describe("controller: server outcomes", () => {
  it("renders a 400 VALIDATION_FAILED inline and focuses the first invalid field", async () => {
    const { controller } = setup(async () =>
      jsonResponse(400, {
        code: "VALIDATION_FAILED",
        fieldErrors: [{ field: "company", message: "Enter your company name." }],
      }),
    );
    const effect = await controller.submit(VALID_VALUES);
    expect(effect).toEqual({ sent: true, focus: "company" });
    expect(controller.getState()).toEqual({
      phase: "editing",
      fieldErrors: [{ field: "company", message: "Enter your company name." }],
      banner: null,
    });
  });

  it("shows the rate-limit banner for RATE_LIMITED (FR-049)", async () => {
    const { controller } = setup(async () => jsonResponse(429, { code: "RATE_LIMITED" }));
    const effect = await controller.submit(VALID_VALUES);
    expect(effect.focus).toBeNull();
    expect(controller.getState()).toEqual({
      phase: "editing",
      fieldErrors: [],
      banner: "rate-limited",
    });
    expect(bannerMessage("rate-limited")).toBe(RATE_LIMIT_MESSAGE);
  });

  it.each([
    "SPAM_CHECK_FAILED",
    "SEND_FAILED",
    "PAYLOAD_TOO_LARGE",
    "UNSUPPORTED_MEDIA_TYPE",
    "METHOD_NOT_ALLOWED",
  ] as const)("shows the send-failure banner for %s and re-enables Send (FR-038)", async (code) => {
    const { controller, resetToken } = setup(async () =>
      jsonResponse(ERROR_STATUS[code], { code }),
    );
    await controller.submit(VALID_VALUES);
    expect(controller.getState()).toEqual({
      phase: "editing",
      fieldErrors: [],
      banner: "send-failure",
    });
    expect(resetToken).toHaveBeenCalledTimes(1);
    expect(bannerMessage("send-failure")).toBe(SEND_FAILURE_MESSAGE);
  });

  it("shows the send-failure banner for status 500 and a network failure", async () => {
    const serverError = setup(async () => new Response("", { status: 500 }));
    await serverError.controller.submit(VALID_VALUES);
    expect(serverError.controller.getState()).toMatchObject({ banner: "send-failure" });

    const offline = setup(async () => {
      throw new TypeError("Failed to fetch");
    });
    await offline.controller.submit(VALID_VALUES);
    expect(offline.controller.getState()).toMatchObject({ banner: "send-failure" });
  });

  it("times out after 15 seconds into the send-failure banner and allows a retry", async () => {
    vi.useFakeTimers();
    const { controller, fetchMock, states } = setup(hangingFetch);
    const pending = controller.submit(VALID_VALUES);
    expect(controller.getState()).toEqual({ phase: "submitting" });
    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS);
    await pending;
    expect(controller.getState()).toEqual({
      phase: "editing",
      fieldErrors: [],
      banner: "send-failure",
    });
    expect(states.map((state) => state.phase)).toEqual(["submitting", "editing"]);

    fetchMock.mockImplementation(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    await controller.submit(VALID_VALUES);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(controller.getState().phase).toBe("sent");
  });
});

describe("controller: double-submit prevention (FR-040)", () => {
  it("sends exactly one request for a double click", async () => {
    const deferred = Promise.withResolvers<Response>();
    const { controller, fetchMock } = setup(() => deferred.promise);
    const first = controller.submit(VALID_VALUES);
    const second = await controller.submit(VALID_VALUES);
    const third = await controller.submit(VALID_VALUES);
    expect(second).toEqual({ sent: false, focus: null });
    expect(third).toEqual({ sent: false, focus: null });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    deferred.resolve(jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }));
    await first;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores submit in the thank-you state", async () => {
    const { controller, fetchMock } = setup(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    await controller.submit(VALID_VALUES);
    const again = await controller.submit(VALID_VALUES);
    expect(again.sent).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("controller: thank-you state (FR-036, FR-054)", () => {
  it("shows Sent to = trimmed Work email, Topic = Interest, Reference = 200 body", async () => {
    const { controller, resetToken } = setup(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    const effect = await controller.submit(VALID_VALUES);
    expect(effect).toEqual({ sent: true, focus: "thank-you-heading" });
    expect(controller.getState()).toEqual({
      phase: "sent",
      rows: { sentTo: "ops@northaid.example", topic: "Products", reference: "TAMS-2026-7K3Q" },
    });
    expect(resetToken).not.toHaveBeenCalled();
  });
});

describe("controller: Send another message (FR-055)", () => {
  it("returns state A with the FR-024 prefill, Interest unselected, a fresh token, and focus on Name", async () => {
    const { controller, resetToken } = setup(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    await controller.submit(VALID_VALUES);
    const effect = controller.reset();
    expect(effect).toEqual({ values: INITIAL_VALUES, focus: "name" });
    expect(effect.values.phone).toBe("+65 ");
    expect(effect.values.interest).toBe("");
    expect(controller.getState()).toEqual(INITIAL_FORM_STATE);
    expect(resetToken).toHaveBeenCalledTimes(1);
  });

  it("allows a second submission after the reset", async () => {
    const { controller, fetchMock } = setup(async () =>
      jsonResponse(200, { status: "sent", reference: "TAMS-2026-7K3Q" }),
    );
    await controller.submit(VALID_VALUES);
    controller.reset();
    await controller.submit(VALID_VALUES);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does nothing outside the thank-you state", () => {
    const { controller, resetToken } = setup(async () => jsonResponse(500, {}));
    expect(controller.reset().focus).toBeNull();
    expect(resetToken).not.toHaveBeenCalled();
  });
});

describe("helpers", () => {
  it("summarizes the error count for the polite live region", () => {
    expect(fieldSummaryText(0)).toBe("");
    expect(fieldSummaryText(1)).toBe("1 field needs attention.");
    expect(fieldSummaryText(5)).toBe("5 fields need attention.");
  });

  it("parses the data-calling-codes attribute", () => {
    expect(parseCallingCodes("1 7 65 91")).toEqual(new Set(["1", "7", "65", "91"]));
    expect(parseCallingCodes(undefined).size).toBe(0);
    expect(parseCallingCodes(" 91  x ").has("91")).toBe(true);
  });

  it("names each error line after its field", () => {
    expect(errorIdFor("workEmail")).toBe("contact-workEmail-error");
  });
});
