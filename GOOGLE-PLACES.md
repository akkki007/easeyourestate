You can use these APIs for search 
// server.js — Node.js + Express backend
// npm install express cors dotenv @googlemaps/google-maps-services-js

import express from “express”;
import cors from “cors”;
import { Client } from “@googlemaps/google-maps-services-js”;
import dotenv from “dotenv”;

dotenv.config();

const app = express();
const mapsClient = new Client({});
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

app.use(cors());
app.use(express.json());

// ─── 1. AUTOCOMPLETE ────────────────────────────────────────────────
// Returns place predictions as user types
app.get(”/api/autocomplete”, async (req, res) => {
const { query, lat, lng } = req.query;
if (!query) return res.json({ predictions: [] });

try {
const response = await mapsClient.placeAutocomplete({
params: {
input: query,
key: GOOGLE_API_KEY,
types: “(regions)”, // cities, localities, sub-localities
components: [“country:in”], // restrict to India (change as needed)
…(lat && lng && {
location: { lat: parseFloat(lat), lng: parseFloat(lng) },
radius: 50000,
}),
},
});

```
const predictions = response.data.predictions.map((p) => ({
  placeId: p.place_id,
  description: p.description,
  mainText: p.structured_formatting.main_text,
  secondaryText: p.structured_formatting.secondary_text,
  types: p.types,
}));

res.json({ predictions });
```

} catch (err) {
console.error(“Autocomplete error:”, err.message);
res.status(500).json({ error: “Autocomplete failed” });
}
});

// ─── 2. PLACE DETAILS (get lat/lng from place_id) ───────────────────
app.get(”/api/place-details”, async (req, res) => {
const { placeId } = req.query;
if (!placeId) return res.status(400).json({ error: “placeId required” });

try {
const response = await mapsClient.placeDetails({
params: {
place_id: placeId,
key: GOOGLE_API_KEY,
fields: [“geometry”, “formatted_address”, “name”, “address_components”],
},
});

```
const { result } = response.data;
res.json({
  name: result.name,
  address: result.formatted_address,
  lat: result.geometry.location.lat,
  lng: result.geometry.location.lng,
  viewport: result.geometry.viewport,
});
```

} catch (err) {
console.error(“Place details error:”, err.message);
res.status(500).json({ error: “Place details failed” });
}
});

// ─── 3. NEARBY PROPERTIES SEARCH ────────────────────────────────────
// In production, replace with your DB query (PostGIS / Elasticsearch)
app.get(”/api/properties”, async (req, res) => {
const { lat, lng, radius = 5, type, sort, page = 1, limit = 20 } = req.query;
if (!lat || !lng) return res.status(400).json({ error: “lat/lng required” });

const startTime = performance.now();
const centerLat = parseFloat(lat);
const centerLng = parseFloat(lng);

// ── MOCK: Replace this block with your actual DB query ──
// Example PostGIS query:
//   SELECT * FROM properties
//   WHERE ST_DWithin(geom, ST_MakePoint($lng, $lat)::geography, $radius * 1000)
//   ORDER BY ST_Distance(geom, ST_MakePoint($lng, $lat)::geography)
//   LIMIT $limit OFFSET ($page - 1) * $limit;

const MOCK_DB = generateMockProperties(centerLat, centerLng, 30);

let results = MOCK_DB;

// Filter by type
if (type && type !== “All”) {
results = results.filter((p) => p.type === type);
}

// Sort
if (sort === “price_low”) results.sort((a, b) => a.priceNum - b.priceNum);
else if (sort === “price_high”) results.sort((a, b) => b.priceNum - a.priceNum);
else if (sort === “area”) results.sort((a, b) => b.areaSqft - a.areaSqft);
else results.sort((a, b) => a.distance - b.distance); // default: nearest

// Paginate
const offset = (parseInt(page) - 1) * parseInt(limit);
const paged = results.slice(offset, offset + parseInt(limit));

const queryTime = (performance.now() - startTime).toFixed(0);

res.json({
total: results.length,
page: parseInt(page),
limit: parseInt(limit),
queryTimeMs: queryTime,
properties: paged,
});
});

// ─── 4. NEARBY PLACES (Google Places) ───────────────────────────────
// Get nearby landmarks, transit, schools etc.
app.get(”/api/nearby-places”, async (req, res) => {
const { lat, lng, type = “transit_station” } = req.query;

try {
const response = await mapsClient.placesNearby({
params: {
location: { lat: parseFloat(lat), lng: parseFloat(lng) },
radius: 2000,
type,
key: GOOGLE_API_KEY,
},
});

```
const places = response.data.results.slice(0, 10).map((p) => ({
  name: p.name,
  lat: p.geometry.location.lat,
  lng: p.geometry.location.lng,
  rating: p.rating,
  vicinity: p.vicinity,
  type: p.types?.[0],
}));

res.json({ places });
```

} catch (err) {
console.error(“Nearby places error:”, err.message);
res.status(500).json({ error: “Nearby search failed” });
}
});

// ─── MOCK DATA GENERATOR (replace with real DB) ─────────────────────
function generateMockProperties(lat, lng, count) {
const types = [“Apartment”, “Villa”, “Studio”, “Penthouse”, “Duplex”];
const amenitiesList = [“Parking”, “Gym”, “Pool”, “Garden”, “Security”, “Lift”, “WiFi”, “Furnished”, “Balcony”, “Terrace”];
const configs = [
{ beds: 1, baths: 1, area: [400, 650], price: [6000, 12000] },
{ beds: 2, baths: 1, area: [700, 1100], price: [10000, 20000] },
{ beds: 2, baths: 2, area: [900, 1300], price: [14000, 25000] },
{ beds: 3, baths: 2, area: [1200, 2000], price: [20000, 45000] },
{ beds: 3, baths: 3, area: [1800, 2800], price: [30000, 60000] },
{ beds: 4, baths: 4, area: [2500, 4000], price: [50000, 100000] },
];

return Array.from({ length: count }, (_, i) => {
const config = configs[Math.floor(Math.random() * configs.length)];
const type = types[Math.floor(Math.random() * types.length)];
const pLat = lat + (Math.random() - 0.5) * 0.04;
const pLng = lng + (Math.random() - 0.5) * 0.04;
const priceNum = Math.round(
(config.price[0] + Math.random() * (config.price[1] - config.price[0])) / 500
) * 500;
const areaSqft = Math.round(
config.area[0] + Math.random() * (config.area[1] - config.area[0])
);
const dist = haversine(lat, lng, pLat, pLng);

```
return {
  id: `prop_${i + 1}`,
  title: `${config.beds} BHK ${type}`,
  type,
  price: `₹${priceNum.toLocaleString("en-IN")}/mo`,
  priceNum,
  area: `${areaSqft} sq.ft`,
  areaSqft,
  beds: config.beds,
  baths: config.baths,
  lat: pLat,
  lng: pLng,
  distance: parseFloat(dist.toFixed(1)),
  rating: parseFloat((3.2 + Math.random() * 1.8).toFixed(1)),
  amenities: amenitiesList.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3)),
  postedDaysAgo: Math.floor(Math.random() * 30),
};
```

});
}

function haversine(lat1, lon1, lat2, lon2) {
const R = 6371;
const dLat = ((lat2 - lat1) * Math.PI) / 180;
const dLon = ((lon2 - lon1) * Math.PI) / 180;
const a =
Math.sin(dLat / 2) ** 2 +
Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── START SERVER ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));