import { NextResponse } from"next/server";
import connectDB from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import { signToken } from"@/lib/jwt";

export async function POST(req: Request) {
 try {
 await connectDB();

 const { phone, name, email, role } = await req.json();

 if (!phone || !name) {
 return NextResponse.json(
 { error:"Phone and name are required"},
 { status: 400 }
 );
 }

 // Check if user already exists with this phone
 const existing = await User.findOne({ phone });
 if (existing) {
 return NextResponse.json(
 { error:"Account already exists with this phone number"},
 { status: 400 }
 );
 }

 // Check if email is already taken (if provided)
 if (email) {
 const emailExists = await User.findOne({ email });
 if (emailExists) {
 return NextResponse.json(
 { error:"This email is already registered"},
 { status: 400 }
 );
 }
 }

 const fullName = name.trim();
 const [first, ...lastParts] = fullName.split(/\s+/);
 const last = lastParts.join("");

 const user = await User.create({
 phone,
 name: { first, last },
 email: email || undefined,
 role: role ||"buyer",
 });

 const token = signToken({ id: user._id, role: user.role });

 return NextResponse.json({
 message:"Account created successfully",
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
 { error:"Registration failed"},
 { status: 500 }
 );
 }
}
