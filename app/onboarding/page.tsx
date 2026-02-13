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
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-medium text-grey-40">Loading...</p>
                </div>
            </div>
        );
    }

    // Still waiting for user (grace period) or no user after grace
    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-medium text-grey-40">Loading your account...</p>
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
        <div className="min-h-screen bg-background-dark text-white">
            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Progress Indicator - Hide on welcome step */}
                {currentStep !== "welcome" && (
                    <ProgressIndicator
                        currentStep={stepIndex[currentStep]}
                        totalSteps={steps.length}
                        steps={steps}
                    />
                )}

                {/* Step Content */}
                <div className="mt-8">
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
    );
}
