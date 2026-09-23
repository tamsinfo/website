/**
 * Class strings for the Contact form controls (TASK-005, design-system.md 7.2 to 7.4).
 * Token utilities only. Tailwind scans this file, so each class is written in full.
 *
 * The error chrome keys off aria-invalid, which contact-form-client.ts sets, so the
 * markup needs no second class list for state B: border --border-width-thick in
 * --color-danger (design-system/02-actions-and-forms.jsx error example).
 */

const CONTROL_BASE =
  "w-full rounded-sm border border-border bg-surface font-sans text-text placeholder:text-text-subtle aria-invalid:border-(length:--border-width-thick) aria-invalid:border-danger";

/** Text input: 48 px tall, 16 px side padding. */
export const INPUT_CLASS = `${CONTROL_BASE} h-12 px-4 text-15 leading-4.5`;

/**
 * Native select styled as the design's closed dropdown (SCR-004 state A). The
 * placeholder option is the required field's :invalid state, so it shows subtle text.
 */
export const SELECT_CLASS = `${CONTROL_BASE} h-12 appearance-none pr-11 pl-4 text-15 leading-4.5 invalid:text-text-subtle`;

/** Option text stays at full contrast inside the open list. */
export const OPTION_CLASS = "text-text";

/** Textarea: 140 px tall (h-35), top-aligned body text. */
export const TEXTAREA_CLASS = `${CONTROL_BASE} block h-35 resize-y p-4 text-15/body`;

export const LABEL_CLASS = "font-sans text-14 font-semibold leading-4.5 text-text";

export const FIELD_ERROR_CLASS = "font-sans text-12 leading-4 text-danger";
