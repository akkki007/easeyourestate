# CLAUDE.md

This file provides guidance to Claude Code (and other AI coding assistants) when working on this Next.js 16 project for AWS production deployment.

## Project Context

- **Framework:** Next.js 16 (App Router, Turbopack, React 19.2)
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB Atlas (M0 free tier → M10 production)
- **ODM:** Mongoose (with full TypeScript types)
- **Deployment Target:** AWS EC2 (Ubuntu 22.04, t3.small)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (via Certbot)
- **Domain:** GoDaddy / MilesWeb (external DNS)
- **Architecture Goal:** Minimal-cost production hosting (~$19/mo) scalable to 1000+ concurrent users

## Important Next.js 16 Changes to Know

These are critical differences from previous Next.js versions. AI assistants must follow these patterns:

1. **Turbopack is default** — no need for `--turbopack` flag in `package.json` scripts
2. **`params` and `searchParams` are now Promises** — must be `await`ed in pages, layouts, route handlers
3. **`middleware.ts` → `proxy.ts`** — middleware file has been renamed
4. **`next build` no longer runs ESLint** — must run lint as a separate npm script
5. **`next.config.ts`** is preferred over `next.config.js` for TypeScript projects
6. **`"use cache"` directive** for explicit caching (replaces implicit caching)
7. **All dynamic code runs at request time by default** — opt-in to caching, not opt-out
8. **`cacheLife` and `cacheTag`** are stable (no `unstable_` prefix)

---

## Pre-Deployment Code Changes

These changes MUST be completed before deploying to production. Work through them in order.

### 1. Environment Variables Setup

**Create a `.env.example` file** at the project root listing every required variable:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.xxxxx.mongodb.net/dbname

# App
NODE_ENV=production
PORT=3000

# Public URLs (must be NEXT_PUBLIC_ prefix to expose to client)
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Auth (if using NextAuth/Auth.js)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Add any third-party API keys
# STRIPE_SECRET_KEY=
# AWS_ACCESS_KEY_ID=
# RESEND_API_KEY=
```

**Create `lib/env.ts`** for type-safe environment variable access:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
```

Install: `npm install zod`

**Verify `.gitignore` includes:**

```
.env
.env.local
.env.production
.env*.local
```

⚠️ **Never commit real `.env` files to Git.** They will be created directly on the EC2 server.

---

### 2. MongoDB Connection with TypeScript

**File:** `lib/mongodb.ts`

```typescript
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in environment variables');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4 (avoids ENOTFOUND issues on EC2)
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log('✅ MongoDB connected');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

**Why this matters:**
- Prevents "too many connections" errors on Atlas
- Reuses connections across hot reloads in development
- Type-safe global declaration prevents TS errors
- Faster API responses (no reconnection overhead)

---

### 3. Mongoose Models with TypeScript

**File pattern:** `models/User.ts`

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define TypeScript interface for the document
export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Prevent re-compilation in dev hot-reload
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
```

---

### 4. Update `package.json` Scripts (Next.js 16)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

**Important changes for Next.js 16:**
- ❌ Remove `--turbopack` flag (it's now default)
- ✅ `next build` no longer auto-runs lint — run it as a separate step or in CI
- ✅ Add `type-check` script for CI/CD type validation
- ✅ The `start` script must explicitly set the port (used by PM2)

---

### 5. Configure `next.config.ts`

**File:** `next.config.ts` (replace `next.config.js` if present)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Hide "X-Powered-By: Next.js" header

  // Enable typed routes for type-safe Link hrefs
  typedRoutes: true,

  // Image optimization config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Strip console logs in production (keep error/warn)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### 6. App Router Page Patterns (Next.js 16)

**Pages with async params:** `params` and `searchParams` are now Promises.

```typescript
// app/blog/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;

  return <h1>Blog: {slug}</h1>;
}
```

**Or use the auto-generated `PageProps` helper** (run `npx next typegen` to enable):

```typescript
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  return <h1>{slug}</h1>;
}
```

**Layouts:** Same pattern — `params` is a Promise.

```typescript
// app/blog/[slug]/layout.tsx
type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function BlogLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  return <div data-slug={slug}>{children}</div>;
}
```

**Route Handlers:** Same pattern.

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[GET /api/users/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### 7. Caching with `"use cache"` (Next.js 16)

Caching is now **opt-in**. By default, all dynamic code runs at request time. Use `"use cache"` to cache explicitly.

**Cache an entire page:**

```typescript
// app/posts/page.tsx
'use cache';

import { cacheLife } from 'next/cache';

export default async function PostsPage() {
  cacheLife('hours'); // 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'

  const posts = await fetch('https://api.example.com/posts').then((r) => r.json());
  return <PostList posts={posts} />;
}
```

**Cache a function:**

```typescript
// lib/data.ts
'use cache';

import { cacheTag } from 'next/cache';

export async function getPosts() {
  cacheTag('posts');
  const posts = await db.collection('posts').find().toArray();
  return posts;
}
```

**Invalidate cache:**

```typescript
import { revalidateTag } from 'next/cache';

// After creating/updating a post
revalidateTag('posts');
```

---

### 8. Proxy (formerly Middleware) — Rate Limiting

**Important:** Middleware is renamed to `proxy.ts` in Next.js 16.

**File:** `proxy.ts` at project root

```typescript
import { NextResponse, NextRequest } from 'next/server';

interface RateLimitData {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const limit = 30; // requests per window
    const windowMs = 60 * 1000; // 1 minute

    const ipData = rateLimitMap.get(ip) ?? { count: 0, lastReset: Date.now() };

    if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData.count >= limit) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    ipData.count += 1;
    rateLimitMap.set(ip, ipData);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

⚠️ **Note:** This in-memory rate limiter resets on PM2 restart and doesn't share state across instances. Adequate for Stage 1 (single server). For multi-server setups (Stage 3+), use Upstash Redis with `@upstash/ratelimit`.

---

### 9. Error Handling

**Global error boundary:** `app/global-error.tsx`

```typescript
'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. Please try again.</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

**Per-route error boundary:** `app/[route]/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**Loading states:** `app/[route]/loading.tsx`

```typescript
export default function Loading() {
  return <div>Loading...</div>;
}
```

---

### 10. Health Check Endpoint

**File:** `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { status: 'unhealthy', error: message },
      { status: 503 }
    );
  }
}
```

This endpoint is used by:
- CloudWatch alarms (auto-detect when site is down)
- Manual checks: `curl https://yourdomain.com/api/health`
- Future load balancer health checks (Stage 3+)

---

### 11. Server vs Client Components — Best Practices

**Default = Server Component** (no directive needed):

```typescript
// app/dashboard/page.tsx — runs on server
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function Dashboard() {
  await dbConnect();
  const users = await User.find().lean();

  return <UserList users={users} />;
}
```

**Client Component** (only when you need interactivity):

```typescript
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Rules of thumb:**
- ✅ Default to Server Components — they don't ship JS to the browser
- ✅ Use `'use client'` only on leaf components that need state, hooks, or browser APIs
- ✅ Pass server-fetched data DOWN to client components as props
- ❌ Don't fetch in client components when you can fetch in server components
- ❌ Don't import server-only code (`fs`, `mongoose`) in client components

---

### 12. PM2 Ecosystem File (TypeScript-aware)

**File:** `ecosystem.config.js` at project root

```javascript
module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'start',
      instances: 1, // Increase to 'max' on multi-core (t3.medium+)
      exec_mode: 'fork', // Use 'cluster' for multi-instance
      autorestart: true,
      watch: false,
      max_memory_restart: '1G', // Prevents OOM crashes
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
```

Then start with: `pm2 start ecosystem.config.js`

---

### 13. TypeScript Configuration

**File:** `tsconfig.json` — recommended Next.js 16 settings

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**Strict mode is required** — don't loosen it. The codebase should pass `tsc --noEmit` cleanly.

---

## Build & Deploy Commands

### Local build verification (before pushing)

```bash
npm run type-check  # Verify TS types
npm run lint        # Run ESLint
npm run build       # Build with Turbopack (default in Next 16)
npm run start       # Test production build locally
```

If all four succeed locally, deployment will succeed on EC2.

### Server-side build (memory-constrained)

On t3.small (2GB RAM), use this command:

```bash
NODE_OPTIONS='--max-old-space-size=1536' npm run build
```

If builds still fail with OOM, add 1GB swap to the EC2 server (one-time setup):

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Deployment Workflow

### One-time setup
1. Push code to GitHub/GitLab
2. SSH into EC2: `ssh -i key.pem ubuntu@ELASTIC_IP`
3. Clone repo: `git clone https://github.com/USER/REPO.git app`
4. Install: `cd app && npm install`
5. Create `.env.production` with real values
6. Build: `NODE_OPTIONS='--max-old-space-size=1536' npm run build`
7. Start: `pm2 start ecosystem.config.js`
8. Save: `pm2 save && pm2 startup systemd`

### For every code update
```bash
# On EC2
cd ~/app
git pull origin main
npm install
NODE_OPTIONS='--max-old-space-size=1536' npm run build
pm2 restart nextjs-app
```

Or use the `deploy.sh` script (see Quick Deployment Guide).

---

## Key File Locations on EC2

| What | Where |
|------|-------|
| App code | `/home/ubuntu/app` |
| Environment vars | `/home/ubuntu/app/.env.production` |
| PM2 logs | `/home/ubuntu/.pm2/logs/` |
| Nginx config | `/etc/nginx/sites-available/nextjs` |
| Nginx logs | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |
| SSL certificates | `/etc/letsencrypt/live/yourdomain.com/` |
| SSH key (local machine) | wherever you saved the `.pem` file |

---

## Things to AVOID

❌ **Don't commit `.env` files** — even `.env.production`. Real values stay only on the server.

❌ **Don't use `localhost` URLs** in production env vars — use the actual domain.

❌ **Don't skip rate limiting** — a single user can DoS the t3.small server without it.

❌ **Don't expose detailed error stacks** to clients in production. Log them server-side, return generic messages.

❌ **Don't use `pm2 start app.js`** for Next.js — use the ecosystem.config.js approach.

❌ **Don't allow unlimited file uploads** — set `client_max_body_size` in Nginx.

❌ **Don't store sessions in memory** if you'll ever have multiple servers — they won't share state.

❌ **Don't run `npm install` as root** on the server — use the `ubuntu` user.

❌ **Don't forget `pm2 save`** — otherwise PM2 won't restart your app on server reboot.

❌ **Don't access `params` synchronously** — they're Promises in Next.js 16.

❌ **Don't use `middleware.ts`** — it's renamed to `proxy.ts` in Next.js 16.

❌ **Don't use `--turbopack` flag** — Turbopack is the default, the flag is unnecessary.

❌ **Don't import server-only modules in client components** — keep `'use client'` files free of `mongoose`, `fs`, etc.

❌ **Don't use `any` in TypeScript** — use `unknown` and type guards instead.

❌ **Don't expect `next build` to lint** — run lint separately in CI/CD.

---

## Things to ALWAYS Do

✅ **Run `npm run type-check`** before every commit

✅ **Keep dependencies updated:** `npm audit fix` before each deploy

✅ **Test build locally** before pushing changes

✅ **Run `pm2 logs` after every deploy** to verify no errors

✅ **Monitor `/api/health`** — it should return 200 OK

✅ **Use Server Components by default** — only use `'use client'` for interactivity

✅ **`await` all `params` and `searchParams`** — they're Promises now

✅ **Use `lean()` on Mongoose queries** when you don't need full Document methods (faster, smaller)

✅ **Type your Mongoose models** — never use untyped schemas

✅ **Use `"use cache"` explicitly** when you want caching — nothing is cached by default

✅ **Backup MongoDB Atlas** — enable automatic backups when on M2+

✅ **Rotate secrets periodically** — JWT secrets, API keys

✅ **Use HTTPS everywhere** — never link to http:// in production code

---

## Performance Tips for t3.small

The t3.small has limited resources. Optimize accordingly:

1. **Use `"use cache"` aggressively** for content-heavy pages — caches at the component level
2. **Set `cacheLife()` appropriately** — `'hours'` for blog posts, `'minutes'` for product listings
3. **Use Server Components** — they don't ship JS to the browser
4. **Use `next/dynamic`** to code-split heavy client components
5. **Optimize images:** WebP/AVIF formats, proper sizes, lazy loading via `next/image`
6. **Use `lean()` on Mongoose reads** — much less memory than full documents
7. **Set `max_memory_restart: '1G'`** in PM2 — prevents OOM crashes
8. **Install `sharp`:** `npm install sharp` — required for fast image optimization

---

## Scaling Triggers — When to Upgrade

Watch for these signs that t3.small is no longer enough:

- CPU sustained above 70% for 10+ minutes
- Memory above 85% sustained
- Page load times exceeding 2 seconds
- PM2 auto-restarting due to memory limits
- 502 errors appearing in Nginx logs
- MongoDB Atlas approaching M0's 512MB limit

When 2+ of these happen, plan upgrade to Stage 2 (t3.medium + Atlas M2).

---

## Useful Commands Reference

```bash
# === App management ===
pm2 status                          # Check if app is running
pm2 logs nextjs-app                 # Tail app logs
pm2 logs nextjs-app --lines 100     # Last 100 log lines
pm2 restart nextjs-app              # Restart after code changes
pm2 reload nextjs-app               # Zero-downtime restart
pm2 monit                           # Real-time CPU/memory monitor
pm2 flush                           # Clear all logs

# === TypeScript / lint ===
npm run type-check                  # Verify TS types pass
npm run lint                        # Run ESLint
npm run build                       # Production build (Turbopack)

# === Server health ===
htop                                # Process viewer (sudo apt install htop)
df -h                               # Disk space
free -h                             # Memory usage
sudo systemctl status nginx         # Nginx status

# === Logs ===
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
sudo journalctl -u nginx -n 50

# === Network ===
sudo ufw status                     # Firewall rules
sudo netstat -tulpn | grep :3000    # Verify Next.js is listening

# === SSL ===
sudo certbot certificates           # List active certificates
sudo certbot renew --dry-run        # Test renewal

# === MongoDB connection test ===
mongosh "YOUR_CONNECTION_STRING"
```

---

## Project-Specific Notes

<!-- Add any project-specific context here that future AI assistants should know -->

- **Custom logic:** [Describe any unusual patterns in the codebase]
- **External services:** [List third-party APIs the app depends on]
- **Cron jobs:** [Document any scheduled tasks]
- **Webhooks:** [List incoming webhooks the server must handle]
- **Background jobs:** [Document any worker processes]
- **Auth provider:** [NextAuth/Auth.js, Clerk, custom JWT, etc.]

---

## Migration Notes (If Upgrading from Older Next.js)

If this project was previously on Next.js 14/15, ensure these migrations are complete:

1. ✅ Run `npx @next/codemod@canary upgrade latest` to auto-migrate
2. ✅ Run `npx next typegen` to generate route type helpers
3. ✅ Rename `middleware.ts` → `proxy.ts` (export `proxy` instead of `middleware`)
4. ✅ Update all `params` access to `await` them
5. ✅ Remove `--turbopack` flags from `package.json` scripts
6. ✅ Remove webpack-specific config from `next.config.ts` (or use `next build --turbopack` to ignore)
7. ✅ Verify `@types/react` and `@types/react-dom` are at latest versions
8. ✅ Move ESLint to separate npm script (no longer auto-run by `next build`)
9. ✅ Audit dynamic pages — they no longer auto-cache; add `"use cache"` where needed

---

## Emergency Contacts & Resources

- **AWS Console:** https://console.aws.amazon.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Domain Registrar:** GoDaddy / MilesWeb (note which one)
- **Repository:** [Your GitHub/GitLab URL]
- **Production URL:** https://yourdomain.com
- **Health Check:** https://yourdomain.com/api/health

---

_Last updated for Next.js 16 + React 19.2. Keep this file current with any architecture changes. AI assistants reading this will use it as the source of truth for production deployment decisions._