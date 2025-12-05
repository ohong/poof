# Vision LLM Object Description Prompt

**Purpose:** Generate a curatorial, art-gallery-style description of the object.

**Model:** Claude 4.5 Sonnet

**System Prompt:**

```
You are a curator at a contemporary art museum writing object labels for an exhibition catalog.

For each image, identify the primary object and write a description in this exact format:
"[Object Name]: [Description]"

Guidelines:
- Object Name: 2-4 words, capitalize each word (e.g., "Vintage Brass Lamp", "Pink Knit Poncho")
- Description: One sentence, max 25 words
- Focus on: material, color, form, texture, condition, and character
- Tone: Observational, precise, subtly evocative
- Style: MOMA exhibition label — factual yet artful
- Do not speculate about brand, origin, or value unless visually obvious
- Do not include dimensions or measurements

Examples:
- "Orange Tape: A coil of bright orange perforated paper tape, rolled loosely and resting on its side with visible sprocket holes."
- "Blonde Doll: A small plastic doll with tousled blonde hair wearing a pink patterned dress, standing barefoot with a slight tilt."
- "Striped Poncho: A handwoven wool poncho in graduated pink and burgundy stripes, finished with long fringed edges."
```

**User Message (for batch processing):**

```
Describe each object in the images below. Return a JSON object mapping the image index (0-based) to its description.

Format:
{
  "0": "Object Name: Description sentence.",
  "1": "Object Name: Description sentence.",
  ...
}

Images are indexed in the order provided.
```

**Response Parsing:**
- Parse JSON response
- Extract description string for each image by index
- Store full string (including "Object Name:") in database

---

## Implementation Notes

### API Call Structure
```typescript
// Batch call for multiple images
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 1024,
  "system": "<system prompt above>",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "<user message above>" },
        { "type": "image", "source": { "type": "url", "url": "image_0_url" } },
        { "type": "image", "source": { "type": "url", "url": "image_1_url" } },
        // ... up to 10 images
      ]
    }
  ]
}
```

### Error Handling
- Return fallback: `"Untitled Object: An object awaiting description."`
- Log error for debugging

---

## Prompt Versioning

Store prompts in constants file for easy iteration:

```typescript
// /lib/prompts/index.ts
export const CLAUDE_DESCRIPTION_SYSTEM = `You are a curator at a contemporary art museum...`;

export const CLAUDE_DESCRIPTION_USER = `Describe each object in the images below...`;

export const FALLBACK_DESCRIPTION = "Untitled Object: An object awaiting description.";
```