import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/utils/supabase/server";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the request via Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // 'scan' or '3d_design'

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing file payload or type" },
        { status: 400 },
      );
    }

    // 3. Buffer the file securely
    const buffer = Buffer.from(await file.arrayBuffer());

    // Gen unique filename
    const uniqueFileName = `${user.id}/${type}/${Date.now()}-${file.name}`;

    // 4. Send to Cloudflare R2
    const uploadCommand = new PutObjectCommand({
      Bucket: "youngin-assets",
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    });

    await s3Client.send(uploadCommand);

    const publicUrl = `https://pub-your-r2-subdomain.r2.dev/${uniqueFileName}`;
    // ^ Assuming user sets up public access, otherwise we generate pre-signed urls

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uniqueFileName,
    });
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to securely stream asset to R2" },
      { status: 500 },
    );
  }
}
