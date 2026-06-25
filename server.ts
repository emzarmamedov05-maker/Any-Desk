import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Define port (3000 is required by the infrastructure)
const PORT = 3000;

async function startServer() {
  const app = express();
  
  // Increase payload limit for base64 camera images
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API Route: Translate image captured from camera
  app.post("/api/translate-camera", async (req, res) => {
    try {
      const { image, targetLanguage } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "Görüntü verisi eksik." });
      }

      // Check for Gemini API key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.warn("GEMINI_API_KEY is not set or placeholder. Using high-quality mock translation engine.");
        
        // Let's create a realistic fallback translation based on typical language patterns
        // simulating a very responsive and robust experience.
        setTimeout(() => {
          return res.json({
            detectedLanguage: "İngilizce (Tahminî - Çevrimdışı Mod)",
            originalText: "Hello, welcome to our language learning application! Practice makes perfect.",
            translatedText: targetLanguage === "ka" 
              ? "გამარჯობა, კეთილი იყოს თქვენი მობრძანება ჩვენს ენის შესწავლის პროგრამაში! პრაქტიკა სრულყოფილებას ხდის."
              : targetLanguage === "tr"
              ? "Merhaba, dil öğrenme uygulamamıza hoş geldiniz! Pratik yapmak mükemmelleştirir."
              : "Hello, welcome to our language learning application! Practice makes perfect.",
            explanation: "Not: API Anahtarı eksik olduğu için sistem 'Simüle Edilmiş Çeviri' modunda çalışıyor. Gerçek bir kameradan metin okumak için lütfen AI Studio Secrets panelinden geçerli bir GEMINI_API_KEY tanımlayın.",
            isDemo: true
          });
        }, 1500);
        return;
      }

      // Parse base64 image data
      // format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Geçersiz görüntü formatı. Base64 bekleniyor." });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Initialize Gemini client lazily to avoid startup crashes if key is invalid
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      console.log(`Analyzing image with mimeType: ${mimeType} for targetLanguage: ${targetLanguage}`);

      // Prompt instructs Gemini to read the text in the image, detect the language, translate it,
      // and provide Turkish grammar and vocabulary explanations.
      const prompt = `Analyze this image containing written text. Perform the following tasks:
1. Detect the language of the written text in the image (it could be English, Georgian, Turkish, or another language).
2. Transcribe the original text exactly as written in the image.
3. Translate this original text into the requested target language (target language short-code is: "${targetLanguage}", which represents "en" for English, "ka" for Georgian, and "tr" for Turkish).
4. Provide a brief, helpful grammatical or vocabulary explanation of the text in Turkish, so the user can learn from it.

You must return the response as a JSON object matching this schema:
{
  "detectedLanguage": "The name of the detected language (e.g. 'İngilizce', 'Gürcüce', 'Türkçe')",
  "originalText": "The transcribed text from the image",
  "translatedText": "The translated text in the target language",
  "explanation": "A short educational explanation in Turkish about vocabulary, pronunciation, or grammar notes found in the text"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedLanguage: { type: Type.STRING },
              originalText: { type: Type.STRING },
              translatedText: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["detectedLanguage", "originalText", "translatedText", "explanation"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini API returned an empty response.");
      }

      const result = JSON.parse(responseText.trim());
      return res.json(result);

    } catch (error: any) {
      console.error("Gemini camera translation error:", error);
      return res.status(500).json({ 
        error: "Yapay Zeka ile çeviri gerçekleştirilirken bir hata oluştu.",
        details: error.message 
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
