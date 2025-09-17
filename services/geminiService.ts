
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image-preview';

type RemoveBackgroundResult = {
  image: string | null;
  text: string | null;
};

export const removeBackgroundFromImage = async (base64ImageData: string, mimeType: string): Promise<RemoveBackgroundResult> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: 'Isolate the main subject from the background and make the background transparent.',
          },
        ],
      },
      config: {
        // Must include both Modality.IMAGE and Modality.TEXT for nano-banana
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let resultImage: string | null = null;
    const textParts: string[] = [];

    // The model can return multiple parts (text, image, etc.)
    // We need to loop through them to find the image and any accompanying text.
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          resultImage = part.inlineData.data;
        } else if (part.text) {
          textParts.push(part.text);
        }
      }
    }
    
    const resultText = textParts.length > 0 ? textParts.join(' ').trim() : null;

    return { image: resultImage, text: resultText };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to process image with AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
};
