"use client";


import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  
const { user, isLoaded } = useUser();
const router = useRouter();


useEffect(() => {
  if (!isLoaded || !user) return;

  const onboarded = user.unsafeMetadata?.onboarded;

  if (!onboarded) {
    router.push("/onboarding");
  }
}, [isLoaded, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main style={{ padding: "40px" }}>
    <h1>Welcome to Our App</h1>

    <SignedOut>
      <a href="/sign-in">Login</a>
      <br />
      <a href="/sign-up">Signup</a>
    </SignedOut>

    <SignedIn>
      <UserButton />
      <p>You are logged in 🎉</p>
    </SignedIn>
  </main>
    </div>
  );
}
