import { NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    // Send OTP via SMS API
    const message = `Your OTP for website login is ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone.. WISTERIA`;
    const url = `http://www.smsdealnow.com/api/pushsms?user=WISTERIATRANS1&authkey=92NbnKkugqJlQ&sender=PRMIUM&mobile=${phone}&text=${encodeURIComponent(message)}&output=json&entityid=1201160784446085589&templateid=1707177288042495285`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("SMS Response:", data);
    } catch (err) {
      console.error("SMS Error:", err);
      // Don't fail the request if SMS fails in dev - OTP is still stored
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
