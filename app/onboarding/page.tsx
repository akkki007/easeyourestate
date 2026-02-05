"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  const handleSelectRole = async (role: "owner" | "tenant") => {
    if (!user) return;

    await user.update({
      unsafeMetadata: {
        role: role,
        onboarded: true,
      },
    });

    router.push("/");
  };

  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>Welcome 👋</h1>
      <p>Select your role to continue</p>

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => handleSelectRole("owner")}
          style={{ padding: "10px 20px", margin: "10px" }}
        >
          I am an Owner
        </button>

        <button
          onClick={() => handleSelectRole("tenant")}
          style={{ padding: "10px 20px", margin: "10px" }}
        >
          I am a Tenant
        </button>
      </div>
    </main>
  );
}
