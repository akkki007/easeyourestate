import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();
    const admin = await User.findOne({ role: "admin" }).select("_id");
    return NextResponse.json({ adminExists: !!admin });
  } catch {
    return NextResponse.json({ adminExists: false });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode } = body;

    await dbConnect();

    if (mode === "setup") {
      return handleSetup(body);
    }

    return handleLogin(body);
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

async function handleSetup(body: {
  setupKey?: string;
  email?: string;
  password?: string;
  name?: string;
}) {
  const { setupKey, email, password, name } = body;

  const requiredKey = process.env.ADMIN_SETUP_KEY;
  if (!requiredKey) {
    return NextResponse.json(
      { error: "Admin setup is not configured. Set ADMIN_SETUP_KEY in .env" },
      { status: 503 },
    );
  }

  if (!setupKey || setupKey !== requiredKey) {
    return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
  }

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, password, and name are required" },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    return NextResponse.json(
      { error: "Admin account already exists. Use login instead." },
      { status: 409 },
    );
  }

  const [first, ...lastParts] = name.trim().split(/\s+/);
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await User.create({
    name: { first, last: lastParts.join(" ") },
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "admin",
    phone: "0000000000",
  });

  const token = signToken({ id: admin._id, role: "admin" });

  return NextResponse.json({
    message: "Admin account created successfully",
    token,
    user: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    },
  });
}

async function handleLogin(body: { email?: string; password?: string }) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const admin = await User.findOne({
    role: "admin",
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!admin || !admin.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: admin._id, role: "admin" });

  return NextResponse.json({
    message: "Admin login successful",
    token,
    user: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    },
  });
}
