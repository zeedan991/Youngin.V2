"use server";

import { Client } from "@gradio/client";

export async function processVirtualTryOn(
  humanImageBase64: string,
  garmentImageBase64: string,
  garmentDescription: string
) {
  try {
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return { success: false, error: "Hugging Face Token is missing on the server." };
    }

    // Convert Base64 Data URL to Blob for Gradio Client
    const humanBlob = await (await fetch(humanImageBase64)).blob();
    const garmentBlob = await (await fetch(garmentImageBase64)).blob();

    console.log("Connecting to Gradio Space yisol/IDM-VTON...");
    // @ts-ignore - The @gradio/client types are often slightly misaligned with their actual runtime config objects
    const app = await Client.connect("yisol/IDM-VTON", { hf_token: hfToken });

    console.log("Sending prediction request. This may take 20-40 seconds.");
    const result = await app.predict("/tryon", [
      {
        background: humanBlob,
        layers: [],
        composite: null,
      },
      garmentBlob,
      garmentDescription,
      true,  // is_checked (Auto-mask)
      true, // is_checked_crop (Auto-crop for better framing)
      30,    // denoise_steps
      42,    // seed
    ]);

    console.log("Gradio API Response received!");

    // The output is an array. First item is the try-on output image string (URL to image)
    // result.data[0] will be the image URI!
    const outputData: any = result.data;
    
    // Result object could look like { type: 'file', url: '...' } depending on Gradio
    // Or just a primitive string based on our earlier exploration "Output" type "string".
    
    let imageUrl = null;
    
    if (Array.isArray(outputData) && outputData.length > 0) {
      const mainOutput = outputData[0];
      if (typeof mainOutput === "string") {
        imageUrl = mainOutput;
      } else if (mainOutput && mainOutput.url) {
        imageUrl = mainOutput.url;
      }
    }

    if (!imageUrl) {
       console.error("Unexpected Output Format:", JSON.stringify(outputData, null, 2));
       return { success: false, error: "Failed to parse unexpected output format from IDM-VTON." };
    }

    return { success: true, imageUrl: imageUrl };

  } catch (error: any) {
    console.error("VTON Server Action Error:", error);
    return { success: false, error: error.message || "Unknown IDM-VTON prediction error" };
  }
}
