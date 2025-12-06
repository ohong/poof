import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a curator at a contemporary art museum writing object descriptions for a catalog.
For each image, write a brief, evocative description (2-3 sentences) that helps someone visualize the object. Focus on: material, color, form, condition, and character.
Style: MOMA exhibition catalog. Tone: observational, precise, slightly poetic.

Return JSON mapping image index to description.
Example: {"0": "A worn leather wallet...", "1": "A ceramic mug..."}`;

const FALLBACK_DESCRIPTION = "Untitled Object: An object awaiting description.";

export async function generateDescriptions(
  imageUrls: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  if (imageUrls.length === 0) {
    return result;
  }

  try {
    // Build content blocks with images
    const content: Anthropic.Messages.ContentBlockParam[] = imageUrls.map(
      (url, index) => ({
        type: "image" as const,
        source: {
          type: "url" as const,
          url,
        },
      })
    );

    // Add text instruction
    content.push({
      type: "text",
      text: `Describe each of the ${imageUrls.length} objects shown in the images above. Return your response as JSON only, with no markdown formatting.`,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    // Extract text response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
    const descriptions = JSON.parse(textBlock.text) as Record<string, string>;

    // Map index to URL
    for (let i = 0; i < imageUrls.length; i++) {
      const description = descriptions[i.toString()];
      result.set(imageUrls[i], description || FALLBACK_DESCRIPTION);
    }

    return result;
  } catch (error) {
    console.error("[Claude] Batch description failed, trying individual:", error);

    // Fallback: try individual calls
    const individualResults = await Promise.allSettled(
      imageUrls.map((url) => generateSingleDescription(url))
    );

    for (let i = 0; i < imageUrls.length; i++) {
      const res = individualResults[i];
      result.set(
        imageUrls[i],
        res.status === "fulfilled" ? res.value : FALLBACK_DESCRIPTION
      );
    }

    return result;
  }
}

async function generateSingleDescription(imageUrl: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: SYSTEM_PROMPT.replace(
        'Return JSON mapping image index to description.\nExample: {"0": "A worn leather wallet...", "1": "A ceramic mug..."}',
        "Write only the description, no JSON formatting."
      ),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl,
              },
            },
            {
              type: "text",
              text: "Describe this object.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return FALLBACK_DESCRIPTION;
    }

    return textBlock.text.trim();
  } catch (error) {
    console.error("[Claude] Single description failed:", error);
    return FALLBACK_DESCRIPTION;
  }
}

// Convenience wrapper for single image (used by process route)
export async function generateDescription(imageUrl: string): Promise<string> {
  const results = await generateDescriptions([imageUrl]);
  return results.get(imageUrl) || FALLBACK_DESCRIPTION;
}
