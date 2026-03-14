"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");

    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setStep("otp");
      setResendTimer(30);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ""), otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }

      if (data.isNewUser) {
        // No account found — redirect to signup with phone prefilled
        router.push(`/signup?phone=${phone.replace(/\s/g, "")}`);
        return;
      }

      if (!data.token || !data.user) {
        setError("Invalid login response.");
        return;
      }

      login(data.token, data.user);
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="absolute inset-0" onClick={() => router.push("/")} />

      <div className="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex min-h-[560px]">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-between p-10 bg-white">
          <div className="mb-8">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/00af9203-b65b-41c8-9638-ad5a5692fa78/image-15-1771951269228.png?width=8000&height=8000&resize=contain"
              alt="EaseYourEstate.ai"
              className="h-14 w-auto object-contain"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-8">
              {step === "phone"
                ? "Enter your mobile number to get started."
                : `We sent a 6-digit OTP to +91 ${phone}`}
            </p>

            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      autoFocus
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || phone.length !== 10}
                  className="w-full py-3 bg-purple-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-md shadow-indigo-200"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition tracking-[0.3em] text-center text-lg font-semibold"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOTP()}
                    disabled={resendTimer > 0}
                    className="text-sm text-purple-600 hover:text-indigo-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 bg-purple-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-md shadow-indigo-200"
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-gray-900 font-semibold underline underline-offset-2 hover:text-purple-600 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Full background image */}
        <div className="hidden md:flex w-[45%] relative overflow-hidden rounded-r-2xl">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85&auto=format&fit=crop"
            alt="Modern home interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="relative z-10 flex flex-col justify-end p-10 h-full">
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Find your perfect<br />place to call home
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Thousands of verified listings. Trusted by renters and landlords
              across the country.
            </p>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-white font-bold text-lg">12k+</p>
                <p className="text-white/60 text-xs">Properties</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-white font-bold text-lg">98%</p>
                <p className="text-white/60 text-xs">Satisfaction</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-white font-bold text-lg">50+</p>
                <p className="text-white/60 text-xs">Cities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-20"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
