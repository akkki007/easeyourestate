"use client";

import { useState, useEffect, useRef } from"react";
import { useRouter } from"next/navigation";
import {
 Search,
 MapPin,
 ChevronDown,
 Building2,
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
 <section className="bg-background pt-24 sm:pt-28 border-b border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
 <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
 <div className="max-w-2xl">
 <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-[4px]">
 Home for Better Living
 </span>
 <h1 className="mt-6 text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1.02] tracking-tight text-foreground">
 <span className="block font-serif italic font-normal">
 Explore your next
 </span>
 <span className="block font-medium">
 living designed for modern lifestyles today.
 </span>
 </h1>
 <p className="mt-4 max-w-xl text-sm sm:text-base text-muted-foreground">
 Discover a new era of comfort and convenience. Next-level living designed to elevate your everyday lifestyle.
 </p>
 </div>

 <div className="lg:pb-3">
 <div className="flex items-center -space-x-3">
 {["RK","AJ","MS","PK"].map((initials) => (
 <div
 key={initials}
 className="h-10 w-10 rounded-full border-2 border-background bg-zinc-300 text-zinc-800 text-xs font-semibold flex items-center justify-center"
 >
 {initials}
 </div>
 ))}
 </div>
 <p className="mt-3 text-xs text-foreground font-medium underline underline-offset-2">
 250 Reviews 4.5/5 out of 5.0
 </p>
 </div>
 </div>

 <div className="relative mt-10">
 <div
 className="h-[330px] sm:h-[420px] lg:h-[470px] border border-border bg-cover bg-center"
 style={{ backgroundImage:"url('/hero-sect.png')" }}
 />

 <div className="absolute left-1/2 -bottom-16 w-[94%] -translate-x-1/2 max-w-6xl">
 <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl shadow-black/30 overflow-visible mx-auto">
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
 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:m-1 bg-primary hover:bg-primary  text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-primary"
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
 </div>
 </div>
 </div>
 </section>
 <div className="h-24 sm:h-28 bg-background"/>
 </>
);
}
