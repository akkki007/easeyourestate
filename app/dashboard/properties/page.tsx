import { redirect } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/proxy";

export default async function PropertiesPage() {
  await requireOnboarded();
  redirect("/dashboard/listings");
}
