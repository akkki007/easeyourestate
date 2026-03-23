"use client";

import { useEffect, useState, useCallback, Suspense } from"react";
import { useSearchParams, useRouter } from"next/navigation";
import Link from"next/link";
import {
 MapPin,
 BedDouble,
 Bath,
 Maximize,
 Car,
 ChevronLeft,
 ChevronRight,
 X,
 Phone,
 Mail,
 User,
 SlidersHorizontal,
 Loader2,
 Home,
 Building2,
} from"lucide-react";
import SavedPropertyButton from "@/components/SavedPropertyButton";

// ── Types ───────────────────────────────────────────────────────────────────
interface Property {
 _id: string;
 slug: string;
 title: string;
 purpose: string;
 category: string;
 propertyType: string;
 listingType: string;
 price: {
 amount: number;
 currency: string;
 pricePerSqft?: number;
 negotiable?: boolean;
 maintenance?: number;
 deposit?: number;
 };
 specs: {
 bedrooms?: number;
 bathrooms?: number;
 balconies?: number;
 furnishing?: string;
 parking?: { covered: number; open: number };
 area?: { carpet?: number; builtUp?: number; superBuiltUp?: number; unit?: string };
 possessionStatus?: string;
 floorNumber?: number;
 totalFloors?: number;
 };
 location: {
 locality: string;
 city: string;
 address: { line1: string; line2?: string; landmark?: string };
 };
 media: {
 images: Array<{ url: string; isPrimary?: boolean; caption?: string }>;
 };
 amenities: string[];
 featured?: { isFeatured: boolean };
 publishedAt: string;
}

interface SearchResult {
 properties: Property[];
 total: number;
 page: number;
 totalPages: number;
}

interface OwnerInfo {
 name: string;
 phone: string;
 email: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(amount: number): string {
 if (amount >= 10000000) {
 return`₹${(amount / 10000000).toFixed(2)} Cr`;
 } else if (amount >= 100000) {
 return`₹${(amount / 100000).toFixed(2)} L`;
 } else if (amount >= 1000) {
 return`₹${(amount / 1000).toFixed(1)}K`;
 }
 return`₹${amount.toLocaleString("en-IN")}`;
}

function formatPriceLabel(purpose: string): string {
 if (purpose ==="rent"|| purpose ==="pg"|| purpose ==="lease") return"/month";
 return"";
}

function purposeLabel(purpose: string): string {
 const map: Record<string, string> = {
 sell:"For Sale",
 rent:"For Rent",
 pg:"PG",
 lease:"For Lease",
 };
 return map[purpose] || purpose;
}

function furnishingLabel(f?: string): string {
 if (f ==="fully") return"Fully Furnished";
 if (f ==="semi") return"Semi Furnished";
 return"Unfurnished";
}

function timeAgo(dateStr: string): string {
 const diff = Date.now() - new Date(dateStr).getTime();
 const days = Math.floor(diff / 86400000);
 if (days === 0) return"Today";
 if (days === 1) return"Yesterday";
 if (days < 30) return`${days} days ago`;
 const months = Math.floor(days / 30);
 return`${months} month${months > 1 ?"s":""} ago`;
}

// ── Auth Modal (matches landing-page Signup / Login UI) ─────────────────────
function SignUpModal({
 onClose,
 onSuccess,
}: {
 onClose: () => void;
 onSuccess: (token: string) => void;
}) {
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [isPropertyManager, setIsPropertyManager] = useState(false);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [mode, setMode] = useState<"signup"|"login">("signup");

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 if (mode ==="signup") {
 if (!name.trim() || !email.trim() || !password) {
 setError("Please fill all fields.");
 return;
 }
 if (password.length < 6) {
 setError("Password must be at least 6 characters.");
 return;
 }
 const [first, ...lastParts] = name.trim().split(/\s+/);
 const last = lastParts.join("");

 setLoading(true);
 try {
 const res = await fetch("/api/auth/register", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({
 name: { first, last },
 email: email.trim().toLowerCase(),
 password,
 role: isPropertyManager ?"owner":"buyer",
 }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) {
 setError(data.error ||"Sign up failed.");
 return;
 }
 localStorage.setItem("token", data.token);
 localStorage.setItem("user", JSON.stringify(data.user));
 onSuccess(data.token);
 } catch {
 setError("Sign up failed. Please try again.");
 } finally {
 setLoading(false);
 }
 } else {
 if (!email.trim() || !password) {
 setError("Please fill all fields.");
 return;
 }
 setLoading(true);
 try {
 const res = await fetch("/api/auth/login", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({
 email: email.trim().toLowerCase(),
 password,
 }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) {
 setError(data.error ||"Login failed.");
 return;
 }
 localStorage.setItem("token", data.token);
 localStorage.setItem("user", JSON.stringify(data.user));
 onSuccess(data.token);
 } catch {
 setError("Login failed. Please try again.");
 } finally {
 setLoading(false);
 }
 }
 };

 const EyeOpen = () => (
 <svg xmlns="http://www.w3.org/2000/svg"width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
 <circle cx="12"cy="12"r="3"/>
 </svg>
 );
 const EyeClosed = () => (
 <svg xmlns="http://www.w3.org/2000/svg"width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
 <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
 <line x1="1"y1="1"x2="23"y2="23"/>
 </svg>
 );

 const GoogleIcon = () => (
 <svg width="18"height="18"viewBox="0 0 48 48">
 <path fill="#EA4335"d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
 <path fill="#4285F4"d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
 <path fill="#FBBC05"d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
 <path fill="#34A853"d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
 </svg>
 );

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
 {/* Backdrop */}
 <div className="absolute inset-0"onClick={onClose} />

 {/* Modal */}
 <div className="relative z-10 w-full max-w-4xl mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden flex min-h-[600px]">

 {/* Left: Form */}
 <div className="flex-1 flex flex-col justify-between p-10 bg-card">
 {/* Logo */}
 <div className="mb-8">
 <img
 src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/00af9203-b65b-41c8-9638-ad5a5692fa78/image-15-1771951269228.png?width=8000&height=8000&resize=contain"
 alt="EaseYourEstate.ai"
 className="h-14 w-auto object-contain"
 />
 </div>

 <div className="flex-1">
 <h1 className="text-3xl font-bold text-foreground mb-1">
 {mode ==="signup"?"Create an account":"Welcome back"}
 </h1>
 <p className="text-muted-foreground text-sm mb-8">
 {mode ==="signup"
 ?"Sign up to view owner details directly."
 :"Welcome back! Please enter your details."}
 </p>

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Name (signup only) */}
 {mode ==="signup"&& (
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
 <input
 type="text"
 placeholder="Full name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
 />
 </div>
 )}

 {/* Email */}
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
 <input
 type="email"
 placeholder="hi@example.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
 />
 </div>

 {/* Password */}
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
 <div className="relative">
 <input
 type={showPassword ?"text":"password"}
 placeholder="Enter password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition"
 >
 {showPassword ? <EyeClosed /> : <EyeOpen />}
 </button>
 </div>
 <div className="flex items-center justify-between mt-1.5">
 <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p>
 {mode ==="login"&& (
 <button type="button"className="text-sm text-primary hover:text-primary font-medium">
 Forgot Password?
 </button>
 )}
 </div>
 </div>

 {/* Property Manager Checkbox (signup only) */}
 {mode ==="signup"&& (
 <div className="flex items-center gap-3 pt-1">
 <button
 type="button"
 onClick={() => setIsPropertyManager(!isPropertyManager)}
 className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
 isPropertyManager
 ?"bg-primary border-primary"
 :"bg-card border-border hover:border-primary"
 }`}
 >
 {isPropertyManager && (
 <svg width="10"height="10"viewBox="0 0 24 24"fill="none"stroke="white"strokeWidth="3"strokeLinecap="round"strokeLinejoin="round">
 <polyline points="20 6 9 17 4 12"/>
 </svg>
 )}
 </button>
 <label
 onClick={() => setIsPropertyManager(!isPropertyManager)}
 className="text-sm text-muted-foreground cursor-pointer select-none"
 >
 I am a property manager
 </label>
 </div>
 )}

 {error && <p className="text-sm text-error">{error}</p>}

 <button
 type="submit"
 disabled={loading}
 className="w-full py-3 bg-primary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors text-sm shadow-md shadow-primary mt-2"
 >
 {loading
 ? mode ==="signup"?"Creating account...":"Logging in..."
 : mode ==="signup"?"Sign up":"Login"}
 </button>

 <button
 type="button"
 className="w-full py-3 border border-border bg-card hover:bg-accent text-foreground font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-3"
 >
 <GoogleIcon />
 {mode ==="signup"?"Sign up with Google":"Continue with Google"}
 </button>
 </form>

 <p className="text-center text-sm text-muted-foreground mt-6">
 {mode ==="signup"? (
 <>
 Already have an account?{""}
 <button
 onClick={() => { setMode("login"); setError(""); }}
 className="text-foreground font-semibold underline underline-offset-2 hover:text-primary transition-colors"
 >
 Login
 </button>
 </>
 ) : (
 <>
 Don&apos;t have an account?{""}
 <button
 onClick={() => { setMode("signup"); setError(""); }}
 className="text-foreground font-semibold underline underline-offset-2 hover:text-primary transition-colors"
 >
 Sign up for free
 </button>
 </>
 )}
 </p>
 </div>
 </div>

 {/* Right: Full background image */}
 <div className="hidden md:flex w-[45%] relative overflow-hidden rounded-r-2xl">
 <img
 src={
 mode ==="signup"
 ?"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85&auto=format&fit=crop"
 :"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85&auto=format&fit=crop"
 }
 alt="Beautiful modern home"
 className="absolute inset-0 w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"/>

 <div className="relative z-10 flex flex-col justify-end p-10 h-full">
 <h2 className="text-3xl font-bold text-primary-foreground leading-tight mb-3">
 {mode ==="signup"? (
 <>Start your journey<br />to a dream home</>
 ) : (
 <>Find your perfect<br />place to call home</>
 )}
 </h2>
 <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
 {mode ==="signup"
 ?"Join thousands of happy homeowners and renters who found their perfect space."
 :"Thousands of verified listings. Trusted by renters and landlords across the country."}
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
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors z-20"
 >
 <svg width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="#6b7280"strokeWidth="2.5"strokeLinecap="round">
 <line x1="18"y1="6"x2="6"y2="18"/>
 <line x1="6"y1="6"x2="18"y2="18"/>
 </svg>
 </button>
 </div>
 </div>
 );
}

// ── Owner Details Modal ─────────────────────────────────────────────────────
function OwnerDetailsModal({
 owner,
 propertyTitle,
 onClose,
}: {
 owner: OwnerInfo;
 propertyTitle: string;
 onClose: () => void;
}) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
 <div className="absolute inset-0"onClick={onClose} />
 <div className="relative z-10 w-full max-w-sm mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center z-20"
 >
 <X className="w-4 h-4 text-muted-foreground"/>
 </button>

 <div className="p-8">
 <div className="text-center mb-6">
 <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-success flex items-center justify-center">
 <User className="w-7 h-7 text-success"/>
 </div>
 <h2 className="text-lg font-bold text-foreground">Owner Details</h2>
 <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{propertyTitle}</p>
 </div>

 <div className="space-y-4">
 <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
 <User className="w-5 h-5 text-primary flex-shrink-0"/>
 <div>
 <p className="text-xs text-muted-foreground">Name</p>
 <p className="text-sm font-semibold text-foreground">{owner.name}</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
 <Phone className="w-5 h-5 text-primary flex-shrink-0"/>
 <div>
 <p className="text-xs text-muted-foreground">Phone</p>
 <a
 href={`tel:${owner.phone}`}
 className="text-sm font-semibold text-primary hover:underline"
 >
 {owner.phone}
 </a>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
 <Mail className="w-5 h-5 text-primary flex-shrink-0"/>
 <div>
 <p className="text-xs text-muted-foreground">Email</p>
 <a
 href={`mailto:${owner.email}`}
 className="text-sm font-semibold text-primary hover:underline break-all"
 >
 {owner.email}
 </a>
 </div>
 </div>
 </div>

 <p className="text-center text-xs text-muted-foreground mt-5">
 Contact the owner directly — Zero brokerage!
 </p>
 </div>
 </div>
 </div>
 );
}

// ── Property Card ───────────────────────────────────────────────────────────
function PropertyCard({
 property,
 onGetOwnerDetails,
}: {
 property: Property;
 onGetOwnerDetails: (property: Property) => void;
}) {
 const image = property.media?.images?.[0]?.url ||"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";
 const area =
 property.specs?.area?.carpet ||
 property.specs?.area?.builtUp ||
 property.specs?.area?.superBuiltUp;
 const areaUnit = property.specs?.area?.unit ||"sqft";

 return (
 <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group">
 <div className="flex flex-col sm:flex-row">
 {/* Image */}
 <div className="relative sm:w-72 h-52 sm:h-auto flex-shrink-0">
 <Link href={`/property/${property.slug}`}>
 <img
 src={image}
 alt={property.title}
 className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
 />
 </Link>
 {/* Purpose badge */}
 <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-card/90 backdrop-blur text-foreground shadow-sm">
 {purposeLabel(property.purpose)}
 </span>
 <SavedPropertyButton propertyId={property._id} />
 {property.featured?.isFeatured && (
 <span className="absolute top-14 right-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-warning text-warning">
 Featured
 </span>
 )}
 {/* Image count */}
 {property.media?.images?.length > 1 && (
 <span className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium rounded-md bg-black/60 text-primary-foreground">
 1/{property.media.images.length}
 </span>
 )}
 </div>

 {/* Details */}
 <div className="flex-1 p-5 flex flex-col">
 {/* Price */}
 <div className="flex items-baseline gap-1 mb-1">
 <span className="text-xl font-bold text-foreground">
 {formatPrice(property.price.amount)}
 </span>
 <span className="text-sm text-muted-foreground">
 {formatPriceLabel(property.purpose)}
 </span>
 {property.price.negotiable && (
 <span className="ml-2 text-xs text-success font-medium">Negotiable</span>
 )}
 </div>

 {/* Maintenance & Deposit for rent */}
 {(property.purpose ==="rent"|| property.purpose ==="lease") &&
 property.price.deposit && (
 <p className="text-xs text-muted-foreground mb-2">
 Deposit: ₹{property.price.deposit.toLocaleString("en-IN")}
 {property.price.maintenance
 ?`· Maintenance: ₹${property.price.maintenance.toLocaleString("en-IN")}/mo`
 :""}
 </p>
 )}

 {/* Title */}
 <Link href={`/property/${property.slug}`}>
 <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 mb-1">
 {property.title}
 </h3>
 </Link>

 {/* Location */}
 <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
 <MapPin className="w-3.5 h-3.5 flex-shrink-0"/>
 <span className="line-clamp-1">
 {property.location.locality}, {property.location.city}
 </span>
 </div>

 {/* Specs */}
 <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
 {property.specs?.bedrooms != null && (
 <div className="flex items-center gap-1">
 <BedDouble className="w-4 h-4 text-muted-foreground"/>
 <span>{property.specs.bedrooms} BHK</span>
 </div>
 )}
 {property.specs?.bathrooms != null && (
 <div className="flex items-center gap-1">
 <Bath className="w-4 h-4 text-muted-foreground"/>
 <span>{property.specs.bathrooms} Bath</span>
 </div>
 )}
 {area && (
 <div className="flex items-center gap-1">
 <Maximize className="w-4 h-4 text-muted-foreground"/>
 <span>
 {area} {areaUnit}
 </span>
 </div>
 )}
 {(property.specs?.parking?.covered || 0) > 0 && (
 <div className="flex items-center gap-1">
 <Car className="w-4 h-4 text-muted-foreground"/>
 <span>{property.specs!.parking!.covered} Parking</span>
 </div>
 )}
 </div>

 {/* Tags */}
 <div className="flex items-center gap-2 flex-wrap mb-4">
 {property.specs?.furnishing && (
 <span className="px-2.5 py-1 text-xs rounded-full bg-primary text-primary font-medium">
 {furnishingLabel(property.specs.furnishing)}
 </span>
 )}
 {property.specs?.possessionStatus ==="under_construction"&& (
 <span className="px-2.5 py-1 text-xs rounded-full bg-warning text-warning font-medium">
 Under Construction
 </span>
 )}
 {property.propertyType && (
 <span className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground font-medium capitalize">
 {property.propertyType}
 </span>
 )}
 {property.amenities?.slice(0, 3).map((a) => (
 <span
 key={a}
 className="px-2.5 py-1 text-xs rounded-full bg-primary text-primary font-medium"
 >
 {a}
 </span>
 ))}
 </div>

 {/* Footer */}
 <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
 <span className="text-xs text-muted-foreground">{timeAgo(property.publishedAt)}</span>
 <button
 onClick={() => onGetOwnerDetails(property)}
 className="px-5 py-2.5 bg-primary hover:bg-primary text-primary-foreground text-sm font-semibold rounded-xl transition-colors shadow-sm"
 >
 Get Owner Details
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

// ── Search Results Content ──────────────────────────────────────────────────
function SearchContent() {
 const searchParams = useSearchParams();
 const router = useRouter();

 const [results, setResults] = useState<SearchResult | null>(null);
 const [loading, setLoading] = useState(true);

 // Modal states
 const [showSignup, setShowSignup] = useState(false);
 const [showOwner, setShowOwner] = useState(false);
 const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
 const [ownerLoading, setOwnerLoading] = useState(false);
 const [pendingSlug, setPendingSlug] = useState<string | null>(null);
 const [pendingTitle, setPendingTitle] = useState("");

 // Current search info
 const city = searchParams.get("city") ||"";
 const purpose = searchParams.get("purpose") ||"";
 const category = searchParams.get("category") ||"";
 const q = searchParams.get("q") ||"";
 const page = parseInt(searchParams.get("page") ||"1", 10);

 const fetchProperties = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams(searchParams.toString());
 const res = await fetch(`/api/properties?${params.toString()}`);
 const data = await res.json();
 setResults(data);
 } catch {
 setResults({ properties: [], total: 0, page: 1, totalPages: 0 });
 } finally {
 setLoading(false);
 }
 }, [searchParams]);

 useEffect(() => {
 fetchProperties();
 }, [fetchProperties]);

 // Fetch owner details
 const fetchOwnerDetails = async (slug: string, token: string) => {
 setOwnerLoading(true);
 try {
 const res = await fetch(`/api/properties/${slug}/owner`, {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (res.ok) {
 const data = await res.json();
 setOwnerInfo(data.owner);
 setShowOwner(true);
 }
 } catch {
 // ignore
 } finally {
 setOwnerLoading(false);
 }
 };

 // Handle"Get Owner Details"click
 const handleGetOwnerDetails = (property: Property) => {
 const token = localStorage.getItem("token");
 setPendingSlug(property.slug);
 setPendingTitle(property.title);

 if (!token) {
 setShowSignup(true);
 } else {
 fetchOwnerDetails(property.slug, token);
 }
 };

 // After signup success, automatically fetch owner details
 const handleAuthSuccess = (token: string) => {
 setShowSignup(false);
 if (pendingSlug) {
 fetchOwnerDetails(pendingSlug, token);
 }
 };

 // Pagination
 const goToPage = (p: number) => {
 const params = new URLSearchParams(searchParams.toString());
 params.set("page", String(p));
 router.push(`/properties?${params.toString()}`);
 };

 // Build title
 const purposeLabels: Record<string, string> = {
 sell:"Buy",
 rent:"Rent",
 pg:"PG",
 lease:"Commercial Rent",
 };
 const searchTitle = [
 purposeLabels[purpose] ||"Properties",
 category ==="commercial"?"Commercial Properties":"Properties",
 city ?`in ${city}`:"",
 q ?`near"${q}"`:"",
 ]
 .filter(Boolean)
 .join("");

 return (
 <div className="min-h-screen bg-background">
 {/* Header */}
 <header className="bg-card border-b border-border sticky top-0 z-30">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
 <Link href="/"className="flex items-center gap-2">
 <span className="text-xl font-black text-primary">
 <span className="text-foreground">ease</span>your<span className="text-foreground">estate</span>
 <span className="text-primary">.ai</span>
 </span>
 </Link>
 <div className="flex items-center gap-3">
 <Link
 href="/"
 className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
 >
 <Home className="w-4 h-4"/>
 Home
 </Link>
 </div>
 </div>
 </header>

 {/* Search summary bar */}
 <div className="bg-card border-b border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-2">
 <div className="flex items-center gap-2">
 <SlidersHorizontal className="w-4 h-4 text-muted-foreground"/>
 <h1 className="text-base font-semibold text-foreground">{searchTitle}</h1>
 {results && (
 <span className="text-sm text-muted-foreground">
 ({results.total} results)
 </span>
 )}
 </div>
 <div className="flex items-center gap-2">
 {city && (
 <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary">
 {city}
 </span>
 )}
 {q && (
 <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary">
 {q}
 </span>
 )}
 {purpose && (
 <span className="px-3 py-1 text-xs font-medium rounded-full bg-success text-success capitalize">
 {purposeLabels[purpose] || purpose}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Results */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-3"/>
 <p className="text-muted-foreground text-sm">Searching properties...</p>
 </div>
 ) : results && results.properties.length > 0 ? (
 <>
 <div className="space-y-4">
 {results.properties.map((property) => (
 <PropertyCard
 key={property._id}
 property={property}
 onGetOwnerDetails={handleGetOwnerDetails}
 />
 ))}
 </div>

 {/* Pagination */}
 {results.totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 mt-8">
 <button
 onClick={() => goToPage(page - 1)}
 disabled={page <= 1}
 className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft className="w-5 h-5"/>
 </button>
 {Array.from({ length: Math.min(results.totalPages, 7) }, (_, i) => {
 let pageNum: number;
 if (results.totalPages <= 7) {
 pageNum = i + 1;
 } else if (page <= 4) {
 pageNum = i + 1;
 } else if (page >= results.totalPages - 3) {
 pageNum = results.totalPages - 6 + i;
 } else {
 pageNum = page - 3 + i;
 }
 return (
 <button
 key={pageNum}
 onClick={() => goToPage(pageNum)}
 className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
 pageNum === page
 ?"bg-primary text-primary-foreground"
 :"border border-border text-muted-foreground hover:bg-primary hover:text-primary"
 }`}
 >
 {pageNum}
 </button>
 );
 })}
 <button
 onClick={() => goToPage(page + 1)}
 disabled={page >= results.totalPages}
 className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRight className="w-5 h-5"/>
 </button>
 </div>
 )}
 </>
 ) : (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <Building2 className="w-16 h-16 text-muted-foreground mb-4"/>
 <h2 className="text-xl font-semibold text-foreground mb-2">
 No properties found
 </h2>
 <p className="text-muted-foreground text-sm mb-6 max-w-md">
 We couldn&apos;t find any properties matching your search criteria. Try adjusting your
 filters or searching in a different area.
 </p>
 <Link
 href="/"
 className="px-6 py-3 bg-primary hover:bg-primary text-primary-foreground font-semibold rounded-xl transition-colors text-sm"
 >
 Back to Home
 </Link>
 </div>
 )}
 </div>

 {/* Loading overlay for owner details */}
 {ownerLoading && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
 <div className="bg-card rounded-2xl p-8 flex flex-col items-center gap-3">
 <Loader2 className="w-8 h-8 text-primary animate-spin"/>
 <p className="text-sm text-muted-foreground">Fetching owner details...</p>
 </div>
 </div>
 )}

 {/* Signup Modal */}
 {showSignup && (
 <SignUpModal
 onClose={() => setShowSignup(false)}
 onSuccess={handleAuthSuccess}
 />
 )}

 {/* Owner Details Modal */}
 {showOwner && ownerInfo && (
 <OwnerDetailsModal
 owner={ownerInfo}
 propertyTitle={pendingTitle}
 onClose={() => {
 setShowOwner(false);
 setOwnerInfo(null);
 }}
 />
 )}
 </div>
 );
}

// ── Page wrapper with Suspense ──────────────────────────────────────────────
export default function PropertiesPage() {
 return (
 <Suspense
 fallback={
 <div className="min-h-screen bg-background flex items-center justify-center">
 <Loader2 className="w-8 h-8 text-primary animate-spin"/>
 </div>
 }
 >
 <SearchContent />
 </Suspense>
 );
}
