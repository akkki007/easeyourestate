// In-memory OTP store (use Redis in production)
interface OTPEntry {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OTPEntry>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, otp: string) {
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
}

export function verifyOTP(phone: string, otp: string): boolean {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (entry.otp !== otp) return false;
  otpStore.delete(phone);
  return true;
}
