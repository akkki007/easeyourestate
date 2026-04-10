"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Building2,
  Loader2,
} from "lucide-react";

const CITIES = ["Pune", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
const BHK_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

// Pune center coordinates for biasing autocomplete
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
};

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export default function SearchBar() {
  const [activeTab, setActiveTab] = useState<"Buy" | "Rent" | "Commercial" | "PG">("Rent");
  const [activeType, setActiveType] = useState<"Full House" | "PG/Hostel" | "Flatmates">("Full House");

  const [selectedCity, setSelectedCity] = useState("Pune");
  const [selectedBHK, setSelectedBHK] = useState("");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [bhkDropdown, setBhkDropdown] = useState(false);

  // Google Places autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState("");

  // Also keep DB-based suggestions as fallback
  const [dbSuggestions, setDbSuggestions] = useState<
    { id: string; locality: string; title: string; address: string; city: string; state: string; pincode: string }[]
  >([]);

  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch Google Places autocomplete predictions
  const fetchPlacePredictions = useCallback(async (query: string, city: string) => {
    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingPlaces(true);

    try {
      const coords = CITY_COORDS[city];
      const params = new URLSearchParams({ query });
      if (coords) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
      }

      const res = await fetch(`/api/places/autocomplete?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Places autocomplete failed:", err);
      }
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  // Fetch DB-based suggestions (existing properties) as secondary results
  const fetchDbSuggestions = useCallback(async (query: string, city: string) => {
    if (query.length < 2) {
      setDbSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/localities?city=${city}&query=${query}`);
      const data = await res.json();
      setDbSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to fetch DB suggestions", err);
    }
  }, []);

  // Debounced fetch on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlacePredictions(searchQuery, selectedCity);
      fetchDbSuggestions(searchQuery, selectedCity);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCity, fetchPlacePredictions, fetchDbSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selecting a Google Place prediction
  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    setSearchQuery(prediction.mainText);
    setShowSuggestions(false);
    setLoadingPlaces(true);

    try {
      const res = await fetch(`/api/places/details?placeId=${prediction.placeId}`);
      const data = await res.json();

      // If the place resolves to a known city, update selected city
      if (data.city) {
        const matchedCity = CITIES.find(
          (c) => c.toLowerCase() === data.city.toLowerCase()
        );
        if (matchedCity) {
          setSelectedCity(matchedCity);
        }
      }

      const locality = data.locality || prediction.mainText;
      setSelectedLocality(locality);

      // Navigate to search with the resolved locality and coordinates
      const params = new URLSearchParams();
      params.set("city", data.city || selectedCity);
      params.set("query", locality);
      if (data.lat && data.lng) {
        params.set("lat", String(data.lat));
        params.set("lng", String(data.lng));
      }
      if (activeTab === "PG") {
        params.set("purpose", "PG");
        params.set("type", "PG/Hostel");
      } else {
        if (activeTab) params.set("purpose", activeTab);
        if (activeType) params.set("type", activeType);
      }
      if (selectedBHK) params.set("bhk", selectedBHK);

      router.push(`/search?${params.toString()}`);
    } catch (err) {
      console.error("Failed to get place details:", err);
      // Fallback: navigate with just the text
      handleSearch(prediction.mainText);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Handle selecting a DB suggestion (existing property locality)
  const handleDbSelect = (locality: string) => {
    setSearchQuery(locality);
    setSelectedLocality(locality);
    setShowSuggestions(false);
    handleSearch(locality);
  };

  const handleSearch = (locality?: string) => {
    const query = locality || selectedLocality || searchQuery;
    const params = new URLSearchParams();
    params.set("city", selectedCity);
    if (query) params.set("query", query);
    if (activeTab === "PG") {
      params.set("purpose", "PG");
      params.set("type", "PG/Hostel");
    } else {
      if (activeTab) params.set("purpose", activeTab);
      if (activeType) params.set("type", activeType);
    }
    if (selectedBHK) params.set("bhk", selectedBHK);

    router.push(`/search?${params.toString()}`);
  };

  const hasSuggestions = predictions.length > 0 || dbSuggestions.length > 0;

  return (
    <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl shadow-black/30 overflow-visible mx-auto">
      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
        {(["Buy", "Rent", "Commercial", "PG"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors relative ${activeTab === tab
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
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
              <MapPin className="w-4 h-4 text-primary" />
              {selectedCity}
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${cityDropdown ? "rotate-180" : ""}`}
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
                      // Clear search when city changes
                      setSearchQuery("");
                      setPredictions([]);
                      setDbSuggestions([]);
                      setSelectedLocality("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors ${selectedCity === city
                      ? "text-primary font-medium bg-primary/10"
                      : "text-foreground"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-muted mx-1" />

          {/* Search input with Google Places autocomplete */}
          <div className="flex-1 relative" ref={searchContainerRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedLocality("");
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search locality, landmark or society..."
                className="w-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-muted/40 rounded-xl sm:bg-transparent sm:rounded-none"
              />
              {loadingPlaces && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>

            {showSuggestions && hasSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-xl border border-border py-1 z-50 max-h-96 overflow-y-auto">
                {/* Google Places predictions */}
                {predictions.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Localities & Areas
                    </div>
                    {predictions.map((p) => (
                      <button
                        key={p.placeId}
                        onClick={() => handlePlaceSelect(p)}
                        className="w-full text-left px-4 py-3 transition-colors flex items-start gap-3 group border-b border-border last:border-0 hover:bg-muted/50"
                      >
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-foreground group-hover:text-primary leading-tight truncate">
                            {p.mainText}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {p.secondaryText}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* DB-based property suggestions */}
                {dbSuggestions.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border">
                      Properties Found
                    </div>
                    {dbSuggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleDbSelect(s.locality)}
                        className="w-full text-left px-4 py-3 transition-colors flex items-start gap-3 group border-b border-border last:border-0 hover:bg-muted/50"
                      >
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-foreground group-hover:text-primary leading-tight truncate">
                            {s.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {s.address}, {s.locality}, {s.city}, {s.state} {s.pincode}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={() => handleSearch()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:m-1 bg-primary hover:bg-primary text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-primary"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Filters row — hidden when PG tab is active */}
      {activeTab !== "PG" && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {(["Full House", "PG/Hostel", "Flatmates"] as const).map(
              (type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    onClick={() => setActiveType(type)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${activeType === type
                      ? "border-primary bg-primary"
                      : "border-border group-hover:border-primary"
                    }`}
                  >
                    {activeType === type && (
                      <div className="w-1.5 h-1.5 rounded-full bg-card" />
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
              {selectedBHK || "BHK Type"}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${bhkDropdown ? "rotate-180" : ""}`}
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
                      ? "text-primary font-medium bg-primary/10"
                      : "text-foreground"
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
  );
}
