import { NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 },
      );
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    if (process.env.NODE_ENV === "development") {
      console.log(`\n=========================================\n[DEV MODE] OTP for ${phone} is: ${otp}\n=========================================\n`);
    }

    const smsUser = process.env.SMS_API_USER;
    const smsAuthKey = process.env.SMS_API_AUTH_KEY;
    const smsSender = process.env.SMS_API_SENDER || "PREMIUM";
    const smsEntityId = process.env.SMS_API_ENTITY_ID;
    const smsTemplateId = process.env.SMS_API_TEMPLATE_ID;
    const smsBaseUrl = process.env.SMS_API_BASE_URL;

    if (smsUser && smsAuthKey && smsBaseUrl) {
      const message = `Your OTP for website login is ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone.. WISTERIA`;
      const url = `${smsBaseUrl}?user=${smsUser}&authkey=${smsAuthKey}&sender=${smsSender}&mobile=${phone}&text=${encodeURIComponent(message)}&output=json&entityid=${smsEntityId}&templateid=${smsTemplateId}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (process.env.NODE_ENV === "development") {
          console.log("SMS API response status:", data?.status ?? "unknown");
        }
      } catch (err) {
        console.error("SMS delivery failed:", (err as Error).message);
      }
    } else if (process.env.NODE_ENV === "development") {
      console.warn("SMS API not configured — OTP stored locally only (dev mode)");
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", (err as Error).message);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
