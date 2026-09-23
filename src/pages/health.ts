import type { APIRoute } from "astro";
import { HEALTH_STATUS } from "../lib/api-types";

// NFR-010: on demand so a 200 proves the process is running, not that a file exists.
export const prerender = false;

// No configuration or SMTP dependency: /health MUST answer 200 while SMTP is down.
export const GET: APIRoute = () =>
  new Response(HEALTH_STATUS, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
