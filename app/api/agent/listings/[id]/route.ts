import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { requireRole } from "@/lib/auth/roles";
import { isValidObjectId } from "@/lib/helpers/sanitize";
import { z } from "zod";

/**
 * PUT /api/agent/listings/:id
 * Update a property listing (agent can only update their own listings)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validation schema for partial updates
  const updateSchema = z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().max(5000).optional(),
    status: z.enum(["draft", "active", "inactive", "sold"]).optional(),
    price: z
      .object({
        amount: z.number().positive(),
        negotiable: z.boolean().optional(),
        maintenance: z.number().min(0).optional(),
        deposit: z.number().min(0).optional(),
      })
      .optional(),
    specs: z.object({}).optional(),
    amenities: z.array(z.string()).optional(),
  });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const property = await Property.findById(id);
  if (!property) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Authorization: agent can only update their own listings
  if (property.listedBy.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update allowed fields
  const data = parsed.data;

  if (data.title !== undefined) {
    property.title = data.title;
  }
  if (data.description !== undefined) {
    property.description = data.description;
  }
  if (data.status !== undefined) {
    property.status = data.status;
  }
  if (data.price !== undefined) {
    if (data.price.amount !== undefined) {
      property.price.amount = data.price.amount;
    }
    if (data.price.negotiable !== undefined) {
      property.price.negotiable = data.price.negotiable;
    }
    if (data.price.maintenance !== undefined) {
      property.price.maintenance = data.price.maintenance;
    }
    if (data.price.deposit !== undefined) {
      property.price.deposit = data.price.deposit;
    }
  }
  if (data.specs !== undefined) {
    property.specs = { ...property.specs, ...data.specs };
  }
  if (data.amenities !== undefined) {
    property.amenities = data.amenities;
  }

  await property.save();

  return NextResponse.json({
    id: property._id.toString(),
    slug: property.slug,
    status: property.status,
    message: "Listing updated successfully",
  });
}

/**
 * DELETE /api/agent/listings/:id
 * Delete/archive a property listing (soft delete via deletedAt)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
  }

  const property = await Property.findById(id);
  if (!property) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Authorization: agent can only delete their own listings
  if (property.listedBy.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete
  property.deletedAt = new Date();
  await property.save();

  return NextResponse.json({
    message: "Listing deleted successfully",
  });
}
