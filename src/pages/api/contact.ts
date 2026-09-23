import type { APIRoute } from "astro";
import {
  createDefaultDependencies,
  runContactPipeline,
  toOutcomeLogEntry,
  toResponse,
  UNEXPECTED_FAILURE,
  type PipelineOutcome,
} from "../../lib/contact-pipeline";
import { writeOutcomeLog } from "../../lib/outcome-log";

// C-05. On demand because every request needs the FR-053 checks, rate limit, and SMTP.
export const prerender = false;

// One rate-limit store per process (ADR-005).
const dependencies = createDefaultDependencies();

// ALL receives every method so the pipeline answers non-POST requests with 405 itself.
export const ALL: APIRoute = async (context) => {
  let outcome: PipelineOutcome;
  try {
    outcome = await runContactPipeline(context.request, () => context.clientAddress, dependencies);
  } catch {
    // No exception may reach the adapter (architecture section 5.1). The error object
    // is not logged because it can carry field values (NFR-017).
    outcome = UNEXPECTED_FAILURE;
  }
  writeOutcomeLog(toOutcomeLogEntry(outcome, new Date()));
  return toResponse(outcome);
};

export const POST: APIRoute = ALL;
