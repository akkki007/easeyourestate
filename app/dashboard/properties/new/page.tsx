"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2, Upload, X, ChevronDown } from "lucide-react";

const PURPOSE_OPTIONS = [
  { value: "sell", label: "Sell" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
  { value: "pg", label: "PG / Co-living" },
];

const CATEGORY_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

const PROPERTY_TYPES: Record<string, { value: string; label: string }[]> = {
  residential: [
    { value: "flat", label: "Flat / Apartment" },
    { value: "villa", label: "Villa" },
    { value: "house", label: "House" },
    { value: "penthouse", label: "Penthouse" },
    { value: "plot", label: "Plot" },
    { value: "pg", label: "PG" },
  ],
  commercial: [
    { value: "office", label: "Office" },
    { value: "shop", label: "Shop" },
    { value: "warehouse", label: "Warehouse" },
    { value: "showroom", label: "Showroom" },
  ],
};

const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi", label: "Semi-furnished" },
  { value: "fully", label: "Fully furnished" },
];

const POSSESSION_OPTIONS = [
  { value: "ready", label: "Ready to move" },
  { value: "under_construction", label: "Under construction" },
];

const FACING_OPTIONS = [
  { value: "", label: "Select facing" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "ne", label: "North-East" },
  { value: "nw", label: "North-West" },
  { value: "se", label: "South-East" },
  { value: "sw", label: "South-West" },
];

const PREFERRED_TENANT_OPTIONS = [
  { value: "bachelor_male_working", label: "Bachelor (Male) - Working" },
  { value: "bachelor_male_student", label: "Bachelor (Male) - Student" },
  { value: "bachelor_female_working", label: "Bachelor (Female) - Working" },
  { value: "bachelor_female_student", label: "Bachelor (Female) - Student" },
  { value: "family", label: "Family" },
];

const INDOOR_AMENITIES = [
  { value: "power_backup", label: "Power Backup" },
  { value: "lift", label: "Lift" },
  { value: "security", label: "Security" },
  { value: "gym", label: "Gym" },
  { value: "gas_pipeline", label: "Gas Pipeline" },
  { value: "internet", label: "Internet / Wi-Fi" },
  { value: "water_supply", label: "24/7 Water Supply" },
];

const OUTDOOR_AMENITIES = [
  { value: "parking", label: "Parking" },
  { value: "pool", label: "Swimming Pool" },
  { value: "garden", label: "Garden" },
  { value: "clubhouse", label: "Clubhouse" },
  { value: "play_area", label: "Play Area" },
];

const INDIAN_STATES_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Delhi": ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "Dwarka", "Rohini"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Kangra"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere", "Shimoga", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Kannur", "Alappuzha"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Navi Mumbai", "Pimpri-Chinchwad"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Secunderabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Ghaziabad", "Noida", "Greater Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Kharagpur"],
  "Chandigarh": ["Chandigarh"],
  "Puducherry": ["Puducherry", "Karaikal", "Yanam"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur"],
  "Ladakh": ["Leh", "Kargil"],
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function NewPropertyPage() {
  const router = useRouter();
  const [storedUser, setStoredUser] = useState<{ _id: string; name: { first: string; last: string } | string; email: string; role: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setStoredUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(e.target as Node)) {
        setShowTenantDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Section 1 — Listing type
  const [purpose, setPurpose] = useState<string>("sell");
  const [category, setCategory] = useState<string>("residential");
  const [propertyType, setPropertyType] = useState<string>("flat");

  // Title & Description (now shown in last section)
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  // Location
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Specifications
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [balconies, setBalconies] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [facing, setFacing] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [furnishing, setFurnishing] = useState("unfurnished");
  const [parkingCovered, setParkingCovered] = useState(0);
  const [parkingOpen, setParkingOpen] = useState(0);
  const [possessionStatus, setPossessionStatus] = useState("ready");

  // Pricing & Terms
  const [priceAmount, setPriceAmount] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [petFriendly, setPetFriendly] = useState(false);
  const [preferredTenants, setPreferredTenants] = useState<string[]>([]);
  const [sharingType, setSharingType] = useState("");
  const [genderPreference, setGenderPreference] = useState("Any");
  const [mealsIncluded, setMealsIncluded] = useState(false);

  // Amenities & Media
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [videos, setVideos] = useState<{ url: string; publicId: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const selectClass = "w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20";

  const getFieldClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl theme-input border focus:outline-none focus:ring-2 ${
      fieldErrors[field] ? "border-error focus:ring-error/20" : "border-border focus:ring-accent/20"
    }`;
  const getCompactFieldClass = (field: string) => getFieldClass(field).replace("w-full", "");

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const togglePreferredTenant = (val: string) => {
    setPreferredTenants((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    setCity("");
    clearFieldError("state");
    setError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (images.length + files.length > 20) {
      const message = "Maximum 20 images allowed.";
      setError(message);
      toast.error(message);
      return;
    }
    setUploading(true);
    setError(null);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        const message = "Only image files are allowed.";
        setError(message);
        setFieldErrors((prev) => ({ ...prev, images: message }));
        toast.error(message);
        break;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const message = "Each image must be 5MB or smaller.";
        setError(message);
        setFieldErrors((prev) => ({ ...prev, images: message }));
        toast.error(message);
        break;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        clearFieldError("images");
        setImages((prev) => [...prev, { url: data.url, publicId: data.publicId }]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        setFieldErrors((prev) => ({ ...prev, images: message }));
        toast.error(message);
        break;
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (videos.length + files.length > 3) {
      toast.error("Maximum 3 videos allowed.");
      return;
    }
    setUploadingVideo(true);
    setError(null);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("video/")) {
        toast.error("Only video files are allowed.");
        break;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Each video must be 50MB or smaller.");
        break;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setVideos((prev) => [...prev, { url: data.url, publicId: data.publicId }]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Video upload failed");
        break;
      }
    }
    setUploadingVideo(false);
    e.target.value = "";
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const amount = Number(priceAmount);
    const depositAmount = deposit.trim() === "" ? undefined : Number(deposit);
    const bedroomsCount = bedrooms.trim() === "" ? undefined : Number(bedrooms);
    const bathroomsCount = bathrooms.trim() === "" ? undefined : Number(bathrooms);
    const balconiesCount = balconies.trim() === "" ? undefined : Number(balconies);
    const area = carpetArea.trim() === "" ? undefined : Number(carpetArea);
    const totalFloorsNum = totalFloors.trim() === "" ? undefined : Number(totalFloors);
    const floorNumberNum = floorNumber.trim() === "" ? undefined : Number(floorNumber);
    const trimmedProjectName = projectName.trim();
    const trimmedDescription = description.trim();
    const trimmedAddress = address.trim();
    const trimmedLandmark = landmark.trim();
    const trimmedLocality = locality.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const sanitizedPincode = pincode.replace(/\D/g, "").slice(0, 6);
    const rentVal = Number(monthlyRent);

    const nextErrors: Record<string, string> = {};

    // Project name validation
    if (trimmedProjectName.length < 5) nextErrors.projectName = "Project / Apartment name must be at least 5 characters.";
    if (trimmedProjectName.length > 200) nextErrors.projectName = "Project / Apartment name cannot exceed 200 characters.";

    if (trimmedDescription.length < 50) nextErrors.description = "Description must be at least 50 characters.";
    if (trimmedDescription.length > 5000) nextErrors.description = "Description cannot exceed 5000 characters.";

    // Pricing validation
    if (purpose === "sell") {
      if (!Number.isFinite(amount) || amount <= 0) nextErrors.priceAmount = "Total Price must be greater than 0.";
    } else {
      if (!Number.isFinite(rentVal) || rentVal <= 0) nextErrors.monthlyRent = "Rent must be greater than 0.";
      if (depositAmount === undefined || !Number.isFinite(depositAmount) || depositAmount < 0) nextErrors.deposit = "Deposit is required and must be 0 or more.";
    }

    if (purpose === "rent" || purpose === "lease") {
      if (!availableFrom) nextErrors.availableFrom = "Available from date is required.";
    }

    if (purpose === "pg") {
      if (!sharingType.trim()) nextErrors.sharingType = "Sharing type is required.";
    }

    // Specs validation
    if (bedroomsCount !== undefined && (!Number.isInteger(bedroomsCount) || bedroomsCount < 0)) {
      nextErrors.bedrooms = "Bedrooms must be a whole number (0 or more).";
    }
    if (bathroomsCount !== undefined && (!Number.isInteger(bathroomsCount) || bathroomsCount < 0)) {
      nextErrors.bathrooms = "Bathrooms must be a whole number (0 or more).";
    }
    if (balconiesCount !== undefined && (!Number.isInteger(balconiesCount) || balconiesCount < 0)) {
      nextErrors.balconies = "Balconies must be a whole number (0 or more).";
    }
    if (area !== undefined && (!Number.isFinite(area) || area <= 0)) {
      nextErrors.carpetArea = "Carpet area must be greater than 0.";
    }
    if (totalFloorsNum !== undefined && (!Number.isInteger(totalFloorsNum) || totalFloorsNum < 0)) {
      nextErrors.totalFloors = "Total floors must be a whole number.";
    }
    if (floorNumberNum !== undefined && (!Number.isInteger(floorNumberNum) || floorNumberNum < 0)) {
      nextErrors.floorNumber = "Floor number must be a whole number.";
    }

    // Location validation
    if (trimmedAddress.length < 5) nextErrors.address = "Address must be at least 5 characters.";
    if (!trimmedLocality) nextErrors.locality = "Locality is required.";
    if (!trimmedCity) nextErrors.city = "City is required.";
    if (!trimmedState) nextErrors.state = "State is required.";
    if (!/^\d{6}$/.test(sanitizedPincode)) nextErrors.pincode = "Pincode must be exactly 6 digits.";

    if (images.length > 20) nextErrors.images = "Maximum 20 images allowed.";

    if (Object.keys(nextErrors).length > 0) {
      const firstMessage = Object.values(nextErrors)[0];
      setFieldErrors(nextErrors);
      setError(firstMessage);
      toast.error(firstMessage);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const message = "You are not logged in. Please login again.";
        setError(message);
        toast.error(message);
        setSubmitting(false);
        router.push("/login");
        return;
      }

      const payload = {
        purpose,
        category,
        propertyType,
        title: trimmedProjectName,
        description: trimmedDescription,
        price: purpose === "sell" ? {
          amount,
          currency: "INR",
          negotiable,
        } : undefined,
        rental_details: (purpose === "rent" || purpose === "lease") ? {
          monthly_rent: rentVal,
          security_deposit: depositAmount || 0,
          available_from: new Date(availableFrom),
          pet_friendly: petFriendly,
          preferred_tenants: preferredTenants,
        } : undefined,
        pg_details: purpose === "pg" ? {
          monthly_rent: rentVal,
          security_deposit: depositAmount || 0,
          sharing_type: sharingType.split(",").map(s => s.trim()).filter(Boolean),
          meals_included: mealsIncluded,
          gender_preference: genderPreference,
        } : undefined,
        specs: {
          bedrooms: bedroomsCount,
          bathrooms: bathroomsCount,
          balconies: balconiesCount,
          totalFloors: totalFloorsNum,
          floorNumber: floorNumberNum,
          facing: facing || undefined,
          furnishing,
          parking: { covered: parkingCovered, open: parkingOpen },
          area: area ? { carpet: area, unit: "sqft" as const } : undefined,
          possessionStatus,
        },
        location: {
          address: { line1: trimmedAddress, landmark: trimmedLandmark || undefined },
          locality: trimmedLocality,
          city: trimmedCity,
          state: trimmedState,
          pincode: sanitizedPincode,
          coordinates: { lat: 0, lng: 0 },
        },
        amenities,
        media: {
          images: images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId,
            isPrimary: i === 0,
            order: i,
          })),
          videos: videos.map((v) => ({
            url: v.url,
            publicId: v.publicId,
          })),
        },
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        let message: string = data.error || "Failed to create listing";
        const fieldErrors = data.details?.fieldErrors as Record<string, string[]> | undefined;
        if (fieldErrors) {
          const allFieldErrors = Object.values(fieldErrors)
            .flat()
            .filter((msg): msg is string => typeof msg === "string" && msg.length > 0);
          if (allFieldErrors.length > 0) {
            message = allFieldErrors[0];
          }
        }
        setError(message);
        toast.error(message);
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const userName = storedUser ? (typeof storedUser.name === "object" ? storedUser.name.first : storedUser.name) || "User" : "User";
  const userEmail = storedUser?.email ?? "";

  const availableCities = state ? (INDIAN_STATES_CITIES[state] ?? []) : [];

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Add Property" />
      <main className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-xl bg-error-bg border border-error/20 text-error px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* ── Project / Apartment Name ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <Label>Project / Apartment Name</Label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => { setProjectName(e.target.value); clearFieldError("projectName"); setError(null); }}
              className={getFieldClass("projectName")}
              placeholder="e.g. Godrej Infinity, Kumar Palmspring"
              required
              minLength={5}
              maxLength={200}
            />
            <FieldError message={fieldErrors.projectName} />
          </section>

          {/* ── Section 1: Listing Type & Classification ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">1. Listing Type & Classification</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Purpose</Label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={selectClass} required>
                  {PURPOSE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPropertyType(PROPERTY_TYPES[e.target.value]?.[0]?.value ?? "flat"); }}
                  className={selectClass}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Property Type</Label>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectClass}>
                  {(PROPERTY_TYPES[category] ?? PROPERTY_TYPES.residential).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Section 2: Location ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">2. Location</h2>
            <div className="space-y-4">
              <div>
                <Label>Address</Label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError("address"); setError(null); }}
                  className={getFieldClass("address")}
                  placeholder="e.g. Flat 402, B Wing, Godrej Infinity, Keshav Nagar"
                  required
                />
                <FieldError message={fieldErrors.address} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Locality</Label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => { setLocality(e.target.value); clearFieldError("locality"); setError(null); }}
                    className={getFieldClass("locality")}
                    placeholder="e.g. Viman Nagar"
                    required
                  />
                  <FieldError message={fieldErrors.locality} />
                </div>
                <div>
                  <Label>Landmark</Label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className={selectClass}
                    placeholder="e.g. Near Phoenix Mall"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>State</Label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className={fieldErrors.state ? `${selectClass.replace("border-border", "border-error").replace("focus:ring-accent/20", "focus:ring-error/20")}` : selectClass}
                    required
                  >
                    <option value="">Select State</option>
                    {Object.keys(INDIAN_STATES_CITIES).sort().map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.state} />
                </div>
                <div>
                  <Label>City</Label>
                  <select
                    value={city}
                    onChange={(e) => { setCity(e.target.value); clearFieldError("city"); setError(null); }}
                    className={fieldErrors.city ? `${selectClass.replace("border-border", "border-error").replace("focus:ring-accent/20", "focus:ring-error/20")}` : selectClass}
                    required
                    disabled={!state}
                  >
                    <option value="">{state ? "Select City" : "Select state first"}</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.city} />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearFieldError("pincode"); setError(null); }}
                    className={getFieldClass("pincode")}
                    maxLength={6}
                    placeholder="e.g. 411014"
                    required
                  />
                  <FieldError message={fieldErrors.pincode} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 3: Specifications ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">3. Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Bedrooms (BHK)</Label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => { setBedrooms(e.target.value); clearFieldError("bedrooms"); setError(null); }}
                  className={getFieldClass("bedrooms")}
                  min={0}
                  placeholder="e.g. 3"
                />
                <FieldError message={fieldErrors.bedrooms} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => { setBathrooms(e.target.value); clearFieldError("bathrooms"); setError(null); }}
                  className={getFieldClass("bathrooms")}
                  min={0}
                />
                <FieldError message={fieldErrors.bathrooms} />
              </div>
              <div>
                <Label>Balconies</Label>
                <input
                  type="number"
                  value={balconies}
                  onChange={(e) => { setBalconies(e.target.value); clearFieldError("balconies"); setError(null); }}
                  className={getFieldClass("balconies")}
                  min={0}
                  placeholder="e.g. 2"
                />
                <FieldError message={fieldErrors.balconies} />
              </div>
              <div>
                <Label>Carpet Area (sqft)</Label>
                <input
                  type="number"
                  value={carpetArea}
                  onChange={(e) => { setCarpetArea(e.target.value); clearFieldError("carpetArea"); setError(null); }}
                  className={getFieldClass("carpetArea")}
                  min={0}
                  placeholder="e.g. 850"
                />
                <FieldError message={fieldErrors.carpetArea} />
              </div>
              <div>
                <Label>Facing Direction</Label>
                <select value={facing} onChange={(e) => setFacing(e.target.value)} className={selectClass}>
                  {FACING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Total Floors in Building</Label>
                <input
                  type="number"
                  value={totalFloors}
                  onChange={(e) => { setTotalFloors(e.target.value); clearFieldError("totalFloors"); setError(null); }}
                  className={getFieldClass("totalFloors")}
                  min={0}
                  placeholder="e.g. 12"
                />
                <FieldError message={fieldErrors.totalFloors} />
              </div>
              <div>
                <Label>Floor No. (your flat is on)</Label>
                <input
                  type="number"
                  value={floorNumber}
                  onChange={(e) => { setFloorNumber(e.target.value); clearFieldError("floorNumber"); setError(null); }}
                  className={getFieldClass("floorNumber")}
                  min={0}
                  placeholder="e.g. 4"
                />
                <FieldError message={fieldErrors.floorNumber} />
              </div>
              <div>
                <Label>Furnishing</Label>
                <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className={selectClass}>
                  {FURNISHING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Possession</Label>
                <select value={possessionStatus} onChange={(e) => setPossessionStatus(e.target.value)} className={selectClass}>
                  {POSSESSION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Parking (covered / open)</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={parkingCovered}
                    onChange={(e) => { setParkingCovered(parseInt(e.target.value, 10) || 0); clearFieldError("parkingCovered"); setError(null); }}
                    className={`w-24 ${getCompactFieldClass("parkingCovered")}`}
                    min={0}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    value={parkingOpen}
                    onChange={(e) => { setParkingOpen(parseInt(e.target.value, 10) || 0); clearFieldError("parkingOpen"); setError(null); }}
                    className={`w-24 ${getCompactFieldClass("parkingOpen")}`}
                    min={0}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 4: Pricing & Terms ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">4. Pricing & Terms</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {purpose === "sell" ? (
                <>
                  <div>
                    <Label>Total Price (&#8377;)</Label>
                    <input
                      type="number"
                      value={priceAmount}
                      onChange={(e) => { setPriceAmount(e.target.value); clearFieldError("priceAmount"); setError(null); }}
                      className={getFieldClass("priceAmount")}
                      placeholder="e.g. 8500000"
                      min={1}
                      required={purpose === "sell"}
                    />
                    <FieldError message={fieldErrors.priceAmount} />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input type="checkbox" id="negotiable" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="rounded border-border" />
                    <label htmlFor="negotiable" className="text-sm text-muted-foreground">Negotiable</label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Rent (&#8377;/month, including maintenance)</Label>
                    <input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => { setMonthlyRent(e.target.value); clearFieldError("monthlyRent"); setError(null); }}
                      className={getFieldClass("monthlyRent")}
                      placeholder="e.g. 25000"
                      min={1}
                      required
                    />
                    <FieldError message={fieldErrors.monthlyRent} />
                  </div>
                  <div>
                    <Label>Security Deposit (&#8377;)</Label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => { setDeposit(e.target.value); clearFieldError("deposit"); setError(null); }}
                      className={getFieldClass("deposit")}
                      placeholder="e.g. 100000"
                      min={0}
                      required
                    />
                    <FieldError message={fieldErrors.deposit} />
                  </div>
                </>
              )}

              {(purpose === "rent" || purpose === "lease") && (
                <>
                  <div>
                    <Label>Available From</Label>
                    <input
                      type="date"
                      value={availableFrom}
                      onChange={(e) => { setAvailableFrom(e.target.value); clearFieldError("availableFrom"); setError(null); }}
                      className={getFieldClass("availableFrom")}
                      required
                    />
                    <FieldError message={fieldErrors.availableFrom} />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input type="checkbox" id="petFriendly" checked={petFriendly} onChange={(e) => setPetFriendly(e.target.checked)} className="rounded border-border" />
                    <label htmlFor="petFriendly" className="text-sm text-muted-foreground">Pet Friendly</label>
                  </div>
                  <div className="sm:col-span-2" ref={tenantDropdownRef}>
                    <Label>Preferred Tenants</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTenantDropdown((v) => !v)}
                        className={`${selectClass} text-left flex items-center justify-between`}
                      >
                        <span className={preferredTenants.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                          {preferredTenants.length > 0
                            ? preferredTenants.map((v) => PREFERRED_TENANT_OPTIONS.find((o) => o.value === v)?.label).join(", ")
                            : "Select preferred tenants"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTenantDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showTenantDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto">
                          {PREFERRED_TENANT_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={preferredTenants.includes(opt.value)}
                                onChange={() => togglePreferredTenant(opt.value)}
                                className="rounded border-border"
                              />
                              <span className="text-sm text-foreground">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {purpose === "pg" && (
                <>
                  <div>
                    <Label>Sharing Type</Label>
                    <input
                      type="text"
                      value={sharingType}
                      onChange={(e) => { setSharingType(e.target.value); clearFieldError("sharingType"); setError(null); }}
                      className={getFieldClass("sharingType")}
                      placeholder="e.g. Single, Double, Triple"
                      required
                    />
                    <FieldError message={fieldErrors.sharingType} />
                  </div>
                  <div>
                    <Label>Gender Preference</Label>
                    <select value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)} className={selectClass}>
                      <option value="Any">Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" id="mealsIncluded" checked={mealsIncluded} onChange={(e) => setMealsIncluded(e.target.checked)} className="rounded border-border" />
                    <label htmlFor="mealsIncluded" className="text-sm text-muted-foreground">Meals Included</label>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Section 5: Amenities (Indoor & Outdoor) ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-5">5. Amenities</h2>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Indoor</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INDOOR_AMENITIES.map((a) => (
                  <label
                    key={a.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      amenities.includes(a.value)
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:bg-hover"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(a.value)}
                      onChange={() => toggleAmenity(a.value)}
                      className="rounded border-border accent-accent"
                    />
                    <span className={`text-sm font-medium ${amenities.includes(a.value) ? "text-foreground" : "text-muted-foreground"}`}>
                      {a.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Outdoor</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {OUTDOOR_AMENITIES.map((a) => (
                  <label
                    key={a.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      amenities.includes(a.value)
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:bg-hover"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(a.value)}
                      onChange={() => toggleAmenity(a.value)}
                      className="rounded border-border accent-accent"
                    />
                    <span className={`text-sm font-medium ${amenities.includes(a.value) ? "text-foreground" : "text-muted-foreground"}`}>
                      {a.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* ── Section 6: Photos & Videos ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">6. Photos & Videos</h2>

            {/* Photos */}
            <p className="text-sm font-medium text-muted-foreground mb-2">Photos (max 20, up to 5MB each)</p>
            <div className="flex flex-wrap gap-4 mb-6">
              {images.map((img, i) => (
                <div key={img.publicId} className="relative w-28 h-28 rounded-xl overflow-hidden bg-hover border border-border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-accent text-primary-foreground text-xs">Primary</span>
                  )}
                </div>
              ))}
              {images.length < 20 && (
                <label className="w-28 h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-hover transition-colors">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-tertiary" /> : <Upload className="w-6 h-6 text-tertiary" />}
                  <span className="text-xs text-tertiary mt-1">Add photo</span>
                </label>
              )}
            </div>
            <FieldError message={fieldErrors.images} />

            {/* Videos */}
            <p className="text-sm font-medium text-muted-foreground mb-2">Videos (max 3, up to 50MB each — MP4, WebM, MOV)</p>
            <div className="flex flex-wrap gap-4">
              {videos.map((vid, i) => (
                <div key={vid.publicId} className="relative w-44 h-28 rounded-xl overflow-hidden bg-hover border border-border group">
                  <video src={vid.url} className="w-full h-full object-cover" muted />
                  <button
                    type="button"
                    onClick={() => removeVideo(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-foreground/70 text-background text-xs">Video {i + 1}</span>
                </div>
              ))}
              {videos.length < 3 && (
                <label className="w-44 h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-hover transition-colors">
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                  {uploadingVideo ? <Loader2 className="w-6 h-6 animate-spin text-tertiary" /> : <Upload className="w-6 h-6 text-tertiary" />}
                  <span className="text-xs text-tertiary mt-1">Add video</span>
                </label>
              )}
            </div>
          </section>

          {/* ── Section 7: Property Description ── */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">7. Property Description</h2>
            <div>
              <Label>Description (min 50 characters)</Label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); clearFieldError("description"); setError(null); }}
                  className={`${getFieldClass("description")} min-h-28 resize-y`}
                  placeholder="Describe the property, highlights, nearby facilities..."
                  required
                  minLength={50}
                  maxLength={5000}
                />
                <FieldError message={fieldErrors.description} />
            </div>
          </section>

          {/* ── Submit ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-medium bg-hover text-muted-foreground hover:bg-active"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-medium bg-accent text-primary-foreground hover:bg-accent-hover disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit
            </button>
          </div>
        </form>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-card rounded-2xl border border-border shadow-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Property Submitted!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your property is under review and your listing will be live in 24-48 hours. You will receive an SMS on your registered mobile number once it is approved.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/dashboard/listings");
                  router.refresh();
                }}
                className="px-6 py-3 rounded-xl font-medium bg-accent text-primary-foreground hover:bg-accent-hover w-full"
              >
                Go to My Listings
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-muted-foreground mb-1.5">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-error">{message}</p>;
}
