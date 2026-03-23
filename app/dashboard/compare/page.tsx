"use client";

import { useEffect, useState } from"react";
import { useRouter } from"next/navigation";
import { Loader2, ArrowLeft, LayoutGrid } from"lucide-react";
import Link from"next/link";

export default function CompareBridgePage() {
 const router = useRouter();
 const [status, setStatus] = useState("checking");

 useEffect(() => {
 const compareIds = JSON.parse(localStorage.getItem("compareProperties") ||"[]");
 if (compareIds.length > 0) {
 router.replace(`/properties/compare?ids=${compareIds.join(",")}`);
 } else {
 setStatus("empty");
 }
 }, [router]);

 if (status ==="checking") {
 return (
 <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
 <Loader2 className="w-10 h-10 animate-spin text-accent"/>
 <p className="text-secondary font-medium">Loading your comparison...</p>
 </div>
 );
 }

 return (
 <div className="max-w-2xl mx-auto px-6 py-20 text-center">
 <div className="w-20 h-20 bg-hover rounded-full flex items-center justify-center mx-auto mb-6">
 <LayoutGrid className="w-10 h-10 text-tertiary"/>
 </div>
 <h1 className="text-2xl font-bold mb-4">No properties selected for comparison</h1>
 <p className="text-secondary mb-8">
 Go to property listings and click"Add to Compare"on up to 3 properties to see them side-by-side.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link href="/search"className="btn-primary">
 Browse Properties
 </Link>
 <Link href="/dashboard"className="px-6 py-3 border border-border rounded-xl font-bold hover:bg-hover transition-colors">
 Back to Dashboard
 </Link>
 </div>
 </div>
 );
}
