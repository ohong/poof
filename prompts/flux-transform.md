# FLUX.2 Image Transformation Prompt

**Purpose:** Transform user's casual phone photo into a clean product shot on white background.

**API Parameters:**
- Aspect ratio: `1:1` (square)
- Output resolution: `1024x1024`

**Prompt (natural language, ~60 words):**

```
Professional studio product photograph of the object on a pure white seamless background. Shot on Hasselblad X2D, 80mm lens, f/8, centered composition. Soft diffused lighting from three-point softbox setup, no harsh shadows. Clean, minimal, museum catalog style. Sharp focus on object details. The object is isolated, floating on infinite white. Commercial product photography quality.
```
---

## Implementation Notes

### API Call Structure

```typescript
// POST to FLUX.2 Image Editing endpoint
{
  "prompt": "Professional studio product photograph of the object on a pure white seamless background. Shot on Hasselblad X2D, 80mm lens, f/8, centered composition. Soft diffused lighting from three-point softbox setup, no harsh shadows. Clean, minimal, museum catalog style. Sharp focus on object details. The object is isolated, floating on infinite white. Commercial product photography quality.",
  "image": "<base64 or URL of original image>",
  "aspect_ratio": "1:1",
  "output_format": "jpeg"
}
```

### Error Handling
- Store `null` for `transformed_image_url`
- Frontend falls back to `original_image_url`

---

## Prompt Versioning

Store prompts in constants file for easy iteration:

```typescript
// /lib/prompts/index.ts

export const FLUX_TRANSFORM_PROMPT = `Professional studio product photograph...`;
```