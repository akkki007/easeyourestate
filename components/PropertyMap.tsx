"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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


export default function PropertyMap({ properties }: any) {

    const center = [
        properties?.[0]?.lat || 18.5204,
        properties?.[0]?.lng || 73.8567
    ];



    return (

        <MapContainer
            center={center as any}
            zoom={12}
            style={{ height: "600px", width: "100%" }}

        >
            <LocationPicker
                onSelect={(coords: any) => {
                    console.log("Selected location:", coords);
                }}
            />

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {properties.map((p: any) => (

                <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                >

                    <Popup>

                        <div>

                            <h3 className="font-bold">{p.title}</h3>

                            <p>₹{p.price}</p>

                            <p>{p.locality}</p>

                        </div>

                    </Popup>

                </Marker>

            ))}

        </MapContainer>

    );
}