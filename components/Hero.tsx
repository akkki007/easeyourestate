"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { decreaseCredit } from "@/store/creditSlice";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Truck,
  Tag,
  Loader2,
} from "lucide-react";

const CITIES = ["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
const BHK_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const PROPERTY_STATUSES = ["Ready to Move", "Under Construction"];
const COMMERCIAL_TYPES = ["Office Space", "Shop", "Warehouse", "Showroom"];

type Tab = "Buy" | "Rent" | "Commercial";
type BuySubType = "Full House" | "Land/Plot";
type RentSubType = "Full House" | "PG/Hostel" | "Flatmates";
type CommercialSubType = "Rent" | "Buy";

export default function Hero() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("Rent");

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);




  //pop up alert
  const [showPopup, setShowPopup] = useState(false);

  // Filter states
  const [buySubType, setBuySubType] = useState<BuySubType>("Full House");
  const [rentSubType, setRentSubType] = useState<RentSubType>("Full House");
  const [commercialSubType, setCommercialSubType] = useState<CommercialSubType>("Rent");

  const [selectedCity, setSelectedCity] = useState("Pune");
  const [selectedBHK, setSelectedBHK] = useState("");
  const [selectedPropertyStatus, setSelectedPropertyStatus] = useState("");
  const [selectedCommercialType, setSelectedCommercialType] = useState("");
  const [newBuilderProjects, setNewBuilderProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown states
  const [cityDropdown, setCityDropdown] = useState(false);
  const [bhkDropdown, setBhkDropdown] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [commercialTypeDropdown, setCommercialTypeDropdown] = useState(false);

  // Locality suggestions
  const [suggestions, setSuggestions] = useState<
    Array<{ locality: string; city: string; count: number }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchCredits = useSelector(
    (state: RootState) => state.credits.searchCredits
  );

  const dispatch = useDispatch();


  // Fetch locality suggestions with debounce
  const fetchSuggestions = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setSuggestionsLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/properties/localities?q=${encodeURIComponent(query.trim())}&city=${encodeURIComponent(selectedCity)}`
          );
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions((data.suggestions || []).length > 0);
        } catch {
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 250);
    },
    [selectedCity]
  );

  //Function to Add Location (Max 3 Only)
  const handleLocationSelect = (location: string) => {
    if (selectedLocations.length >= 3) {
      alert("You can only select 3 locations");
      return;
    }

    if (!selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
    }
  };


  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const selectSuggestion = (locality: string) => {
    if (selectedLocations.length >= 3) {
      alert("You can only select 3 locations");
      return;
    }

    if (!selectedLocations.includes(locality)) {
      setSelectedLocations([...selectedLocations, locality]);
    }

    setSearchQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
  };


  useEffect(() => {
    localStorage.setItem("searchCredits", searchCredits.toString());
  }, [searchCredits]);

  // Close dropdowns on outside click
  const searchCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchCardRef.current && !searchCardRef.current.contains(e.target as Node)) {
        setCityDropdown(false);
        setBhkDropdown(false);
        setStatusDropdown(false);
        setCommercialTypeDropdown(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAllDropdowns = () => {
    setCityDropdown(false);
    setBhkDropdown(false);
    setStatusDropdown(false);
    setCommercialTypeDropdown(false);
  };

  // Build search URL and navigate
  const handleSearch = () => {

    if (searchCredits <= 0) {
      setShowPopup(true);
      return;
    }

    if (selectedLocations.length === 0) {
      alert("Please select at least one location");
      return;
    }


    const params = new URLSearchParams();

    params.set("locations", selectedLocations.join(","));

    params.set("city", selectedCity);

    if (activeTab === "Buy") {
      params.set("purpose", "sell");
      params.set("category", buySubType === "Land/Plot" ? "residential" : "residential");
      if (buySubType === "Land/Plot") {
        params.set("propertyType", "plot");
      } else {
        if (selectedBHK) {
          params.set("bedrooms", selectedBHK.replace(/[^0-9]/g, ""));
        }
        if (selectedPropertyStatus === "Ready to Move") {
          params.set("possessionStatus", "ready");
        } else if (selectedPropertyStatus === "Under Construction") {
          params.set("possessionStatus", "under_construction");
        }
        if (newBuilderProjects) {
          params.set("listingType", "builder");
        }
      }
    } else if (activeTab === "Rent") {
      if (rentSubType === "PG/Hostel") {
        params.set("purpose", "pg");
      } else if (rentSubType === "Flatmates") {
        params.set("purpose", "rent");
        params.set("sharing", "true");
      } else {
        params.set("purpose", "rent");
      }
      params.set("category", "residential");
      if (selectedBHK) {
        params.set("bedrooms", selectedBHK.replace(/[^0-9]/g, ""));
      }
    } else if (activeTab === "Commercial") {
      params.set("category", "commercial");
      if (commercialSubType === "Rent") {
        params.set("purpose", "lease");
      } else {
        params.set("purpose", "sell");
      }
      if (selectedCommercialType) {
        const typeMap: Record<string, string> = {
          "Office Space": "office",
          Shop: "shop",
          Warehouse: "warehouse",
          Showroom: "showroom",
        };
        params.set("propertyType", typeMap[selectedCommercialType] || "");
      }
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    router.push(`/properties?${params.toString()}`);

    dispatch(decreaseCredit());
  };

  // Radio button component
  const Radio = ({
    label,
    selected,
    onClick,
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer group" onClick={onClick}>
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selected
          ? "border-emerald-500 bg-emerald-500"
          : "border-gray-300 group-hover:border-emerald-400"
          }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors select-none">
        {label}
      </span>
    </label>
  );

  // Dropdown component
  const Dropdown = ({
    label,
    value,
    options,
    isOpen,
    onToggle,
    onSelect,
    clearLabel,
  }: {
    label: string;
    value: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (val: string) => void;
    clearLabel?: string;
  }) => (
    <div className="relative">
      <button
        onClick={() => {
          closeAllDropdowns();
          onToggle();
        }}
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors"
      >
        {value || label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          {clearLabel && (
            <button
              onClick={() => {
                onSelect("");
                closeAllDropdowns();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 transition-colors"
            >
              {clearLabel}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                closeAllDropdowns();
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 transition-colors ${value === opt
                ? "text-red-500 font-medium bg-red-50/60"
                : "text-gray-700"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

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

          {/* Display Credits on Top */}



          {/* Search card */}
          <div
            ref={searchCardRef}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-visible"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["Buy", "Rent", "Commercial"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    closeAllDropdowns();
                  }}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${activeTab === tab
                    ? "text-red-500"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t" />
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
                    closeAllDropdowns();
                    setCityDropdown(!cityDropdown);
                  }}
                  className="flex items-center gap-1.5 px-3 py-3 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
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
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 transition-colors ${selectedCity === city
                          ? "text-red-500 font-medium bg-red-50/60"
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

              {/* Search input with suggestions */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (searchQuery.trim() !== "") {
                        if (selectedLocations.length >= 3) {
                          alert("You can only select 3 locations");
                          return;
                        }

                        if (!selectedLocations.includes(searchQuery.trim())) {
                          setSelectedLocations([
                            ...selectedLocations,
                            searchQuery.trim(),
                          ]);
                        }

                        setSearchQuery("");
                      }

                      setShowSuggestions(false);
                      handleSearch();
                    }

                    if (e.key === "Escape") setShowSuggestions(false);
                  }}
                  placeholder="Search upto 3 localities or landmarks"
                  className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
                />

                {/* Display Selected Locations */}
                <div className="flex gap-2 mt-2">
                  {selectedLocations.map((loc, index) => (
                    <span
                      key={index}
                      className="bg-purple-200 px-3 py-1 rounded-full text-sm"
                    >
                      {loc}
                    </span>
                  ))}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 max-h-64 overflow-y-auto">
                    {suggestionsLoading ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((s) => (
                        <button
                          key={`${s.locality}-${s.city}`}
                          onClick={() => selectSuggestion(s.locality)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800">
                              {s.locality}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">{s.city}</span>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {s.count} {s.count === 1 ? "property" : "properties"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                disabled={searchCredits <= 0}
                className={`px-6 py-2 rounded-lg ${searchCredits <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                Search
              </button>
            </div>

            {/* Filters row - varies by tab */}
            <div className="flex items-center justify-between px-4 pb-4 pt-3 flex-wrap gap-3">
              {/* ── Buy tab filters ── */}
              {activeTab === "Buy" && (
                <>
                  <div className="flex items-center gap-5">
                    <Radio
                      label="Full House"
                      selected={buySubType === "Full House"}
                      onClick={() => setBuySubType("Full House")}
                    />
                    <Radio
                      label="Land/Plot"
                      selected={buySubType === "Land/Plot"}
                      onClick={() => setBuySubType("Land/Plot")}
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {buySubType === "Full House" && (
                      <>
                        <Dropdown
                          label="BHK Type"
                          value={selectedBHK}
                          options={BHK_TYPES}
                          isOpen={bhkDropdown}
                          onToggle={() => setBhkDropdown(!bhkDropdown)}
                          onSelect={setSelectedBHK}
                          clearLabel="Any BHK"
                        />
                        <Dropdown
                          label="Property Status"
                          value={selectedPropertyStatus}
                          options={PROPERTY_STATUSES}
                          isOpen={statusDropdown}
                          onToggle={() => setStatusDropdown(!statusDropdown)}
                          onSelect={setSelectedPropertyStatus}
                          clearLabel="Any Status"
                        />
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={newBuilderProjects}
                            onChange={(e) => setNewBuilderProjects(e.target.checked)}
                            className="w-4 h-4 accent-red-500 rounded"
                          />
                          <span className="select-none">New Builder Projects</span>
                        </label>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── Rent tab filters ── */}
              {activeTab === "Rent" && (
                <>
                  <div className="flex items-center gap-5">
                    <Radio
                      label="Full House"
                      selected={rentSubType === "Full House"}
                      onClick={() => setRentSubType("Full House")}
                    />
                    <Radio
                      label="PG/Hostel"
                      selected={rentSubType === "PG/Hostel"}
                      onClick={() => setRentSubType("PG/Hostel")}
                    />
                    <Radio
                      label="Flatmates"
                      selected={rentSubType === "Flatmates"}
                      onClick={() => setRentSubType("Flatmates")}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {rentSubType === "Full House" && (
                      <Dropdown
                        label="BHK Type"
                        value={selectedBHK}
                        options={BHK_TYPES}
                        isOpen={bhkDropdown}
                        onToggle={() => setBhkDropdown(!bhkDropdown)}
                        onSelect={setSelectedBHK}
                        clearLabel="Any BHK"
                      />
                    )}
                  </div>
                </>
              )}

              {/* ── Commercial tab filters ── */}
              {activeTab === "Commercial" && (
                <>
                  <div className="flex items-center gap-5">
                    <Radio
                      label="Rent"
                      selected={commercialSubType === "Rent"}
                      onClick={() => setCommercialSubType("Rent")}
                    />
                    <Radio
                      label="Buy"
                      selected={commercialSubType === "Buy"}
                      onClick={() => setCommercialSubType("Buy")}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Dropdown
                      label="Property Type"
                      value={selectedCommercialType}
                      options={COMMERCIAL_TYPES}
                      isOpen={commercialTypeDropdown}
                      onToggle={() =>
                        setCommercialTypeDropdown(!commercialTypeDropdown)
                      }
                      onSelect={setSelectedCommercialType}
                      clearLabel="Any Type"
                    />
                  </div>
                </>
              )}
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
            <button
              onClick={() => router.push("/signup")}
              className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
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
                <div className="text-purple-200 text-sm mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>


      </section>
      {showPopup && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-white/95 p-8 rounded-2xl w-[340px] text-center shadow-2xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-3">
              Search Credits Finished
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You have used all 3 free searches.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </>
  );
}
