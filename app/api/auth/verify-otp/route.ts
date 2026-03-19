import { NextResponse } from"next/server";
import connectDB from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import { signToken } from"@/lib/jwt";
import { verifyOTP } from"@/lib/otp-store";

export async function POST(req: Request) {
 try {
 const { phone, otp } = await req.json();

 if (!phone || !otp) {
 return NextResponse.json(
 { error:"Phone and OTP are required"},
 { status: 400 }
 );
 }

 const isValid = verifyOTP(phone, otp);
 if (!isValid) {
 return NextResponse.json(
 { error:"Invalid or expired OTP"},
 { status: 401 }
 );
 }

 await connectDB();

 // Check if user already exists
 const existingUser = await User.findOne({ phone });

 if (existingUser) {
 // Login flow - user exists
 const token = signToken({ id: existingUser._id, role: existingUser.role });

 return NextResponse.json({
 message:"Login successful",
 isNewUser: false,
 token,
 user: {
 _id: existingUser._id,
 name: existingUser.name,
 email: existingUser.email,
 phone: existingUser.phone,
 role: existingUser.role,
 },
 });
 }

 // New user - OTP verified, needs to complete profile
 return NextResponse.json({
 message:"OTP verified",
 isNewUser: true,
 phone,
 });
 } catch (err) {
 console.error("Verify OTP Error:", err);
 return NextResponse.json(
 { error:"OTP verification failed"},
 { status: 500 }
 );
 }
}
