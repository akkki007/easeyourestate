# Wisteria Properties — Product Requirements Document
**Version:** 1.1 | **Status:** In Progress | **Last Updated:** March 2026

---

## ✅ Already Implemented
| Feature | Status |
|---|---|
| OTP-based Login & Signup | ✅ Done |
| Owner Dashboard UI | ✅ Done |
| Owner — Create & View Property Listings | ✅ Done |
| Landing Page Search (NoBroker-style) | ✅ Done |

---

## Global Notes
- **Auth:** All protected endpoints require `Authorization: Bearer <JWT>` header.
- **RBAC Roles:** `buyer`, `tenant`, `agent`, `builder`, `admin`
- **Base URL prefix:** `/api/v1`
- **Pagination default:** `?page=1&limit=20`

---

## MODULE 1 — User Profile & Role Management
> Applies to: All logged-in users

### Features
- Complete profile setup after OTP login (name, email, avatar, role)
- Role selection/switch (Buyer / Tenant / Agent / Builder)
- Saved searches
- Viewed property history
- Saved / Favourite properties

### API Endpoints

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/user/profile` | Get own profile | All |
| PUT | `/user/profile` | Update profile (name, email, avatar) | All |
| PUT | `/user/role` | Set/update role | All |
| GET | `/user/saved-properties` | List saved properties | Buyer/Tenant |
| POST | `/user/saved-properties/:propertyId` | Save a property | Buyer/Tenant |
| DELETE | `/user/saved-properties/:propertyId` | Unsave a property | Buyer/Tenant |
| GET | `/user/viewed-properties` | Get recently viewed | Buyer/Tenant |
| POST | `/user/viewed-properties/:propertyId` | Log a property view | Buyer/Tenant |
| GET | `/user/saved-searches` | List saved searches | Buyer/Tenant |
| POST | `/user/saved-searches` | Save a search query | Buyer/Tenant |
| DELETE | `/user/saved-searches/:id` | Delete saved search | Buyer/Tenant |

### UI Notes
- **Profile Setup Screen:** Step-by-step after OTP login — Name → Email → Role selection (card picker UI with icons for Buyer / Tenant / Agent / Builder)
- **Profile Page:** Editable inline fields, avatar upload, role badge
- Saved properties shown as property cards grid (reuse listing card component)

---

## MODULE 2 — Property Search & Discovery
> Applies to: All users (including guests)

### Features
- City → Locality → Project drill-down search *(landing page done)*
- Filters: Budget, Property type, BHK, Area (sq ft), Possession status, Furnishing, Amenities
- Sort: Relevance, Price (low/high), Date posted, Popularity
- Map-based search (Google Maps pins)
- Keyword smart search
- Featured/sponsored listings in results

### API Endpoints

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/properties/search` | Main search with filters & pagination | All |
| GET | `/properties/search/suggestions` | Autocomplete for city/locality/project | All |
| GET | `/properties/featured` | Get featured listings (homepage) | All |
| GET | `/properties/trending` | Trending localities/searches | All |
| GET | `/properties/:id` | Get single property detail | All |
| GET | `/properties/map` | Get properties with lat/lng for map view | All |
| GET | `/properties/nearby` | Properties near a lat/lng coordinate | All |

#### Query Params for `/properties/search`
```
city, locality, project, type (buy/rent/commercial/pg),
property_type (flat/villa/plot/office/shop),
bhk, min_price, max_price, min_area, max_area,
furnishing (furnished/semi/unfurnished),
possession (ready/under-construction),
amenities (comma-separated),
sort (price_asc/price_desc/date/relevance),
page, limit
```

### UI Notes
- **Search Bar (Landing):** Tab switcher — Buy | Rent | Commercial | PG → city input with autocomplete dropdown *(already done)*
- **Search Results Page:**
  - Left sidebar: filter panel (collapsible on mobile)
  - Right: toggle between List view / Map view
  - Property card: thumbnail, title, price, BHK, area, locality, "Contacted" badge, Save button
  - Sponsored listings get a subtle "Featured" ribbon
- **Property Detail Page:**
  - Image carousel (full-width)
  - Price, BHK, area, floor, facing prominently
  - Amenities chips
  - Location map embed (Google Maps)
  - Nearby: schools, hospitals, metro (distance tags)
  - Sticky enquiry CTA sidebar on desktop; bottom sheet on mobile
  - Agent/Owner card with Call, WhatsApp, Enquire buttons

---

## MODULE 3 — Buyer Features
> Role: `buyer`

### Features
- Browse buy listings (residential + commercial)
- Enquire / Contact seller
- Schedule site visit
- Track enquiry status
- Compare properties (up to 3)
- Download brochure/floor plan
- Price trend charts for locality

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/leads` | Submit enquiry on a property |
| GET | `/leads` | Get own enquiry history |
| GET | `/leads/:id` | Get single enquiry status |
| POST | `/site-visits` | Schedule a site visit |
| GET | `/site-visits` | List own scheduled visits |
| PUT | `/site-visits/:id` | Reschedule visit |
| DELETE | `/site-visits/:id` | Cancel visit |
| GET | `/properties/compare` | Compare properties `?ids=1,2,3` |
| GET | `/localities/:slug/price-trends` | Price trend data for a locality |
| GET | `/properties/:id/brochure` | Download brochure (returns signed URL) |

#### POST `/leads` Body
```json
{
  "property_id": "uuid",
  "name": "string",
  "phone": "string",
  "message": "string",
  "intent": "buy | visit | info"
}
```

#### POST `/site-visits` Body
```json
{
  "property_id": "uuid",
  "preferred_date": "YYYY-MM-DD",
  "preferred_time": "HH:MM",
  "notes": "string"
}
```

### UI Notes
- **Buyer Dashboard:**
  - Tabs: My Enquiries | Saved Properties | Scheduled Visits | Saved Searches
  - Enquiry card shows: property thumbnail, status badge (Pending / Contacted / Visited), date
- **Compare Page:** Side-by-side table with rows for Price, BHK, Area, Amenities, Location, Agent
- **Price Trend Chart:** Line graph (recharts / chart.js) — X-axis months, Y-axis avg price/sqft

---

## MODULE 4 — Tenant Features
> Role: `tenant`

### Features
- Browse rent / PG / lease listings
- Filter by furnished status, rent range, deposit range
- Enquire / Contact owner
- Schedule visit
- View rental agreement info (if provided)
- Track application/enquiry

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/properties/search` | Same search endpoint, `type=rent` or `type=pg` |
| POST | `/leads` | Submit rental enquiry (same as buyer) |
| GET | `/leads` | Tenant's enquiry history |
| POST | `/site-visits` | Schedule rental visit |
| GET | `/site-visits` | Tenant's visit list |
| GET | `/properties/:id/rental-details` | Rental-specific details (deposit, maintenance, lock-in) |

#### Rental Detail Response Fields
```json
{
  "monthly_rent": 25000,
  "security_deposit": 75000,
  "maintenance": 2000,
  "lock_in_period": "11 months",
  "available_from": "2025-04-01",
  "pet_friendly": true,
  "preferred_tenants": ["family", "bachelor"]
}
```

### UI Notes
- **Tenant Dashboard:** Same layout as Buyer dashboard — Tabs: My Enquiries | Saved | Visits
- Rental listing cards show: Rent/month prominently, Deposit amount, Furnished badge, Available from date
- **PG Listings** have specific attributes: sharing type (single/double/triple), meals included, gender preference — rendered as tags

---

## MODULE 5 — Real Estate Agent Features
> Role: `agent`

### Features
- Agent profile/brand page (public-facing)
- Manage own property listings (separate from owner)
- View & manage leads assigned to them
- Lead follow-up notes & status updates
- Subscription plan management
- Performance analytics (views, leads, conversions)
- Bulk property upload (CSV)
- Team member invite (sub-agents)

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/agent/profile` | Get agent public profile |
| PUT | `/agent/profile` | Update agent profile & brand info |
| GET | `/agent/listings` | Agent's property listings |
| POST | `/agent/listings` | Create new listing |
| PUT | `/agent/listings/:id` | Edit listing |
| DELETE | `/agent/listings/:id` | Delete listing |
| GET | `/agent/leads` | All leads for agent's listings |
| PUT | `/agent/leads/:id` | Update lead status & add follow-up note |
| GET | `/agent/analytics` | Views, enquiries, conversion summary |
| POST | `/agent/listings/bulk-upload` | Upload CSV of properties |
| GET | `/agent/team` | List team/sub-agents |
| POST | `/agent/team/invite` | Invite a team member |
| DELETE | `/agent/team/:memberId` | Remove team member |
| GET | `/agent/subscription` | Current plan & usage |

#### PUT `/agent/leads/:id` Body
```json
{
  "status": "new | contacted | follow_up | visited | converted | lost",
  "note": "Called buyer, showing scheduled for Monday",
  "follow_up_date": "2025-04-05"
}
```

#### POST `/agent/listings/bulk-upload`
- Content-Type: `multipart/form-data`
- Field: `file` (.csv or .xlsx)
- CSV columns: `title, type, city, locality, price, bhk, area, furnishing, description, images (comma-separated URLs)`

### UI Notes
- **Agent Dashboard Layout:**
  - Sidebar nav: Overview | My Listings | Leads | Analytics | Team | Subscription
  - **Overview:** KPI cards — Active Listings, Total Leads (this month), Site Visits, Conversion Rate
  - **Leads Table:** Sortable columns, status dropdown inline, last contacted date, quick "Add Note" action
  - **Analytics:** Line charts for lead trends; bar chart for top-performing listings
  - **Public Agent Profile Page:** Avatar, name, agency, years of experience, total listings, rating, listings grid
- **Bulk Upload:** Drag-drop CSV zone + downloadable template link + validation error table after upload

---

## MODULE 6 — Builder / Developer Features
> Role: `builder`

### Features
- Builder brand profile page (public)
- Create & manage Projects (a project contains multiple units/listings)
- Upload floor plans, brochures, RERA number
- Manage project phases (under construction, possession dates)
- Leads per project
- Analytics per project
- Subscription & promotional plan management

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/builder/profile` | Get builder profile |
| PUT | `/builder/profile` | Update brand info, logo, RERA |
| GET | `/builder/projects` | List all builder's projects |
| POST | `/builder/projects` | Create new project |
| PUT | `/builder/projects/:id` | Edit project details |
| DELETE | `/builder/projects/:id` | Delete project |
| GET | `/builder/projects/:id/units` | List units/flats in a project |
| POST | `/builder/projects/:id/units` | Add a unit to project |
| PUT | `/builder/projects/:id/units/:unitId` | Edit unit |
| DELETE | `/builder/projects/:id/units/:unitId` | Remove unit |
| POST | `/builder/projects/:id/media` | Upload images/brochure/floor plan |
| GET | `/builder/leads` | All leads across projects |
| PUT | `/builder/leads/:id` | Update lead status |
| GET | `/builder/analytics` | Project-wise lead & view analytics |
| GET | `/builder/subscription` | Plan & billing details |

#### POST `/builder/projects` Body
```json
{
  "name": "Wisteria Heights",
  "city": "Pune",
  "locality": "Baner",
  "type": "residential",
  "possession_date": "2026-12-01",
  "rera_number": "P52100XXXXX",
  "min_price": 5000000,
  "max_price": 12000000,
  "total_units": 240,
  "description": "string",
  "amenities": ["gym", "pool", "clubhouse"]
}
```

### UI Notes
- **Builder Dashboard Layout:**
  - Sidebar: Overview | Projects | Leads | Analytics | Subscription
  - **Projects Page:** Card grid with project image, name, locality, possession date, RERA badge, units sold/available progress bar
  - **Project Detail (Internal):** Tabs — Units | Media | Leads | Analytics
  - **Units Table:** BHK, area, floor, price, status (Available/Booked/Sold) — inline editable
  - **Public Builder Page:** Logo, RERA verified badge, active projects grid, reviews, "Contact Builder" CTA

---

## MODULE 7 — Lead & Communication System
> Applies to: Agents, Builders, Owners receiving leads

### Features
- Enquiry forms on every listing
- WhatsApp & Call CTAs
- In-app messaging thread per lead
- Email + SMS notification on new lead
- Lead status pipeline
- Follow-up reminders

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/leads` | Create a new lead (buyer/tenant action) |
| GET | `/leads/:id/messages` | Get message thread for a lead |
| POST | `/leads/:id/messages` | Send message in lead thread |
| PUT | `/leads/:id/status` | Update lead status |
| POST | `/leads/:id/reminder` | Set follow-up reminder |
| GET | `/notifications` | Get user notifications |
| PUT | `/notifications/:id/read` | Mark notification as read |
| PUT | `/notifications/read-all` | Mark all as read |

#### Lead Status Enum
`new → contacted → follow_up → site_visit_scheduled → visited → negotiation → converted → lost`

### UI Notes
- **Lead Detail Drawer/Page:** Timeline of status changes + message thread + add note + set reminder
- **Notification Bell (Topbar):** Dropdown with unread count badge; each notification links to the relevant lead/listing

---

## MODULE 8 — Admin Panel
> Role: `admin`

### Features
- User management (view, suspend, delete, role change)
- Property listing approval & moderation
- Reported listings handling
- Subscription & payment management
- System configuration (featured slots, plan limits)
- Content moderation
- Activity & access logs
- Dashboard with platform-level KPIs

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users with filters |
| GET | `/admin/users/:id` | Get user details |
| PUT | `/admin/users/:id/suspend` | Suspend user |
| PUT | `/admin/users/:id/activate` | Activate user |
| PUT | `/admin/users/:id/role` | Change user role |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/listings` | All listings with status filter |
| PUT | `/admin/listings/:id/approve` | Approve listing |
| PUT | `/admin/listings/:id/reject` | Reject with reason |
| DELETE | `/admin/listings/:id` | Force delete listing |
| GET | `/admin/listings/reported` | Get reported listings |
| PUT | `/admin/listings/:id/report/resolve` | Resolve a report |
| GET | `/admin/subscriptions` | All subscriptions & payments |
| PUT | `/admin/subscriptions/:id/cancel` | Cancel a subscription |
| GET | `/admin/analytics/overview` | Platform KPIs |
| GET | `/admin/logs` | Access & activity logs |
| GET | `/admin/config` | Get platform config |
| PUT | `/admin/config` | Update platform config |

#### GET `/admin/analytics/overview` Response
```json
{
  "total_users": 12400,
  "new_users_today": 34,
  "active_listings": 5820,
  "total_leads_today": 210,
  "revenue_this_month": 245000,
  "pending_approvals": 18
}
```

### UI Notes
- **Admin Layout:** Dark sidebar with sections — Dashboard | Users | Listings | Reports | Subscriptions | Config | Logs
- **Dashboard:** KPI stat cards + line chart (user growth, leads/day) + recent activity feed
- **Users Table:** Searchable, filterable by role/status, bulk suspend action
- **Listings Moderation Queue:** Cards with approve/reject buttons inline; reject opens a modal to enter reason
- **Config Panel:** Toggle switches for features (e.g., "Require approval before listing goes live"), numeric inputs for plan limits

---

## MODULE 9 — Monetization & Subscriptions
> Applies to: Agents, Builders; managed by Admin

### Features
- Plans: Free / Basic / Pro / Enterprise
- Feature gating by plan (listing count, leads/month, featured slots)
- Online payment (Razorpay)
- Invoice generation (with GST)
- Auto-renewal with email alerts
- Upgrade/downgrade flow

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/plans` | List all available plans |
| POST | `/subscriptions` | Subscribe to a plan |
| GET | `/subscriptions/current` | Get own current subscription |
| POST | `/subscriptions/cancel` | Cancel subscription |
| POST | `/payments/initiate` | Create Razorpay order |
| POST | `/payments/verify` | Verify payment signature |
| GET | `/invoices` | List own invoices |
| GET | `/invoices/:id/download` | Download invoice PDF |

#### POST `/payments/initiate` Body
```json
{
  "plan_id": "pro_monthly",
  "coupon_code": "optional"
}
```

### UI Notes
- **Pricing Page (Public):** 3-column plan comparison table, "Most Popular" badge on Pro, CTA buttons
- **Billing Section (Dashboard):** Current plan card with usage bar (e.g., "12/20 listings used"), next renewal date, payment history table, upgrade button

---

## MODULE 10 — Location & Maps
> Applies to: All users

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/geo/cities` | List supported cities |
| GET | `/geo/localities?city=Pune` | Localities in a city |
| GET | `/geo/nearby-amenities` | Schools, hospitals, metro near lat/lng |
| GET | `/geo/commute` | Commute time between two points |

#### GET `/geo/nearby-amenities` Params
`?lat=18.5204&lng=73.8567&radius=2000&types=school,hospital,metro`

---

## Data Models — Quick Reference

### Property
```
id, title, description, type (buy/rent/pg/commercial),
property_type (flat/villa/plot/office/shop),
city, locality, address, lat, lng,
price, rent, deposit, maintenance,
bhk, bathrooms, area_sqft, floor, total_floors,
furnishing, facing, possession_status, possession_date,
amenities[], images[], videos[], floor_plan_url, brochure_url,
status (draft/pending_approval/active/sold/rented),
owner_id, agent_id, builder_id, project_id,
is_featured, featured_until,
rera_number, created_at, updated_at
```

### Lead
```
id, property_id, buyer_id (nullable),
name, phone, email, message, intent,
status, notes[], follow_up_date,
assigned_to (agent/owner/builder id),
created_at, updated_at
```

### User
```
id, name, email, phone, avatar,
role (buyer/tenant/agent/builder/admin),
is_verified, is_suspended,
created_at, updated_at
```

---

## Development Priority Order (Suggested)

| Priority | Module | Roles Involved |
|---|---|---|
| 🔴 P0 | Property Search & Filters (full) | All |
| 🔴 P0 | Property Detail Page | All |
| 🔴 P0 | Lead/Enquiry Submission | Buyer/Tenant |
| 🟠 P1 | Buyer & Tenant Dashboard | Buyer/Tenant |
| 🟠 P1 | Agent Dashboard + Lead Management | Agent |
| 🟠 P1 | Builder Project Management | Builder |
| 🟡 P2 | Admin Panel | Admin |
| 🟡 P2 | Subscriptions & Payments | Agent/Builder |
| 🟢 P3 | Notifications System | All |
| 🟢 P3 | Maps & Nearby Amenities | All |
| 🔵 Phase 2 | AI Recommendations, Virtual Tours, Mobile App | — |