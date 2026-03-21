# Security & Production Fixes

A comprehensive set of fixes applied to make the EaseYourEstate codebase production-ready. All changes are grouped by priority.

---

## P0 — Critical Security Fixes

### 1. Replaced Hardcoded Admin Credentials

**File:** `app/api/auth/admin/login/route.ts`

**Before:** Admin username (`admin`) and password (`admin`) were hardcoded in the source code. Anyone who guessed them had full admin access.

**After:** Implemented a **first-run setup flow**:
- On first visit to `/admin/login`, the page detects no admin exists (via `GET /api/auth/admin/login`) and shows a **setup form**.
- Setup requires `ADMIN_SETUP_KEY` from `.env` — a secret only the deployer knows.
- The admin sets their own email, name, and password (min 8 chars, bcrypt-hashed with cost 12).
- Once an admin exists, the endpoint rejects further setup attempts (HTTP 409).
- Subsequent visits show a standard email/password login form that authenticates against the DB.

**Files changed:**
- `app/api/auth/admin/login/route.ts` — full rewrite with `GET` (check admin exists) + `POST` (setup or login)
- `app/admin/login/page.tsx` — conditional setup/login UI

**Action required:** Add `ADMIN_SETUP_KEY` to your `.env` file before deploying.

---

### 2. Fixed Role Escalation on Registration

**Files:** `app/api/auth/register/route.ts`, `app/api/auth/complete-profile/route.ts`

**Before:** The `role` field from the client request body was stored directly. A malicious user could send `role: "admin"` to gain admin access.

**After:**
- Both routes now validate `role` against an explicit whitelist: `["buyer", "tenant", "owner", "agent", "builder"]`.
- Register returns HTTP 400 for invalid roles.
- Complete-profile silently defaults to `"buyer"` if an invalid role is provided.
- Email format validation added.
- Password minimum length enforced (6 chars).

---

### 3. JWT_SECRET Runtime Validation

**File:** `lib/jwt.ts`

**Before:** `process.env.JWT_SECRET!` used a non-null assertion that silently allowed `undefined` through. If unset, tokens would be signed with `undefined`, making them trivially forgeable.

**After:** A `getSecret()` helper that:
- Throws a clear error if `JWT_SECRET` is missing.
- Throws if the secret is shorter than 32 characters.
- Is called on every `signToken` / `verifyToken` invocation, so the app fails fast.

---

### 4. Fixed Signup OTP Bypass

**File:** `components/SignUp.tsx`

**Before:** Visiting `/signup?phone=9876543210` skipped OTP verification entirely and jumped straight to the profile completion step. An attacker could create accounts with any phone number.

**After:** The `?phone=` parameter now only **pre-fills** the phone input field. The user still must complete the full OTP flow (send → verify → profile).

---

## P1 — High Priority Fixes

### 5. Rate Limiting

**Files:** `middleware.ts` (new), `lib/rate-limit.ts` (new)

**Before:** Zero rate limiting on any endpoint. Login, register, OTP send/verify were all vulnerable to brute-force attacks and SMS bombing.

**After:**
- **Next.js middleware** (`middleware.ts`) intercepts all requests and applies rate limits:
  - Auth endpoints (login, register, verify-otp): **20 requests per minute per IP**
  - OTP send: **5 requests per 5 minutes per IP**
- Returns HTTP 429 with `Retry-After` header when exceeded.
- In-memory rate limit store (swappable with Redis for multi-instance deployments).
- A reusable `lib/rate-limit.ts` utility is also available for per-route rate limiting.

---

### 6. Security Headers via Middleware + next.config.ts

**Files:** `middleware.ts`, `next.config.ts`

**Before:** No security headers on any response.

**After:** Every response now includes:
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leaks
- `X-XSS-Protection: 1; mode=block` — legacy XSS protection
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)` — restricts browser APIs
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — enforces HTTPS (via next.config.ts)

Headers are set in both middleware (for dynamic routes) and `next.config.ts` (for static assets).

---

### 7. BuyerDashboard Error Handling

**File:** `components/dashboard/BuyerDashboard.tsx`

**Before:** Four parallel `fetch()` calls had their responses parsed with `.json()` without checking `res.ok`. A 401/500 response would be silently treated as valid data, causing broken UI or crashes.

**After:** Each response is checked with a ternary: `res.ok ? res.json() : Promise.resolve({ fallbackKey: [] })`. Failed requests gracefully return empty arrays instead of crashing.

---

### 8. Register Name Format Mismatch

**File:** `app/api/auth/register/route.ts`

**Before:** The raw `name` string from the client was passed to `User.create()`, but the User schema expects `name: { first, last }`. This caused Mongoose validation errors.

**After:** The name is split on whitespace: first word becomes `first`, remaining words become `last`. Same pattern already used in `complete-profile`.

---

## P2 — Medium Priority Fixes

### 9. ReDoS Prevention (Regex Injection)

**Files:** `app/api/localities/route.ts`, `app/api/properties/search/route.ts`, `app/api/properties/map/route.ts`

**Before:** User-provided `city`, `query`, and `parsedQuery.locality` values were passed directly to `new RegExp(...)` without escaping. Malicious patterns like `(a+)+$` could cause catastrophic backtracking (ReDoS), hanging the server.

**After:** Created `lib/helpers/sanitize.ts` with `escapeRegex()` that escapes all regex metacharacters (`.*+?^${}()|[]\`). All user input is now escaped before being used in RegExp constructors across all affected routes.

---

### 10. ObjectId Validation

**Files:** `app/api/leads/route.ts`, `app/api/leads/[id]/route.ts`, `app/api/site-visits/route.ts`, `app/api/site-visits/[id]/route.ts`, `app/api/properties/compare/route.ts`

**Before:** Route parameters and body fields used as MongoDB ObjectIds were passed to `findById()` / `$in` without validation. Invalid IDs caused unhandled `CastError` exceptions.

**After:** Created `isValidObjectId()` in `lib/helpers/sanitize.ts`. All affected routes now validate IDs before querying and return HTTP 400 for invalid values.

---

### 11. Input Sanitization on Leads & Site Visits

**Files:** `app/api/leads/route.ts`, `app/api/site-visits/route.ts`, `app/api/site-visits/[id]/route.ts`

**Before:** User-submitted text (messages, notes, names) had no length limits. Phone numbers weren't validated.

**After:**
- Lead messages: max 2000 characters, trimmed
- Lead names: max 200 characters, trimmed
- Lead phone: validated against Indian mobile format `^[6-9]\d{9}$`
- Site visit notes: max 1000 characters
- Site visit status: validated against whitelist `["pending", "confirmed", "completed", "cancelled"]`

---

### 12. OTP Plaintext Logging Removed

**File:** `app/api/auth/send-otp/route.ts`

**Before:** When SMS API was not configured, the OTP was logged in plaintext: `console.warn("SMS API not configured — OTP stored locally only:", otp)`. In production, server logs could expose OTPs.

**After:** The log message no longer includes the OTP value. Debug logging is restricted to `NODE_ENV === "development"` only. Also fixed the typo `"PRMIUM"` → `"PREMIUM"` in the SMS sender fallback.

---

### 13. `.env.example` Created

**File:** `.env.example` (new)

Documents all required environment variables with descriptions and generation commands for secrets:
- `MONGODB_URI`
- `JWT_SECRET` (with `openssl`/`node` generation command)
- `ADMIN_SETUP_KEY` (with generation command)
- All SMS API variables

---

### 14. Duplicate `bcrypt` Dependency Removed

**File:** `package.json`

**Before:** Both `bcrypt` (native C++ addon) and `bcryptjs` (pure JS) were installed. All code used `bcryptjs`.

**After:** `bcrypt` removed via `npm uninstall`. Only `bcryptjs` remains. This avoids native compilation issues in Docker/CI and eliminates the dead dependency.

---

## Remaining Recommendations (Not Yet Implemented)

These are documented for future implementation:

| Item | Description |
|------|-------------|
| **Redis OTP store** | Replace in-memory `Map` in `lib/otp-store.ts` with Redis for multi-instance and restart resilience. The file already has a comment noting this. |
| **Redis caching** | Cache `/api/properties/featured`, `/api/properties/trending`, `/api/localities`, `/api/admin/analytics` responses for 5-15 min to reduce DB load. |
| **Redis rate limiting** | Replace the in-memory rate limiter in `middleware.ts` with Redis-backed sliding window for multi-instance deployments. |
| **httpOnly cookies** | Move JWT from `localStorage` to `httpOnly` cookies to eliminate XSS token theft risk. Requires refactoring `AuthContext` and API auth. |
| **Token revocation** | Add a Redis-based JWT blacklist for logout invalidation. Currently tokens remain valid for the full 7-day expiry. |
| **Shorter JWT expiry** | Reduce access token to 15-30 min with a refresh token flow. |
| **Error monitoring** | Add Sentry or similar for production error tracking instead of `console.error`. |
| **File upload magic bytes** | Validate actual file content (magic bytes) in the upload route, not just the MIME type. |
| **MongoDB indexes** | Verify compound indexes exist for common query patterns (city + purpose + status, text search on title/locality). |

---

## New Files Created

| File | Purpose |
|------|---------|
| `middleware.ts` | Next.js edge middleware for rate limiting + security headers |
| `lib/rate-limit.ts` | Reusable in-memory rate limiter (Redis-ready interface) |
| `lib/helpers/sanitize.ts` | `escapeRegex()` and `isValidObjectId()` utilities |
| `.env.example` | Documents all required environment variables |
| `FIXES.md` | This file |

## Files Modified

| File | Changes |
|------|---------|
| `app/api/auth/admin/login/route.ts` | Full rewrite: DB-backed auth + first-run setup |
| `app/admin/login/page.tsx` | Conditional setup/login UI |
| `lib/jwt.ts` | Runtime JWT_SECRET validation |
| `app/api/auth/register/route.ts` | Role whitelist, name format, email/password validation |
| `app/api/auth/complete-profile/route.ts` | Role whitelist, email validation |
| `app/api/auth/send-otp/route.ts` | Remove OTP from logs, fix sender typo |
| `components/SignUp.tsx` | Remove OTP bypass via URL param |
| `components/dashboard/BuyerDashboard.tsx` | Add res.ok checks on fetch calls |
| `app/api/localities/route.ts` | Escape regex input |
| `app/api/properties/search/route.ts` | Escape regex input |
| `app/api/properties/map/route.ts` | Escape regex input |
| `app/api/properties/compare/route.ts` | ObjectId validation |
| `app/api/leads/route.ts` | ObjectId + phone + message validation |
| `app/api/leads/[id]/route.ts` | ObjectId validation |
| `app/api/site-visits/route.ts` | ObjectId validation, notes length limit |
| `app/api/site-visits/[id]/route.ts` | ObjectId validation, status whitelist, notes limit |
| `next.config.ts` | Security headers (HSTS, etc.) |
| `package.json` | Removed duplicate `bcrypt` |
