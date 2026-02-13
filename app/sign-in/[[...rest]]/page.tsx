import { SignIn } from "@clerk/nextjs";

export default function Page() {
  // After a successful sign-in via Clerk's hosted UI,
  // send users to the dashboard (middleware will still
  // enforce onboarding if needed).
  return <SignIn forceRedirectUrl="/dashboard" />;
}
