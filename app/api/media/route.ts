import { NextRequest, NextResponse } from "next/server";
import { getSignedFileUrl } from "@/lib/s3";

// POST /api/media — Generate fresh presigned URLs for a list of S3 keys
export async function POST(req: NextRequest) {
  let body: { keys?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const keys = body.keys;
  if (!Array.isArray(keys) || keys.length === 0) {
    return NextResponse.json({ error: "keys array is required" }, { status: 400 });
  }

  // Cap at 50 keys per request
  const safeKeys = keys.slice(0, 50);

  try {
    const urls: Record<string, string> = {};
    await Promise.all(
      safeKeys.map(async (key) => {
        urls[key] = await getSignedFileUrl(key);
      })
    );

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Media URL generation error:", err);
    return NextResponse.json({ error: "Failed to generate URLs" }, { status: 500 });
  }
}
