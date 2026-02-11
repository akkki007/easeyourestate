"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/onboarding"
      />
      <p className="absolute bottom-8 text-sm text-muted-foreground">
        Completing sign in...
      </p>
    </div>
  );
}
