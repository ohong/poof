import "server-only";
import { getRun } from "workflow/api";
import { HttpError } from "@/lib/http";
const terminal = ["completed", "failed", "cancelled"];
export async function stopProcessing(runId: string) {
  const run = getRun(runId);
  try {
    if (terminal.includes(await run.status)) return;
    await run.cancel();
  } catch {
    // Completion can race with cancellation. A terminal run needs no further stop.
    try {
      if (terminal.includes(await run.status)) return;
    } catch {
      /* Retry with the run service available. */
    }
    throw new HttpError(
      409,
      "Processing is still stopping. Please retry removal shortly.",
    );
  }
}
