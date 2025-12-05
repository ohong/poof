// Prompt constants for AI services

// FLUX.2 Image Transformation
export const FLUX_TRANSFORM_PROMPT = `Professional studio product photograph of the object on a pure white seamless background. Shot on Hasselblad X2D, 80mm lens, f/8, centered composition. Soft diffused lighting from three-point softbox setup, no harsh shadows. Clean, minimal, museum catalog style. Sharp focus on object details. The object is isolated, floating on infinite white. Commercial product photography quality.`

// Claude Vision - Object Description
export const CLAUDE_DESCRIPTION_SYSTEM = `You are a curator at a contemporary art museum writing object labels for an exhibition catalog.

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
- "Striped Poncho: A handwoven wool poncho in graduated pink and burgundy stripes, finished with long fringed edges."`

export const CLAUDE_DESCRIPTION_USER = `Describe each object in the images below. Return a JSON object mapping the image index (0-based) to its description.

Format:
{
  "0": "Object Name: Description sentence.",
  "1": "Object Name: Description sentence."
}

Images are indexed in the order provided.`

export const FALLBACK_DESCRIPTION = "Untitled Object: An object awaiting description."
