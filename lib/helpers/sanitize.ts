import mongoose from "mongoose";

/**
 * Escape special regex characters to prevent ReDoS attacks.
 * Use this before passing user input to `new RegExp(...)`.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate that a string is a valid MongoDB ObjectId.
 * Returns false for null/undefined/empty/invalid values.
 */
export function isValidObjectId(id: unknown): boolean {
  if (typeof id !== "string" || !id) return false;
  return mongoose.Types.ObjectId.isValid(id);
}
