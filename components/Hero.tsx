"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Building2,
  CreditCard,
  LogIn,
  Menu,
  Star,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Truck,
  Tag,
  X,
} from "lucide-react";


const CITIES = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];
const BHK_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

export default function Hero() {
  const [activeTab, setActiveTab] = useState<"Buy" | "Rent" | "Commercial">(
    "Rent",
  );
  const [activeType, setActiveType] = useState<
    "Full House" | "PG/Hostel" | "Flatmates"
  >("Full House");
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [selectedBHK, setSelectedBHK] = useState("");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [bhkDropdown, setBhkDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/65 to-purple-800/40" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl mx-auto">
        {/* Badge */}
        <div className="flex items-center gap-6 mb-8 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium">
            <Truck className="w-4 h-4 text-purple-300" />
            <span className="text-white/90">Packers And Movers</span>
            <div className="w-px h-4 bg-white/30" />
            <Tag className="w-4 h-4 text-purple-300" />
            <span className="text-white/90">Lowest Prices</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 tracking-tight drop-shadow-lg">
          More Comfortable.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-400">
            More Classy.
          </span>
        </h1>
        <p className="text-white/70 text-lg mb-10 text-center">
          Find your perfect property — no brokers, zero commissions.
        </p>

        {/* Search card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-visible">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["Buy", "Rent", "Commercial"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab
                    ? "text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Search row */}
          <div className="flex items-center gap-0 p-4 pb-0">
            {/* City dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setCityDropdown(!cityDropdown);
                  setBhkDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-3 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap"
              >
                <MapPin className="w-4 h-4 text-purple-500" />
                {selectedCity}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${cityDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {cityDropdown && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                        selectedCity === city
                          ? "text-purple-600 font-medium bg-purple-50/60"
                          : "text-gray-700"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 mx-1" />

            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search upto 3 localities or landmarks"
              className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
            />

            {/* Search button */}
            <button className="flex items-center gap-2 px-6 py-3 m-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-purple-200">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Filters row */}
          <div className="flex items-center justify-between px-4 pb-4 pt-3">
            <div className="flex items-center gap-5">
              {(["Full House", "PG/Hostel", "Flatmates"] as const).map(
                (type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      onClick={() => setActiveType(type)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        activeType === type
                          ? "border-purple-600 bg-purple-600"
                          : "border-gray-300 group-hover:border-purple-400"
                      }`}
                    >
                      {activeType === type && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      {type}
                    </span>
                  </label>
                ),
              )}
            </div>

            {/* BHK dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setBhkDropdown(!bhkDropdown);
                  setCityDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
              >
                {selectedBHK || "BHK Type"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${bhkDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {bhkDropdown && (
                <div className="absolute bottom-full right-0 mb-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => {
                      setSelectedBHK("");
                      setBhkDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-purple-50 transition-colors"
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
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                        selectedBHK === bhk
                          ? "text-purple-600 font-medium bg-purple-50/60"
                          : "text-gray-700"
                      }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property owner CTA */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/70 text-sm font-medium whitespace-nowrap">
              Are you a Property Owner?
            </span>
            <div className="flex-1 h-px bg-white/20" />
          </div>
          <button className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Post Free Property Ad
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
    <section className="bg-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10 Lakh+", label: "Happy Customers" },
              { value: "5 Lakh+", label: "Active Listings" },
              { value: "35+", label: "Cities Covered" },
              { value: "Zero", label: "Brokerage" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-purple-200 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </>
  );
}
