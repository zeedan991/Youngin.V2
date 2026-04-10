"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI client with the available API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// We'll use 2.5 Flash as it is extremely fast and robust for the free tier.
const MODEL = "gemini-2.5-flash";

const SYSTEM_INSTRUCTIONS = {
  planner: `You are a professional Weekly Wardrobe Planner. The user will provide their week's schedule and details about their existing wardrobe.
Your goal is to generate a full 7-day outfit plan that mixes and matches their items appropriately for their calendar events (meetings, gym, date, travel, etc.).
Format your response in beautiful, easy-to-read Markdown. Use bold headers for the days of the week. Ensure no outfit is repeated exactly.`,

  mood: `You are a Mood-to-Outfit Translator. The user will describe how they feel emotionally or select a "vibe".
Translate their emotional context into a highly specific fashion recommendation. Do not just say "casual" or "formal".
Map their mood directly to specific colors, fabrics (e.g., heavy wool, sheer silk, rigid denim), and silhouettes (e.g., oversized drape, structured tailoring).
Be creative, poetic, and highly descriptive. Output in Markdown format.`,

  budget: `You are a Budget-Aware Style Advisor. The user will set a budget limit and list their existing wardrobe base.
Your job is to advise them on how to maximize outfit variety without breaking the bank.
You must provide a "Cost-Per-Wear" breakdown estimation for your recommendations. Flag priority "gap-filler" purchases that will connect their existing pieces together.
Turn fashion into a financial strategy. Output cleanly formatted Markdown with bullet points or tables where appropriate.`,

  season: `You are a master Colour Season Analyser. Based on the user's uploaded image or described skin tone, eye color, and hair color, identify their exact Colour Season (e.g., True Winter, Soft Autumn, Light Spring).
Provide a personalized palette of highly flattering shades (give names of colors and optionally Hex codes if relevant). Also warn them of 2-3 colors to absolutely avoid.
Output your analysis in confident, professional Markdown.`,

  celebrity: `You are a Celebrity Alter-Ego Styler. The user will name a celebrity or visual era (or upload an image representing an aesthetic, like "90s Bollywood" or "Zendaya at the Met Gala").
Your task is to carefully deconstruct that high-fashion or red-carpet aesthetic and translate it into affordable, wearable street-style looks.
Break down the "DNA" of the aesthetic into 3 key rules, and then provide a specific, wearable outfit recommendation inspired by it.
Output in styled Markdown.`,
};

function processBase64Image(base64String: string) {
  // Strip out the data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = base64String.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

export async function generateStylistResponse(
  toolType: keyof typeof SYSTEM_INSTRUCTIONS,
  userInput: string,
  base64Image?: string
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file." };
    }

    const contents: any[] = [{ text: userInput }];

    if (base64Image) {
      contents.push(processBase64Image(base64Image));
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[toolType],
        temperature: 0.7,
      },
    });

    return {
      success: true,
      text: response.text,
    };
  } catch (error: any) {
    console.error(`Gemini API Error [${toolType}]:`, error);
    return {
      success: false,
      error: error.message || "Failed to generate AI response. Plrease check your API limits and network.",
    };
  }
}
