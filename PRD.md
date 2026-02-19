# Wisteria Properties — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** February 18, 2026  
**Stack:** Next.js (App Router) · MongoDB (Atlas) · Clerk Auth · TypeScript  
**Status:** Auth & Onboarding ✅ Complete → Core Platform 🔨 In Progress

---

## 1. Executive Summary

Wisteria Properties is a scalable real estate marketplace connecting buyers, sellers, landlords, tenants, agents, and developers. The platform supports property discovery, listing management, lead generation, communication, analytics, and monetization.

This PRD covers the **full system design** — data modeling, API contracts, module specifications, and infrastructure — with MongoDB as the primary database and a modular architecture optimized for rapid iteration and horizontal scaling.

---

## 2. What's Already Built

| Module | Status | Implementation Details |
|---|---|---|
| Authentication | ✅ Done | Clerk (Email, OTP, Social login, forgot password, session management) |
| Onboarding Flow | ✅ Done | Role selection (Buyer/Tenant, Owner, Agent, Builder), basic profile setup |
| Next.js App Shell | ✅ Done | App Router, layout structure, middleware for auth guards |

**Clerk handles:** Signup/Login, MFA, session tokens, user metadata (role stored in `publicMetadata`), webhooks for user sync.

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│         Next.js App Router (RSC + Client)            │
└──────────────┬──────────────────────┬────────────────┘
               │                      │
       Server Actions          API Routes (/api/*)
               │                      │
┌──────────────▼──────────────────────▼────────────────┐
│                  NEXT.JS SERVER                       │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ Middleware  │ │ Auth Layer │ │  Business Logic   │  │
│  │ (Clerk)    │ │ (RBAC)     │ │  (Service Layer)  │  │
│  └────────────┘ └────────────┘ └──────────────────┘  │
└───────┬────────────┬───────────────┬─────────────────┘
        │            │               │
   ┌────▼───┐  ┌────▼────┐   ┌─────▼──────┐
   │MongoDB │  │ Redis   │   │ External   │
   │ Atlas  │  │ (Cache) │   │ Services   │
   └────────┘  └─────────┘   └────────────┘
                               ├─ Cloudinary (Media)
                               ├─ Google Maps API
                               ├─ Razorpay/Stripe
                               ├─ Resend (Email)
                               └─ Clerk Webhooks
```

### 3.2 Project Structure (Recommended)

```
src/
├── app/
│   ├── (public)/              # Guest-accessible routes
│   │   ├── page.tsx           # Homepage
│   │   ├── properties/        # Property listing & detail pages
│   │   ├── search/            # Search results
│   │   ├── agents/            # Agent directory
│   │   ├── projects/          # Builder projects
│   │   └── blog/              # Blog & guides
│   ├── (auth)/                # Clerk auth routes (done)
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── buyer/
│   │   ├── owner/
│   │   ├── agent/
│   │   ├── builder/
│   │   └── admin/
│   └── api/
│       ├── webhooks/clerk/    # Clerk user sync
│       ├── properties/
│       ├── leads/
│       ├── search/
│       ├── payments/
│       ├── media/
│       └── admin/
├── lib/
│   ├── db/
│   │   ├── connection.ts      # MongoDB singleton connection
│   │   ├── models/            # Mongoose models
│   │   └── indexes.ts         # Index definitions
│   ├── services/              # Business logic layer
│   ├── validations/           # Zod schemas
│   ├── utils/
│   └── constants/
├── components/
│   ├── ui/                    # Shared UI primitives
│   ├── property/              # Property-specific components
│   ├── search/
│   ├── dashboard/
│   └── maps/
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript type definitions
└── middleware.ts               # Clerk + RBAC middleware
```

### 3.3 Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Database | MongoDB Atlas | Flexible schema for varied property types, geo-queries native, horizontal scaling via sharding |
| ODM | Mongoose 8+ | Schema validation, middleware hooks, population, TypeScript support |
| Caching | Redis (Upstash) | Search result caching, rate limiting, session augmentation |
| File Storage | Cloudinary | Image/video optimization, transformations, CDN delivery |
| Search | MongoDB Atlas Search (→ Elasticsearch Phase 2) | Atlas Search handles full-text + facets natively, avoid infra complexity early |
| Email | Resend | Transactional emails, good DX with React Email templates |
| Payments | Razorpay (India-primary) + Stripe (fallback) | Razorpay for UPI/India payments, Stripe for international |
| State Management | Zustand + React Query (TanStack) | Zustand for client state, React Query for server state caching |

---

## 4. MongoDB Data Models

### 4.1 Design Principles

- **Embed what you read together, reference what changes independently**
- **Index every field you query** — especially geo, status, price, type
- **Use discriminator pattern** for property subtypes (residential/commercial/rental)
- **Soft deletes everywhere** (`deletedAt` field) for audit trails
- **Timestamps on all collections** (`createdAt`, `updatedAt`)

### 4.2 Collections & Schemas

#### `users` Collection
Synced from Clerk via webhook. Extended with platform-specific data.

```typescript
{
  _id: ObjectId,
  clerkId: string,              // Clerk user ID (indexed, unique)
  email: string,
  phone?: string,
  name: {
    first: string,
    last: string
  },
  avatar?: string,              // Cloudinary URL
  role: "buyer" | "owner" | "agent" | "builder" | "admin",
  
  // Role-specific embedded profile
  agentProfile?: {
    licenseNumber: string,
    agency: string,
    experience: number,         // years
    specializations: string[],
    serviceAreas: string[],     // locality slugs
    bio: string,
    verified: boolean,
    rating: { avg: number, count: number }
  },
  builderProfile?: {
    companyName: string,
    reraNumber: string,
    established: number,
    completedProjects: number,
    ongoingProjects: number,
    bio: string,
    verified: boolean,
    rating: { avg: number, count: number }
  },
  
  preferences: {
    savedSearches: [{
      name: string,
      filters: object,          // Stored search criteria
      alertEnabled: boolean,
      createdAt: Date
    }],
    favoriteProperties: ObjectId[],  // refs → properties
    notificationPrefs: {
      email: boolean,
      sms: boolean,
      whatsapp: boolean,
      push: boolean
    }
  },
  
  subscription?: {
    planId: ObjectId,
    status: "active" | "expired" | "cancelled",
    startDate: Date,
    endDate: Date,
    razorpaySubscriptionId?: string
  },
  
  meta: {
    lastLoginAt: Date,
    loginCount: number,
    source: string              // utm_source tracking
  },
  
  deletedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}

// INDEXES
// { clerkId: 1 } — unique
// { email: 1 } — unique
// { role: 1 }
// { "agentProfile.serviceAreas": 1 }
// { "subscription.status": 1, "subscription.endDate": 1 }
```

#### `properties` Collection
Core listing data. Uses discriminator-style `category` field.

```typescript
{
  _id: ObjectId,
  slug: string,                 // URL-friendly unique slug (indexed)
  
  // Ownership
  listedBy: ObjectId,           // ref → users
  listingType: "owner" | "agent" | "builder",
  
  // Classification
  purpose: "sell" | "rent" | "lease" | "pg",
  category: "residential" | "commercial",
  propertyType: "flat" | "villa" | "plot" | "house" | "penthouse" |
                "office" | "shop" | "warehouse" | "showroom" | "pg",
  
  // Core Details
  title: string,
  description: string,
  
  // Pricing
  price: {
    amount: number,
    currency: "INR",
    pricePerSqft?: number,
    negotiable: boolean,
    maintenance?: number,       // monthly maintenance
    deposit?: number            // for rentals
  },
  
  // Specifications
  specs: {
    bedrooms?: number,          // BHK
    bathrooms?: number,
    balconies?: number,
    totalFloors?: number,
    floorNumber?: number,
    facing?: "north" | "south" | "east" | "west" | "ne" | "nw" | "se" | "sw",
    furnishing: "unfurnished" | "semi" | "fully",
    parking: { covered: number, open: number },
    area: {
      superBuiltUp?: number,
      builtUp?: number,
      carpet?: number,
      plot?: number,
      unit: "sqft" | "sqm" | "sqyd"
    },
    age?: string,               // "new" | "1-3" | "3-5" | "5-10" | "10+"
    possessionStatus: "ready" | "under_construction",
    possessionDate?: Date,
    reraId?: string
  },
  
  // Amenities (flexible array for varied property types)
  amenities: string[],          // ["gym", "pool", "security", "power_backup", ...]
  
  // Location (critical for geo-queries)
  location: {
    address: {
      line1: string,
      line2?: string,
      landmark?: string
    },
    locality: string,
    city: string,
    state: string,
    pincode: string,
    coordinates: {
      type: "Point",
      coordinates: [number, number]   // [lng, lat] — GeoJSON format
    }
  },
  
  // Media
  media: {
    images: [{
      url: string,              // Cloudinary URL
      publicId: string,         // For deletion
      caption?: string,
      isPrimary: boolean,
      order: number
    }],
    videos?: [{
      url: string,
      publicId: string,
      thumbnail: string
    }],
    floorPlan?: { url: string, publicId: string },
    brochure?: { url: string, publicId: string }
  },
  
  // Builder Project Reference (for builder listings)
  project?: ObjectId,           // ref → projects
  
  // Status & Moderation
  status: "draft" | "pending_review" | "active" | "sold" | "rented" |
          "expired" | "rejected" | "archived",
  featured: {
    isFeatured: boolean,
    featuredUntil?: Date,
    plan?: string               // "city_highlight" | "top_listing" | "premium"
  },
  moderationNotes?: string,
  rejectionReason?: string,
  
  // Engagement Metrics (denormalized for read performance)
  metrics: {
    views: number,
    uniqueViews: number,
    inquiries: number,
    favorites: number,
    shares: number,
    phoneReveals: number
  },
  
  // Duplicate Detection
  fingerprint: string,          // Hash of key attributes for dedup
  
  deletedAt?: Date,
  publishedAt?: Date,
  expiresAt?: Date,
  createdAt: Date,
  updatedAt: Date
}

// INDEXES
// { slug: 1 } — unique
// { "location.coordinates": "2dsphere" } — geo queries
// { status: 1, purpose: 1, "location.city": 1 } — compound for search
// { listedBy: 1, status: 1 } — dashboard queries
// { "price.amount": 1 } — range queries
// { category: 1, propertyType: 1 }
// { "specs.bedrooms": 1 }
// { "location.city": 1, "location.locality": 1 }
// { featured.isFeatured: 1, featured.featuredUntil: 1 }
// { fingerprint: 1 } — duplicate detection
// { publishedAt: -1 } — sorting
// { expiresAt: 1 } — TTL-based cleanup jobs
// Atlas Search index on: title, description, location.locality, location.city, amenities
```

#### `projects` Collection (Builder Projects)

```typescript
{
  _id: ObjectId,
  slug: string,
  builder: ObjectId,            // ref → users
  
  name: string,
  description: string,
  status: "upcoming" | "under_construction" | "ready_to_move" | "completed",
  
  location: {
    address: string,
    locality: string,
    city: string,
    state: string,
    pincode: string,
    coordinates: { type: "Point", coordinates: [number, number] }
  },
  
  reraId: string,
  launchDate?: Date,
  possessionDate?: Date,
  
  configurations: [{           // e.g., 2BHK, 3BHK options
    type: string,
    area: { min: number, max: number, unit: string },
    price: { min: number, max: number }
  }],
  
  amenities: string[],
  
  media: {
    images: [{ url: string, publicId: string, caption?: string, order: number }],
    videos?: [{ url: string, thumbnail: string }],
    masterPlan?: { url: string, publicId: string },
    brochure?: { url: string, publicId: string }
  },
  
  totalUnits: number,
  availableUnits: number,
  
  // Linked properties in this project
  propertyCount: number,        // denormalized count
  
  metrics: { views: number, inquiries: number },
  
  deletedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### `leads` Collection

```typescript
{
  _id: ObjectId,
  
  // Who made the inquiry
  from: {
    userId?: ObjectId,          // ref → users (null for guest)
    name: string,
    email: string,
    phone: string
  },
  
  // Who receives the lead
  to: ObjectId,                 // ref → users (owner/agent/builder)
  
  // What property
  property: ObjectId,           // ref → properties
  project?: ObjectId,           // ref → projects (if project inquiry)
  
  type: "inquiry" | "callback" | "site_visit" | "whatsapp",
  message?: string,
  
  // Lead lifecycle
  status: "new" | "contacted" | "interested" | "site_visit_scheduled" |
          "negotiating" | "converted" | "lost" | "spam",
  
  followUps: [{
    date: Date,
    note: string,
    nextFollowUp?: Date,
    by: ObjectId               // ref → users
  }],
  
  source: "property_page" | "search" | "featured" | "project_page" | "direct",
  
  convertedAt?: Date,
  deletedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}

// INDEXES
// { to: 1, status: 1, createdAt: -1 } — dashboard view
// { property: 1 } — property-level analytics
// { "from.userId": 1 } — user's inquiry history
// { status: 1, createdAt: -1 }
```

#### `messages` Collection (In-App Messaging)

```typescript
{
  _id: ObjectId,
  threadId: ObjectId,           // ref → messageThreads
  sender: ObjectId,             // ref → users
  content: string,
  attachments?: [{ url: string, type: string, name: string }],
  readAt?: Date,
  deletedAt?: Date,
  createdAt: Date
}

// Separate thread collection for efficient thread listing
// messageThreads collection:
{
  _id: ObjectId,
  participants: [ObjectId, ObjectId],
  property?: ObjectId,
  lastMessage: {
    content: string,
    sender: ObjectId,
    createdAt: Date
  },
  unreadCount: { [userId: string]: number },
  createdAt: Date,
  updatedAt: Date
}
```

#### `subscriptionPlans` Collection

```typescript
{
  _id: ObjectId,
  name: string,                 // "Basic", "Pro", "Enterprise"
  slug: string,
  targetRole: "owner" | "agent" | "builder",
  
  pricing: {
    monthly: number,
    quarterly: number,
    yearly: number,
    currency: "INR"
  },
  
  limits: {
    maxListings: number,        // -1 for unlimited
    maxFeaturedListings: number,
    maxLeadsPerMonth: number,
    maxPhotosPerListing: number,
    maxVideosPerListing: number,
    teamMembers: number,
    bulkUpload: boolean,
    analytics: "basic" | "advanced",
    prioritySupport: boolean
  },
  
  isActive: boolean,
  displayOrder: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### `payments` Collection

```typescript
{
  _id: ObjectId,
  user: ObjectId,
  
  type: "subscription" | "featured_listing" | "ad_placement",
  amount: number,
  currency: "INR",
  gst: { rate: number, amount: number },
  totalAmount: number,
  
  gateway: "razorpay" | "stripe",
  gatewayOrderId: string,
  gatewayPaymentId?: string,
  gatewaySignature?: string,
  
  status: "created" | "authorized" | "captured" | "failed" | "refunded",
  
  // What was purchased
  reference: {
    type: "subscription" | "featured" | "ad",
    id: ObjectId
  },
  
  invoice: {
    number: string,
    gstNumber?: string,
    billingAddress?: object,
    generatedAt?: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

#### `localities` Collection (Geo/SEO Data)

```typescript
{
  _id: ObjectId,
  slug: string,
  name: string,
  city: string,
  state: string,
  
  coordinates: { type: "Point", coordinates: [number, number] },
  boundary?: { type: "Polygon", coordinates: [[number, number][]] },
  
  // Denormalized stats (updated via cron)
  stats: {
    totalProperties: number,
    avgPricePerSqft: { residential: number, commercial: number },
    priceRange: { min: number, max: number },
    trending: boolean
  },
  
  // SEO
  seo: {
    title: string,
    description: string,
    content?: string            // Locality guide content
  },
  
  nearbyAmenities: [{
    type: "school" | "hospital" | "metro" | "market" | "park",
    name: string,
    distance: number            // km
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

#### `blogPosts` Collection (CMS)

```typescript
{
  _id: ObjectId,
  slug: string,
  title: string,
  excerpt: string,
  content: string,              // Rich text / MDX
  coverImage: { url: string, alt: string },
  author: ObjectId,
  category: "buying_guide" | "selling_guide" | "market_trends" |
            "legal" | "investment" | "locality_guide",
  tags: string[],
  seo: { title: string, description: string, canonical?: string },
  status: "draft" | "published" | "archived",
  publishedAt?: Date,
  views: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### `activityLogs` Collection (Audit)

```typescript
{
  _id: ObjectId,
  actor: ObjectId,              // ref → users
  action: string,               // "property.created", "lead.status_changed", etc.
  resource: { type: string, id: ObjectId },
  changes?: object,             // Before/after diff
  ip: string,
  userAgent: string,
  createdAt: Date               // TTL index: auto-delete after 90 days
}
```

---

## 5. Module Specifications (Implementation Priority)

### Phase 1 — Core Platform (Weeks 1–5)

#### M1: Property Listing & Management Module

**Priority:** 🔴 Critical  
**Depends on:** Auth (done), User model

**API Endpoints:**

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/properties` | Owner, Agent, Builder | Create listing |
| GET | `/api/properties` | Public | List/search properties |
| GET | `/api/properties/[slug]` | Public | Property detail |
| PATCH | `/api/properties/[id]` | Owner (own) | Update listing |
| DELETE | `/api/properties/[id]` | Owner (own), Admin | Soft delete |
| POST | `/api/properties/[id]/media` | Owner (own) | Upload images/video |
| PATCH | `/api/properties/[id]/status` | Owner (own), Admin | Change status |
| GET | `/api/properties/my-listings` | Owner, Agent, Builder | Dashboard listings |

**Business Rules:**
- Properties start as `draft` → owner publishes → status becomes `pending_review` (if moderation enabled) or `active`
- Auto-generate `slug` from title + locality + unique suffix
- Generate `fingerprint` hash from: propertyType + bedrooms + area + coordinates (rounded) + price range → flag potential duplicates
- Listings expire after 60 days by default → email reminder at day 50
- Image upload: max 20 images, max 5MB each, auto-compress via Cloudinary transformations
- Video: max 2 videos, max 50MB each, transcoded via Cloudinary

**Validation (Zod):**
```typescript
const createPropertySchema = z.object({
  purpose: z.enum(["sell", "rent", "lease", "pg"]),
  category: z.enum(["residential", "commercial"]),
  propertyType: z.enum(["flat", "villa", "plot", ...]),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  price: z.object({
    amount: z.number().positive(),
    negotiable: z.boolean().default(false),
    ...
  }),
  specs: z.object({ ... }).refine(/* conditional validation by type */),
  location: z.object({
    address: z.object({ line1: z.string().min(5) }),
    locality: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string().regex(/^\d{6}$/),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    })
  }),
  amenities: z.array(z.string()).max(30)
});
```

**Service Layer Pattern:**
```typescript
// lib/services/property.service.ts
class PropertyService {
  async create(data: CreatePropertyInput, userId: string): Promise<Property>
  async update(id: string, data: UpdatePropertyInput, userId: string): Promise<Property>
  async getBySlug(slug: string): Promise<PropertyWithOwner>
  async search(filters: SearchFilters, pagination: Pagination): Promise<PaginatedResult>
  async updateStatus(id: string, status: PropertyStatus, userId: string): Promise<Property>
  async checkDuplicate(fingerprint: string): Promise<Property | null>
  async incrementMetric(id: string, metric: keyof PropertyMetrics): Promise<void>
  async getMyListings(userId: string, filters: DashboardFilters): Promise<PaginatedResult>
}
```

---

#### M2: Search & Discovery Module

**Priority:** 🔴 Critical

**Search Strategy:**

1. **Primary:** MongoDB Atlas Search (full-text + faceted)
2. **Geo queries:** MongoDB native `$geoNear`
3. **Caching:** Redis for popular search results (TTL: 5 min)
4. **Future:** Migrate to Elasticsearch when >100K listings

**Atlas Search Index Definition:**
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": { "type": "string", "analyzer": "lucene.standard" },
      "description": { "type": "string", "analyzer": "lucene.standard" },
      "location.city": { "type": "string", "analyzer": "lucene.keyword" },
      "location.locality": { "type": "string", "analyzer": "lucene.standard" },
      "propertyType": { "type": "stringFacet" },
      "purpose": { "type": "stringFacet" },
      "specs.bedrooms": { "type": "numberFacet" },
      "price.amount": { "type": "number" },
      "amenities": { "type": "string", "analyzer": "lucene.keyword" },
      "status": { "type": "string", "analyzer": "lucene.keyword" },
      "location.coordinates": { "type": "geo" }
    }
  }
}
```

**API Endpoints:**

| Method | Route | Description |
|---|---|---|
| GET | `/api/search` | Full search with filters, facets, pagination |
| GET | `/api/search/suggestions` | Autocomplete for city/locality/project |
| GET | `/api/search/map` | Geo-bounded search for map view |
| GET | `/api/search/trending` | Trending searches & localities |

**Search Filter Object:**
```typescript
interface SearchFilters {
  q?: string;                    // keyword
  purpose?: "sell" | "rent" | "lease" | "pg";
  category?: "residential" | "commercial";
  propertyType?: string[];
  city?: string;
  locality?: string[];
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: number[];           // [2, 3] means 2BHK or 3BHK
  areaMin?: number;
  areaMax?: number;
  furnishing?: string[];
  possessionStatus?: string;
  amenities?: string[];
  postedWithin?: "24h" | "7d" | "30d";
  sortBy?: "relevance" | "price_asc" | "price_desc" | "date" | "popularity";
  // Geo
  bounds?: { ne: LatLng, sw: LatLng };  // map viewport
  near?: { lat: number, lng: number, radius: number };
  // Pagination
  page?: number;
  limit?: number;
}
```

**Performance Targets:**
- Search response: < 300ms (p95)
- Autocomplete: < 100ms (p95)
- Map search: < 500ms (p95)

---

#### M3: Property Detail Page

**Priority:** 🔴 Critical

**Data Fetching (RSC):**
- Fetch property by slug via server component
- Parallel fetch: nearby properties, locality data
- Increment view count via server action (debounced, use Redis `INCR` then batch write to MongoDB)

**Page Sections:**
1. Image gallery (lightbox, swipeable)
2. Price, specs, status badges
3. Description & amenities
4. Floor plan viewer
5. Map with nearby amenities (Google Maps embed)
6. Enquiry form / Contact CTA (WhatsApp, Call, Enquiry)
7. Similar properties carousel
8. Locality insights
9. Schema.org structured data (JSON-LD)

---

#### M4: Lead Management Module

**Priority:** 🔴 Critical

**API Endpoints:**

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/leads` | Authenticated + Guest | Create inquiry |
| GET | `/api/leads` | Owner, Agent, Builder | List received leads |
| PATCH | `/api/leads/[id]/status` | Lead owner | Update lead status |
| POST | `/api/leads/[id]/follow-up` | Lead owner | Add follow-up note |
| GET | `/api/leads/analytics` | Owner, Agent, Builder | Lead funnel stats |

**Business Rules:**
- Rate limit: max 5 inquiries per user per property per 24h
- Guest inquiries require name + phone (validated via OTP in Phase 2)
- Lead notification: realtime via in-app + email + optional WhatsApp
- Auto-spam detection: flag leads with suspicious patterns
- Lead routing: if property listed by agent, lead goes to agent; if by builder, routes to builder's sales team

**Notifications Pipeline:**
```
Lead Created → Queue (via server action)
  ├─ In-App Notification (write to notifications collection)
  ├─ Email (Resend API, React Email template)
  ├─ SMS (optional, via MSG91/Twilio)
  └─ WhatsApp (optional, via WhatsApp Business API)
```

---

### Phase 2 — Dashboards & Monetization (Weeks 6–9)

#### M5: User Dashboards

**Buyer/Tenant Dashboard:**
- Saved/favorite properties
- Recent searches with alerts
- Inquiry history
- Recommended properties

**Owner Dashboard:**
- My listings (with status filters)
- Lead inbox with status management
- Property performance (views, inquiries, CTR)
- Quick actions: boost listing, mark as sold

**Agent Dashboard:**
- All above plus:
- Portfolio/brand profile editor
- Bulk upload (CSV/Excel via SheetJS parsing)
- Team member management
- Lead analytics (funnel, conversion rate)
- Subscription & billing

**Builder Dashboard:**
- All agent features plus:
- Project management (CRUD)
- Project-level analytics
- Unit inventory management

#### M6: Monetization Module

**Subscription Plans:**

| Feature | Free | Basic (₹999/mo) | Pro (₹2,499/mo) | Enterprise |
|---|---|---|---|---|
| Listings | 3 | 15 | 50 | Unlimited |
| Photos/listing | 5 | 15 | 20 | 30 |
| Featured slots | 0 | 2 | 10 | 25 |
| Lead access | Limited | Full | Full | Full |
| Analytics | Basic | Basic | Advanced | Advanced |
| Bulk upload | ❌ | ❌ | ✅ | ✅ |
| Team members | 1 | 1 | 3 | 10 |

**Payment Flow (Razorpay):**
```
1. User selects plan → POST /api/payments/create-order
2. Server creates Razorpay order → returns orderId
3. Client opens Razorpay checkout
4. On success → POST /api/payments/verify (verify signature server-side)
5. Activate subscription → update user.subscription
6. Generate invoice → store in payments collection
```

**Featured Listing Boost:**
```
User clicks "Boost" on listing → select boost type & duration
→ Create payment → On success, update property.featured
→ Cron job: check featured.featuredUntil daily, deactivate expired
```

---

### Phase 3 — Admin, CMS, Analytics (Weeks 10–12)

#### M7: Admin Control Panel

**Routes:** `/dashboard/admin/*`
**Access:** `role === "admin"` only

**Capabilities:**
- User management: view, suspend, change role, impersonate
- Property moderation queue: approve/reject pending listings
- Reported listings: review, take down, warn user
- Subscription management: manual plan assignment, refunds
- Content management: blog CRUD, static pages
- System config: feature flags, default settings
- Audit logs viewer with filters

#### M8: CMS & Blog

- MDX-based blog with rich editor (use `@tiptap/react` or `novel` editor)
- Category & tag system
- Auto-generate city/locality SEO pages from `localities` collection
- Dynamic sitemap generation

#### M9: Analytics & SEO

**Internal Analytics:**
- Property performance: views, inquiries, conversion rate
- Lead funnel: new → contacted → interested → converted
- Search analytics: popular queries, zero-result queries
- Revenue dashboard: MRR, plan distribution, churn

**SEO Implementation:**
- Dynamic `metadata` exports on all pages
- JSON-LD schema: `RealEstateListing`, `Organization`, `BreadcrumbList`, `FAQPage`
- Auto-generated `sitemap.xml` (properties, localities, blog)
- `robots.txt` configuration
- Canonical URLs, OpenGraph + Twitter cards

---

## 6. Cross-Cutting Concerns

### 6.1 RBAC Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", "/properties(.*)", "/search(.*)", "/blog(.*)",
  "/agents(.*)", "/projects(.*)", "/api/webhooks(.*)",
  "/about", "/contact", "/privacy", "/terms"
]);

const roleRouteMap = {
  "/dashboard/admin(.*)": ["admin"],
  "/dashboard/agent(.*)": ["agent"],
  "/dashboard/builder(.*)": ["builder"],
  "/dashboard/owner(.*)": ["owner"],
  "/dashboard/buyer(.*)": ["buyer", "owner"]  // owners can also browse
};

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  
  auth().protect();  // Ensure authenticated
  
  // Role-based route protection
  const userRole = auth().sessionClaims?.metadata?.role;
  for (const [pattern, roles] of Object.entries(roleRouteMap)) {
    if (new RegExp(pattern).test(req.nextUrl.pathname)) {
      if (!roles.includes(userRole)) {
        return Response.redirect(new URL("/unauthorized", req.url));
      }
    }
  }
});
```

### 6.2 API Response Pattern

```typescript
// Consistent API response wrapper
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;  // field-level validation errors
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
```

### 6.3 Error Handling

```typescript
// lib/errors.ts
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage in API routes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createPropertySchema.safeParse(body);
    if (!validated.success) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid input", 
        validated.error.flatten().fieldErrors);
    }
    // ... business logic
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ success: false, error: { 
        code: error.code, message: error.message, details: error.details 
      }}, { status: error.statusCode });
    }
    return Response.json({ success: false, error: { 
      code: "INTERNAL_ERROR", message: "Something went wrong" 
    }}, { status: 500 });
  }
}
```

### 6.4 MongoDB Connection (Singleton)

```typescript
// lib/db/connection.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
  
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}
```

### 6.5 Caching Strategy

| Data | Cache | TTL | Invalidation |
|---|---|---|---|
| Search results | Redis | 5 min | On new listing in same city |
| Property detail | Redis | 15 min | On property update |
| Locality stats | Redis | 1 hour | Cron job recalculation |
| User session data | Clerk | Clerk-managed | Clerk-managed |
| Autocomplete | Redis | 30 min | On locality/project changes |
| Homepage featured | Redis | 10 min | On featured listing change |

### 6.6 Rate Limiting

```
Unauthenticated:  30 requests/min (search, property view)
Authenticated:    100 requests/min
Lead creation:    5 per property per 24h per user
Media upload:     20 uploads per hour
API (admin):      500 requests/min
```

Implementation: Upstash Redis rate limiter (`@upstash/ratelimit`).

---

## 7. Infrastructure & DevOps

### 7.1 Deployment

| Component | Service | Notes |
|---|---|---|
| Frontend + API | Vercel | Edge functions for middleware, ISR for property pages |
| Database | MongoDB Atlas (M10+) | Auto-scaling, backups, Atlas Search |
| Cache | Upstash Redis | Serverless Redis, global replication |
| Media | Cloudinary | Free tier → Scale plan |
| Email | Resend | Transactional + marketing |
| Monitoring | Vercel Analytics + Sentry | Error tracking, performance |
| CI/CD | GitHub Actions | Lint, test, deploy on merge to main |

### 7.2 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://wisteriaproperties.com
```

---

## 8. Development Roadmap

| Phase | Weeks | Modules | Deliverables |
|---|---|---|---|
| **Phase 1** | 1–5 | Property CRUD, Search, Detail Page, Leads | Users can list & discover properties, make inquiries |
| **Phase 2** | 6–9 | Dashboards, Monetization, Payments | Revenue-ready: subscriptions, featured listings, billing |
| **Phase 3** | 10–12 | Admin Panel, CMS, Blog, SEO | Full admin control, content engine, search engine visibility |
| **Phase 4** | 13–15 | Analytics, Notifications, Maps deep integration | Data-driven insights, real-time notifications, locality pages |
| **Phase 5** | 16+ | AI recommendations, Virtual tours, Mobile app, Chatbot | Differentiated features, mobile presence |

---

## 9. Key NPM Packages

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "mongoose": "^8.x",
    "@clerk/nextjs": "^6.x",
    "zod": "^3.x",
    "zustand": "^5.x",
    "@tanstack/react-query": "^5.x",
    "@upstash/redis": "^1.x",
    "@upstash/ratelimit": "^2.x",
    "cloudinary": "^2.x",
    "razorpay": "^2.x",
    "resend": "^4.x",
    "@react-email/components": "^0.x",
    "lucide-react": "latest",
    "date-fns": "^4.x",
    "slugify": "^1.x",
    "sharp": "^0.33.x",
    "next-sitemap": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "tailwindcss": "^4.x",
    "eslint": "^9.x",
    "prettier": "latest"
  }
}
```

---

## 10. Non-Functional Requirements

| Category | Target |
|---|---|
| Page Load (LCP) | < 2.5s |
| Search Response | < 300ms (p95) |
| API Response | < 500ms (p95) |
| Uptime | 99.9% |
| Image Load | < 1s (with CDN) |
| Concurrent Users | 1,000+ (Phase 1) |
| Database | Auto-scale via Atlas |
| Security | OWASP Top 10 compliant |
| Accessibility | WCAG 2.1 AA |

---

*This PRD serves as the implementation blueprint. Each module should be developed with its own service layer, validation schemas, and API tests. Iterate on this document as requirements evolve.*