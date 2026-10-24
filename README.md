# Ụlọ — Curated Campus Living
> **Ụlọ** (/ˈʊ.lɔː/ — *Home / Shelter* in Igbo) is a curated off-campus student hostel discovery and concurrency-resilient reservation platform specifically designed for the **University of Nigeria, Nsukka (UNN)** student, landlord, and administrative ecosystem.

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Domain-Driven Modular Monolith Architecture](#-domain-driven-modular-monolith-architecture)
   - [The 12-File Autonomous Module Anatomy](#the-12-file-autonomous-module-anatomy)
   - [Module Inventory (All 11 Domains)](#module-inventory-all-11-domains)
3. [Relational Database Architecture (PostgreSQL + Drizzle ORM)](#-relational-database-architecture-postgresql--drizzle-orm)
   - [19-Table Relational Schema Dictionary](#19-table-relational-schema-dictionary)
   - [Partial Indexes & Concurrency Constraints](#partial-indexes--concurrency-constraints)
4. [Third-Party Integrations & Infrastructure](#-third-party-integrations--infrastructure)
   - [PostgreSQL & Supabase Connection Pooling](#1-postgresql--supabase-connection-pooling)
   - [Binary Magic-Byte Media Pipeline (Sharp & S3)](#2-binary-magic-byte-media-pipeline-sharp--s3)
   - [Geospatial Haversine Gate Proximity Engine](#3-geospatial-haversine-gate-proximity-engine)
   - [Mailer & Event-Driven Asynchronous Bus](#4-mailer--event-driven-asynchronous-bus)
   - [Docker Compose & Adminer Database GUI](#5-docker-compose--adminer-database-gui)
5. [Frontend UI & Component Architecture](#-frontend-ui--component-architecture)
   - [Component Directory Catalog](#component-directory-catalog)
   - [Token Lifecycle & Silent Auto-Refresh Hook](#token-lifecycle--silent-auto-refresh-hook)
6. [Complete REST API Route Catalog](#-complete-rest-api-route-catalog)
7. [Security Invariants & NDPA 2023 Compliance](#-security-invariants--ndpa-2023-compliance)
8. [Acceptance Test Suite & Quality Assurance](#-acceptance-test-suite--quality-assurance)
9. [1-Click Local Presentation Quickstart](#-1-click-local-presentation-quickstart)

---

## 🏛️ Executive Summary & Problem Statement

### The Problem
At the University of Nigeria, Nsukka (UNN), internal campus halls accommodate under 30% of enrolled students. Over 70% must seek off-campus lodging in surrounding communities: **Hilltop, Odim Gate, Behind Flat, Green House, Ofulonu, and Umunkaka**. 

Traditionally, this housing search has relied on informal touts, unregistered agents, and roadside noticeboards, creating severe vulnerabilities:
* **Extortionate Middlemen Fees:** Unregistered agents levy mandatory, non-refundable "bussing/inspection" fees (₦2,000–₦5,000) and 10%–15% commissions.
* **Double-Booking & Fraud:** Multiple students frequently pay deposits for the same vacant room to rogue caretakers who abscond before the semester starts.
* **Geographic Ambiguity:** Lodges claim to be "5 minutes from school," yet students find themselves miles from their lecture halls.
* **Privacy & Safety Violations:** Landlord phone numbers and exact compound addresses are published openly online, exposing property owners to spam and security risks.

### The Ụlọ Solution
Ụlọ solves these systemic failures by serving as an automated, trusted digital clearinghouse:
1. **The Gatekeeper (Two-Tier Verification):** Only landlords whose identity (NIN/Driver's License) and ownership documents (Deeds/Letters of Authority) have been audited by platform administrators can publish lodges.
2. **Concurrency-Safe Atomic Reservations:** Room bookings utilize PostgreSQL row-level locks (`SELECT ... FOR UPDATE SKIP LOCKED`), rendering double-booking mathematically impossible.
3. **Haversine Geodesic Gate Proximity:** Every lodge is mapped against UNN's 4 primary access gates (Second Gate, Hilltop Gate, Odim Gate, Main Gate), displaying walking-time bands and real distances in meters.
4. **Privacy-Preserving Contact Revelation:** Landlord telephone numbers and exact compound addresses remain masked until a student's reservation is officially approved.
5. **Automated 72-Hour Expiry:** Stale booking requests expire automatically after 72 hours, returning room capacity to the vacancy pool.

---

## 🏛️ Domain-Driven Modular Monolith Architecture

Ụlọ avoids the pitfalls of unstructured monolithic apps (spaghetti code) and microservices (distributed transaction failure, high hosting costs, network latency). It is built as a **strict Domain-Driven Modular Monolith** inside Next.js 16 (App Router) and TypeScript 5.

```
src/
├── app/                       # Next.js App Router (Thin transport routes & pages)
├── components/                # React 19 UI presentation components
├── hooks/                     # Custom hooks (e.g., useTokenRefresh)
├── modules/                   # 11 AUTONOMOUS DOMAIN MODULES
│   ├── auth/
│   ├── users/
│   ├── landlords/
│   ├── properties/
│   ├── locations/
│   ├── search/
│   ├── bookings/
│   ├── media/
│   ├── moderation/
│   ├── notifications/
│   └── audit/
└── shared/                    # Cross-cutting concerns (DB, Logger, Security, Mail)
```

---

### The 12-File Autonomous Module Anatomy
Every domain capability lives in its own isolated directory inside `src/modules/<module>/` conforming strictly to the **12-File Pattern**:

```
src/modules/<module>/
├── index.ts              # 1. Public API boundary; ONLY file imported outside this module
├── <m>.controller.ts     # 2. HTTP transport: parses cookies/headers, invokes service
├── <m>.service.ts        # 3. Pure domain business logic & ACID multi-step workflows
├── <m>.repo.ts           # 4. Exclusive database queries (Drizzle ORM)
├── <m>.schema.ts         # 5. Zod schemas for input validation & sanitization
├── <m>.dto.ts            # 6. Explicit input/output TypeScript contracts
├── <m>.policy.ts         # 7. Fine-grained RBAC matrix (Visitor, Student, Landlord, Admin)
├── <m>.mapper.ts         # 8. Data transformation & privacy field stripping
├── <m>.errors.ts         # 9. Custom typed domain errors with HTTP status mapping
├── <m>.events.ts         # 10. Dispatched domain events (EventBus)
├── db/index.ts           # 11. Domain-owned Drizzle table definitions
└── jobs/index.ts         # 12. Scheduled background / cron tasks
```

| Component | Responsibility & Architectural Necessity |
| :--- | :--- |
| **`index.ts`** | **Boundary Gatekeeper:** Prevents leaky abstractions. Modules only interact through defined interfaces. |
| **`controller.ts`** | **Transport Isolation:** Bridges HTTP requests to services; extracts cookies, route parameters, and query strings. |
| **`service.ts`** | **Business Logic:** Orchestrates multi-step transactions (e.g. approving a booking, locking rows, cascading cancellations). |
| **`repo.ts`** | **Data Isolation:** Isolates SQL queries. Schema changes never directly alter business logic files. |
| **`schema.ts`** | **Untrusted Input Sanitization:** Zod schemas validating UNN matric numbers (`202X/XXXXXX`), phone numbers, and coordinate ranges. |
| **`dto.ts`** | **Type Contracts:** Explicit TypeScript interfaces decoupling internal database representations from API payload shapes. |
| **`policy.ts`** | **RBAC Enforcement:** Validates permissions (e.g., verifying a landlord owns a lodge before approving bookings). |
| **`mapper.ts`** | **Privacy Barrier:** Scrubs sensitive data (e.g., passwords, phone numbers prior to booking approval, NDPA scrubbing). |
| **`errors.ts`** | **Typed Domain Failures:** Maps domain exceptions directly to standard HTTP status codes (`400`, `401`, `403`, `404`, `409`). |
| **`events.ts`** | **Decoupled Asynchrony:** Publishes domain events (`BOOKING_APPROVED`, `USER_REGISTERED`) over an internal event bus. |
| **`db/index.ts`** | **Schema Ownership:** Declares relational tables owned by this domain module. |
| **`jobs/index.ts`** | **Scheduled Cron Routines:** Houses background tasks (such as the 72-hour booking auto-expiry worker). |

---

### Module Inventory (All 11 Domains)

1. [**`auth`**](src/modules/auth): Student & landlord registration, UNN matric validation, bcrypt password hashing (cost factor 12), dual-token JWT generation (15-min Access + rotated Refresh tokens in HttpOnly cookies), and session revocation.
2. [**`users`**](src/modules/users): Profile inspection, academic level updates, and NDPA 2023 Account Anonymization with an inviolable guard preventing deletion of the last platform administrator.
3. [**`landlords`**](src/modules/landlords): Ownership document uploads (NIN, Deeds, Caretaker letters), verification status lifecycle, and real-time occupancy metrics calculation (`occupiedUnits / totalUnits`).
4. [**`properties`**](src/modules/properties): Hostel listings, room types (Self-Contain, Single Room, Flat), manual offline unit blocking, amenities association, and 4–10 photo requirement enforcement.
5. [**`locations`**](src/modules/locations): UNN campus gate definitions, great-circle Haversine walking distance calculation, and Nsukka coordinate bounding box enforcement.
6. [**`search`**](src/modules/search): Multi-criteria public lodge discovery filtering by zone, maximum rent, room type, amenities, and walking-time bands to specific UNN gates.
7. [**`bookings`**](src/modules/bookings): Concurrency-safe reservations, serializable row locking (`SELECT ... FOR UPDATE SKIP LOCKED`), 72-hour auto-expiry cron, and contact detail unlocking.
8. [**`media`**](src/modules/media): File upload defense checking binary magic bytes (blocks disguised executables), EXIF GPS stripping, Sharp WebP compression, and 400px thumbnail generation.
9. [**`moderation`**](src/modules/moderation): Administrative review queues for landlord verifications and lodge approvals, user suspension cascades, and automated 3-strike lodge report hiding.
10. [**`notifications`**](src/modules/notifications): In-app notification creation, unread count badge calculation, and event-bus listeners for booking alerts.
11. [**`audit`**](src/modules/audit): Immutable, append-only security and compliance audit ledger recording all significant platform mutations.

---

## 🗄️ Relational Database Architecture (PostgreSQL + Drizzle ORM)

The relational schema is defined declaratively using **Drizzle ORM** targeting **PostgreSQL 17/18** across exactly **19 Third Normal Form (3NF) tables**.

### 19-Table Relational Schema Dictionary

```
┌────┬──────────────────────────┬─────────────────────────────┬────────────────────────────────────────────────────────┐
│ #  │ Table Name               │ Primary Key (PK)            │ Foreign Keys & Core Purpose                            │
├────┼──────────────────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1  │ users                    │ id (UUID)                   │ Central identity, unique email, phone, role, status    │
│ 2  │ students                 │ user_id (UUID)              │ FK -> users.id; reg_number (unique), department        │
│ 3  │ landlords                │ user_id (UUID)              │ FK -> users.id; verification_status, verified_by       │
│ 4  │ verification_documents   │ id (UUID)                   │ FK -> landlords.user_id; doc_type (nin/deed), file key │
│ 5  │ academic_sessions        │ id (UUID)                   │ label (e.g., '2025/2026'), is_current (Boolean)        │
│ 6  │ campus_gates             │ id (UUID)                   │ UNN gates (Second, Hilltop, Odim, Main), lat/lng       │
│ 7  │ zones                    │ id (UUID)                   │ 6 lodging zones (Hilltop, Odim, Behind Flat, etc.)     │
│ 8  │ amenities                │ id (UUID)                   │ Lodge facilities (Borehole, Generator, Security, etc.) │
│ 9  │ hostels                  │ id (UUID)                   │ FK -> landlords.user_id; title, status, street, lat/lng│
│ 10 │ hostel_gate_distances    │ (hostel_id, gate_id) [Comp] │ FK -> hostels.id, campus_gates.id; distance_m (integer)│
│ 11 │ hostel_amenities         │ (hostel_id, amenity_id)[Cp] │ FK -> hostels.id, amenities.id (Many-to-Many bridge)   │
│ 12 │ room_types               │ id (UUID)                   │ FK -> hostels.id; label, annual_rent, total_units      │
│ 13 │ unit_blocks              │ id (UUID)                   │ FK -> room_types.id, sessions.id; offline booked units │
│ 14 │ hostel_images            │ id (UUID)                   │ FK -> hostels.id; storageKey, tag (room/exterior/bath) │
│ 15 │ bookings                 │ id (UUID)                   │ FK -> students.id, room_types.id; status, expires_at   │
│ 16 │ listing_reports          │ id (UUID)                   │ FK -> hostels.id, users.id; 3-strike flag reason       │
│ 17 │ banned_identifiers       │ id (UUID)                   │ Blacklisted phone numbers and NIN SHA-256 hashes       │
│ 18 │ notifications            │ id (UUID)                   │ FK -> users.id; in-app notification payload, read_at   │
│ 19 │ audit_logs               │ id (UUID)                   │ FK -> users.id; immutable action ledger, metadata diff │
└────┴──────────────────────────┴─────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### Partial Indexes & Concurrency Constraints

To achieve high read performance and bulletproof concurrency guarantees, Ụlọ leverages PostgreSQL-specific index capabilities:

1. **Active Booking Uniqueness (`uniq_student_room_active`):**
   ```sql
   CREATE UNIQUE INDEX uniq_student_room_active 
     ON bookings (student_id, room_type_id) 
     WHERE status IN ('PENDING', 'APPROVED');
   ```
   *Guarantees that a student cannot submit multiple active inquiries for the same room type.*

2. **Single Approved Room Constraint (`uniq_student_session_approved`):**
   ```sql
   CREATE UNIQUE INDEX uniq_student_session_approved 
     ON bookings (student_id, session_id) 
     WHERE status = 'APPROVED';
   ```
   *Guarantees that a student can only hold one approved hostel reservation per academic session.*

3. **Partial Expiry Seek Index (`idx_bookings_pending_expires`):**
   ```sql
   CREATE INDEX idx_bookings_pending_expires 
     ON bookings (expires_at) 
     WHERE status = 'PENDING';
   ```
   *Enables the hourly 72-hour auto-expiry cron job to perform an instant index seek without scanning the entire table.*

4. **Landlord Dashboard Covering Index (`idx_bookings_status_requested_at`):**
   ```sql
   CREATE INDEX idx_bookings_status_requested_at 
     ON bookings (status, requested_at);
   ```
   *Optimizes landlord inbox queries, sorting incoming requests by submission timestamp.*

5. **Notification Unread Index (`idx_notifications_user_read`):**
   ```sql
   CREATE INDEX idx_notifications_user_read 
     ON notifications (user_id, read_at);
   ```
   *Computes unread badge counts in under 5ms per user.*

---

## 🔌 Third-Party Integrations & Infrastructure

### 1. PostgreSQL & Supabase Connection Pooling
* Configured using `postgres.js` with `prepare: false` for complete compatibility with Supabase transaction-mode connection poolers.
* Connection pool dynamically sized (`max: 30`) via `PG_MAX_POOL` with automated idle timeout (`idle_timeout: 20`) to prevent connection exhaustion during traffic spikes.

### 2. Binary Magic-Byte Media Pipeline (Sharp & S3)
* **Defense-in-Depth File Validation:** File extensions are never trusted. File buffers are verified by examining their binary magic bytes (`\xFF\xD8\xFF` for JPEG, `\x89\x50\x4E\x47` for PNG, `RIFF....WEBP` for WebP). Disguised executables (`MZ` Windows binaries or PHP scripts) are rejected immediately.
* **Sharp Processing Engine:** Image buffers are re-encoded through Sharp to WebP format at 80% quality, stripping camera EXIF metadata and GPS locations to preserve student and landlord privacy.
* **Dual Storage:** Supports both local filesystem storage (`/public/uploads/`) for zero-dependency offline presentations and AWS S3 / Supabase Storage via `@aws-sdk/client-s3`.

### 3. Geospatial Haversine Gate Proximity Engine
* UNN campus access gates are surveyed and stored with exact geographic coordinates:
  * **Second Gate:** `6.86872°N, 7.40935°E`
  * **Hilltop Gate:** `6.87750°N, 7.41120°E`
  * **Odim Gate:** `6.86210°N, 7.41890°E`
  * **Main Gate (Abuja Building):** `6.85820°N, 7.40510°E`
* Uses the spherical Haversine trigonometric formula to precompute walking distances in meters, caching them in `hostel_gate_distances`. Searches execute as simple integer lookups without external Google Maps API charges.
* Validates lodge coordinates against the strict Nsukka Bounding Box: Latitude `[6.80, 6.95]`, Longitude `[7.35, 7.46]`.

### 4. Mailer & Event-Driven Asynchronous Bus
* Built on Node.js `EventEmitter`. Operations such as `BOOKING_APPROVED` dispatch events asynchronously, allowing `notifications` and `audit_logs` to process side-effects without blocking HTTP controller responses.
* Dual email strategy: Supports OAuth2 Gmail API v1 (`@googleapis/gmail`) and standard SMTP, with a development-mode console logger that guarantees full offline execution without internet connectivity.

### 5. Docker Compose & Adminer Database GUI
* **PostgreSQL Service:** Containerized PostgreSQL 17 Alpine image running on port `5433` with health check monitoring.
* **Adminer Web GUI:** Lightweight database browser accessible at `http://localhost:8080` pre-configured to connect to the PostgreSQL instance for live split-screen defense demonstrations.

---

## 🎨 Frontend UI & Component Architecture

Ụlọ’s user interface is built using **Next.js 16 (App Router)**, **React 19**, and **TailwindCSS v4**, enhanced with **Lucide React** icons and **Framer Motion** transitions.

### Component Directory Catalog

```
src/components/
├── admin/
│   └── AdminDashboardView.tsx      # Moderation docket: landlord verifications & lodge review
├── auth/
│   ├── LoginForm.tsx               # Credentials login with role redirection & error display
│   └── RegisterForm.tsx            # Student & Landlord registration with UNN matric regex
├── dashboard/
│   └── BookingsView.tsx            # Student reservations docket with status badges & contact cards
├── hostel-detail/
│   ├── BookingModal.tsx            # Reservation modal with room selection & student inquiry note
│   ├── HostelDetailView.tsx        # Detail view: walk-time bands, rules, gate distances
│   ├── HostelGallery.tsx           # Responsive image carousel with tagged photos
│   └── ReservationCard.tsx         # Sticky pricing, vacancy counters, and booking trigger
├── landing/
│   ├── CustomSelect.tsx            # Custom accessible dropdown selector for lodging zones
│   ├── DiscoveryGrid.tsx           # Dynamic lodge grid with active filter chips
│   ├── Footer.tsx                  # Institutional footer with UNN campus links
│   ├── GateShowcase.tsx            # Visual cards showing UNN gate coordinates & walking times
│   ├── HeroSection.tsx             # Main hero with integrated multi-criteria search bar
│   ├── LandingView.tsx             # Composite landing page integrating all landing blocks
│   ├── LandlordBanner.tsx          # Call-to-action banner onboarding lodge owners
│   ├── LodgeCard.tsx               # Lodge card displaying verified badges, rent, and distance
│   ├── Navbar.tsx                  # Responsive navigation bar with role-based links
│   └── TheStandard.tsx             # Ụlọ standard verification criteria explainer
├── landlord/
│   ├── LandlordDashboardView.tsx   # Landlord portal: occupancy metrics & booking inbox
│   ├── NewHostelForm.tsx           # Multi-step lodge creation form with photo uploader
│   └── VerificationUploadView.tsx  # Document upload portal for NIN and property deeds
├── layout/
│   ├── DashboardFooter.tsx         # Compact dashboard footer
│   └── DashboardNav.tsx            # Authenticated topbar with notifications & useTokenRefresh
└── report/
    └── ReportForm.tsx              # Student lodge misrepresentation report modal
```

---

### Token Lifecycle & Silent Auto-Refresh Hook
To ensure users are not disrupted or logged out while browsing or filling forms, Ụlọ utilizes [`useTokenRefresh.ts`](file:///home/moze/Desktop/ulo/src/hooks/useTokenRefresh.ts), mounted inside `DashboardNav.tsx`:

1. **Proactive Background Refresh:** Access tokens expire after 15 minutes. The hook automatically fires a silent `POST /api/v1/auth/refresh` at the 14-minute mark (60 seconds before expiration), re-issuing fresh HttpOnly cookies.
2. **Reactive 401 Interception:** Monkey-patches `window.fetch` to intercept any unexpected `401 Unauthorized` responses from the API, silently executing a token refresh and retrying the failed request once before prompting for re-login.

---

## 🌐 Complete REST API Route Catalog

The backend exposes **41 RESTful route endpoints** structured under `/api/v1/`:

### Authentication & Identity (`/api/v1/auth/`)
* `POST /api/v1/auth/register/student` — Register student with UNN matric number.
* `POST /api/v1/auth/register/landlord` — Register property owner profile.
* `POST /api/v1/auth/login` — Authenticate credentials, set HttpOnly JWT cookies.
* `POST /api/v1/auth/refresh` — Rotate refresh token, issue fresh access cookie.
* `POST /api/v1/auth/logout` — Revoke tokens, clear cookies.
* `GET  /api/v1/auth/me` — Inspect current session user payload.

### Lodge Discovery & Properties (`/api/v1/hostels/`)
* `GET  /api/v1/hostels` — Multi-criteria search (zone, rent, amenities, gate distance).
* `GET  /api/v1/hostels/[id]` — Retrieve full lodge details (masks landlord contact details).
* `GET  /api/v1/hostels/[id]/room-types` — List room types and real-time vacancies.
* `GET  /api/v1/gates` — Retrieve UNN campus gates with coordinates.
* `GET  /api/v1/zones` — Retrieve the 6 Nsukka lodging zones.

### Reservation & Concurrency Engine (`/api/v1/bookings/`)
* `GET  /api/v1/bookings` — Retrieve current student's bookings (reveals contact on approval).
* `POST /api/v1/bookings` — Create pending booking inquiry (verifies active uniqueness).
* `POST /api/v1/bookings/[id]/cancel` — Cancel pending booking.
* `GET  /api/v1/cron/booking-expiry` — Background task auto-expiring requests older than 72 hours.

### Landlord Management (`/api/v1/landlord/`)
* `GET  /api/v1/landlord/verification` — Get landlord verification status.
* `POST /api/v1/landlord/verification/upload` — Upload NIN / property deed files.
* `GET  /api/v1/landlord/hostels` — List hostels owned by authenticated landlord.
* `POST /api/v1/landlord/hostels` — Create draft hostel listing.
* `GET  /api/v1/landlord/hostels/[id]` — Get single owned hostel.
* `POST /api/v1/landlord/hostels/[id]/submit` — Submit hostel for administrative moderation.
* `POST /api/v1/landlord/hostels/[id]/images` — Upload and tag hostel photos (Sharp WebP).
* `POST /api/v1/landlord/hostels/[id]/room-types` — Add room type with unit count and rent.
* `PATCH/DELETE /api/v1/landlord/room-types/[id]` — Edit or hide room type.
* `GET  /api/v1/landlord/occupancy` — Real-time occupancy analytics.
* `GET  /api/v1/landlord/bookings` — Landlord booking inbox with student inquiry notes.
* `POST /api/v1/landlord/bookings/[id]/approve` — ACID approval with row lock & cancellation cascade.
* `POST /api/v1/landlord/bookings/[id]/reject` — Reject booking with mandatory explanation.
* `POST /api/v1/landlord/bookings/[id]/defer` — Defer booking request.

### Administrative Moderation (`/api/v1/admin/`)
* `GET  /api/v1/admin/verifications` — Queue of pending landlord document submissions.
* `POST /api/v1/admin/verifications/[id]/approve` — Approve landlord verification.
* `POST /api/v1/admin/verifications/[id]/reject` — Reject landlord verification with feedback.
* `GET  /api/v1/admin/listings/pending` — Queue of pending hostel listings.
* `POST /api/v1/admin/listings/[id]/approve` — Publish hostel to search index.
* `POST /api/v1/admin/listings/[id]/reject` — Reject hostel with feedback.
* `POST /api/v1/admin/listings/[id]/suspend` — Suspend published lodge.
* `POST /api/v1/admin/users/[id]/suspend` — Suspend user account.
* `POST /api/v1/admin/users/[id]/reactivate` — Reactivate user account.
* `GET  /api/v1/admin/metrics` — Platform health metrics (total users, lodges, bookings).
* `GET  /api/v1/admin/audit-logs` — Immutable audit log ledger.

### Notifications & Reports
* `GET  /api/v1/notifications` — Retrieve user in-app notifications.
* `PATCH /api/v1/notifications/[id]/read` — Mark notification as read.
* `POST /api/v1/reports` — Submit lodge misrepresentation report (triggers 3-strike check).
* `GET/PATCH /api/v1/users/profile` — View/update profile; trigger NDPA account anonymization.

---

## 🔒 Security Invariants & NDPA 2023 Compliance

* **TC-001 (Student Matric Validation):** UNN registration number regex `^202[0-6]/\d{6}$` strictly enforced.
* **TC-002 (Bcrypt Cost Factor 12):** Passwords hashed using bcrypt with salt rounds = 12.
* **TC-003 (Search Visibility Filter):** Lodges render in search results only if `hostels.status = 'published'` AND `landlords.verification_status = 'verified'` AND `users.status = 'active'`.
* **TC-004 (Binary Magic-Byte Inspection):** Uploaded files inspected at the binary level; non-image formats rejected.
* **TC-005 & TC-006 (ACID Row-Level Concurrency & Privacy):** Room approvals executed inside serializable transactions with `SELECT ... FOR UPDATE SKIP LOCKED`. Landlord phone numbers and street addresses remain masked until approval.
* **TC-010 (72-Hour Booking Expiry):** Automated cron sweeps stale `PENDING` bookings and sets status to `EXPIRED`.
* **TC-014 (Auto-Cancellation Cascade):** Approval of a student's reservation automatically cancels all their other pending inquiries for that academic session.
* **TC-024 (Geographic Bounding Box):** Rejects coordinates outside Nsukka bounds (`Lat 6.80–6.95`, `Lng 7.35–7.46`).
* **FR-E19 (Last-Admin Guard):** The last active platform administrator account cannot be deleted, suspended, or anonymized.
* **NDPA 2023 Compliance:** Cryptographic account anonymization scrubs personal identifiable information (full name, phone, email) while preserving referential integrity in bookings and audit logs.

---

## 🧪 Acceptance Test Suite & Quality Assurance

Ụlọ includes an end-to-end domain verification test suite in `tests/backend.test.ts`.

### Running the Acceptance Suite
```bash
npx tsx tests/backend.test.ts
```

### Verified Test Results (10 Passed, 0 Failed)
```
🧪 Running Ụlọ Backend Verification Test Suite...

  ✅ PASS: TC-001: Register Student with valid details and UNN reg number
  ✅ PASS: TC-002: Login with seeded credentials
  ✅ PASS: TC-003: Search Hilltop lodges returns only published, verified matches
  ✅ PASS: TC-004: Upload .exe disguised as .png rejected on magic-byte check
  ✅ PASS: TC-024: Coordinates outside Nsukka bounding box rejected
  ✅ PASS: TC-005 & TC-006: Concurrency-safe booking approval with row locking
  ✅ PASS: TC-010: Expiry job idempotently expires stale bookings
  ✅ PASS: FR-M4: Platform Metrics retrieval
  ✅ PASS: Users Module: Profile retrieval, update, and last-admin anonymization protection
  ✅ PASS: Notifications Module: Dispatch notification and query list

========================================
Test Results: 10 Passed, 0 Failed
========================================
```

---

## 🚀 1-Click Local Presentation Quickstart

### Prerequisites
* **Node.js 20+**
* **Docker Desktop** (optional; native local PostgreSQL script included)

### 1-Click Startup

#### On Linux / macOS:
```bash
./start_all.sh
```

#### On Windows:
Double-click `start_all.bat` or run:
```cmd
start_all.bat
```

*The script starts the database, pushes the schema, seeds demonstration accounts, and launches Next.js at `http://localhost:3000`.*

---

### Seeded Demonstration Accounts

| Role | Email Address | Password | Demonstration Purpose |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@ulo.ng` | `SuperAdmin123!` | Moderation docket: audit landlord documents, approve lodges, view system metrics & audit logs. |
| **Verified Landlord** | `okey.nnamdi@example.com` | `Landlord123!` | Landlord portal: occupancy dashboard, review student booking requests, approve reservations. |
| **Student** | `chinedu.okeke@unn.edu.ng` | `Password123!` | Student portal: search lodges by gate distance, submit booking inquiry, view approved contact info. |

### Browser Tab Setup for Presentations
* **Tab 1 (Student View):** `http://localhost:3000`
* **Tab 2 (Landlord View - Incognito):** `http://localhost:3000/landlord/dashboard`
* **Tab 3 (Admin View - Incognito):** `http://localhost:3000/admin/verifications`
* **Tab 4 (Database Viewer):** `http://localhost:8080` (Adminer: System: PostgreSQL, Server: `postgres` or `localhost`, User: `postgres`, DB: `ulo`)
