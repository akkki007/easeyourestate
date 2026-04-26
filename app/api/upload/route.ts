import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAuth } from "@/lib/auth/auth";
import { uploadToS3 } from "@/lib/s3";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

const MAX_IMAGE_SIZE = 70 * 1024 * 1024; // 70 MB (raw upload cap)
const MAX_VIDEO_SIZE = 70 * 1024 * 1024; // 70 MB

// Compression target: keep visual quality high while shrinking S3 footprint.
const IMAGE_MAX_DIMENSION = 2200; // px on the longest side
const IMAGE_QUALITY = 82;          // perceptually near-lossless for webp

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM, MOV." },
      { status: 400 }
    );
  }

  const isVideo = VIDEO_TYPES.includes(file.type);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.floor(maxSize / 1024 / 1024)}MB.` },
      { status: 400 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    let outBuffer: Buffer = inputBuffer;
    let outContentType: string = file.type;
    let outExt: string = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");

    if (!isVideo && file.type !== "image/gif") {
      // Compress raster images via sharp → webp (high quality, small footprint).
      // Skip animated GIFs; webp re-encode would lose frames here.
      const compressed = await sharp(inputBuffer, { failOn: "none" })
        .rotate() // honor EXIF orientation before stripping metadata
        .resize({
          width: IMAGE_MAX_DIMENSION,
          height: IMAGE_MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_QUALITY, effort: 4 })
        .toBuffer();

      outBuffer = compressed;
      outContentType = "image/webp";
      outExt = "webp";
    }

    const folder = isVideo ? "videos" : "images";
    const key = `properties/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${outExt}`;

    const { url } = await uploadToS3(outBuffer, key, outContentType);

    return NextResponse.json({
      url,
      publicId: key,
      type: isVideo ? "video" : "image",
      originalSize: file.size,
      storedSize: outBuffer.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
