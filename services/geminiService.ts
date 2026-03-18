import { GoogleGenAI } from "@google/genai";
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
    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const fullPrompt = `Transform the provided image into a high-contrast pop-art digital vector illustration.

STYLE REQUIREMENTS:
1. THE SUBJECT: Redraw the main person/subject as a crisp vector illustration with bold, clean ink outlines. 
   COLORING: You MUST use flat, stylized vector colors that match the subject's ORIGINAL natural skin tones and clothing colors. The subject should remain recognizable and distinct from the background.
   
2. THE BACKGROUND: Fill 100% of the background area with an extremely dense, chaotic, and whimsical composition of hand-drawn doodles (swirls, stars, geometric shapes, tiny monsters, flowers).
   COLORING: The background doodles MUST only use shades of ${palette.shades}. Incorporate subtle highlights of ${palette.tertiary}.
   
3. COMPOSITION: The subject must be clearly layered in front of the background. No doodles should overlap or cross over the subject's face or body.

FINAL OUTPUT: A single, clean, high-resolution graphic art piece. Do not include any photographic textures or realistic shadows. The subject is original-colored vector art, and the background is monochromatic ${palette.label} doodle art.`;

    const imageConfig: any = {
      aspectRatio: "1:1"
    };

    // imageSize is only supported by gemini-3-pro-image-preview and gemini-3.1-flash-image-preview
    if (modelName.includes('gemini-3')) {
      imageConfig.imageSize = resolution;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: fullPrompt }
        ],
      },
      config: {
        imageConfig
      } as any
    });

    let resultImageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          resultImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!resultImageUrl) {
      throw new Error("Gemini failed to generate an image part. Please check the prompt or image content.");
    }
    
    return resultImageUrl;
  }
}