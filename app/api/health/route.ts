import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "unhealthy", error: message },
      { status: 503 },
    );
  }
}
