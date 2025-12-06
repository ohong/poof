/**
 * Test script for FLUX image transformation pipeline
 * Run with: bun run scripts/test-flux.ts <image-url>
 */

const BFL_API_URL = "https://api.bfl.ai/v1/flux-2-pro";
const POLL_INTERVAL = 2000;
const MAX_POLL_TIME = 120000;

const FLUX_TRANSFORM_PROMPT = `Professional studio product photograph of the object on a pure white seamless background. Shot on Hasselblad X2D, 80mm lens, f/8, centered composition. Soft diffused lighting from three-point softbox setup, no harsh shadows. Clean, minimal, museum catalog style. Sharp focus on object details. The object is isolated, floating on infinite white. Commercial product photography quality.`;

interface BFLResponse {
  id: string;
  polling_url: string;
}

interface BFLPollResponse {
  status: "Ready" | "Pending" | "Error" | "Failed" | "Request Moderated";
  result?: {
    sample: string;
  };
}

async function pollForResult(pollingUrl: string, apiKey: string): Promise<string | null> {
  const startTime = Date.now();
  console.log("[FLUX] Polling for result...");

  while (Date.now() - startTime < MAX_POLL_TIME) {
    const response = await fetch(pollingUrl, {
      headers: { "x-key": apiKey },
    });

    if (!response.ok) {
      console.error("[FLUX] Poll error:", response.status, await response.text());
      return null;
    }

    const data: BFLPollResponse = await response.json();
    console.log("[FLUX] Status:", data.status);

    if (data.status === "Ready" && data.result?.sample) {
      return data.result.sample;
    }

    if (data.status === "Error" || data.status === "Failed" || data.status === "Request Moderated") {
      console.error("[FLUX] Generation failed:", data);
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  console.error("[FLUX] Polling timeout exceeded");
  return null;
}

async function testFluxTransform(imageUrl: string) {
  const apiKey = process.env.BFL_API_KEY;

  if (!apiKey) {
    console.error("BFL_API_KEY not set in environment");
    process.exit(1);
  }

  console.log("[FLUX] Testing transformation pipeline");
  console.log("[FLUX] Input image:", imageUrl);
  console.log("[FLUX] Prompt:", FLUX_TRANSFORM_PROMPT);
  console.log("");

  // Step 1: Submit the request
  console.log("[FLUX] Submitting to FLUX.2 Pro API...");
  const response = await fetch(BFL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-key": apiKey,
    },
    body: JSON.stringify({
      prompt: FLUX_TRANSFORM_PROMPT,
      input_image: imageUrl,
      width: 1024,
      height: 1024,
      output_format: "jpeg",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[FLUX] API error:", response.status, errorText);
    process.exit(1);
  }

  const data: BFLResponse = await response.json();
  console.log("[FLUX] Request ID:", data.id);
  console.log("[FLUX] Polling URL:", data.polling_url);
  console.log("");

  // Step 2: Poll for result
  const resultUrl = await pollForResult(data.polling_url, apiKey);

  if (!resultUrl) {
    console.error("[FLUX] Failed to get result");
    process.exit(1);
  }

  console.log("");
  console.log("[FLUX] SUCCESS! Transformed image URL:");
  console.log(resultUrl);
  console.log("");
  console.log("(Note: This URL expires in 10 minutes)");
}

// Get image URL from command line args
const imageUrl = process.argv[2];

if (!imageUrl) {
  console.log("Usage: bun run scripts/test-flux.ts <image-url>");
  console.log("");
  console.log("Example:");
  console.log("  bun run scripts/test-flux.ts https://example.com/photo.jpg");
  process.exit(1);
}

testFluxTransform(imageUrl);
