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
    const sort = searchParams.get("sort");

    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const skip = (page - 1) * limit;

    const filter: any = {
      status: "active",
      deletedAt: null,
    };
    const andConditions: any[] = [];

    const petFriendly = searchParams.get("petFriendly");
    const genderPreference = searchParams.get("genderPreference");
    const pgSharing = searchParams.get("pgSharing");

    let sortOption: any = { updatedAt: -1 };

    if (sort === "price_asc") {
      if (purpose === "rent" || purpose === "lease") sortOption = { "rental_details.monthly_rent": 1 };
      else if (purpose === "pg") sortOption = { "pg_details.monthly_rent": 1 };
      else sortOption = { "price.amount": 1 };
    } else if (sort === "price_desc") {
      if (purpose === "rent" || purpose === "lease") sortOption = { "rental_details.monthly_rent": -1 };
      else if (purpose === "pg") sortOption = { "pg_details.monthly_rent": -1 };
      else sortOption = { "price.amount": -1 };
    } else if (sort === "date") sortOption = { createdAt: -1 };
    else if (sort === "popularity") sortOption = { "metrics.views": -1 };

    // CITY FILTER
    if (city) {
      filter["location.city"] = { $regex: new RegExp(escapeRegex(city), "i") };
    }

    // PURPOSE
    if (purpose) {
      const p = purpose.toLowerCase();
      filter.purpose = p === "buy" ? "sell" : p;
    }

    // PROPERTY TYPE
    if (type) {
      if (type === "Full House") {
        filter.propertyType = { $in: ["flat", "house", "villa", "penthouse"] };
      } else if (type === "PG/Hostel") {
        filter.purpose = "pg";
      } else if (type === "Flatmates") {
        filter.propertyType = "flat";
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

    // SMART SEARCH PARSER RESULTS

    if (parsedQuery.bhk) {
      filter["specs.bedrooms"] = parsedQuery.bhk;
    }

    if (parsedQuery.propertyType) {
      filter.propertyType = parsedQuery.propertyType;
    }

    if (parsedQuery.locality) {
      filter["location.locality"] = {
        $regex: escapeRegex(parsedQuery.locality),
        $options: "i",
      };
    }

    if (parsedQuery.city) {
      filter["location.city"] = {
        $regex: escapeRegex(parsedQuery.city),
        $options: "i"
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

    // BHK FILTER FROM UI

    if (bhk) {
      const bhkValues = bhk
        .split(",")
        .map((v) => parseInt(v, 10))
        .filter((v) => !isNaN(v));

      if (bhkValues.length > 0) {
        filter["specs.bedrooms"] = { $in: bhkValues };
      }
    }

    // FURNISHING

    if (furnishing) {
      filter["specs.furnishing"] = { $in: furnishing.split(",") };
    }

    // PARKING

    if (parking) {
      if (parking === "true") {
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
          if (v === "two_wheeler") return "open";
          if (v === "four_wheeler") return "covered";
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

    // AMENITIES

    if (amenities) {
      filter.amenities = {
        $all: amenities.split(","),
      };
    }

    // PRICE FILTER (merge with any existing price filter from parsedQuery)

    if (minPrice || maxPrice) {
      const minVal = minPrice ? parseInt(minPrice, 10) : undefined;
      const maxVal = maxPrice ? parseInt(maxPrice, 10) : undefined;
      const priceRange: any = {};
      if (minVal !== undefined) priceRange.$gte = minVal;
      if (maxVal !== undefined) priceRange.$lte = maxVal;

      if (purpose === "rent" || purpose === "lease") {
        filter["rental_details.monthly_rent"] = { ...(filter["rental_details.monthly_rent"] || {}), ...priceRange };
      } else if (purpose === "pg") {
        filter["pg_details.monthly_rent"] = { ...(filter["pg_details.monthly_rent"] || {}), ...priceRange };
      } else if (purpose === "sell") {
        filter["price.amount"] = { ...(filter["price.amount"] || {}), ...priceRange };
      } else {
        andConditions.push({
          $or: [
            { "price.amount": priceRange },
            { "rental_details.monthly_rent": priceRange },
            { "pg_details.monthly_rent": priceRange },
          ],
        });
      }
    }

    // TENANT EXACT FILTERS

    if (petFriendly === "true") {
      filter["rental_details.pet_friendly"] = true;
    }

    if (genderPreference) {
      filter["pg_details.gender_preference"] = genderPreference;
    }

    if (pgSharing) {
      const types = pgSharing.split(",").map((v) => v.trim()).filter(Boolean);
      if (types.length > 0) {
        filter["pg_details.sharing_type"] = { $in: types };
      }
    }

    // AREA FILTER

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

    // POSSESSION STATUS

    if (possession) {
      filter["specs.possessionStatus"] = possession;
    }

    // PROJECT FILTER
    const project = searchParams.get("project");
    if (project) {
      filter.project = project;
    }

    // GENERIC TEXT SEARCH (TITLE + DESCRIPTION ONLY)

    if (query) {
      const cleanQuery = query
        .replace(/\d+\s*bhk/gi, "")
        .replace(/in\s+[a-zA-Z\s]+/gi, "")
        .trim();

      if (cleanQuery.length > 2) {
        const escaped = escapeRegex(cleanQuery);
        filter.$or = [
          { title: { $regex: escaped, $options: "i" } },
          { description: { $regex: escaped, $options: "i" } },
          { "location.locality": { $regex: escaped, $options: "i" } },
          { "location.address.line1": { $regex: escaped, $options: "i" } },
          { "location.address.line2": { $regex: escaped, $options: "i" } },
          { "location.address.landmark": { $regex: escaped, $options: "i" } },
        ];
      }
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // DATABASE QUERY

    const [list, total] = await Promise.all([
      Property.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      Property.countDocuments(filter),
    ]);

    const listings = list.map((p: any) => ({
      id: p._id.toString(),
      slug: p.slug,
      title: p.title,
      purpose: p.purpose,
      category: p.category,
      propertyType: p.propertyType,
      price: p.price,
      location: {
        city: p.location.city,
        locality: p.location.locality,
        address: p.location.address,
      },
      specs: p.specs,
      rental_details: p.rental_details,
      pg_details: p.pg_details,
      media: p.media?.images?.[0]
        ? { primary: p.media.images[0].url }
        : null,
    }));

    return NextResponse.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}