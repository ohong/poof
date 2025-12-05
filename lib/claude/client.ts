import {
  CLAUDE_DESCRIPTION_SYSTEM,
  FALLBACK_DESCRIPTION,
} from '@/lib/prompts'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: ClaudeContent[]
}

type ClaudeContent =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'url'; url: string } }

interface ClaudeResponse {
  content: Array<{ type: 'text'; text: string }>
}

/**
 * Generate a description for a single image
 * @param imageUrl - Public URL of the image
 * @returns Description string
 */
async function describeOneImage(imageUrl: string): Promise<string> {
  try {
    const content: ClaudeContent[] = [
      { type: 'text', text: 'Describe this object. Return ONLY the description in the format "Object Name: Description sentence." with no additional text.' },
      { type: 'image', source: { type: 'url', url: imageUrl } },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 256,
        system: CLAUDE_DESCRIPTION_SYSTEM,
        messages: [{ role: 'user', content }] as ClaudeMessage[],
      }),
    })

    if (!response.ok) {
      console.error(`Claude API failed for ${imageUrl}:`, response.status, await response.text())
      return FALLBACK_DESCRIPTION
    }

    const data: ClaudeResponse = await response.json()
    const textContent = data.content.find((c) => c.type === 'text')?.text
    return textContent?.trim() || FALLBACK_DESCRIPTION
  } catch (error) {
    console.error(`Claude error for ${imageUrl}:`, error)
    return FALLBACK_DESCRIPTION
  }
}

/**
 * Generate museum-style descriptions for multiple images (parallel, individual calls)
 * @param imageUrls - Array of public image URLs
 * @returns Map of image URL to description
 */
export async function generateDescriptions(
  imageUrls: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  if (imageUrls.length === 0) {
    return results
  }

  // Process all images in parallel, each with its own API call
  const settledResults = await Promise.allSettled(
    imageUrls.map(async (url) => ({
      url,
      description: await describeOneImage(url),
    }))
  )

  // Collect results
  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      results.set(result.value.url, result.value.description)
    } else {
      // This shouldn't happen since describeOneImage catches errors, but just in case
      console.error('Unexpected rejection:', result.reason)
    }
  }

  // Fill in any missing URLs with fallback
  for (const url of imageUrls) {
    if (!results.has(url)) {
      results.set(url, FALLBACK_DESCRIPTION)
    }
  }

  return results
}

/**
 * Generate a description for a single image (exported wrapper)
 * @param imageUrl - Public URL of the image
 * @returns Description string
 */
export async function generateDescription(imageUrl: string): Promise<string> {
  return describeOneImage(imageUrl)
}
