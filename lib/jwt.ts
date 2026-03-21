import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to your .env file (min 32 characters).",
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET is too short. Use at least 32 characters for security.",
    );
  }
  return secret;
}

export function signToken(payload: object) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getSecret());
}
