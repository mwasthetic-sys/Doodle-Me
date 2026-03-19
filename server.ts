import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Gemini API Route
  app.post("/api/transform", async (req, res) => {
    try {
      const { imageBase64, mimeType, fullPrompt, modelName, resolution } = req.body;
      
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is missing. Please configure it in the environment." });
      }

      // We use fetch directly instead of the SDK so we can manually set the Referer header.
      // This helps if the user's API key has HTTP Referrer restrictions.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const imageConfig: any = {
        aspectRatio: "1:1"
      };

      if (modelName.includes('gemini-3')) {
        imageConfig.imageSize = resolution;
      }

      const payload = {
        contents: [{
          parts: [
            { inlineData: { data: imageBase64, mimeType } },
            { text: fullPrompt }
          ]
        }],
        generationConfig: {
          // The image generation config is passed here
          ...({ imageConfig } as any)
        }
      };

      // Re-implementing the call using fetch to include the Referer
      const geminiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // We use the referer from the incoming request or a fallback
          'Referer': req.headers.referer || 'https://ais-dev-varv3v43zbv2i5pneogjef-20801200097.europe-west2.run.app',
          'x-goog-api-client': 'genai-js/0.21.0' 
        },
        body: JSON.stringify(payload)
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json().catch(() => ({}));
        const message = errorData.error?.message || geminiResponse.statusText;
        
        if (message.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
          throw new Error("API Key Error: Your API key has 'HTTP Referrer' restrictions that block server-side requests. Please go to Google Cloud Console and set 'Website restrictions' to 'None' for this key.");
        }
        throw new Error(message);
      }

      const data: any = await geminiResponse.json();
      
      let resultImageUrl = '';
      const candidate = data.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            resultImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!resultImageUrl) {
        throw new Error("Gemini failed to generate an image part.");
      }

      res.json({ resultImageUrl });
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/{*catchAll}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
