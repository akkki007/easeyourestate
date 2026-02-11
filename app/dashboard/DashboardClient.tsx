"use client";

import { SignOutButton } from "@clerk/nextjs";

export function DashboardClient() {
  return (
    <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
      <button
        type="button"
        className="px-4 py-2 rounded-lg border border-border-dark bg-card-dark text-sm font-medium hover:bg-white/5 transition-colors"
      >
        Log out
      </button>
    </SignOutButton>
  );
}
