import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ImageSize } from "../types";

// Helper to trigger API key selection
export const promptForApiKey = async () => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
    return true;
  }
  return false;
};

export const checkApiKeyStatus = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return true;
};

export const generateColoringPage = async (
  theme: string,
  imageSize: ImageSize
): Promise<string> => {
  // Determine which model to use based on requested quality
  const isProModel = imageSize === '2K' || imageSize === '4K';
  const modelName = isProModel 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';

  // Always instantiate fresh to get the latest process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Refined prompt to be more direct for image generation models
  const prompt = `A black and white coloring page for kids. Theme: ${theme}. Visual Style: thick bold black outlines, clean white background, simple shapes, no shading, no grayscale, suitable for coloring.`;

  // imageSize is only supported for gemini-3-pro-image-preview.
  const imageConfig: any = {
    aspectRatio: "3:4",
  };
  
  if (isProModel) {
    imageConfig.imageSize = imageSize;
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig,
    },
  });

  // Extract parts and handle cases where model returns text instead of image
  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error("The AI did not provide a valid response. This might be due to safety filters.");
  }

  let textReason = "";
  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    if (part.text) {
      textReason += part.text;
    }
  }
  
  // If we reached here, no image was found. Use the model's text as the error reason if available.
  throw new Error(textReason || "No image data was returned by the AI model. Try a different theme or resolution.");
};

export const createChatSession = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are DreamColor, a creative assistant for a children's coloring book generator. Help parents and kids brainstorm fun, imaginative themes (like 'astronaut kittens' or 'underwater castles'). Keep suggestions short, magical, and friendly.",
    },
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
    return await chat.sendMessageStream({ message });
};