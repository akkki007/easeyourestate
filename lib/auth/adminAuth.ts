import { NextRequest } from "next/server";
import { requireAuth } from "./auth";

/**
 * Middleware: requires authenticated user with admin role.
 * Returns the user doc or null.
 */
export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user || user.role !== "admin") return null;
  return user;
}
