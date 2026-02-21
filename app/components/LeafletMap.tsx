"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { log } from "console";

export default function LeafletMap() {
  const { user } = useUser();

  const [circleData, setCircleData] = useState<{
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);

  const handleCreated = (e: any) => {
    const layer = e.layer;

    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();

      setCircleData({
        lat: center.lat,
        lng: center.lng,
        radius,
      });
    }
  };

  const handleEdited = (e:any) => {
    e.layers.eachLayer((layer:any)=>{
      if(layer instanceof L.Circle){
        const center = layer.getLatLng();
        const radius = layer.getRadius();

        setCircleData({
        lat: center.lat,
        lng: center.lng,
        radius,
      });
      }
    });
  };

  const handleSave = async () => {
    if (!circleData || !user) return;

    const res = await fetch("/api/search-area", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        lat: circleData.lat,
        lng: circleData.lng,
        radius: circleData.radius,
      }),
    });

    const data = await res.json();
    console.log(data);
    if (data.success) {
      alert("Search area saved successfully ✅");
    } else {
      alert("Failed to save ❌");
    }
  };

  return (
    <div style={{ height: "600px", width: "100%", padding: "20px" }}>
      <h2>Select Search Area</h2>

      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            draw={{
              rectangle: false,
              polygon: false,
              polyline: false,
              marker: false,
              circlemarker: false,
              circle: true,
            }}
          />
        </FeatureGroup>
      </MapContainer>

      {circleData && (
        <div style={{ marginTop: "20px" }}>
          <p>
            Lat: {circleData.lat.toFixed(4)} <br />
            Lng: {circleData.lng.toFixed(4)} <br />
            Radius: {Math.round(circleData.radius)} m
          </p>

          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none",
            }}
          >
            Confirm & Save
          </button>
        </div>
      )}
    </div>
  );
}
