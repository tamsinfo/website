import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  isDirectHtmlPath,
  NOT_FOUND_PATH,
  readFallbackCsp,
  REFERRER_POLICY,
} from "./src/lib/http-hardening.ts";

// ADR-002: this wrapper is the only hook that runs before the adapter's static handler.
// It adds Referrer-Policy, a fallback CSP, and the direct .html block.

interface AdapterEntry {
  readonly handler: (request: IncomingMessage, response: ServerResponse) => void;
}

const DEFAULT_PORT = 4321;
const DEFAULT_HOST = "0.0.0.0";

// The adapter would otherwise start its own server on import.
process.env["ASTRO_NODE_AUTOSTART"] = "disabled";

const entry: AdapterEntry = await import(new URL("./dist/server/entry.mjs", import.meta.url).href);

const fallbackCsp = readFallbackCsp(new URL("./dist/_headers.json", import.meta.url));
if (!fallbackCsp.ok) {
  // Serving without a CSP would break NFR-011 silently, so refuse to start.
  throw new Error(`Cannot start: ${fallbackCsp.error.code} for dist/_headers.json`);
}
const FALLBACK_CSP = fallbackCsp.value;

const server = createServer((request, response) => {
  response.setHeader("Referrer-Policy", REFERRER_POLICY);
  // The adapter overwrites this for prerendered routes and Astro for /contact.
  response.setHeader("Content-Security-Policy", FALLBACK_CSP);
  if (request.url !== undefined && isDirectHtmlPath(request.url)) {
    request.url = NOT_FOUND_PATH;
  }
  entry.handler(request, response);
});

function shutDown(): void {
  server.close();
  server.closeIdleConnections();
}

process.once("SIGTERM", shutDown);
process.once("SIGINT", shutDown);

server.listen(Number(process.env["PORT"] ?? DEFAULT_PORT), process.env["HOST"] ?? DEFAULT_HOST);
