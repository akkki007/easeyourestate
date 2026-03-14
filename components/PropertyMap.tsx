"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});
export function LocationPicker({ onSelect }: any) {
    const [position, setPosition] = useState<any>(null);

    useMapEvents({
        click(e) {
            const coords = {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            };

            setPosition(coords);
            onSelect(coords);
        }
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

function AutoFitBounds({ properties }: any) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    const bounds = properties.map((p: any) => [p.lat, p.lng]);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14
    });

  }, [properties, map]);

  return null;
}

export default function PropertyMap({ properties = [] }: any) {

    const center: [number, number] = [
  Number(properties?.[0]?.lat) || 18.5204,
  Number(properties?.[0]?.lng) || 73.8567
];


    return (

        <MapContainer
            center={center as any}
            zoom={12}
            style={{ height: "600px", width: "100%" }}

        >

            <AutoFitBounds properties={properties} />
            <LocationPicker
                onSelect={(coords: any) => {
                    console.log("Selected location:", coords);
                }}
            />

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {properties?.map((p: any) => (

                <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                >

                <Popup offset={[0, -10]}>
  <div className="w-[220px]">

    <img
      src={p.image || "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d"}
      className="w-full h-[120px] object-cover rounded-lg"
    />

    <div className="mt-2 space-y-1">
      <h3 className="font-semibold text-sm">
        {p.title}
      </h3>

      <p className="text-teal-600 font-bold text-sm">
        ₹{p.price}
      </p>

      <p className="text-xs text-gray-500">
        {p.locality}
      </p>

      <a
        href={`/property/${p.slug}`}
        className="text-xs text-blue-600 font-medium"
      >
        View Property →
      </a>
    </div>

  </div>
</Popup>

                </Marker>

            ))}

        </MapContainer>

    );
}