import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

// Hard-coded admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    await dbConnect();

    // Find or create the admin user in DB so JWT/auth works consistently
    let admin = await User.findOne({ role: "admin", email: "admin@easeyourestate.com" });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      admin = await User.create({
        name: { first: "Admin", last: "" },
        email: "admin@easeyourestate.com",
        password: hashedPassword,
        role: "admin",
        phone: "0000000000",
      });
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
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
