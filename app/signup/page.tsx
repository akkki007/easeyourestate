import { Suspense } from "react";
import Home from "../page";
import SignUp from "@/components/SignUp";

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full">
      <Home />
      <Suspense>
        <SignUp />
      </Suspense>
    </main>
  );
}
