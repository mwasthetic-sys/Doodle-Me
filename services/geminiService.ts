import { ColorPalette } from "../types";

export class GeminiService {
  private static instance: GeminiService;
  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async transformToDoodle(
    imageBase64: string,
    mimeType: string,
    palette: ColorPalette,
    modelName: string = 'gemini-3.1-flash-image-preview',
    resolution: string = '1K'
  ): Promise<string> {
    const fullPrompt = `Transform the provided image into a high-contrast pop-art digital vector illustration.

STYLE REQUIREMENTS:
1. THE SUBJECT: Redraw the main person/subject as a crisp vector illustration with bold, clean ink outlines. 
   COLORING: You MUST use flat, stylized vector colors that match the subject's ORIGINAL natural skin tones and clothing colors. The subject should remain recognizable and distinct from the background.
   
2. THE BACKGROUND: Fill 100% of the background area with an extremely dense, chaotic, and whimsical composition of hand-drawn doodles (swirls, stars, geometric shapes, tiny monsters, flowers).
   COLORING: The background doodles MUST only use shades of ${palette.shades}. Incorporate subtle highlights of ${palette.tertiary}.
   
3. COMPOSITION: The subject must be clearly layered in front of the background. No doodles should overlap or cross over the subject's face or body.

FINAL OUTPUT: A single, clean, high-resolution graphic art piece. Do not include any photographic textures or realistic shadows. The subject is original-colored vector art, and the background is monochromatic ${palette.label} doodle art.`;

    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        fullPrompt,
        modelName,
        resolution
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.resultImageUrl) {
      throw new Error("Server failed to return an image URL.");
    }

    return data.resultImageUrl;
  }
}