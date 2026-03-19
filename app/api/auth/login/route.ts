import { NextResponse } from"next/server";
import bcrypt from"bcryptjs";

import connectDB from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import { signToken } from"@/lib/jwt";

export async function POST(req: Request) {
 try {
 await connectDB();

 const { email, password } = await req.json();

 if (!email || !password) {
 return NextResponse.json(
 { error:"Email and password required"},
 { status: 400 }
 );
 }

 const user = await User.findOne({ email }).select("+password");

 if (!user) {
 return NextResponse.json(
 { error:"Invalid credentials"},
 { status: 401 }
 );
 }

 const match = await bcrypt.compare(password, user.password);

 if (!match) {
 return NextResponse.json(
 { error:"Invalid credentials"},
 { status: 401 }
 );
 }

 const token = signToken({
 id: user._id,
 role: user.role,
 });
 
 const safeUser = {
 _id: user._id,
 name: user.name,
 email: user.email,
 role: user.role,
};

 return NextResponse.json({
 message:"Login successful",
 token,
 user: safeUser,
 });
 } catch (err) {
 console.error("Login Error:", err);

 return NextResponse.json(
 { error:"Login failed"},
 { status: 500 }
 );
 }
}