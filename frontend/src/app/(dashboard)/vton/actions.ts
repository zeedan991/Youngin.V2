"use server";

import { Client } from "@gradio/client";

export async function processVirtualTryOn(
  humanImageBase64: string,
  garmentImageBase64: string,
  garmentType: "shirt" | "pant",
  lowerBodyMaskBase64?: string // Only provided for pants
) {
  try {
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return { success: false, error: "Hugging Face Token is missing on the server." };
    }

    // Convert Base64 Data URLs to Blob for Gradio Client
    const humanBlob = await (await fetch(humanImageBase64)).blob();
    const garmentBlob = await (await fetch(garmentImageBase64)).blob();

    // For shirts: use auto-mask (true). For pants: supply mask layer, disable auto-mask.
    const isShirt = garmentType === "shirt";
    const garmentDescription = isShirt ? "upper body shirt garment" : "lower body pants garment";

    const humanDict: any = {
      background: humanBlob,
      layers: [],
      composite: null,
    };

    // If pants mode, pass the programmatic lower-body mask as a "layer"
    if (!isShirt && lowerBodyMaskBase64) {
      const maskBlob = await (await fetch(lowerBodyMaskBase64)).blob();
      humanDict.layers = [maskBlob];
    }

    console.log(`Connecting to yisol/IDM-VTON (garment: ${garmentType})...`);
    // @ts-ignore - The @gradio/client types are often slightly misaligned with their actual runtime config objects
    const app = await Client.connect("yisol/IDM-VTON", { hf_token: hfToken });

    console.log("Sending prediction. This may take 20-40 seconds.");
    const result = await app.predict("/tryon", [
      humanDict,
      garmentBlob,
      garmentDescription,
      isShirt,   // is_checked: auto-mask ON for shirts, OFF for pants (use our supplied mask)
      true,      // is_checked_crop: Always crop for better output framing
      30,        // denoise_steps
      42,        // seed
    ]);

    console.log("IDM-VTON response received!");
    const outputData: any = result.data;

    let imageUrl: string | null = null;

    if (Array.isArray(outputData) && outputData.length > 0) {
      const mainOutput = outputData[0];
      if (typeof mainOutput === "string") {
        imageUrl = mainOutput;
      } else if (mainOutput && mainOutput.url) {
        imageUrl = mainOutput.url;
      }
    }

    if (!imageUrl) {
      console.error("Unexpected IDM-VTON output format:", JSON.stringify(outputData, null, 2));
      return { success: false, error: "Failed to parse output from IDM-VTON model." };
    }

    return { success: true, imageUrl };

  } catch (error: any) {
    console.error("VTON Server Action Error:", error);
    return { success: false, error: error.message || "Unknown IDM-VTON error." };
  }
}
