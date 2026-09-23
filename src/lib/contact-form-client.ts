/**
 * C-28 Contact form client (TASK-005). Browser only.
 *
 * Binds the state machine in contact-form-state.ts to the ContactForm.astro and
 * ThankYouPanel.astro markup. Every decision lives in the state module; this file
 * only reads field values, writes state into the DOM, and moves focus.
 *
 * Markup contract:
 * - form[data-contact-form][data-calling-codes]: fields named per FieldName; the
 *   submit button [data-submit] renders as type="button" so the form sends nothing
 *   without JavaScript (FR-041). This module upgrades it to type="submit".
 * - p#contact-<field>-error: per-field error text (FR-037).
 * - [data-field-summary] (polite) and [data-banner-region] (assertive) live regions.
 * - [data-form-panel] and [data-thank-you] panels; [data-thank-you-heading];
 *   [data-thank-you-value="sentTo|topic|reference"]; [data-send-another].
 * - [data-turnstile][data-sitekey]: the Turnstile container (C-29).
 */

import type { FieldError, FieldName } from "./contact-validation";
import {
  bannerMessage,
  createContactFormController,
  errorIdFor,
  fieldSummaryText,
  FIELD_ORDER,
  parseCallingCodes,
  type FocusTarget,
  type FormState,
  type FormValues,
  type ThankYouRows,
} from "./contact-form-state";
import { initTurnstile } from "./turnstile-client";

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const BANNER_CLASS = "mb-5 rounded-sm bg-danger-soft px-4 py-3 text-14/snug text-danger-on";
const SUMMARY_CLASS = "mb-5 text-14/snug font-semibold text-danger";

function isFieldElement(element: Element | RadioNodeList | null): element is FieldElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function collectFields(form: HTMLFormElement): ReadonlyMap<FieldName, FieldElement> | null {
  const fields = new Map<FieldName, FieldElement>();
  for (const name of FIELD_ORDER) {
    const element = form.elements.namedItem(name);
    if (!isFieldElement(element)) return null;
    fields.set(name, element);
  }
  return fields;
}

function readValues(fields: ReadonlyMap<FieldName, FieldElement>): FormValues {
  const read = (name: FieldName): string => fields.get(name)?.value ?? "";
  return {
    name: read("name"),
    company: read("company"),
    workEmail: read("workEmail"),
    phone: read("phone"),
    interest: read("interest"),
    message: read("message"),
  };
}

function renderMessage(region: HTMLElement | null, text: string, className: string): void {
  if (region === null) return;
  if (text === "") {
    region.replaceChildren();
    return;
  }
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.textContent = text;
  region.replaceChildren(paragraph);
}

function renderFieldErrors(
  form: HTMLFormElement,
  fields: ReadonlyMap<FieldName, FieldElement>,
  fieldErrors: readonly FieldError[],
): void {
  for (const [name, element] of fields) {
    const error = fieldErrors.find((entry) => entry.field === name);
    const errorParagraph = form.querySelector<HTMLElement>(`#${errorIdFor(name)}`);
    if (error === undefined) {
      element.removeAttribute("aria-invalid");
      element.removeAttribute("aria-describedby");
      if (errorParagraph !== null) {
        errorParagraph.textContent = "";
        errorParagraph.hidden = true;
      }
    } else {
      element.setAttribute("aria-invalid", "true");
      element.setAttribute("aria-describedby", errorIdFor(name));
      if (errorParagraph !== null) {
        errorParagraph.textContent = error.message;
        errorParagraph.hidden = false;
      }
    }
  }
}

function renderThankYouRows(panel: HTMLElement, rows: ThankYouRows): void {
  const values: Record<keyof ThankYouRows, string> = rows;
  for (const key of ["sentTo", "topic", "reference"] as const) {
    const target = panel.querySelector<HTMLElement>(`[data-thank-you-value="${key}"]`);
    if (target !== null) target.textContent = values[key];
  }
}

function setBusy(button: HTMLButtonElement, busy: boolean): void {
  if (busy) {
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("aria-busy", "true");
  } else {
    button.removeAttribute("aria-disabled");
    button.removeAttribute("aria-busy");
  }
  const arrow = button.querySelector<HTMLElement>("[data-submit-arrow]");
  const spinner = button.querySelector<HTMLElement>("[data-submit-spinner]");
  if (arrow !== null) arrow.hidden = busy;
  if (spinner !== null) spinner.hidden = !busy;
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("form[data-contact-form]");
  const formPanel = document.querySelector<HTMLElement>("[data-form-panel]");
  const thankYou = document.querySelector<HTMLElement>("[data-thank-you]");
  if (form === null || formPanel === null || thankYou === null) return;

  const fields = collectFields(form);
  const submitButton = form.querySelector<HTMLButtonElement>("[data-submit]");
  if (fields === null || submitButton === null) return;

  const summaryRegion = form.querySelector<HTMLElement>("[data-field-summary]");
  const bannerRegion = form.querySelector<HTMLElement>("[data-banner-region]");
  const heading = thankYou.querySelector<HTMLElement>("[data-thank-you-heading]");
  const sendAnother = thankYou.querySelector<HTMLButtonElement>("[data-send-another]");

  // FR-024: the server-rendered value is the state-A Phone content.
  const phoneField = fields.get("phone");
  const initialValues: FormValues = {
    name: "",
    company: "",
    workEmail: "",
    phone: phoneField instanceof HTMLInputElement ? phoneField.defaultValue : "",
    interest: "",
    message: "",
  };

  const turnstile = initTurnstile(form.querySelector<HTMLElement>("[data-turnstile]"));

  function render(state: FormState): void {
    formPanel?.toggleAttribute("hidden", state.phase === "sent");
    thankYou?.toggleAttribute("hidden", state.phase !== "sent");
    if (submitButton !== null) setBusy(submitButton, state.phase === "submitting");
    if (state.phase === "sent") {
      if (thankYou !== null) renderThankYouRows(thankYou, state.rows);
      return;
    }
    if (form === null || fields === null) return;
    const fieldErrors = state.phase === "editing" ? state.fieldErrors : [];
    renderFieldErrors(form, fields, fieldErrors);
    renderMessage(summaryRegion, fieldSummaryText(fieldErrors.length), SUMMARY_CLASS);
    const banner = state.phase === "editing" ? state.banner : null;
    renderMessage(bannerRegion, banner === null ? "" : bannerMessage(banner), BANNER_CLASS);
  }

  function moveFocus(target: FocusTarget): void {
    if (target === null) return;
    if (target === "thank-you-heading") {
      heading?.focus();
      return;
    }
    fields?.get(target)?.focus();
  }

  const controller = createContactFormController(
    {
      fetch: (input, init) => fetch(input, init),
      readToken: turnstile.readToken,
      resetToken: turnstile.reset,
      callingCodes: parseCallingCodes(form.dataset["callingCodes"]),
    },
    initialValues,
    render,
  );

  submitButton.type = "submit";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void controller.submit(readValues(fields)).then((effect) => moveFocus(effect.focus));
  });

  sendAnother?.addEventListener("click", () => {
    const effect = controller.reset();
    for (const [name, element] of fields) element.value = effect.values[name];
    moveFocus(effect.focus);
  });
}
