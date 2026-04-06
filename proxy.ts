import { NextRequest, NextResponse } from "next/server";

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

const AUTH_RATE_LIMIT = { maxRequests: 20, windowMs: 60_000 };
const OTP_RATE_LIMIT = { maxRequests: 5, windowMs: 300_000 };

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  config: { maxRequests: number; windowMs: number },
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  if (pathname.startsWith("/api/auth/send-otp")) {
    const { allowed, retryAfter } = checkRateLimit(`otp:${ip}`, OTP_RATE_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many OTP requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  }

  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/admin/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/verify-otp")
  ) {
    const { allowed, retryAfter } = checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  }

  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
