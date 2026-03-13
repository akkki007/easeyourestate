import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const city = searchParams.get("city");
        const query = searchParams.get("query"); // Locality or title
        const purpose = searchParams.get("purpose"); // sell, rent, pg
        const type = searchParams.get("type"); // Full House, PG/Hostel, Flatmates
        const bhk = searchParams.get("bhk"); // 1 BHK, 2 BHK, etc.
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
            status: { $in: ["active", "draft"] },
            deletedAt: { $exists: false },
        };

        let sortOption: any = { updatedAt: -1 };

        if (sort === "price_asc") {
            sortOption = { "price.amount": 1 };
        }
        else if (sort === "price_desc") {
            sortOption = { "price.amount": -1 };
        }
        else if (sort === "date") {
            sortOption = { createdAt: -1 };
        }
        else if (sort === "popularity") {
            sortOption = { "metrics.views": -1 };
        }


        if (city) {
            filter["location.city"] = { $regex: new RegExp(city, "i") };
        }

        if (purpose) {
            const p = purpose.toLowerCase();
            filter.purpose = p === "buy" ? "sell" : p;
        }

        if (type) {
            // Mapping common UI types to DB property types if needed
            if (type === "Full House") {
                filter.propertyType = { $in: ["flat", "house", "villa", "penthouse"] };
            } else if (type === "PG/Hostel") {
                filter.purpose = "pg";
            } else if (type === "Flatmates") {
                // Assuming flatmates is a specific type or filter
                filter.propertyType = "flat";
            }
        }

        if (bhk) {
            const bhkValues = bhk.split(",").map(v => parseInt(v.split(" ")[0])).filter(v => !isNaN(v));
            if (bhkValues.length > 0) {
                filter["specs.bedrooms"] = { $in: bhkValues };
            }
        }

        if (furnishing) {
            filter["specs.furnishing"] = { $in: furnishing.split(",") };
        }

        if (amenities) {
            const amenityList = amenities.split(",");

            filter.amenities = {
                $all: amenityList
            };
        }

        if (query) {
            filter.$or = [
                { "location.locality": { $regex: new RegExp(query, "i") } },
                { title: { $regex: new RegExp(query, "i") } },
                { "location.address.line1": { $regex: new RegExp(query, "i") } },
            ];
        }

        if (minPrice || maxPrice) {
            filter["price.amount"] = {};
            if (minPrice) filter["price.amount"].$gte = parseInt(minPrice);
            if (maxPrice) filter["price.amount"].$lte = parseInt(maxPrice);
        }

        if (minArea || maxArea) {
            filter["specs.area.superBuiltUp"] = {};

            if (minArea) filter["specs.area.superBuiltUp"].$gte = parseInt(minArea);
            if (maxArea) filter["specs.area.superBuiltUp"].$lte = parseInt(maxArea);
        }

        if (possession) {
            filter["specs.possessionStatus"] = possession;
        }

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
            location: { city: p.location.city, locality: p.location.locality, address: p.location.address },
            specs: p.specs,
            media: p.media?.images?.[0] ? { primary: p.media.images[0].url } : null,
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
