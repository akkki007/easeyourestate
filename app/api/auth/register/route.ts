import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { signToken } from "@/lib/jwt";

const ALLOWED_ROLES = ["buyer", "tenant", "owner"] as const;

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const emailNorm = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const fullName = String(name).trim();
    const [first, ...lastParts] = fullName.split(/\s+/);
    const last = lastParts.join(" ");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: { first, last },
      email: emailNorm,
      password: hashedPassword,
      role,
    });

    const token = signToken({
      id: user._id,
      role: user.role,
    });

    return NextResponse.json({
      message: "Registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    );
  }
}
