import { sleep } from "workflow";
import {
  loadOriginal,
  analyze,
  beginImage,
  checkImage,
  saveImage,
  finish,
  fail,
} from "./steps";
export async function processItem(id: string, userId: string) {
  "use workflow";
  console.log("poof.processing.start", id);
  try {
    await loadOriginal(id, userId);
    const results = await Promise.all([
      analyze(id, userId),
      beginImage(id, userId),
    ]);
    let imageWarning = results[1].warning;
    if (results[1].job) {
      let completed = false;
      for (let attempt = 0; attempt < 48; attempt++) {
        await sleep("5s");
        const result = await checkImage(results[1].job);
        if (result.state === "ready") {
          await saveImage(id, userId, result.url);
          completed = true;
          break;
        }
        if (result.state === "failed") {
          imageWarning =
            "The clean image could not be created. Your original is safe.";
          completed = true;
          break;
        }
      }
      if (!completed)
        imageWarning =
          "Image processing timed out. Your original is safe; you can retry.";
    }
    await finish(
      id,
      userId,
      [results[0], imageWarning].filter(Boolean).join(" ") || null,
    );
  } catch {
    await fail(id, userId);
  }
}
