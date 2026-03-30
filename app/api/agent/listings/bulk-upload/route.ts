import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import AgentSubscription from "@/lib/db/models/AgentSubscription";
import Property from "@/lib/db/models/Property";
import { propertySlug } from "@/lib/helpers/slug";
import { parseCSV, validateCSVRows, generateCSVTemplate } from "@/lib/helpers/csvParser";

/**
 * POST /api/agent/listings/bulk-upload
 * Upload multiple listings via CSV
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Check subscription and bulk upload permission
  const subscription = await AgentSubscription.findOne({ agentId: user._id });
  if (!subscription || !subscription.bulkUploadEnabled) {
    return NextResponse.json(
      { error: "Bulk upload is not enabled for your plan" },
      { status: 403 }
    );
  }

  // Get form data
  let file: File | null = null;
  try {
    const formData = await req.formData();
    file = formData.get("file") as File;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
  }

  // Read and parse CSV
  let csvContent: string;
  try {
    csvContent = await file.text();
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 400 });
  }

  const rows = parseCSV(csvContent);
  const { validRows, errors } = validateCSVRows(rows);

  // Check listing limit
  const currentListingCount = await Property.countDocuments({
    listedBy: user._id,
    listingType: "agent",
    deletedAt: null,
  });

  const availableSlots = Math.max(0, subscription.listingLimit - currentListingCount);

  if (validRows.length > availableSlots) {
    return NextResponse.json(
      {
        error: `Cannot upload ${validRows.length} listings. Only ${availableSlots} slots available in your plan.`,
        errors,
      },
      { status: 403 }
    );
  }

  // Create listings
  const createdListings: string[] = [];
  const creationErrors: Array<{
    rowIndex: number;
    error: string;
  }> = [];

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];

    try {
      let slug = propertySlug(row.title, row.locality);
      const existing = await Property.findOne({ slug });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const property = await Property.create({
        slug,
        listedBy: user._id,
        listingType: "agent",
        purpose: row.purpose,
        category: row.category,
        propertyType: row.propertytype,
        title: row.title,
        description: row.description,
        price: {
          amount: row.amount,
          currency: "INR",
          pricePerSqft: row.priceperunit,
          negotiable: row.negotiable || false,
        },
        specs: {
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          balconies: row.balconies,
          furnishing: row.furnishing || "unfurnished",
        },
        location: {
          address: {
            line1: row.address ? String(row.address).slice(0, 120) : `${row.locality}, ${row.city}`,
            landmark: row.landmark ? String(row.landmark) : undefined,
          },
          locality: row.locality,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          coordinates: {
            type: "Point",
            coordinates: [row.longitude || 0, row.latitude || 0],
          },
        },
        status: "draft",
      });

      createdListings.push(property._id.toString());
    } catch (error) {
      creationErrors.push({
        rowIndex: i + 1,
        error: String(error instanceof Error ? error.message : "Unknown error"),
      });
    }
  }

  // Update subscription usage
  if (createdListings.length > 0) {
    await AgentSubscription.updateOne(
      { _id: subscription._id },
      {
        $inc: {
          "usage.listings": createdListings.length,
        },
      }
    );
  }

  return NextResponse.json({
    success: true,
    summary: {
      total: rows.length,
      validRows: validRows.length,
      created: createdListings.length,
      failed: creationErrors.length,
    },
    createdListings,
    validationErrors: errors,
    creationErrors: creationErrors.length > 0 ? creationErrors : undefined,
    message:
      createdListings.length > 0
        ? `Successfully created ${createdListings.length} listings${creationErrors.length > 0 ? ` with ${creationErrors.length} errors` : ""}`
        : "No listings were created",
  });
}

/**
 * GET /api/agent/listings/bulk-upload
 * Download CSV template
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = generateCSVTemplate();

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="property-bulk-upload-template.csv"',
    },
  });
}
