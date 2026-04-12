"use client";

import { useEffect } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
  useMap,
} from "@/components/ui/map";

// Auto-fit bounds helper component
function AutoFitBounds({ properties }: { properties: any[] }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || !properties || properties.length === 0) return;

    const bounds = properties.reduce(
      (acc: any, p: any) => {
        const lng = Number(p.lng);
        const lat = Number(p.lat);
        if (isNaN(lng) || isNaN(lat)) return acc;
        return {
          minLng: Math.min(acc.minLng, lng),
          maxLng: Math.max(acc.maxLng, lng),
          minLat: Math.min(acc.minLat, lat),
          maxLat: Math.max(acc.maxLat, lat),
        };
      },
      { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
    );

    if (bounds.minLng > bounds.maxLng) return;

    map.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      { padding: 50, maxZoom: 14, duration: 500 }
    );
  }, [map, isLoaded, properties]);

 return null;
}

// Format price in Indian format
function formatPrice(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// LocationPicker export for backward compatibility
export function LocationPicker(_props: {
  onSelect: (coords: { lat: number; lng: number }) => void;
}) {
  // mapcn doesn't have built-in click-to-select, this is a compatibility export
  return null;
}

export default function PropertyMap({
  properties = [],
}: {
  properties?: any[];
}) {
  const validProperties = properties.filter(
    (p) => !isNaN(Number(p.lat)) && !isNaN(Number(p.lng))
  );

  const center: [number, number] =
    validProperties.length > 0
      ? [Number(validProperties[0].lng), Number(validProperties[0].lat)]
      : [73.8567, 18.5204]; // Default [lng, lat]

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border shadow-sm">
      <Map center={center} zoom={12}>
        <AutoFitBounds properties={validProperties} />
        <MapControls position="bottom-right" showZoom showFullscreen />

        {validProperties.map((p: any) => (
          <MapMarker
            key={p.id}
            longitude={Number(p.lng)}
            latitude={Number(p.lat)}
          >
            <MarkerContent>
              <div className="w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform" />
            </MarkerContent>
            <MarkerPopup className="p-0 w-[240px]">
              <div className="overflow-hidden rounded-lg bg-card">
                <img
                  src={
                    p.image ||
                    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400&q=80"
                  }
                  alt="Property image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400&q=80";
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                  className="w-full h-[130px] object-cover bg-muted"
                />
                <div className="p-3 space-y-1.5">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-teal-600 font-bold text-sm">
                    {typeof p.price === "number"
                      ? formatPrice(p.price)
                      : `₹${p.price}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.locality}</p>
                  <a
                    href={`/property/${p.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover mt-1"
                  >
                    View Property
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
