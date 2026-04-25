import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const fashionPrompt = `Create a high-quality fashion graphic design suitable for printing on clothing. 
The design should have a transparent or white background. Style: ${prompt}. 
Make it bold, eye-catching, and suitable for fashion streetwear. 
No text overlays unless specifically requested. High contrast, print-ready quality.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fashionPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Extract image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 422 },
      );
    }

    for (const part of candidates[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        return NextResponse.json({ imageBase64: part.inlineData.data });
      }
    }

    return NextResponse.json(
      { error: "No image generated. Try a different prompt." },
      { status: 422 },
    );
  } catch (error: any) {
    console.error("AI generation error:", error?.message || error);
    return NextResponse.json(
      { error: "AI generation failed. Check API key." },
      { status: 500 },
    );
  }
}
