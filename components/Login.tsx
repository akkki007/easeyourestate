"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Backdrop click to go back */}
      <div
        className="absolute inset-0"
        onClick={() => router.push("/")}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex min-h-[560px]">

        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-between p-10 bg-white">
          {/* Logo */}
            <div className="mb-8">
              <img
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/00af9203-b65b-41c8-9638-ad5a5692fa78/image-15-1771951269228.png?width=8000&height=8000&resize=contain"
                alt="EaseYourEstate.ai"
                className="h-14 w-auto object-contain"
              />
            </div>

          {/* Heading */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-8">Welcome back! Please enter your details.</p>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="hi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" className="text-sm text-purple-600 hover:text-indigo-700 font-medium">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-md shadow-indigo-200"
              >
                Login
              </button>

              <button
                type="button"
                className="w-full py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-gray-900 font-semibold underline underline-offset-2 hover:text-purple-600 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

          {/* Right: Full background image */}
          <div className="hidden md:flex w-[45%] relative overflow-hidden rounded-r-2xl">
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85&auto=format&fit=crop"
              alt="Modern home interior"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Content over image */}
            <div className="relative z-10 flex flex-col justify-end p-10 h-full">
              {/* Logo */}

              <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                Find your perfect<br />place to call home
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Thousands of verified listings. Trusted by renters and landlords across the country.
              </p>

              {/* Stats row */}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
