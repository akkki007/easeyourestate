"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <AuthenticateWithRedirectCallback />
      <p className="absolute bottom-8 text-sm text-gray-400">
        Completing sign in...
      </p>
    </div>
  );
}
