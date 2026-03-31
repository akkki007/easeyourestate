import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth";
import type { UserRole } from "@/lib/db/models/User";

export async function requireRole(req: NextRequest, roles: UserRole[]) {
  const user = await requireAuth(req);
  if (!user) return null;
  return roles.includes(user.role) ? user : null;
}

export async function requireSellerRole(req: NextRequest) {
  return requireRole(req, ["owner", "agent", "builder"]);
}
