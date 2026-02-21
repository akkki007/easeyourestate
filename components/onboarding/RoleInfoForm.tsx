"use client";

import { useState } from "react";
import { UserRole } from "./RoleSelection";

export type OnboardingFormData = Record<string, string>;

interface RoleInfoFormProps {
    role: UserRole;
    onComplete: (formData: OnboardingFormData) => void;
    onBack: () => void;
}

export default function RoleInfoForm({ role, onComplete, onBack }: RoleInfoFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
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
                            label="Agency / Company Name"
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
                return "Your requirements";
            case "owner":
                return "About your property";
            case "agent":
                return "About your practice";
            case "builder":
                return "About your projects";
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto px-4">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
                    <svg className="w-6 h-6 text-accent" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary tracking-tight mb-3">
                    {getTitle()}
                </h2>
                <p className="text-secondary">
                    Help us personalize your experience
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-6 rounded-2xl bg-card border border-border">
                    <div className="space-y-5">
                        {renderForm()}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="
                            flex-1 px-6 py-3.5 rounded-full font-medium
                            bg-card border border-border text-secondary
                            transition-all duration-300
                            hover:bg-hover hover:text-primary hover:border-accent/30
                            active:scale-[0.98]
                            flex items-center justify-center gap-2
                        "
                    >
                        <svg
                            className="w-4 h-4"
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
                            group flex-1 px-6 py-3.5 rounded-full font-medium
                            bg-gradient-to-r from-accent to-accent-hover text-white
                            transition-all duration-300
                            hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.02]
                            active:scale-[0.98]
                            flex items-center justify-center gap-2
                        "
                    >
                        Continue
                        <svg
                            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M9 5l7 7-7 7" />
                        </svg>
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
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-primary">
                {label}
                {required && <span className="text-accent ml-1">*</span>}
            </label>
            {type === "text" ? (
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className="
                        w-full px-4 py-3.5 rounded-xl
                        bg-bg border border-border
                        focus:bg-surface focus:border-accent focus:outline-none
                        focus:ring-4 focus:ring-accent/10
                        transition-all duration-200
                        placeholder:text-tertiary
                        text-primary
                    "
                />
            ) : (
                <div className="relative">
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        className="
                            w-full px-4 py-3.5 rounded-xl
                            bg-bg border border-border
                            focus:bg-surface focus:border-accent focus:outline-none
                            focus:ring-4 focus:ring-accent/10
                            transition-all duration-200
                            cursor-pointer appearance-none
                            text-primary
                        "
                    >
                        {options?.map((option) => (
                            <option key={option.value} value={option.value} className="bg-card text-primary">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-secondary"
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
