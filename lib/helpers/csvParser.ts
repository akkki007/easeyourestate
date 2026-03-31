import { z } from "zod";

/**
 * CSV parsing and validation utilities for bulk property uploads
 */

export interface CSVRow {
  [key: string]: string | number | undefined;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface ParseResult {
  rows: CSVRow[];
  errors: ValidationError[];
  successCount: number;
}

/**
 * Parse CSV content into rows
 */
export function parseCSV(content: string): CSVRow[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: CSVRow = {};

    headers.forEach((header, idx) => {
      if (values[idx] !== undefined) {
        row[header] = values[idx];
      }
    });

    rows.push(row);
  }

  return rows;
}

/**
 * CSV column requirements
 */
const REQUIRED_COLUMNS = [
  "title",
  "description",
  "purpose",
  "category",
  "propertytype",
  "locality",
  "city",
  "state",
  "pincode",
  "amount",
];

/**
 * Validation schema for a CSV property row
 */
const propertyRowSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  purpose: z.enum(["sell", "rent", "lease", "pg"]).catch("sell"),
  category: z.enum(["residential", "commercial"]).catch("residential"),
  propertytype: z.string().min(1, "Property type is required"),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  balconies: z.number().min(0).optional(),
  furnishing: z.enum(["unfurnished", "semi", "fully"]).optional(),
  locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  amount: z.number().positive("Amount must be positive"),
  priceperunit: z.number().positive().optional(),
  negotiable: z.boolean().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

type PropertyRow = z.infer<typeof propertyRowSchema>;

/**
 * Validate CSV rows
 */
export function validateCSVRows(rows: CSVRow[]): { validRows: PropertyRow[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const validRows: PropertyRow[] = [];

  // Check required columns first
  if (rows.length === 0) {
    return { validRows: [], errors: [{ row: 1, field: "", value: "", error: "CSV is empty" }] };
  }

  const firstRow = rows[0];
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !(col in firstRow));

  if (missingColumns.length > 0) {
    return {
      validRows: [],
      errors: [
        {
          row: 1,
          field: "headers",
          value: "",
          error: `Missing required columns: ${missingColumns.join(", ")}`,
        },
      ],
    };
  }

  // Validate each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const converted: Record<string, any> = {};

    // Convert numeric fields
    converted.title = row.title;
    converted.description = row.description;
    converted.purpose = row.purpose;
    converted.category = row.category;
    converted.propertytype = row.propertytype;
    converted.bedrooms = row.bedrooms ? Number(row.bedrooms) : undefined;
    converted.bathrooms = row.bathrooms ? Number(row.bathrooms) : undefined;
    converted.balconies = row.balconies ? Number(row.balconies) : undefined;
    converted.furnishing = row.furnishing;
    converted.locality = row.locality;
    converted.city = row.city;
    converted.state = row.state;
    converted.pincode = row.pincode;
    converted.amount = row.amount ? Number(row.amount) : undefined;
    converted.priceperunit = row.priceperunit ? Number(row.priceperunit) : undefined;
    converted.negotiable = row.negotiable ? String(row.negotiable).toLowerCase() === "true" : undefined;
    converted.address = row.address;
    converted.landmark = row.landmark;
    converted.latitude = row.latitude ? Number(row.latitude) : undefined;
    converted.longitude = row.longitude ? Number(row.longitude) : undefined;

    const result = propertyRowSchema.safeParse(converted);
    if (!result.success) {
      const firstError = Object.values(result.error.flatten().fieldErrors)[0];
      errors.push({
        row: i + 2, // +2 because we skip header and rows are 1-indexed
        field: Object.keys(result.error.flatten().fieldErrors)[0] || "unknown",
        value: String(row[Object.keys(result.error.flatten().fieldErrors)[0] || ""] || ""),
        error: firstError ? String(firstError[0]) : "Validation failed",
      });
    } else {
      validRows.push(result.data);
    }
  }

  return { validRows, errors };
}

/**
 * Generate CSV template
 */
export function generateCSVTemplate(): string {
  const headers = [
    "title",
    "description",
    "purpose",
    "category",
    "propertytype",
    "bedrooms",
    "bathrooms",
    "balconies",
    "furnishing",
    "locality",
    "city",
    "state",
    "pincode",
    "address",
    "landmark",
    "amount",
    "priceperunit",
    "negotiable",
    "latitude",
    "longitude",
  ];

  const exampleRow = [
    "2 BHK Apartment in Baner",
    "Beautiful 2 BHK apartment with modern amenities in prime location",
    "sell",
    "residential",
    "flat",
    "2",
    "2",
    "1",
    "semi",
    "Baner",
    "Pune",
    "Maharashtra",
    "411045",
    "123 Main Street",
    "Near Park",
    "3500000",
    "15000",
    "false",
    "18.5573",
    "73.8005",
  ];

  return [headers.join(","), exampleRow.join(",")].join("\n");
}
