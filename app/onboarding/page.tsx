"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Home, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ITenantAnswers, IOwnerAnswers, IAgentAnswers } from "@/models/OnboardingProfile";

const ROLE_STORAGE_KEY = "wisteria_role";
type Role = "tenant" | "owner" | "agent";

const ROLE_OPTIONS: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "tenant", label: "I'm looking to rent or buy", icon: <Home className="size-6" /> },
  { value: "owner", label: "I want to list my property", icon: <Building2 className="size-6" /> },
  { value: "agent", label: "I'm a real estate agent", icon: <Briefcase className="size-6" /> },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<"role" | "questions">("role");
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tenant form state
  const [tenantAnswers, setTenantAnswers] = useState<ITenantAnswers>({});
  // Owner form state
  const [ownerAnswers, setOwnerAnswers] = useState<IOwnerAnswers>({});
  // Agent form state
  const [agentAnswers, setAgentAnswers] = useState<IAgentAnswers>({});

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    const stored = sessionStorage.getItem(ROLE_STORAGE_KEY) as Role | null;
    if (stored && (stored === "tenant" || stored === "owner" || stored === "agent")) {
      setRole(stored);
      setStep("questions");
    }
  }, [isLoaded, user, router]);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    sessionStorage.setItem(ROLE_STORAGE_KEY, r);
    setStep("questions");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);
    const answers =
      role === "tenant"
        ? tenantAnswers
        : role === "owner"
          ? ownerAnswers
          : agentAnswers;
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/sync-role");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background hero-gradient flex flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg">
        {step === "role" && (
          <Card className="border-border bg-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome to easeyourestate.ai</CardTitle>
              <CardDescription className="text-muted-foreground">
                How would you like to use our platform?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRoleSelect(opt.value)}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <span className="flex size-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    {opt.icon}
                  </span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {step === "questions" && role && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {role === "tenant" && "Tell us what you're looking for"}
                {role === "owner" && "Tell us about your property"}
                {role === "agent" && "Tell us about your practice"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                This helps us personalize your experience.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                {role === "tenant" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLocations">Preferred areas / locations</Label>
                      <Input
                        id="preferredLocations"
                        placeholder="e.g. Downtown, North District"
                        value={tenantAnswers.preferredLocations ?? ""}
                        onChange={(e) =>
                          setTenantAnswers((p) => ({ ...p, preferredLocations: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budgetMin">Min budget ($)</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          placeholder="0"
                          value={tenantAnswers.budgetMin ?? ""}
                          onChange={(e) =>
                            setTenantAnswers((p) => ({
                              ...p,
                              budgetMin: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budgetMax">Max budget ($)</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          placeholder="0"
                          value={tenantAnswers.budgetMax ?? ""}
                          onChange={(e) =>
                            setTenantAnswers((p) => ({
                              ...p,
                              budgetMax: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moveInDate">Ideal move-in date</Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={tenantAnswers.moveInDate ?? ""}
                        onChange={(e) =>
                          setTenantAnswers((p) => ({ ...p, moveInDate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfOccupants">Number of occupants</Label>
                      <Input
                        id="numberOfOccupants"
                        type="number"
                        min={1}
                        placeholder="1"
                        value={tenantAnswers.numberOfOccupants ?? ""}
                        onChange={(e) =>
                          setTenantAnswers((p) => ({
                            ...p,
                            numberOfOccupants: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="petFriendly"
                        checked={tenantAnswers.petFriendly ?? false}
                        onChange={(e) =>
                          setTenantAnswers((p) => ({ ...p, petFriendly: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <Label htmlFor="petFriendly">I need pet-friendly options</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenantNotes">Additional notes</Label>
                      <Input
                        id="tenantNotes"
                        placeholder="Any other requirements?"
                        value={tenantAnswers.additionalNotes ?? ""}
                        onChange={(e) =>
                          setTenantAnswers((p) => ({ ...p, additionalNotes: e.target.value }))
                        }
                      />
                    </div>
                  </>
                )}

                {role === "owner" && (
                  <>
                    <div className="space-y-2">
                      <Label>Property type</Label>
                      <Select
                        value={ownerAnswers.propertyType ?? ""}
                        onValueChange={(v) =>
                          setOwnerAnswers((p) => ({ ...p, propertyType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Listing type</Label>
                      <Select
                        value={ownerAnswers.listingType ?? ""}
                        onValueChange={(v: "rent" | "sale" | "both") =>
                          setOwnerAnswers((p) => ({ ...p, listingType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rent, sale, or both?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyAddress">Property address</Label>
                      <Input
                        id="propertyAddress"
                        placeholder="Street address"
                        value={ownerAnswers.propertyAddress ?? ""}
                        onChange={(e) =>
                          setOwnerAnswers((p) => ({ ...p, propertyAddress: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={ownerAnswers.city ?? ""}
                        onChange={(e) =>
                          setOwnerAnswers((p) => ({ ...p, city: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availabilityDate">Availability date</Label>
                      <Input
                        id="availabilityDate"
                        type="date"
                        value={ownerAnswers.availabilityDate ?? ""}
                        onChange={(e) =>
                          setOwnerAnswers((p) => ({ ...p, availabilityDate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerNotes">Additional notes</Label>
                      <Input
                        id="ownerNotes"
                        placeholder="Anything else we should know?"
                        value={ownerAnswers.additionalNotes ?? ""}
                        onChange={(e) =>
                          setOwnerAnswers((p) => ({ ...p, additionalNotes: e.target.value }))
                        }
                      />
                    </div>
                  </>
                )}

                {role === "agent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="agencyName">Agency name</Label>
                      <Input
                        id="agencyName"
                        placeholder="Your agency or brokerage"
                        value={agentAnswers.agencyName ?? ""}
                        onChange={(e) =>
                          setAgentAnswers((p) => ({ ...p, agencyName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="Real estate license #"
                        value={agentAnswers.licenseNumber ?? ""}
                        onChange={(e) =>
                          setAgentAnswers((p) => ({ ...p, licenseNumber: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areasServed">Areas served</Label>
                      <Input
                        id="areasServed"
                        placeholder="e.g. Metro area, Downtown"
                        value={agentAnswers.areasServed ?? ""}
                        onChange={(e) =>
                          setAgentAnswers((p) => ({ ...p, areasServed: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">Years of experience</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={agentAnswers.yearsExperience ?? ""}
                        onChange={(e) =>
                          setAgentAnswers((p) => ({
                            ...p,
                            yearsExperience: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialties">Specialties</Label>
                      <Input
                        id="specialties"
                        placeholder="e.g. Luxury, First-time buyers"
                        value={agentAnswers.specialties ?? ""}
                        onChange={(e) =>
                          setAgentAnswers((p) => ({ ...p, specialties: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentNotes">Additional notes</Label>
                      <Input
                        id="agentNotes"
                        placeholder="Anything else?"
                        value={agentAnswers.additionalNotes ?? ""}
                        onChange={(e) =>
                          setAgentAnswers((p) => ({ ...p, additionalNotes: e.target.value }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("role");
                    setRole(null);
                    sessionStorage.removeItem(ROLE_STORAGE_KEY);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
