"use client";

import { useState } from "react";
import { UserRole } from "./RoleSelection";

interface RoleInfoFormProps {
    role: UserRole;
    onComplete: () => void;
    onBack: () => void;
}

export default function RoleInfoForm({ role, onComplete, onBack }: RoleInfoFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete();
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const renderForm = () => {
        switch (role) {
            case "buyer":
                return (
                    <>
                        <FormField
                            label="What are you looking for?"
                            name="lookingFor"
                            type="select"
                            options={[
                                { value: "", label: "Select an option" },
                                { value: "buy", label: "Buy a Property" },
                                { value: "rent", label: "Rent a Property" },
                                { value: "pg", label: "PG / Co-living" },
                            ]}
                            value={formData.lookingFor || ""}
                            onChange={(value) => handleChange("lookingFor", value)}
                            required
                        />
                        <FormField
                            label="Preferred Location"
                            name="location"
                            type="text"
                            placeholder="e.g., Mumbai, Pune, Bangalore"
                            value={formData.location || ""}
                            onChange={(value) => handleChange("location", value)}
                        />
                        <FormField
                            label="Budget Range"
                            name="budget"
                            type="select"
                            options={[
                                { value: "", label: "Select budget range" },
                                { value: "0-50L", label: "Under ₹50 Lakhs" },
                                { value: "50L-1Cr", label: "₹50L - ₹1 Crore" },
                                { value: "1Cr-2Cr", label: "₹1-2 Crores" },
                                { value: "2Cr+", label: "Above ₹2 Crores" },
                            ]}
                            value={formData.budget || ""}
                            onChange={(value) => handleChange("budget", value)}
                        />
                    </>
                );

            case "owner":
                return (
                    <>
                        <FormField
                            label="Number of Properties"
                            name="propertyCount"
                            type="select"
                            options={[
                                { value: "", label: "Select" },
                                { value: "1", label: "1 Property" },
                                { value: "2-5", label: "2-5 Properties" },
                                { value: "5+", label: "More than 5" },
                            ]}
                            value={formData.propertyCount || ""}
                            onChange={(value) => handleChange("propertyCount", value)}
                            required
                        />
                        <FormField
                            label="What do you want to do?"
                            name="purpose"
                            type="select"
                            options={[
                                { value: "", label: "Select an option" },
                                { value: "sell", label: "Sell Property" },
                                { value: "rent", label: "Rent Out Property" },
                                { value: "both", label: "Both" },
                            ]}
                            value={formData.purpose || ""}
                            onChange={(value) => handleChange("purpose", value)}
                            required
                        />
                        <FormField
                            label="Property Location"
                            name="location"
                            type="text"
                            placeholder="e.g., Andheri, Mumbai"
                            value={formData.location || ""}
                            onChange={(value) => handleChange("location", value)}
                        />
                    </>
                );

            case "agent":
                return (
                    <>
                        <FormField
                            label="Agency/Company Name"
                            name="agencyName"
                            type="text"
                            placeholder="Your agency or company name"
                            value={formData.agencyName || ""}
                            onChange={(value) => handleChange("agencyName", value)}
                            required
                        />
                        <FormField
                            label="Years of Experience"
                            name="experience"
                            type="select"
                            options={[
                                { value: "", label: "Select" },
                                { value: "0-2", label: "0-2 Years" },
                                { value: "2-5", label: "2-5 Years" },
                                { value: "5-10", label: "5-10 Years" },
                                { value: "10+", label: "10+ Years" },
                            ]}
                            value={formData.experience || ""}
                            onChange={(value) => handleChange("experience", value)}
                            required
                        />
                        <FormField
                            label="Primary Service Area"
                            name="serviceArea"
                            type="text"
                            placeholder="e.g., South Mumbai, Pune"
                            value={formData.serviceArea || ""}
                            onChange={(value) => handleChange("serviceArea", value)}
                        />
                    </>
                );

            case "builder":
                return (
                    <>
                        <FormField
                            label="Company Name"
                            name="companyName"
                            type="text"
                            placeholder="Your company name"
                            value={formData.companyName || ""}
                            onChange={(value) => handleChange("companyName", value)}
                            required
                        />
                        <FormField
                            label="Active Projects"
                            name="activeProjects"
                            type="select"
                            options={[
                                { value: "", label: "Select" },
                                { value: "1", label: "1 Project" },
                                { value: "2-5", label: "2-5 Projects" },
                                { value: "5-10", label: "5-10 Projects" },
                                { value: "10+", label: "10+ Projects" },
                            ]}
                            value={formData.activeProjects || ""}
                            onChange={(value) => handleChange("activeProjects", value)}
                            required
                        />
                        <FormField
                            label="Project Location(s)"
                            name="projectLocations"
                            type="text"
                            placeholder="e.g., Navi Mumbai, Thane"
                            value={formData.projectLocations || ""}
                            onChange={(value) => handleChange("projectLocations", value)}
                        />
                    </>
                );
        }
    };

    const getTitle = () => {
        switch (role) {
            case "buyer":
                return "Tell us about your requirements";
            case "owner":
                return "Tell us about your property";
            case "agent":
                return "Tell us about your practice";
            case "builder":
                return "Tell us about your projects";
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0B1E3A]">{getTitle()}</h2>
                <p className="text-lg text-slate-600">
                    Help us personalize your experience
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {renderForm()}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="
              flex-1 px-6 py-3 rounded-lg font-semibold
              bg-white border-2 border-slate-300
              hover:border-[#0066CC] hover:bg-blue-50
              transition-all duration-300 hover:scale-[1.02]
              flex items-center justify-center gap-2 text-slate-700
            "
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <button
                        type="submit"
                        className="
              group flex-1 px-6 py-3 rounded-lg font-semibold
              bg-[#0066CC] text-white hover:shadow-lg
              transition-all duration-300 hover:scale-[1.02]
              relative overflow-hidden
              flex items-center justify-center gap-2
            "
                    >
                        <span className="relative z-10">Continue</span>
                        <svg
                            className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0052A3] to-[#0066CC] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            </form>
        </div>
    );
}

interface FormFieldProps {
    label: string;
    name: string;
    type: "text" | "select";
    placeholder?: string;
    options?: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

function FormField({
    label,
    name,
    type,
    placeholder,
    options,
    value,
    onChange,
    required,
}: FormFieldProps) {
    return (
        <div className="space-y-2 animate-fade-in">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">
                {label}
                {required && <span className="text-[#0066CC] ml-1">*</span>}
            </label>
            {type === "text" ? (
                <div className="relative group">
                    <input
                        type="text"
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        className="
              w-full px-4 py-3 rounded-lg
              bg-white border-2 border-slate-200
              focus:border-[#0066CC] focus:outline-none
              focus:shadow-sm
              transition-all duration-300
              placeholder:text-slate-400
              text-slate-900
            "
                    />
                </div>
            ) : (
                <div className="relative group">
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        className="
              w-full px-4 py-3 rounded-lg
              bg-white border-2 border-slate-200
              focus:border-[#0066CC] focus:outline-none
              focus:shadow-sm
              transition-all duration-300
              cursor-pointer appearance-none
              text-slate-900
            "
                    >
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-slate-400 group-focus-within:text-[#0066CC] transition-colors duration-300"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}