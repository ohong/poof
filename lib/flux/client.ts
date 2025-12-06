import { createServerClient, getStorageUrl } from "@/lib/supabase/server";

// FLUX.2 Pro - supports both generation and multi-reference editing
const BFL_API_URL = "https://api.bfl.ai/v1/flux-2-pro";
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 120000; // 120 seconds timeout

const FLUX_TRANSFORM_PROMPT = `Professional studio product photograph of the object on a pure white seamless background. Shot on Hasselblad X2D, 80mm lens, f/8, centered composition. Soft diffused lighting from three-point softbox setup, no harsh shadows. Clean, minimal, museum catalog style. Sharp focus on object details. The object is isolated, floating on infinite white. Commercial product photography quality.`;

interface BFLResponse {
  id: string;
  polling_url: string;
}

interface BFLPollResponse {
  status: "Ready" | "Pending" | "Error" | "Failed";
  result?: {
    sample: string;
  };
}

async function pollForResult(pollingUrl: string): Promise<string | null> {
  const startTime = Date.now();
  const apiKey = process.env.BFL_API_KEY;

  while (Date.now() - startTime < MAX_POLL_TIME) {
    try {
      const response = await fetch(pollingUrl, {
        headers: {
          "x-key": apiKey!,
        },
      });

      if (!response.ok) {
        console.error("[FLUX] Poll error:", response.status);
        return null;
      }

      const data: BFLPollResponse = await response.json();

      if (data.status === "Ready" && data.result?.sample) {
        return data.result.sample;
      }

      if (data.status === "Error" || data.status === "Failed") {
        console.error("[FLUX] Generation failed:", data.status);
        return null;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    } catch (error) {
      console.error("[FLUX] Poll exception:", error);
      return null;
    }
  }

  console.error("[FLUX] Polling timeout exceeded");
  return null;
}

async function downloadAndUploadImage(
  imageUrl: string
): Promise<string | null> {
  try {
    // Download the image from BFL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("[FLUX] Failed to download image:", response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();

    // Upload to Supabase Storage
    const supabase = createServerClient();
    const uuid = crypto.randomUUID();
    const path = `transformed/${uuid}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("object-images")
      .upload(path, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("[FLUX] Upload to storage failed:", uploadError);
      return null;
    }

    return getStorageUrl(path);
  } catch (error) {
    console.error("[FLUX] Download/upload exception:", error);
    return null;
  }
}

export async function transformImage(imageUrl: string): Promise<string | null> {
  const apiKey = process.env.BFL_API_KEY;

  if (!apiKey) {
    console.error("[FLUX] BFL_API_KEY not configured");
    return null;
  }

  try {
    // Submit the image transformation request to FLUX.2 Pro
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
      return null;
    }

    const data: BFLResponse = await response.json();

    if (!data.polling_url) {
      console.error("[FLUX] No polling URL returned");
      return null;
    }

    // Poll for the result
    const generatedImageUrl = await pollForResult(data.polling_url);

    if (!generatedImageUrl) {
      return null;
    }

    // Download the generated image and upload to our storage
    // (BFL URLs expire after 10 minutes)
    return await downloadAndUploadImage(generatedImageUrl);
  } catch (error) {
    console.error("[FLUX] Transform exception:", error);
    return null;
  }
}
