"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2, Upload, X } from "lucide-react";

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

const AMENITIES_LIST = [
  "power_backup", "lift", "security", "parking", "gym", "pool", "garden",
  "clubhouse", "play_area", "water_supply", "gas_pipeline", "internet",
];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function NewPropertyPage() {
  const router = useRouter();
  const [storedUser, setStoredUser] = useState<{ _id: string; name: { first: string; last: string } | string; email: string; role: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setStoredUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [purpose, setPurpose] = useState<string>("sell");
  const [category, setCategory] = useState<string>("residential");
  const [propertyType, setPropertyType] = useState<string>("flat");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [maintenance, setMaintenance] = useState("");
  const [deposit, setDeposit] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("unfurnished");
  const [parkingCovered, setParkingCovered] = useState(0);
  const [parkingOpen, setParkingOpen] = useState(0);
  const [superBuiltUp, setSuperBuiltUp] = useState("");
  const [possessionStatus, setPossessionStatus] = useState("ready");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const getFieldClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl theme-input border focus:outline-none focus:ring-2 ${
      fieldErrors[field] ? "border-error focus:ring-error/20" : "border-border focus:ring-accent/20"
    }`;
  const getCompactFieldClass = (field: string) => getFieldClass(field).replace("w-full ", "");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const amount = Number(priceAmount);
    const maintenanceAmount = maintenance.trim() === "" ? undefined : Number(maintenance);
    const depositAmount = deposit.trim() === "" ? undefined : Number(deposit);
    const bedroomsCount = bedrooms.trim() === "" ? undefined : Number(bedrooms);
    const bathroomsCount = bathrooms.trim() === "" ? undefined : Number(bathrooms);
    const area = superBuiltUp.trim() === "" ? undefined : Number(superBuiltUp);
    const latNum = lat.trim() === "" ? undefined : Number(lat);
    const lngNum = lng.trim() === "" ? undefined : Number(lng);
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedAddressLine1 = addressLine1.trim();
    const trimmedAddressLine2 = addressLine2.trim();
    const trimmedLandmark = landmark.trim();
    const trimmedLocality = locality.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const sanitizedPincode = pincode.replace(/\D/g, "").slice(0, 6);

    const nextErrors: Record<string, string> = {};

    if (trimmedTitle.length < 10) nextErrors.title = "Title must be at least 10 characters.";
    if (trimmedTitle.length > 200) nextErrors.title = "Title cannot exceed 200 characters.";

    if (trimmedDescription.length < 50) nextErrors.description = "Description must be at least 50 characters.";
    if (trimmedDescription.length > 5000) nextErrors.description = "Description cannot exceed 5000 characters.";

    if (!Number.isFinite(amount) || amount <= 0) nextErrors.priceAmount = "Price must be greater than 0.";

    if ((purpose === "rent" || purpose === "lease" || purpose === "pg") && maintenanceAmount !== undefined) {
      if (!Number.isFinite(maintenanceAmount) || maintenanceAmount < 0) {
        nextErrors.maintenance = "Maintenance must be 0 or more.";
      }
    }

    if ((purpose === "rent" || purpose === "lease" || purpose === "pg") && depositAmount !== undefined) {
      if (!Number.isFinite(depositAmount) || depositAmount < 0) {
        nextErrors.deposit = "Deposit must be 0 or more.";
      }
    }

    if (bedroomsCount !== undefined && (!Number.isInteger(bedroomsCount) || bedroomsCount < 0)) {
      nextErrors.bedrooms = "Bedrooms must be a whole number (0 or more).";
    }
    if (bathroomsCount !== undefined && (!Number.isInteger(bathroomsCount) || bathroomsCount < 0)) {
      nextErrors.bathrooms = "Bathrooms must be a whole number (0 or more).";
    }
    if (area !== undefined && (!Number.isFinite(area) || area <= 0)) {
      nextErrors.superBuiltUp = "Super built-up area must be greater than 0.";
    }
    if (parkingCovered < 0 || !Number.isInteger(parkingCovered)) {
      nextErrors.parkingCovered = "Covered parking must be a whole number (0 or more).";
    }
    if (parkingOpen < 0 || !Number.isInteger(parkingOpen)) {
      nextErrors.parkingOpen = "Open parking must be a whole number (0 or more).";
    }

    if (trimmedAddressLine1.length < 5) {
      nextErrors.addressLine1 = "Address line 1 must be at least 5 characters.";
    }
    if (!trimmedLocality) nextErrors.locality = "Locality is required.";
    if (!trimmedCity) nextErrors.city = "City is required.";
    if (!trimmedState) nextErrors.state = "State is required.";
    if (!/^\d{6}$/.test(sanitizedPincode)) nextErrors.pincode = "Pincode must be exactly 6 digits.";

    if ((latNum === undefined) !== (lngNum === undefined)) {
      nextErrors.coordinates = "Provide both latitude and longitude together.";
    }
    if (latNum !== undefined && (!Number.isFinite(latNum) || latNum < -90 || latNum > 90)) {
      nextErrors.lat = "Latitude must be between -90 and 90.";
    }
    if (lngNum !== undefined && (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180)) {
      nextErrors.lng = "Longitude must be between -180 and 180.";
    }

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
        title: trimmedTitle,
        description: trimmedDescription,
        price: {
          amount,
          currency: "INR",
          negotiable,
          maintenance: maintenanceAmount,
          deposit: depositAmount,
        },
        specs: {
          bedrooms: bedroomsCount,
          bathrooms: bathroomsCount,
          furnishing,
          parking: { covered: parkingCovered, open: parkingOpen },
          area: area ? { superBuiltUp: area, unit: "sqft" as const } : undefined,
          possessionStatus,
        },
        location: {
          address: { line1: trimmedAddressLine1, line2: trimmedAddressLine2 || undefined, landmark: trimmedLandmark || undefined },
          locality: trimmedLocality,
          city: trimmedCity,
          state: trimmedState,
          pincode: sanitizedPincode,
          coordinates: { lat: latNum ?? 0, lng: lngNum ?? 0 },
        },
        amenities,
        media: {
          images: images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId,
            isPrimary: i === 0,
            order: i,
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
        // Try to surface the most specific validation error from the API
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

      toast.success("Listing saved as draft.");
      router.push("/dashboard/listings");
      router.refresh();
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

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Listing type & classification</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Label>Purpose</Label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              >
                {PURPOSE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPropertyType(PROPERTY_TYPES[e.target.value]?.[0]?.value ?? "flat"); }}
                className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Label>Property type</Label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20">
                {(PROPERTY_TYPES[category] ?? PROPERTY_TYPES.residential).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Basic details</h2>
            <div className="space-y-4">
              <div>
                <Label>Title (min 10 characters)</Label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearFieldError("title");
                    setError(null);
                  }}
                  className={getFieldClass("title")}
                  placeholder="e.g. Spacious 3BHK in gated society"
                  required
                  minLength={10}
                  maxLength={200}
                />
                <FieldError message={fieldErrors.title} />
              </div>
              <div>
                <Label>Description (min 50 characters)</Label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError("description");
                    setError(null);
                  }}
                  className={`${getFieldClass("description")} min-h-[120px] resize-y`}
                  placeholder="Describe the property, highlights, nearby facilities..."
                  required
                  minLength={50}
                  maxLength={5000}
                />
                <FieldError message={fieldErrors.description} />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Pricing</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Price (₹)</Label>
                <input
                  type="number"
                  value={priceAmount}
                  onChange={(e) => {
                    setPriceAmount(e.target.value);
                    clearFieldError("priceAmount");
                    setError(null);
                  }}
                  className={getFieldClass("priceAmount")}
                  placeholder="e.g. 8500000"
                  min={1}
                  required
                />
                <FieldError message={fieldErrors.priceAmount} />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="negotiable" className="text-sm text-secondary">Negotiable</label>
              </div>
              {(purpose === "rent" || purpose === "lease" || purpose === "pg") && (
                <>
                  <div>
                    <Label>Maintenance (₹/month)</Label>
                    <input
                      type="number"
                      value={maintenance}
                      onChange={(e) => {
                        setMaintenance(e.target.value);
                        clearFieldError("maintenance");
                        setError(null);
                      }}
                      className={getFieldClass("maintenance")}
                      min={0}
                    />
                    <FieldError message={fieldErrors.maintenance} />
                  </div>
                  <div>
                    <Label>Deposit (₹)</Label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => {
                        setDeposit(e.target.value);
                        clearFieldError("deposit");
                        setError(null);
                      }}
                      className={getFieldClass("deposit")}
                      min={0}
                    />
                    <FieldError message={fieldErrors.deposit} />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Bedrooms (BHK)</Label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => {
                    setBedrooms(e.target.value);
                    clearFieldError("bedrooms");
                    setError(null);
                  }}
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
                  onChange={(e) => {
                    setBathrooms(e.target.value);
                    clearFieldError("bathrooms");
                    setError(null);
                  }}
                  className={getFieldClass("bathrooms")}
                  min={0}
                />
                <FieldError message={fieldErrors.bathrooms} />
              </div>
              <div>
                <Label>Furnishing</Label>
                <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20">
                  {FURNISHING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Possession</Label>
                <select value={possessionStatus} onChange={(e) => setPossessionStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20">
                  {POSSESSION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Super built-up area (sqft)</Label>
                <input
                  type="number"
                  value={superBuiltUp}
                  onChange={(e) => {
                    setSuperBuiltUp(e.target.value);
                    clearFieldError("superBuiltUp");
                    setError(null);
                  }}
                  className={getFieldClass("superBuiltUp")}
                  min={0}
                  placeholder="e.g. 1450"
                />
                <FieldError message={fieldErrors.superBuiltUp} />
              </div>
              <div>
                <Label>Parking (covered / open)</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={parkingCovered}
                    onChange={(e) => {
                      setParkingCovered(parseInt(e.target.value, 10) || 0);
                      clearFieldError("parkingCovered");
                      setError(null);
                    }}
                    className={`w-24 ${getCompactFieldClass("parkingCovered")}`}
                    min={0}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    value={parkingOpen}
                    onChange={(e) => {
                      setParkingOpen(parseInt(e.target.value, 10) || 0);
                      clearFieldError("parkingOpen");
                      setError(null);
                    }}
                    className={`w-24 ${getCompactFieldClass("parkingOpen")}`}
                    min={0}
                    placeholder="0"
                  />
                </div>
                <FieldError message={fieldErrors.parkingCovered || fieldErrors.parkingOpen} />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <Label>Address line 1</Label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);
                    clearFieldError("addressLine1");
                    setError(null);
                  }}
                  className={getFieldClass("addressLine1")}
                  required
                />
                <FieldError message={fieldErrors.addressLine1} />
              </div>
              <div>
                <Label>Address line 2</Label>
                <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div>
                <Label>Landmark</Label>
                <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full px-4 py-2.5 rounded-xl theme-input border border-border focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Locality</Label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => {
                      setLocality(e.target.value);
                      clearFieldError("locality");
                      setError(null);
                    }}
                    className={getFieldClass("locality")}
                    required
                  />
                  <FieldError message={fieldErrors.locality} />
                </div>
                <div>
                  <Label>City</Label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldError("city");
                      setError(null);
                    }}
                    className={getFieldClass("city")}
                    required
                  />
                  <FieldError message={fieldErrors.city} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      clearFieldError("state");
                      setError(null);
                    }}
                    className={getFieldClass("state")}
                    required
                  />
                  <FieldError message={fieldErrors.state} />
                </div>
                <div>
                  <Label>Pincode (6 digits)</Label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      clearFieldError("pincode");
                      setError(null);
                    }}
                    className={getFieldClass("pincode")}
                    maxLength={6}
                    required
                  />
                  <FieldError message={fieldErrors.pincode} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Latitude (optional)</Label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value);
                      clearFieldError("lat");
                      clearFieldError("coordinates");
                      setError(null);
                    }}
                    className={getFieldClass("lat")}
                    placeholder="e.g. 19.0760"
                  />
                  <FieldError message={fieldErrors.lat || fieldErrors.coordinates} />
                </div>
                <div>
                  <Label>Longitude (optional)</Label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value);
                      clearFieldError("lng");
                      clearFieldError("coordinates");
                      setError(null);
                    }}
                    className={getFieldClass("lng")}
                    placeholder="e.g. 72.8777"
                  />
                  <FieldError message={fieldErrors.lng || fieldErrors.coordinates} />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${amenities.includes(a) ? "bg-accent text-white" : "bg-hover text-secondary hover:bg-active"}`}
                >
                  {a.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Photos (max 20)</h2>
            <div className="flex flex-wrap gap-4">
              {images.map((img, i) => (
                <div key={img.publicId} className="relative w-28 h-28 rounded-xl overflow-hidden bg-hover border border-border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-accent text-white text-xs">Primary</span>
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
          </section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-medium bg-hover text-secondary hover:bg-active"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save as draft
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-secondary mb-1.5">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-error">{message}</p>;
}
