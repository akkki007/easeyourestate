import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { parseSearchQuery } from "@/lib/utils/parseSearchQuery";

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

        let sortOption: any = { updatedAt: -1 };

        if (sort === "price_asc") sortOption = { "price.amount": 1 };
        else if (sort === "price_desc") sortOption = { "price.amount": -1 };
        else if (sort === "date") sortOption = { createdAt: -1 };
        else if (sort === "popularity") sortOption = { "metrics.views": -1 };

        // CITY FILTER
        if (city) {
            filter["location.city"] = { $regex: new RegExp(city, "i") };
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
                $regex: parsedQuery.locality,
                $options: "i",
            };
        }

        if (parsedQuery.city) {
            filter["location.city"] = {
                $regex: parsedQuery.city,
                $options: "i"
            };
        }

        if (parsedQuery.maxPrice) {
            filter["price.amount"] = { $lte: parsedQuery.maxPrice };
        }

        if (parsedQuery.parking) {
            filter["specs.parking"] = true;
        }

        // BHK FILTER FROM UI

        if (bhk) {
            const bhkValues = bhk
                .split(",")
                .map((v) => parseInt(v.split(" ")[0]))
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
            filter["specs.parking"] = parking === "true";
        }

        // AMENITIES

        if (amenities) {
            filter.amenities = {
                $all: amenities.split(","),
            };
        }

        // PRICE FILTER (merge with any existing price filter from parsedQuery)

        if (minPrice || maxPrice) {
            const existing = filter["price.amount"] ?? {};
            if (minPrice) existing.$gte = parseInt(minPrice);
            if (maxPrice) existing.$lte = parseInt(maxPrice);
            filter["price.amount"] = existing;
        }

        // AREA FILTER

        if (minArea || maxArea) {
            filter["specs.area.superBuiltUp"] = {};

            if (minArea)
                filter["specs.area.superBuiltUp"].$gte = parseInt(minArea);

            if (maxArea)
                filter["specs.area.superBuiltUp"].$lte = parseInt(maxArea);
        }

        // POSSESSION STATUS

        if (possession) {
            filter["specs.possessionStatus"] = possession;
        }

        // GENERIC TEXT SEARCH (TITLE + DESCRIPTION ONLY)

        if (query) {
            const cleanQuery = query
                .replace(/\d+\s*bhk/gi, "")
                .replace(/in\s+[a-zA-Z\s]+/gi, "")
                .trim();

            if (cleanQuery.length > 2) {
                filter.$or = [
                    { title: { $regex: cleanQuery, $options: "i" } },
                    { description: { $regex: cleanQuery, $options: "i" } },
                ];
            }
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