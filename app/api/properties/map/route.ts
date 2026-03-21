import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { parseSearchQuery } from "@/lib/helpers/parseSearchQuery";
import { escapeRegex } from "@/lib/helpers/sanitize";

export async function GET(req: NextRequest) {
 try {

 await dbConnect();

 const { searchParams } = new URL(req.url);

 const city = searchParams.get("city");
 const query = searchParams.get("query");
 const parsedQuery = query ? parseSearchQuery(query) : {};
 const purpose = searchParams.get("purpose");
 const type = searchParams.get("type");
 const bhk = searchParams.get("bhk");
 const minPrice = searchParams.get("minPrice");
 const maxPrice = searchParams.get("maxPrice");
 const minArea = searchParams.get("min_area");
 const maxArea = searchParams.get("max_area");
 const furnishing = searchParams.get("furnishing");
 const parking = searchParams.get("parking");
 const amenities = searchParams.get("amenities");
 const possession = searchParams.get("possession");
 const project = searchParams.get("project");

 const filter: any = {
 status:"active",
 deletedAt: null,
 };
 const andConditions: any[] = [];

 if (city) {
 filter["location.city"] = { $regex: new RegExp(escapeRegex(city),"i") };
 }

 if (purpose) {
 const p = purpose.toLowerCase();
 filter.purpose = p ==="buy"?"sell": p;
 }

 if (type) {
 if (type ==="Full House") {
 filter.propertyType = { $in: ["flat","house","villa","penthouse"] };
 } else if (type ==="PG/Hostel") {
 filter.purpose ="pg";
 } else if (type ==="Flatmates") {
 filter.propertyType ="flat";
 } else {
 const typeValues = type
 .split(",")
 .map((v) => v.trim())
 .filter(Boolean);
 if (typeValues.length > 0) {
 filter.propertyType = { $in: typeValues };
 }
 }
 }

 if (parsedQuery.bhk) {
 filter["specs.bedrooms"] = parsedQuery.bhk;
 }

 if (parsedQuery.propertyType) {
 filter.propertyType = parsedQuery.propertyType;
 }

 if (parsedQuery.locality) {
 filter["location.locality"] = {
 $regex: escapeRegex(parsedQuery.locality),
 $options:"i",
 };
 }

 if (parsedQuery.city) {
 filter["location.city"] = {
 $regex: escapeRegex(parsedQuery.city),
 $options:"i"
 };
 }

 if (parsedQuery.maxPrice) {
 filter["price.amount"] = { $lte: parsedQuery.maxPrice };
 }

 if (parsedQuery.parking) {
 andConditions.push({
 $or: [
 { "specs.parking.covered": { $gt: 0 } },
 { "specs.parking.open": { $gt: 0 } },
 ],
 });
 }

 if (bhk) {
 const bhkValues = bhk
 .split(",")
 .map((v) => parseInt(v, 10))
 .filter((v) => !isNaN(v));

 if (bhkValues.length > 0) {
 filter["specs.bedrooms"] = { $in: bhkValues };
 }
 }

 if (furnishing) {
 filter["specs.furnishing"] = { $in: furnishing.split(",") };
 }

 if (parking) {
 if (parking ==="true") {
 andConditions.push({
 $or: [
 { "specs.parking.covered": { $gt: 0 } },
 { "specs.parking.open": { $gt: 0 } },
 ],
 });
 } else {
 const parkingValues = parking
 .split(",")
 .map((v) => v.trim())
 .filter(Boolean);
 const normalizedParkingValues = parkingValues.map((v) => {
 if (v ==="two_wheeler") return"open";
 if (v ==="four_wheeler") return"covered";
 return v;
 });
 const parkingConditions: any[] = [];
 if (normalizedParkingValues.includes("covered")) {
 parkingConditions.push({ "specs.parking.covered": { $gt: 0 } });
 }
 if (normalizedParkingValues.includes("open")) {
 parkingConditions.push({ "specs.parking.open": { $gt: 0 } });
 }
 if (parkingConditions.length === 1) {
 andConditions.push(parkingConditions[0]);
 } else if (parkingConditions.length > 1) {
 andConditions.push({ $or: parkingConditions });
 }
 }
 }

 if (amenities) {
 filter.amenities = {
 $all: amenities.split(","),
 };
 }

 if (minPrice || maxPrice) {
 const existing = filter["price.amount"] ?? {};
 if (minPrice) existing.$gte = parseInt(minPrice);
 if (maxPrice) existing.$lte = parseInt(maxPrice);
 filter["price.amount"] = existing;
 }

 if (minArea || maxArea) {
 const areaRange: any = {};
 if (minArea) areaRange.$gte = parseInt(minArea, 10);
 if (maxArea) areaRange.$lte = parseInt(maxArea, 10);
 andConditions.push({
 $or: [
 { "specs.area.superBuiltUp": { ...areaRange } },
 { "specs.area.builtUp": { ...areaRange } },
 { "specs.area.carpet": { ...areaRange } },
 { "specs.area.plot": { ...areaRange } },
 ],
 });
 }

 if (possession) {
 filter["specs.possessionStatus"] = possession;
 }

 if (project) {
 filter.project = project;
 }

 if (query) {
 const cleanQuery = query
 .replace(/\d+\s*bhk/gi,"")
 .replace(/in\s+[a-zA-Z\s]+/gi,"")
 .trim();

 if (cleanQuery.length > 2) {
 const escaped = escapeRegex(cleanQuery);
 filter.$or = [
 { title: { $regex: escaped, $options:"i"} },
 { description: { $regex: escaped, $options:"i"} },
 ];
 }

 if (andConditions.length > 0) {
 filter.$and = andConditions;
 }
 }

 const properties = await Property.find(filter)
 .select(
"title slug price location.coordinates location.locality specs.bedrooms media.images"
 )
 .limit(100)
 .lean();

 const results = properties.map((p: any) => ({
 id: p._id,
 title: p.title,
 price: p.price?.amount,
 bhk: p.specs?.bedrooms,
 locality: p.location?.locality,
 lat: p.location?.coordinates?.coordinates[1],
 lng: p.location?.coordinates?.coordinates[0],
 image: p.media?.images?.[0]?.url || null,
 slug: p.slug
 }));

 return NextResponse.json({ properties: results });

 } catch (error) {

 console.error("Map API error", error);

 return NextResponse.json(
 { error:"Failed to fetch map properties"},
 { status: 500 }
 );
 }
}