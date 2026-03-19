"use client";

import { FormEvent, useState, useEffect } from"react";
import Link from"next/link";
import { useRouter, useSearchParams } from"next/navigation";
import { useAuth } from"@/lib/auth/AuthContext";

export default function Signup() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { login } = useAuth();

 // Steps: phone → otp → profile
 const [step, setStep] = useState<"phone"|"otp"|"profile">("phone");
 const [phone, setPhone] = useState("");
 const [otp, setOtp] = useState("");
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [selectedRole, setSelectedRole] = useState<"buyer"|"tenant"|"owner"|"agent"|"builder">("buyer");
 const [error, setError] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [resendTimer, setResendTimer] = useState(0);

 // If redirected from login with phone pre-filled, skip to profile
 useEffect(() => {
 const prefilled = searchParams.get("phone");
 if (prefilled && /^[6-9]\d{9}$/.test(prefilled)) {
 setPhone(prefilled);
 setStep("profile");
 }
 }, [searchParams]);

 useEffect(() => {
 if (resendTimer <= 0) return;
 const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
 return () => clearInterval(interval);
 }, [resendTimer]);

 const handleSendOTP = async (e?: FormEvent) => {
 e?.preventDefault();
 setError("");

 const cleaned = phone.replace(/\s/g,"");
 if (!/^[6-9]\d{9}$/.test(cleaned)) {
 setError("Please enter a valid 10-digit mobile number.");
 return;
 }

 setIsLoading(true);
 try {
 const res = await fetch("/api/auth/send-otp", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ phone: cleaned }),
 });
 const data = await res.json();
 if (!res.ok) {
 setError(data.error ||"Failed to send OTP.");
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
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ phone: phone.replace(/\s/g,""), otp }),
 });
 const data = await res.json();

 if (!res.ok) {
 setError(data.error ||"Invalid OTP.");
 return;
 }

 if (!data.isNewUser) {
 // User already exists, log them in
 login(data.token, data.user);
 router.push("/dashboard");
 return;
 }

 // OTP verified, move to profile step
 setStep("profile");
 } catch {
 setError("Verification failed. Please try again.");
 } finally {
 setIsLoading(false);
 }
 };

 const handleCompleteProfile = async (e: FormEvent) => {
 e.preventDefault();
 setError("");

 if (!name.trim()) {
 setError("Please enter your name.");
 return;
 }

 setIsLoading(true);
 try {
 const res = await fetch("/api/auth/complete-profile", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({
 phone: phone.replace(/\s/g,""),
 name: name.trim(),
 email: email.trim().toLowerCase() || undefined,
 role: selectedRole,
 }),
 });

 const data = await res.json();
 if (!res.ok) {
 setError(data.error ||"Sign up failed. Please try again.");
 return;
 }

 if (!data.token || !data.user) {
 setError("Invalid sign up response.");
 return;
 }

 login(data.token, data.user);
 router.push("/dashboard");
 } catch {
 setError("Sign up failed. Please try again.");
 } finally {
 setIsLoading(false);
 }
 };

 const renderStepIndicator = () => (
 <div className="flex items-center gap-2 mb-6">
 {[
 { key:"phone", label:"Phone"},
 { key:"otp", label:"Verify"},
 { key:"profile", label:"Profile"},
 ].map((s, i) => {
 const steps = ["phone","otp","profile"];
 const currentIdx = steps.indexOf(step);
 const stepIdx = steps.indexOf(s.key);
 const isActive = stepIdx <= currentIdx;
 return (
 <div key={s.key} className="flex items-center gap-2">
 <div
 className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
 isActive
 ?"bg-primary text-primary-foreground"
 :"bg-muted text-muted-foreground"
 }`}
 >
 {stepIdx < currentIdx ? (
 <svg width="12"height="12"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="3"strokeLinecap="round"strokeLinejoin="round">
 <polyline points="20 6 9 17 4 12"/>
 </svg>
 ) : (
 i + 1
 )}
 </div>
 <span className={`text-xs font-medium ${isActive ?"text-foreground":"text-muted-foreground"}`}>
 {s.label}
 </span>
 {i < 2 && (
 <div className={`w-8 h-0.5 ${stepIdx < currentIdx ?"bg-primary":"bg-muted"}`} />
 )}
 </div>
 );
 })}
 </div>
 );

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
 <div className="absolute inset-0"onClick={() => router.push("/")} />

 <div className="relative z-10 w-full max-w-4xl mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden flex min-h-[600px]">
 {/* Left: Form */}
 <div className="flex-1 flex flex-col justify-between p-10 bg-card">
 <div className="mb-6">
 <img
 src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/00af9203-b65b-41c8-9638-ad5a5692fa78/image-15-1771951269228.png?width=8000&height=8000&resize=contain"
 alt="EaseYourEstate.ai"
 className="h-14 w-auto object-contain"
 />
 </div>

 <div className="flex-1">
 <h1 className="text-3xl font-bold text-foreground mb-1">Create an account</h1>
 <p className="text-muted-foreground text-sm mb-4">
 {step ==="phone"&&"Get started with your free account today."}
 {step ==="otp"&&`Enter the OTP sent to +91 ${phone}`}
 {step ==="profile"&&"Almost there! Tell us about yourself."}
 </p>

 {renderStepIndicator()}

 {/* Step 1: Phone */}
 {step ==="phone"&& (
 <form onSubmit={handleSendOTP} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">
 Mobile Number
 </label>
 <div className="flex items-center gap-2">
 <span className="px-3 py-3 rounded-xl border border-border bg-background text-muted-foreground text-sm font-medium">
 +91
 </span>
 <input
 type="tel"
 placeholder="Enter 10-digit number"
 value={phone}
 onChange={(e) => setPhone(e.target.value.replace(/\D/g,"").slice(0, 10))}
 className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
 autoFocus
 />
 </div>
 </div>

 {error && <p className="text-sm text-error">{error}</p>}

 <button
 type="submit"
 disabled={isLoading || phone.length !== 10}
 className="w-full py-3 bg-primary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors text-sm shadow-md shadow-primary"
 >
 {isLoading ?"Sending OTP...":"Send OTP"}
 </button>
 </form>
 )}

 {/* Step 2: OTP */}
 {step ==="otp"&& (
 <form onSubmit={handleVerifyOTP} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">
 Enter OTP
 </label>
 <input
 type="text"
 inputMode="numeric"
 placeholder="6-digit OTP"
 value={otp}
 onChange={(e) => setOtp(e.target.value.replace(/\D/g,"").slice(0, 6))}
 className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition tracking-[0.3em] text-center text-lg font-semibold"
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
 className="text-sm text-muted-foreground hover:text-foreground font-medium"
 >
 Change number
 </button>
 <button
 type="button"
 onClick={() => handleSendOTP()}
 disabled={resendTimer > 0}
 className="text-sm text-primary hover:text-primary font-medium disabled:text-muted-foreground disabled:cursor-not-allowed"
 >
 {resendTimer > 0 ?`Resend in ${resendTimer}s`:"Resend OTP"}
 </button>
 </div>

 {error && <p className="text-sm text-error">{error}</p>}

 <button
 type="submit"
 disabled={isLoading || otp.length !== 6}
 className="w-full py-3 bg-primary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors text-sm shadow-md shadow-primary"
 >
 {isLoading ?"Verifying...":"Verify OTP"}
 </button>
 </form>
 )}

 {/* Step 3: Profile */}
 {step ==="profile"&& (
 <form onSubmit={handleCompleteProfile} className="space-y-4">
 <div className="px-3 py-2 rounded-lg bg-primary border border-primary text-sm text-primary font-medium">
 Phone verified: +91 {phone}
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">
 Name <span className="text-error">*</span>
 </label>
 <input
 type="text"
 placeholder="Full name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
 autoFocus
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">
 Email <span className="text-muted-foreground text-xs font-normal">(optional)</span>
 </label>
 <input
 type="email"
 placeholder="hi@example.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
 />
 </div>

 {/* Role Selection */}
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 I am a <span className="text-error">*</span>
 </label>
 <div className="grid grid-cols-2 gap-2">
 {([
 { value:"buyer", label:"Buyer", desc:"Looking to buy"},
 { value:"tenant", label:"Tenant", desc:"Looking to rent"},
 { value:"owner", label:"Owner", desc:"List my property"},
 { value:"agent", label:"Agent", desc:"Manage listings"},
 { value:"builder", label:"Builder", desc:"Manage projects"},
 ] as const).map((role) => (
 <button
 key={role.value}
 type="button"
 onClick={() => setSelectedRole(role.value)}
 className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
 selectedRole === role.value
 ?"border-primary bg-primary"
 :"border-border hover:border-primary bg-background"
 }`}
 >
 <span className={`text-sm font-semibold ${selectedRole === role.value ?"text-primary":"text-foreground"}`}>
 {role.label}
 </span>
 <span className="text-[11px] text-muted-foreground">{role.desc}</span>
 </button>
 ))}
 </div>
 </div>

 {error && <p className="text-sm text-error">{error}</p>}

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3 bg-primary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors text-sm shadow-md shadow-primary mt-2"
 >
 {isLoading ?"Creating account...":"Create Account"}
 </button>
 </form>
 )}

 <p className="text-center text-sm text-muted-foreground mt-6">
 Already have an account?{""}
 <Link
 href="/login"
 className="text-foreground font-semibold underline underline-offset-2 hover:text-primary transition-colors"
 >
 Login
 </Link>
 </p>
 </div>
 </div>

 {/* Right: Full background image */}
 <div className="hidden md:flex w-[45%] relative overflow-hidden rounded-r-2xl">
 <img
 src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85&auto=format&fit=crop"
 alt="Beautiful modern home"
 className="absolute inset-0 w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"/>

 <div className="relative z-10 flex flex-col justify-end p-10 h-full">
 <h2 className="text-3xl font-bold text-primary-foreground leading-tight mb-3">
 Start your journey<br />to a dream home
 </h2>
 <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
 Join thousands of happy homeowners and renters who found their
 perfect space with EaseYourEstate.
 </p>

 <div className="flex items-center gap-6">
 <div>
 <p className="text-primary-foreground font-bold text-lg">12k+</p>
 <p className="text-primary-foreground/60 text-xs">Properties</p>
 </div>
 <div className="w-px h-8 bg-card/20"/>
 <div>
 <p className="text-primary-foreground font-bold text-lg">98%</p>
 <p className="text-primary-foreground/60 text-xs">Satisfaction</p>
 </div>
 <div className="w-px h-8 bg-card/20"/>
 <div>
 <p className="text-primary-foreground font-bold text-lg">50+</p>
 <p className="text-primary-foreground/60 text-xs">Cities</p>
 </div>
 </div>
 </div>
 </div>

 {/* Close button */}
 <button
 onClick={() => router.push("/")}
 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors z-20"
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
 <line x1="18"y1="6"x2="6"y2="18"/>
 <line x1="6"y1="6"x2="18"y2="18"/>
 </svg>
 </button>
 </div>
 </div>
 );
}
