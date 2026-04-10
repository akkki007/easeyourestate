import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { signToken } from "@/lib/jwt";

const ALLOWED_ROLES = ["buyer", "tenant", "owner"] as const;

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone, name, email, role } = await req.json();

    if (!phone || !name) {
      return NextResponse.json(
        { error: "Phone and name are required" },
        { status: 400 },
      );
    }

    const safeRole = ALLOWED_ROLES.includes(role) ? role : "buyer";

    const existing = await User.findOne({ phone });
    if (existing) {
      return NextResponse.json(
        { error: "Account already exists with this phone number" },
        { status: 400 },
      );
    }

    if (email) {
      const emailNorm = String(email).toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }
      const emailExists = await User.findOne({ email: emailNorm });
      if (emailExists) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 400 },
        );
      }
    }

    const fullName = String(name).trim();
    const [first, ...lastParts] = fullName.split(/\s+/);
    const last = lastParts.join(" ");

    const user = await User.create({
      phone,
      name: { first, last },
      email: email ? String(email).toLowerCase().trim() : undefined,
      role: safeRole,
    });

    const token = signToken({ id: user._id, role: user.role });

    return NextResponse.json({
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Complete Profile Error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    );
  }
}
