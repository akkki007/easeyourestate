"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import RoleSelection, { UserRole } from "@/components/onboarding/RoleSelection";
import RoleInfoForm from "@/components/onboarding/RoleInfoForm";
import CompletionStep from "@/components/onboarding/CompletionStep";
import { Pupil, EyeBall } from "@/components/ui/animated-characters-login-page";

type OnboardingStep = "welcome" | "role" | "info" | "complete";

// Grace period so Clerk can restore session after sign-up redirect (avoids flashing redirect to login)
const AUTH_GRACE_MS = 2500;

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const graceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasCheckedAuthRef = useRef(false);

    useEffect(() => {
        if (!isLoaded) return;

        // If we have a user, clear any pending redirect and handle onboarded check
        if (user) {
            hasCheckedAuthRef.current = false;
            if (graceTimeoutRef.current) {
                clearTimeout(graceTimeoutRef.current);
                graceTimeoutRef.current = null;
            }
            if (user.unsafeMetadata?.onboarded) {
                router.replace("/dashboard");
            }
            return;
        }

        // No user: wait a grace period before redirecting (session may still be hydrating after sign-up)
        if (hasCheckedAuthRef.current) return;
        hasCheckedAuthRef.current = true;
        graceTimeoutRef.current = setTimeout(() => {
            router.replace("/demoone");
        }, AUTH_GRACE_MS);
        return () => {
            if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
        };
    }, [isLoaded, user, router]);

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0B1E3A] to-[#0B1E3A]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0066CC]" />
                    <p className="text-lg font-medium text-white/60">Loading...</p>
                </div>
            </div>
        );
    }

    // Still waiting for user (grace period) or no user after grace
    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0B1E3A] to-[#0B1E3A]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0066CC]" />
                    <p className="text-lg font-medium text-white/60">Loading your account...</p>
                </div>
            </div>
        );
    }

    const steps = ["Welcome", "Choose Role", "Your Info", "Complete"];
    const stepIndex = {
        welcome: 0,
        role: 1,
        info: 2,
        complete: 3,
    };

    const handleNextFromWelcome = () => {
        setCurrentStep("role");
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        // Auto-advance to info step
        setTimeout(() => setCurrentStep("info"), 300);
    };

    const handleBackFromInfo = () => {
        setCurrentStep("role");
    };

    const handleInfoComplete = () => {
        setCurrentStep("complete");
    };

    const handleComplete = async () => {
        // Update user metadata to mark as onboarded
        try {
            await user.update({
                unsafeMetadata: {
                    role: selectedRole,
                    onboarded: true,
                },
            });
            // Reload the user to ensure the session has the updated metadata
            await user.reload();

            // Set a cookie for the middleware to read immediately
            document.cookie = "onboarded=true; path=/; max-age=31536000"; // 1 year

            // Give Clerk an additional moment to sync
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
        } finally {
            // Use hard redirect to ensure Clerk session is fully refreshed
            // and user is taken to their dashboard after completing onboarding
            window.location.href = "/dashboard";
        }
    };


    const userName = user.firstName || "there";

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Sidebar with Animated Characters */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-[#0B1E3A] to-[#0B1E3A] relative overflow-hidden items-center justify-center">
                {/* Animated Characters */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Character 1 - Purple */}
                    <div className="absolute w-24 h-24 rounded-full bg-[#7C5CFF]/30 blur-xl animate-pulse" style={{ top: "15%", left: "10%" }} />
                    
                    {/* Character 2 - Teal */}
                    <div className="absolute w-32 h-32 rounded-full bg-[#2EC4B6]/20 blur-2xl animate-pulse" style={{ top: "50%", right: "5%", animationDelay: "0.5s" }} />
                    
                    {/* Character 3 - Orange */}
                    <div className="absolute w-28 h-28 rounded-full bg-[#F4A261]/25 blur-xl animate-pulse" style={{ bottom: "15%", left: "20%", animationDelay: "1s" }} />
                    
                    {/* Character 4 - Yellow */}
                    <div className="absolute w-24 h-24 rounded-full bg-[#E9C46A]/30 blur-xl animate-pulse" style={{ bottom: "10%", right: "15%", animationDelay: "1.5s" }} />

                    {/* Main Mascot/Center Element */}
                    <div className="absolute flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full flex items-center justify-center relative">
                            {/* Eyes Container */}
                            <div className="absolute flex gap-12">
                                {/* Left Eye */}
                                <EyeBall
                                    size={48}
                                    pupilSize={16}
                                    eyeColor="white"
                                    pupilColor="#7C5CFF"
                                />
                                {/* Right Eye */}
                                <EyeBall
                                    size={48}
                                    pupilSize={16}
                                    eyeColor="white"
                                    pupilColor="#2EC4B6"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Text */}
                <div className="absolute bottom-8 text-center">
                    <p className="text-white/40 text-sm font-medium">Wisteria Properties</p>
                    <p className="text-white/30 text-xs mt-1">Your Real Estate Partner</p>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex-1 overflow-auto flex flex-col items-center justify-center px-6 md:px-12 py-8">
                    {/* Progress Indicator - Hide on welcome step */}
                    {currentStep !== "welcome" && (
                        <ProgressIndicator
                            currentStep={stepIndex[currentStep]}
                            totalSteps={steps.length}
                            steps={steps}
                        />
                    )}

                    {/* Step Content Container */}
                    <div className={`w-full max-w-2xl ${currentStep !== "welcome" ? "mt-8" : ""}`}>
                        {currentStep === "welcome" && (
                            <WelcomeStep userName={userName} onNext={handleNextFromWelcome} />
                        )}

                        {currentStep === "role" && (
                            <RoleSelection
                                selectedRole={selectedRole}
                                onSelectRole={handleRoleSelect}
                            />
                        )}

                        {currentStep === "info" && selectedRole && (
                            <RoleInfoForm
                                role={selectedRole}
                                onComplete={handleInfoComplete}
                                onBack={handleBackFromInfo}
                            />
                        )}

                        {currentStep === "complete" && selectedRole && (
                            <CompletionStep
                                userName={userName}
                                role={selectedRole}
                                onComplete={handleComplete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
