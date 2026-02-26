import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import User from "@/lib/db/models/User";
import connectDB from "@/lib/db/connection";

export async function requireAuth(req: NextRequest) {
  try {
    await connectDB();

    const header = req.headers.get("authorization");

    if (!header || !header.startsWith("Bearer ")) {
      return null;
    }

    const token = header.split(" ")[1];

    const decoded: any = verifyToken(token);

    const user = await User.findById(decoded.id);

    return user;

  } catch {
    return null;
  }
}