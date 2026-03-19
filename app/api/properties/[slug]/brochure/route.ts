import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import Property from"@/lib/db/models/Property";

export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ slug: string }> }
) {
 try {
 const { slug } = await params;

 await dbConnect();

 const property = await Property.findOne({ slug }).select("media");

 if (!property) {
 return NextResponse.json({ error:"Property not found"}, { status: 404 });
 }

 const brochure = property.media?.brochure;

 if (!brochure || !brochure.url) {
 return NextResponse.json({ error:"Brochure not available for this property"}, { status: 404 });
 }

 // Return the brochure URL. In a real system, this might be a signed URL.
 // For this implementation, we return the stored URL.
 return NextResponse.json({ url: brochure.url });
 } catch (error) {
 console.error("GET /api/properties/[id]/brochure error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}
