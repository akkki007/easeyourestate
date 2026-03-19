"use client";

import { useEffect, useState, Suspense } from"react";
import { useSearchParams } from"next/navigation";
import Image from"next/image";
import Link from"next/link";
import { Check, X, ArrowLeft } from"lucide-react";

function CompareContent() {
 const searchParams = useSearchParams();
 const [properties, setProperties] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchProperties = async () => {
 const ids = searchParams.get("ids");
 if (!ids) {
 setLoading(false);
 return;
 }

 try {
 const res = await fetch(`/api/properties/compare?ids=${ids}`);
 const data = await res.json();
 setProperties(data.properties || []);
 } catch (error) {
 console.error("Error fetching comparison properties:", error);
 } finally {
 setLoading(false);
 }
 };

 fetchProperties();
 }, [searchParams]);

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
 </div>
 );
 }

 if (properties.length === 0) {
 return (
 <div className="max-w-4xl mx-auto px-6 py-20 text-center">
 <h1 className="text-3xl font-bold mb-4">No properties to compare</h1>
 <p className="text-secondary mb-8">Select up to 3 properties from the search results to compare them side-by-side.</p>
 <Link href="/dashboard/search"className="btn-primary">
 Go to Search
 </Link>
 </div>
 );
 }

 const allAmenities = Array.from(new Set(properties.flatMap(p => p.amenities || [])));

 return (
 <div className="max-w-7xl mx-auto px-6 py-12">
 <div className="flex items-center gap-4 mb-8">
 <Link href="/dashboard/search"className="p-2 rounded-full hover:bg-hover transition-colors">
 <ArrowLeft className="w-6 h-6"/>
 </Link>
 <h1 className="text-3xl font-bold">Compare Properties</h1>
 </div>

 <div className="overflow-x-auto">
 <table className="w-100 border-collapse">
 <thead>
 <tr>
 <th className="p-4 text-left min-w-[200px] border-b border-border bg-hover/20">Features</th>
 {properties.map((property: any) => (
 <th key={property._id} className="p-4 border-b border-border min-w-[250px] align-top">
 <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
 <Image
 src={property.media?.images?.find((img: any) => img.isPrimary)?.url || property.media?.images?.[0]?.url ||"/placeholder-property.jpg"}
 alt={property.title}
 fill
 className="object-cover"
 />
 </div>
 <h3 className="font-semibold text-lg mb-1 leading-tight">{property.title}</h3>
 <p className="text-sm text-secondary mb-2 truncate">
 {property.location.locality}, {property.location.city}
 </p>
 <p className="text-xl font-bold text-accent">
 ₹{(property.price.amount / 10000000).toFixed(2)} Cr
 </p>
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {/* Price */}
 <tr>
 <td className="p-4 border-b border-border font-medium bg-hover/10">Type</td>
 {properties.map((p: any) => (
 <td key={p._id} className="p-4 border-b border-border capitalize">{p.propertyType}</td>
 ))}
 </tr>
 {/* BHK */}
 <tr>
 <td className="p-4 border-b border-border font-medium bg-hover/10">BHK</td>
 {properties.map((p: any) => (
 <td key={p._id} className="p-4 border-b border-border">{p.specs?.bedrooms ||"N/A"} BHK</td>
 ))}
 </tr>
 {/* Area */}
 <tr>
 <td className="p-4 border-b border-border font-medium bg-hover/10">Area</td>
 {properties.map((p: any) => (
 <td key={p._id} className="p-4 border-b border-border">
 {p.specs?.area?.carpet || p.specs?.area?.builtUp ||"N/A"} {p.specs?.area?.unit ||"sqft"}
 </td>
 ))}
 </tr>
 {/* Location */}
 <tr>
 <td className="p-4 border-b border-border font-medium bg-hover/10">Full Location</td>
 {properties.map((p: any) => (
 <td key={p._id} className="p-4 border-b border-border text-sm">
 {p.location.address.line1}, {p.location.locality}, {p.location.city}, {p.location.state}
 </td>
 ))}
 </tr>
 {/* Agent */}
 <tr>
 <td className="p-4 border-b border-border font-medium bg-hover/10">Listed By</td>
 {properties.map((p: any) => (
 <td key={p._id} className="p-4 border-b border-border capitalize">
 {p.listedBy?.name?.first} {p.listedBy?.name?.last} ({p.listingType})
 </td>
 ))}
 </tr>
 {/* Amenities Header */}
 <tr>
 <td colSpan={properties.length + 1} className="p-4 bg-hover font-bold text-sm uppercase tracking-wider">
 Amenities
 </td>
 </tr>
 {allAmenities.map((amenity) => (
 <tr key={amenity}>
 <td className="p-4 border-b border-border text-sm font-medium bg-hover/5">{amenity}</td>
 {properties.map((p: any) => (
 <td key={p._id} className="p-4 border-b border-border text-center">
 {p.amenities?.includes(amenity) ? (
 <Check className="w-5 h-5 text-success mx-auto"/>
 ) : (
 <X className="w-5 h-5 text-error mx-auto opacity-20"/>
 )}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

export default function ComparePage() {
 return (
 <Suspense fallback={<div>Loading...</div>}>
 <CompareContent />
 </Suspense>
 );
}
