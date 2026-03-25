"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface SearchSidebarProps {
    onFilterChange: (filters: any) => void;
    initialFilters: any;
}

const buyBudgetRanges = [
    { label: "₹10L – ₹20L", minPrice: "1000000", maxPrice: "2000000" },
    { label: "₹20L – ₹50L", minPrice: "2000000", maxPrice: "5000000" },
    { label: "₹50L – ₹1Cr", minPrice: "5000000", maxPrice: "10000000" },
    { label: "₹1Cr – ₹2Cr", minPrice: "10000000", maxPrice: "20000000" },
    { label: "₹2Cr+", minPrice: "20000000", maxPrice: "" },
];

const rentBudgetRanges = [
    { label: "₹5k – ₹10k", minPrice: "5000", maxPrice: "10000" },
    { label: "₹10k – ₹20k", minPrice: "10000", maxPrice: "20000" },
    { label: "₹20k – ₹50k", minPrice: "20000", maxPrice: "50000" },
    { label: "₹50k – ₹1L", minPrice: "50000", maxPrice: "100000" },
    { label: "₹1L+", minPrice: "100000", maxPrice: "" },
];

const areaRanges = [
    { label: "500 – 1000 sqft", min_area: "500", max_area: "1000" },
    { label: "1000 – 2000 sqft", min_area: "1000", max_area: "2000" },
    { label: "2000 – 4000 sqft", min_area: "2000", max_area: "4000" },
    { label: "4000+ sqft", min_area: "4000", max_area: "" },
];

const bhkOptions = [
    { label: "1 RK", value: "1" },
    { label: "1 BHK", value: "1" },
    { label: "2 BHK", value: "2" },
    { label: "3 BHK", value: "3" },
    { label: "4 BHK", value: "4" },
    { label: "4+ BHK", value: "4+" },
];

function getBudgetKey(minPrice: string, maxPrice: string) {
    return `${minPrice}-${maxPrice}`;
}

function getAreaKey(min_area: string, max_area: string) {
    return `${min_area}-${max_area}`;
}

export default function SearchSidebar({ onFilterChange, initialFilters }: SearchSidebarProps) {
    const [bhk, setBhk] = useState<string[]>(initialFilters.bhk ? initialFilters.bhk.split(",") : []);
    const [propertyStatus, setPropertyStatus] = useState(initialFilters.possession || "");
    const [furnishing, setFurnishing] = useState<string[]>(initialFilters.furnishing ? initialFilters.furnishing.split(",") : []);
    const [propertyType, setPropertyType] = useState<string[]>(initialFilters.type ? initialFilters.type.split(",") : []);
    const [parking, setParking] = useState<string[]>(initialFilters.parking ? initialFilters.parking.split(",") : []);
    const [selectedBudget, setSelectedBudget] = useState<string>(
        initialFilters.minPrice && initialFilters.maxPrice
            ? getBudgetKey(initialFilters.minPrice, initialFilters.maxPrice)
            : initialFilters.minPrice
                ? getBudgetKey(initialFilters.minPrice, "")
                : ""
    );
    const [selectedArea, setSelectedArea] = useState<string>(
        initialFilters.min_area && initialFilters.max_area
            ? getAreaKey(initialFilters.min_area, initialFilters.max_area)
            : initialFilters.min_area
                ? getAreaKey(initialFilters.min_area, "")
                : ""
    );
    const [petFriendly, setPetFriendly] = useState<boolean>(initialFilters.petFriendly === "true");
    const [genderPreference, setGenderPreference] = useState<string>(initialFilters.genderPreference || "");
    const [pgSharing, setPgSharing] = useState<string[]>(initialFilters.pgSharing ? initialFilters.pgSharing.split(",") : []);

    const purpose = initialFilters.purpose || "sell";
    const budgetRanges = (purpose === "rent" || purpose === "lease" || purpose === "pg") ? rentBudgetRanges : buyBudgetRanges;

    const handleBhkToggle = (value: string) => {
        const newBhk = bhk.includes(value) ? bhk.filter((item) => item !== value) : [...bhk, value];
        setBhk(newBhk);
        onFilterChange({ bhk: newBhk.length ? newBhk.join(",") : "" });
    };

    const handleBudgetSelect = (minPrice: string, maxPrice: string) => {
        const key = getBudgetKey(minPrice, maxPrice);
        if (selectedBudget === key) {
            // Deselect if clicking the same budget
            setSelectedBudget("");
            onFilterChange({ minPrice: "", maxPrice: "" });
        } else {
            setSelectedBudget(key);
            onFilterChange({ minPrice, maxPrice });
        }
    };

    const handleAreaSelect = (min_area: string, max_area: string) => {
        const key = getAreaKey(min_area, max_area);
        if (selectedArea === key) {
            // Deselect if clicking the same area
            setSelectedArea("");
            onFilterChange({ min_area: "", max_area: "" });
        } else {
            setSelectedArea(key);
            onFilterChange({ min_area, max_area });
        }
    };

    const handleFurnishingToggle = (val: string) => {
        setFurnishing((prev) => {
            const updated = prev.includes(val)
                ? prev.filter((item) => item !== val)
                : [...prev, val];

            onFilterChange({
                furnishing: updated.length ? updated.join(",") : ""
            });

            return updated;
        });
    };

    const handlePropertyTypeToggle = (val: string) => {
        setPropertyType((prev) => {
            const updated = prev.includes(val)
                ? prev.filter((item) => item !== val)
                : [...prev, val];

            onFilterChange({
                type: updated.length ? updated.join(",") : ""
            });

            return updated;
        });
    };

    const handlePropertyStatusChange = (val: string) => {
        if (propertyStatus === val) {
            // Deselect if clicking the same status
            setPropertyStatus("");
            onFilterChange({ possession: "" });
        } else {
            setPropertyStatus(val);
            onFilterChange({ possession: val });
        }
    };

    const resetFilters = () => {
        setBhk([]);
        setPropertyStatus("");
        setFurnishing([]);
        setPropertyType([]);
        setParking([]);
        setSelectedBudget("");
        setSelectedArea("");
        setPetFriendly(false);
        setGenderPreference("");
        setPgSharing([]);
        onFilterChange({
            bhk: "",
            possession: "",
            furnishing: "",
            type: "",
            parking: "",
            minPrice: "",
            maxPrice: "",
            min_area: "",
            max_area: "",
            petFriendly: "",
            genderPreference: "",
            pgSharing: "",
        });
    };

    return (
        <div className="w-80 shrink-0 bg-card border border-border rounded-lg overflow-hidden hidden lg:block h-fit sticky top-24">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Filters</span>
                <button onClick={resetFilters} className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
            </div>

            <div className="p-5 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {/* BHK Type */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">BHK Type</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {bhkOptions.map((option) => (
                            <button
                                key={`${option.label}-${option.value}`}
                                onClick={() => handleBhkToggle(option.value)}
                                className={`py-2 text-xs font-semibold rounded-md border transition-all ${bhk.includes(option.value)
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-card border-border text-muted-foreground hover:border-border"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Budget */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Budget</h3>
                    <div className="space-y-2">
                        {budgetRanges.map((range) => {
                            const key = getBudgetKey(range.minPrice, range.maxPrice);
                            const isActive = selectedBudget === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleBudgetSelect(range.minPrice, range.maxPrice)}
                                    className={`block w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${isActive
                                        ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                                        : "bg-secondary border-border text-muted-foreground hover:border-border hover:bg-accent"
                                        }`}
                                >
                                    {range.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <hr className="border-border" />

                {(purpose === "rent" || purpose === "lease") && (
                    <>
                        <div>
                            <h3 className="text-sm font-bold text-foreground mb-3">Tenant Preferences</h3>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={petFriendly}
                                    onChange={(e) => {
                                        setPetFriendly(e.target.checked);
                                        onFilterChange({ petFriendly: e.target.checked ? "true" : "" });
                                    }}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Pet Friendly</span>
                            </label>
                        </div>
                        <hr className="border-border" />
                    </>
                )}

                {purpose === "pg" && (
                    <>
                        <div>
                            <h3 className="text-sm font-bold text-foreground mb-3">PG Preferences</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground mb-2 block">Gender</span>
                                    <div className="flex gap-2">
                                        {["Any", "Male", "Female"].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => {
                                                    const val = genderPreference === g ? "" : g;
                                                    setGenderPreference(val);
                                                    onFilterChange({ genderPreference: val });
                                                }}
                                                className={`px-3 py-1.5 text-xs font-semibold border rounded-md transition-all ${genderPreference === g ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-border"}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground mb-2 block">Sharing Type</span>
                                    <div className="flex flex-wrap gap-2">
                                        {["Single", "Double", "Triple", "Four+"].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    const updated = pgSharing.includes(s) ? pgSharing.filter((val) => val !== s) : [...pgSharing, s];
                                                    setPgSharing(updated);
                                                    onFilterChange({ pgSharing: updated.length ? updated.join(",") : "" });
                                                }}
                                                className={`px-3 py-1.5 text-xs font-semibold border rounded-md transition-all ${pgSharing.includes(s) ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-border"}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="border-border" />
                    </>
                )}

                {/* Area */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Area (sq ft)</h3>
                    <div className="space-y-2">
                        {areaRanges.map((range) => {
                            const key = getAreaKey(range.min_area, range.max_area);
                            const isActive = selectedArea === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleAreaSelect(range.min_area, range.max_area)}
                                    className={`block w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${isActive
                                        ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                                        : "bg-secondary border-border text-muted-foreground hover:border-border hover:bg-accent"
                                        }`}
                                >
                                    {range.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Property Status */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Property Status</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {[
                            { label: "Under Construction", value: "under_construction" },
                            { label: "Ready to Move", value: "ready" },
                        ].map((item) => (
                            <button
                                key={item.value}
                                onClick={() => handlePropertyStatusChange(item.value)}
                                className={`px-3 py-1.5 rounded-md border text-sm transition-all ${propertyStatus === item.value
                                    ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                                    : "bg-secondary border-border text-muted-foreground hover:border-border"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Furnishing */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Furnishing</h3>
                    <div className="flex items-center gap-4">
                        {[
                            { label: "Full", value: "fully" },
                            { label: "Semi", value: "semi" },
                            { label: "None", value: "unfurnished" },
                        ].map((item) => (
                            <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={furnishing.includes(item.value)}
                                    onChange={() => handleFurnishingToggle(item.value)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Property Type */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Property Type</h3>
                    <div className="space-y-3">
                        {[
                            { id: "flat", label: "Flat / Apartment" },
                            { id: "house", label: "House" },
                            { id: "villa", label: "Villa" },
                            { id: "penthouse", label: "Penthouse" },
                            { id: "plot", label: "Plot" },
                        ].map((type) => (
                            <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={propertyType.includes(type.id)}
                                    onChange={() => handlePropertyTypeToggle(type.id)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Parking */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Parking</h3>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={parking.includes("open")}
                                onChange={(e) => {
                                    const newParking = e.target.checked ? [...parking, "open"] : parking.filter(p => p !== "open");
                                    setParking(newParking);
                                    onFilterChange({ parking: newParking.join(",") });
                                }}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">2 Wheeler</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={parking.includes("covered")}
                                onChange={(e) => {
                                    const newParking = e.target.checked ? [...parking, "covered"] : parking.filter(p => p !== "covered");
                                    setParking(newParking);
                                    onFilterChange({ parking: newParking.join(",") });
                                }}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">4 Wheeler</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
