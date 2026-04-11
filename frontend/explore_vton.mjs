import { Client } from "@gradio/client";

async function explore() {
  const app = await Client.connect("yisol/IDM-VTON");
    
  console.log("=== API Documentation ===");
  const info = await app.view_api();
  console.log(JSON.stringify(info, null, 2));
}

explore().catch(console.error);
