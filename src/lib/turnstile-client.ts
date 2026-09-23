/**
 * C-29 Turnstile client (TASK-005, ADR-007, FR-029, FR-048). Browser only.
 *
 * Loads api.js with render=explicit, renders the widget into the container that
 * carries data-sitekey, and keeps the latest token for the form client.
 * The script is inserted here rather than written into the page markup: an
 * attribute-carrying <script> in an .astro file is left unprocessed, and ADR-002
 * forbids unprocessed scripts. The origin is already in script-src.
 */

export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  readonly sitekey: string;
  readonly appearance: "interaction-only";
  readonly "refresh-expired": "auto";
  readonly callback: (token: string) => void;
  readonly "expired-callback": () => void;
  readonly "error-callback": () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string | null | undefined;
  reset(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileHandle {
  readonly readToken: () => string | null;
  readonly reset: () => void;
}

/** Token holder shared by the widget callbacks and the form client. Pure. */
export function createTokenStore(): {
  readonly read: () => string | null;
  readonly store: (token: string) => void;
  readonly clear: () => void;
} {
  let token: string | null = null;
  return {
    read: () => token,
    store: (next) => {
      token = next === "" ? null : next;
    },
    clear: () => {
      token = null;
    },
  };
}

/**
 * Starts Turnstile for the container. With no container (no TURNSTILE_SITE_KEY,
 * ENT-004) the handle reports no token, and the server answers SPAM_CHECK_FAILED.
 */
export function initTurnstile(container: HTMLElement | null): TurnstileHandle {
  const tokens = createTokenStore();
  const siteKey = container?.dataset["sitekey"];
  if (container === null || siteKey === undefined || siteKey === "") {
    return { readToken: tokens.read, reset: tokens.clear };
  }

  let widgetId: string | null = null;

  function render(api: TurnstileApi, target: HTMLElement, key: string): void {
    widgetId =
      api.render(target, {
        sitekey: key,
        appearance: "interaction-only",
        "refresh-expired": "auto",
        callback: tokens.store,
        "expired-callback": tokens.clear,
        "error-callback": tokens.clear,
      }) ?? null;
  }

  const loaded = window.turnstile;
  if (loaded === undefined) {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      if (window.turnstile !== undefined) render(window.turnstile, container, siteKey);
    });
    document.head.append(script);
  } else {
    render(loaded, container, siteKey);
  }

  return {
    readToken: tokens.read,
    reset: () => {
      tokens.clear();
      if (window.turnstile !== undefined && widgetId !== null) window.turnstile.reset(widgetId);
    },
  };
}
