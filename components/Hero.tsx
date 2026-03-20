"use client";

import { useState, useEffect, useRef } from"react";
import { useRouter } from"next/navigation";
import {
 Search,
 MapPin,
 ChevronDown,
 Building2,
 Truck,
 Tag,
} from"lucide-react";


const CITIES = ["Bangalore","Mumbai","Delhi","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad"];
const BHK_TYPES = ["1 BHK","2 BHK","3 BHK","4 BHK","4+ BHK"];

export default function Hero() {
 const [activeTab, setActiveTab] = useState<"Buy"|"Rent"|"Commercial"|"PG">(
"Rent",
 );
 const [activeType, setActiveType] = useState<
"Full House"|"PG/Hostel"|"Flatmates"
 >("Full House");

 const [selectedCity, setSelectedCity] = useState("Bangalore");
 const [selectedBHK, setSelectedBHK] = useState("");
 const [cityDropdown, setCityDropdown] = useState(false);
 const [bhkDropdown, setBhkDropdown] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [suggestions, setSuggestions] = useState<
 { id: string; locality: string; title: string; address: string; city: string; state: string; pincode: string }[]
 >([]);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const router = useRouter();
 const searchContainerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const fetchSuggestions = async () => {
 if (searchQuery.length < 2) {
 setSuggestions([]);
 return;
 }
 try {
 const res = await fetch(`/api/localities?city=${selectedCity}&query=${searchQuery}`);
 const data = await res.json();
 setSuggestions(data.suggestions || []);
 } catch (err) {
 console.error("Failed to fetch suggestions", err);
 }
 };

 const timer = setTimeout(fetchSuggestions, 300);
 return () => clearTimeout(timer);
 }, [searchQuery, selectedCity]);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
 setShowSuggestions(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSearch = (locality?: string) => {
 const query = locality || searchQuery;
 const params = new URLSearchParams();
 params.set("city", selectedCity);
 if (query) params.set("query", query);
 if (activeTab ==="PG") {
 params.set("purpose","PG");
 params.set("type","PG/Hostel");
 } else {
 if (activeTab) params.set("purpose", activeTab);
 if (activeType) params.set("type", activeType);
 }
 if (selectedBHK) params.set("bhk", selectedBHK);

 router.push(`/search?${params.toString()}`);
 };

return (
 <>
 <section className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden pt-20 sm:pt-24">
 {/* Background */}
 <div
 className="absolute inset-0 bg-cover bg-center bg-no-repeat"
 style={{
 backgroundImage:`url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80')`,
 }}
 />
 <div className="absolute inset-0 bg-linear-to-br from-gray-900/80 via-gray-800/65 to-primary"/>
 <div
 className="absolute inset-0 opacity-[0.04]"
 style={{
 backgroundImage:`radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
 backgroundSize:"32px 32px",
 }}
 />

 {/* Hero content */}
 <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 w-full max-w-4xl mx-auto">
 {/* Badge */}
 <div className="flex items-center justify-center mb-6 mt-2 sm:mt-4">
 <div className="flex flex-wrap items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card/10 backdrop-blur border border-white/20 text-primary-foreground text-xs sm:text-sm font-medium">
 <Truck className="w-4 h-4 text-primary"/>
 <span className="text-primary-foreground/90">Packers And Movers</span>
 <div className="w-px h-4 bg-card/30"/>
 <Tag className="w-4 h-4 text-primary"/>
 <span className="text-primary-foreground/90">Lowest Prices</span>
 </div>
 </div>

 {/* Headline */}
 <h1 className="text-center text-3xl sm:text-5xl lg:text-6xl font-black text-primary-foreground leading-tight mb-3 tracking-tight drop-shadow-lg">
 More Comfortable.{""}
 <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary">
 More Classy.
 </span>
 </h1>
 <p className="text-primary-foreground/70 text-sm sm:text-lg mb-8 sm:mb-10 text-center">
 Find your perfect property — no brokers, zero commissions.
 </p>

 {/* Search card */}
 <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl shadow-black/30 overflow-visible">
 {/* Tabs */}
 <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
 {(["Buy","Rent","Commercial","PG"] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors relative ${activeTab === tab
 ?"text-primary"
 :"text-muted-foreground hover:text-foreground"
 }`}
 >
 {tab}
 {activeTab === tab && (
 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"/>
 )}
 </button>
 ))}
 </div>

 {/* Search row */}
 <div className="p-3 sm:p-4 pb-0">
 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
 {/* City dropdown */}
 <div className="relative w-full sm:w-auto">
 <button
 onClick={() => {
 setCityDropdown(!cityDropdown);
 setBhkDropdown(false);
 }}
 className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 px-3 py-3 text-foreground font-medium text-sm hover:bg-muted rounded-xl transition-colors whitespace-nowrap"
 >
 <MapPin className="w-4 h-4 text-primary"/>
 {selectedCity}
 <ChevronDown
 className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${cityDropdown ?"rotate-180":""}`}
 />
 </button>
 {cityDropdown && (
 <div className="absolute top-full left-0 mt-1 w-full sm:w-44 bg-card rounded-xl shadow-xl border border-border py-1 z-50">
 {CITIES.map((city) => (
 <button
 key={city}
 onClick={() => {
 setSelectedCity(city);
 setCityDropdown(false);
 }}
 className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors ${selectedCity === city
 ?"text-primary font-medium bg-primary/10"
 :"text-foreground"
 }`}
 >
 {city}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Divider */}
 <div className="hidden sm:block w-px h-8 bg-muted mx-1"/>

 {/* Search input */}
 <div className="flex-1 relative"ref={searchContainerRef}>
 <input
 type="text"
 value={searchQuery}
 onFocus={() => setShowSuggestions(true)}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setShowSuggestions(true);
 }}
 onKeyDown={(e) => e.key ==="Enter"&& handleSearch()}
 placeholder="Search upto 3 localities or landmarks"
 className="w-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-muted/40 rounded-xl sm:bg-transparent sm:rounded-none"
 />
 {showSuggestions && suggestions.length > 0 && (
 <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-xl border border-border py-1 z-50 max-h-96 overflow-y-auto">
 {suggestions.map((s) => (
 <button
 key={s.id}
 onClick={() => {
 setSearchQuery(s.locality);
 setShowSuggestions(false);
 handleSearch(s.locality);
 }}
 className="w-full text-left px-4 py-3 hover:bg-primary transition-colors flex items-start justify-between group border-b border-border last:border-0"
 >
 <div className="flex items-start gap-3">
 <div className="mt-1 w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary transition-colors">
 <Building2 className="w-4 h-4"/>
 </div>
 <div>
 <div className="text-sm font-bold text-foreground group-hover:text-primary leading-tight">
 {s.title}
 </div>
 <div className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
 {s.address}, {s.locality}, {s.city}, {s.state} {s.pincode}
 </div>
 </div>
 </div>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Search button */}
 <button
 onClick={() => handleSearch()}
 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:m-1 bg-primary hover:bg-primary text-primary-foreground text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-primary"
 >
 <Search className="w-4 h-4"/>
 Search
 </button>
 </div>
 </div>

 {/* Filters row — hidden when PG tab is active */}
 {activeTab !=="PG"&& (
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pb-4 pt-3">
 <div className="flex flex-wrap items-center gap-3 sm:gap-5">
 {(["Full House","PG/Hostel","Flatmates"] as const).map(
 (type) => (
 <label
 key={type}
 className="flex items-center gap-2 cursor-pointer group"
 >
 <div
 onClick={() => setActiveType(type)}
 className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${activeType === type
 ?"border-primary bg-primary"
 :"border-border group-hover:border-primary"
 }`}
 >
 {activeType === type && (
 <div className="w-1.5 h-1.5 rounded-full bg-card"/>
 )}
 </div>
 <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
 {type}
 </span>
 </label>
 ),
 )}
 </div>

 {/* BHK dropdown */}
 <div className="relative w-full sm:w-auto">
 <button
 onClick={() => {
 setBhkDropdown(!bhkDropdown);
 setCityDropdown(false);
 }}
 className="w-full sm:w-auto flex items-center justify-between gap-1.5 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
 >
 {selectedBHK ||"BHK Type"}
 <ChevronDown
 className={`w-3.5 h-3.5 transition-transform ${bhkDropdown ?"rotate-180":""}`}
 />
 </button>
 {bhkDropdown && (
 <div className="absolute top-full right-0 mt-1 w-full sm:w-36 bg-card rounded-xl shadow-xl border border-border py-1 z-50">
 <button
 onClick={() => {
 setSelectedBHK("");
 setBhkDropdown(false);
 }}
 className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-primary/10 transition-colors"
 >
 Any BHK
 </button>
 {BHK_TYPES.map((bhk) => (
 <button
 key={bhk}
 onClick={() => {
 setSelectedBHK(bhk);
 setBhkDropdown(false);
 }}
 className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors ${selectedBHK === bhk
 ?"text-primary font-medium bg-primary/10"
 :"text-foreground"
 }`}
 >
 {bhk}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Property owner CTA */}
 <div className="mt-8 flex flex-col items-center gap-3">
 <div className="flex items-center gap-3 w-full max-w-xs">
 <div className="flex-1 h-px bg-card/20"/>
 <span className="text-primary-foreground/70 text-sm font-medium whitespace-nowrap">
 Are you a Property Owner?
 </span>
 <div className="flex-1 h-px bg-card/20"/>
 </div>
 <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary transition-all hover:scale-[1.02] active:scale-[0.98]">
 Post Free Property Ad
 </button>
 </div>
 </div>

 {/* Scroll indicator */}
 <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-primary-foreground/50 animate-bounce">
 <ChevronDown className="w-5 h-5"/>
 </div>
 </section>
 <section className="bg-primary text-primary-foreground py-6">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
 {[
 { value:"10 Lakh+", label:"Happy Customers"},
 { value:"5 Lakh+", label:"Active Listings"},
 { value:"35+", label:"Cities Covered"},
 { value:"Zero", label:"Brokerage"},
 ].map((stat) => (
 <div key={stat.label}>
 <div className="text-xl sm:text-2xl font-black">{stat.value}</div>
 <div className="text-primary-foreground/80 text-xs sm:text-sm mt-0.5">{stat.label}</div>
 </div>
 ))}
 </div>
 </div>
 </section>
 </>
);
}
