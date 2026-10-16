# The Hostel Hub — PRD & Requirements Analysis

Source: Group A, Chapters 1–3 (UNN Dept. of Computer Science, supervisor Dr. Mrs. Adaora Obayi, June 2026). Everything below is derived from that document plus the embedded diagrams. Where the document contradicts itself or is silent, a decision is made and marked **\[D\]**. Items needing sign-off are marked **\[Q\]** and collected in section 13.

## 1. Product Summary

**What:** A web platform where UNN students find and reserve off-campus rooms in Nsukka from landlords who have been verified by an admin. "Hostel" and "lodge" mean the same thing here, as in the thesis.

**Problem (from Ch. 1–3):** Students find rooms by physically walking Hilltop, Odim, Odenigwe, Behind Flat etc. with agents. Result: hidden prices, non-refundable "bussing" fees (₦2,000–5,000), 10–15% commissions, fake caretakers collecting rent from several students for the same room, double-booking, and wasted trips to unlivable rooms.

**Core value:** Trust (verified owners and listings) plus efficiency (filter by price, zone, distance to gate, then reserve) with no middlemen.

### Goals

1. Only verified landlords' admin-approved listings are publicly visible (the "Gatekeeper").
2. Students can filter by price, zone, room type, amenities, and distance to campus gates.
3. A room can never be over-allocated, even under concurrent requests.
4. Usable on a phone over poor connectivity.

### Non-goals (explicit, per Ch. 1.5)

Rent collection, payments, legal lease management, e-signatures. Also out: reviews/ratings, agent accounts, native mobile apps, multi-university support.

## 2. Audit of the Document: Contradictions and Gaps

These would break the build or the defence if not settled. Decisions are the build baseline.

| # | Issue in the document;o | Decision |
| --- | --- | --- |
| 1 | **Stack conflict.** Ch.1/2: React + Node.js + MySQL. Ch.3.10: "PHP 8.2 or Node.js", plain HTML5/CSS3/ES6. Ch.2 also says Python scripts compress images. | **\[D\]** Next.js (React + Node.js, TypeScript) as a modular monolith + PostgreSQL on Supabase. This departs from the thesis's MySQL, justified because both are ACID relational databases and Postgres gives partial unique indexes for booking integrity. No PHP. Next.js is React plus a Node server, so it still satisfies Ch.1 and Ch.2. Image compression in Node (`sharp`), no Python service. Matches Ch.1 and Ch.2, the most-cited chapters. |
| 2 | **Scope conflict.** Ch.1.5 excludes rent collection, but admin dashboard reports "revenue floats", Ch.2 cites payment integration, and students "upload tenancy confirmation documents". | **\[D\]** No money flows through the system. Drop revenue metric. Replace with booking and verification metrics. Replace tenancy document upload with an optional note. **\[Q1\]** |
| 3 | **Auth conflict.** Ch.2 says JWT; Ch.3.5.2 says HttpOnly session cookies. | **\[D\]** JWT stored in HttpOnly, Secure, SameSite=Lax cookies (short-lived access token plus rotating refresh token). Satisfies both. Adds CSRF protection. |
| 4 | **Schema cannot model the product.** `hostel_listings` has one `is_available` flag, but landlords need "capacity, occupied, vacant rooms" and a hostel has many rooms. | **\[D\]** Split into `hostels` (property) and `room_types` (with `total_units`). Availability is derived, not a stored boolean. |
| 5 | **Schema missing:** `students` and `landlords` tables (named in the ERD, never defined), images, amenities, coordinates/gate distance, verification state and documents, notifications, audit log. | **\[D\]** Added in section 8. |
| 6 | **Double-booking logic is wrong.** Algorithm 3.1 checks, then inserts. Race condition: two requests both pass the check. It also only prevents the *same student* duplicating a pending request, not two students taking the last room. The pseudocode never marks a room as taken. Column names differ from the schema (`id` vs `student_id`, `students.active_status` does not exist). | **\[D\]** Enforce in the database: unique constraint for active bookings, plus `SELECT … FOR UPDATE` on the room type inside the approval transaction. See section 6. |
| 7 | **Booking states mismatch.** FR says landlord can "accept, defer, or flag"; schema allows only PENDING/APPROVED/REJECTED. | **\[D\]** States: PENDING, APPROVED, REJECTED, CANCELLED, EXPIRED. "Defer" = stays PENDING with a note. "Flag" = report to admin. |
| 8 | **Verification is thin.** Admin reviews "property deeds and structural certifications", but uploads are limited to JPEG/PNG ≤ 2 MB, and the class diagram has a `businessLicense` string. Nothing says how a landlord is verified versus how a listing is moderated. | **\[D\]** Two gates: landlord verification (identity + ownership/authority docs, PDF/JPEG/PNG) and listing approval. A listing is public only if both pass. **\[Q2\]** |
| 9 | **Agents.** The whole problem is fake agents, but legitimate caretakers managing for owners are not addressed. | **\[D\]** MVP: landlord role only. A caretaker registers as the landlord of record and uploads authority documents. **\[Q2\]** |
| 10 | **Proximity filter has no data.** Objectives promise "proximity to campus gates", but no coordinates, gate table or distance field exists. Ch.2 cites geolocation as a key feature. | **\[D\]** Admin-managed `campus_gates` table plus lat/lng per hostel, distance precomputed (Haversine). No map screen. The landlord gives the exact address plus a Google Maps link or pasted coordinates, which the system converts to coordinates and checks (FR-E13). The detail page shows the zone, nearest gate and a distance or walking-time band; the Maps link appears only after approval. |
| 11 | **Messaging.** Ch.3.4.1 promises secure communication with owners; no FR covers it. | **\[D\]** Phase 2: booking-scoped message thread. MVP reveals contact details only after approval. |
| 12 | **NFRs are not realistic as written.** 99.9% uptime on one 4-core VM; 2.5 s under 1,000 concurrent sessions with no caching or indexing stated. | **\[D\]** Keep the targets for the document, build to them with indexes, pagination, image compression, and a k6 load test. Treat 99.9% as a monitoring target, not a guarantee on single-VM hosting. |
| 13 | **Image limit vs. "high-resolution".** 2 MB cap contradicts both high-res photos and the compression story. | **\[D\]** Accept up to 5 MB uploads, compress server-side to WebP/JPEG ≤ \~300 KB with thumbnail variants. If the supervisor insists on 2 MB, set the config value. **\[Q3\]** |
| 14 | **Housekeeping.** Duplicate section 3.2 (testing should be 3.12); Algorithm 3.1 is split across a page; test execution log (Table 3.5) is empty; Figure 3.7 sequence diagram table is blank; class diagram lacks ties between Student/BookingReservation and no User→Admin class. | Fix in the written report, not the build. |

## 3. Users and Roles

| Role | Who | Can do |
| --- | --- | --- |
| **Visitor** | Anyone, not logged in | Browse and search published listings; see price, zone, photos, map. Cannot see landlord contact details or book. |
| **Student** | UNN student | Register, log in, search, save listings, request bookings, track status, cancel own pending requests. |
| **Landlord** | Property owner or authorised caretaker | Register, submit verification, create and edit hostels and room types, manage booking requests, see occupancy. |
| **Admin** | Platform staff | Verify landlords, approve or reject listings, suspend accounts, manage gates and amenities, view metrics and audit log. |

Admin accounts are seeded or created by another admin. There is no public admin signup.

## 4. Scope by Release

**MVP (must ship, maps to thesis objectives 1–3):** auth and roles, landlord verification, listing creation with images, admin moderation queue, search with filters and gate distance, listing detail page with map, booking request lifecycle with concurrency safety, landlord booking management and occupancy view, admin account management and metrics, email notifications, listing reports, stale-listing reconfirmation, academic sessions, audit log.

**Phase 2 (should):** booking-scoped messaging, saved listings and search history, in-app notification centre, SMS notifications.

**Later (could):** reviews tied to completed stays, WhatsApp/SMS notifications, PWA/offline caching, agent accounts.

## 5. Functional Requirements

Priority: **M** = must (MVP), **S** = should (Phase 2), **C** = could.

### 5.1 Accounts and Auth

- **FR-A1 (M)** Student registration: full name, email, phone, password, UNN reg number, department. Email must be unique. Institutional email preferred, personal email allowed (per Ch.3.5.1.1).
- **FR-A2 (M)** Landlord registration: full name, email, phone, password. Account starts as `unverified`.
- **FR-A3 (M)** Email verification link before first login to a role-restricted action (booking, listing creation).
- **FR-A4 (M)** Login with email and password; logout; refresh rotation; account lockout/backoff after repeated failures.
- **FR-A5 (M)** Password reset by emailed one-time link (expires in 30 min).
- **FR-A6 (M)** Role-based access control on every API route. Suspended users cannot log in or act.
- **FR-A7 (S)** Student profile edit; landlord profile edit.

### 5.2 Landlord

- **FR-L1 (M)** Submit verification: upload an owner identity document, a property deed and a structural certification, plus a business licence if the landlord has one (PDF/JPEG/PNG), stored privately. These are the documents the thesis names (3.4 and the class diagram).
- **FR-L2 (M)** See verification status (unsubmitted, pending, verified, rejected with reason) and resubmit after rejection.
- **FR-L3 (M)** Create a hostel: title (5–100 chars), zone (one of Hilltop, Odim Gate, Behind Flat, Green House, Ofulonu, Umunkaka), street or landmark text, nearest gate and walking-time band (all public), exact address and an optional Google Maps link or pasted coordinates (private until a booking is approved), description, rules, amenities, 4–10 images, each tagged (exterior, room, bathroom, kitchen/other) with at least one room photo, first = primary, plus a checkbox confirming the photos show this property.
- **FR-L4 (M)** Add room types to a hostel: type (e.g. Single Room, Self-Contain, Flat), annual rent (NGN, > 0), total units, optional description.
- **FR-L5 (M)** Submit hostel for review; edit while draft or rejected; substantive edits to a published hostel (price, zone, images) send it back to review. **\[D\]** Cosmetic edits (description typo) do not.
- **FR-L6 (M)** Mark a room type as temporarily unavailable.
- **FR-L7 (M)** Booking inbox: list requests per hostel with student name and note; Approve, Reject (with reason), or Defer (with note).
- **FR-L8 (M)** Occupancy dashboard per hostel: total units, approved/occupied, vacant, pending requests.
- **FR-L9 (S)** Flag a booking request or student to admin.

### 5.3 Student

- **FR-S1 (M)** Search published listings with filters: price range, zone, room type, amenities (multi), max distance to a selected gate. Sort by price, distance, newest. Paginated (12 per page).
- **FR-S2 (M)** Results grid card: primary image, annual rent (bold), zone, room type(s), availability badge, View Details / Request Booking.
- **FR-S3 (M)** Listing detail: gallery, full description, rules, amenities, room types with price and availability, rounded distance to each gate (e.g. about 600 m); the exact address and the Open in Maps link appear only after approval, landlord verified badge.
- **FR-S4 (M)** Request a booking for a room type with an optional note. Business rules in section 6.
- **FR-S5 (M)** "My bookings" dashboard with status and history; cancel a pending request.
- **FR-S6 (M)** After approval, show landlord's phone, email and the exact address to the student.
- **FR-S7 (S)** Save/favourite listings; recent search history (stored locally or minimal server side, deletable).

### 5.4 Admin

- **FR-M1 (M)** Verification queue: view submitted documents, approve or reject with a mandatory reason.
- **FR-M2 (M)** Listing moderation queue: new and materially edited hostels hidden until approved or rejected with a reason.
- **FR-M3 (M)** Search, view, suspend, reactivate, or deactivate any student or landlord account (suspension unpublishes a landlord's listings and cancels their pending requests).
- **FR-M4 (M)** Metrics: registrations by role, verified landlords, published listings, bookings by status, approval rate, median time-to-decision, listings per zone. CSV export.
- **FR-M5 (M)** Manage lookup data: campus gates (name + coordinates), amenities, zones.
- **FR-M6 (M)** Audit log viewer (who did what, when) for verification, moderation, suspension, booking decisions.
- **FR-M7 (M)** Review reported and auto-hidden listings, then restore or reject them.

### 5.5 System

- **FR-X1 (M)** Email notifications: verification result, listing decision, new booking request (to landlord), booking decision (to student), request expiry.
- **FR-X2 (M)** Pending requests auto-expire after 72 hours without a decision (configurable). **\[D\]**
- **FR-X3 (M)** All uploads validated (type by file signature, size), re-encoded, EXIF/GPS stripped.
- **FR-X4 (M)** All state-changing admin and booking actions written to the audit log.

### 5.6 Edge-Case and Integrity Requirements

Added after an edge-case review. All are MVP.

**Sessions and availability**

- **FR-E1 (M)** An `academic_sessions` table (label, start, end, one marked current). Bookings belong to a session. Availability = total units − approved bookings − blocked units, counted per session, so units free up when the next session starts.
- **FR-E2 (M)** Landlords can block units ("mark N units occupied", with a reason) for rooms let outside the platform. Blocks feed availability.
- **FR-E3 (M)** One APPROVED booking per student per session, enforced by a database unique key. On approval, the student's other PENDING requests auto-cancel ("accepted elsewhere") and those landlords are notified. A student can cancel an approval to free the unit.
- **FR-E4 (M)** Each booking stores `rent_at_request`. Later price edits apply only to new requests, and pending students are notified of the change.
- **FR-E5 (M)** Landlord edit guards: `total_units` cannot drop below approved plus blocked; a room type with approved bookings can be closed to new requests but not deleted; suspending or revoking a landlord unpublishes listings and cancels pending requests, while approved bookings stay honoured and admin is alerted.
- **FR-E6 (M)** Booking transitions are idempotent and run only from PENDING (`WHERE status = 'PENDING'`), so a double-clicked Approve and the expiry job racing an approval are both no-ops.

**Fraud and trust**

- **FR-E7 (M)** Listing reports: a logged-in student can report a listing (reason, note). Three reports from distinct users auto-hide it pending admin review.
- **FR-E8 (M)** Duplicate detection on submit: flag to the admin queue when another landlord's listing is within about 30 m or shares a perceptual image hash.
- **FR-E9 (M)** Phone numbers are unique and normalised. Store a hash of the ID document number. A `banned_identifiers` table (phone, document hash) holds matches for admin review at registration.
- **FR-E10 (M)** Reconfirmation: every 30 days the landlord gets a one-tap "still available?" link. No reply within 7 days auto-hides the listing, and one tap restores it. Both intervals are configurable.
- **FR-E11 (M)** Assisted listing: an admin or campus rep can create a listing on behalf of a verified landlord, for cold-start onboarding.

**Location and photos**

- **FR-E12 (M)** Public: zone, street or landmark text, nearest gate, and either a measured straight-line distance (when verified coordinates exist) or the landlord's walking-time band. Private: exact address (admin always, student after approval). Coordinates are internal and used only for distance.
- **FR-E13 (M)** Coordinates come from pasted coordinates, a full Google Maps URL (parsed locally), or a short link resolved by a hardened server route: Google hosts only, every redirect hop re-checked, about 3 hops, short timeout, no cookies, private IP ranges blocked, only the numbers stored. If parsing fails, ask for coordinates. Coordinates are checked against an Nsukka bounding box, the declared zone's reference point (flag to admin, never block) and the declared gate. A listing shows "location verified" only after admin confirmation. Without verified coordinates a listing can still publish, showing only zone, landmark and the walking-time band.
- **FR-E14 (M)** At least 4 photos per listing, each tagged, with at least one room photo. A photo can be linked to a specific room type.
- **FR-E15 (M)** EXIF is stripped from public files, but capture date and GPS are stored for admin review only. Photos with a capture date older than about 12 months are flagged.
- **FR-E16 (M)** HEIC uploads are converted in the browser, with a server-side fallback (confirm the image library decodes HEIC). Uploads go to a temporary key and attach on save; a nightly job deletes unattached files older than 24 hours.

**Notifications and accounts**

- **FR-E17 (M)** Landlord reminders at 24 hours and shortly before a request expires, by email with signed one-tap links (a confirm page, no login needed). The admin dashboard lists requests nearing expiry. SMS (for example Termii) follows right after MVP.
- **FR-E18 (M)** One account can hold both a student and a landlord profile, with a role switcher.
- **FR-E19 (M)** Account deletion anonymises personal data and keeps booking rows. The last active admin cannot be deleted or suspended.

## 6. Business Rules and State Machines

### 6.1 Visibility

A hostel appears in public search only when: `hostel.status = published` AND `landlord.verification = verified` AND landlord account is active AND at least one room type is not hidden.

### 6.2 Hostel status

`draft` → `pending_review` → `published` | `rejected` (with reason, editable, resubmit). `published` → `suspended` (admin) → `published`. Material edit to `published` → `pending_review`.

### 6.3 Landlord verification

`unsubmitted` → `pending` → `verified` | `rejected` → (resubmit) → `pending`. Revocation by admin sets back to `rejected` and unpublishes all listings.

### 6.4 Booking lifecycle

`PENDING` → `APPROVED` | `REJECTED` | `CANCELLED` (student) | `EXPIRED` (timer). `APPROVED` → `CANCELLED` (either party, with reason). Terminal states are final.

### 6.5 Booking rules

1. Only active students with verified email may request.
2. A student cannot hold two active (PENDING or APPROVED) requests for the same room type. Enforced by a database unique constraint, not just application code.
3. Request is rejected immediately if the room type has no vacancy (`total_units − approved_count ≤ 0`) or is hidden.
4. **\[D\]** A student may have at most 3 PENDING requests at once, to limit spam. **\[Q4\]**
5. Approval runs in one transaction: lock the room type row (`SELECT … FOR UPDATE`), recount approved bookings, fail if full, otherwise set APPROVED. If the approval fills the last unit, all other PENDING requests for that room type are auto-REJECTED with reason "No longer available" and those students notified.
6. Cancelling an APPROVED booking frees the unit.
7. Defer keeps the request PENDING with a landlord note and extends expiry once by 48 h.
8. The Hub does not take money. UI states: "Never pay before you have physically inspected the room."

## 7. Non-Functional Requirements

| Area | Requirement | How it is met |
| --- | --- | --- |
| Performance | p95 search/render ≤ 2.5 s at 1,000 concurrent sessions | Indexes on (status, zone, rent); pagination; thumbnails; gzip/brotli; response caching for public search; k6 load test as acceptance |
| Availability | Target 99.9% (< 8.7 h/yr unplanned downtime) | Process manager, health checks, uptime monitor, automated restarts; honest note that a single VM cannot guarantee it |
| Security | bcrypt cost 12; HttpOnly+Secure cookies; parameterised queries; XSS escaping; CSRF protection; rate limits | See section 9 |
| Responsiveness | Mobile, tablet, desktop breakpoints; mobile-first | Tailwind or CSS breakpoints; test at 360 px width |
| Low-bandwidth | Usable on weak 3G | Compressed images, lazy loading, small JS bundle, skeletons |
| Data integrity | ACID on all writes; no orphans | Foreign keys with explicit ON DELETE rules, transactions on booking and approval |
| Privacy | Compliance with the Nigeria Data Protection Act 2023 | Collect minimum data, private document storage, account deletion path, consent text at signup |
| Observability | Know when it breaks | Structured logs, error tracking, alert at 85% CPU/connection use (Ch.3.14.2) |
| Backups | Weekly incremental backups (Ch.3.14.2) | **\[D\]** Make it daily; weekly loses too much data. Restore tested once. |
| Maintainability | Independent tiers | Separate frontend and API apps, migration scripts, CI |

## 8. Data Model (revised, PostgreSQL, 3NF)

| Table | Key columns |
| --- | --- |
| `users` | id PK, email UNIQUE, password\_hash, role ENUM(student, landlord, admin), full\_name, phone, status ENUM(active, suspended), email\_verified\_at, created\_at |
| `students` | user\_id PK/FK, reg\_number UNIQUE, department |
| `landlords` | user\_id PK/FK, verification\_status ENUM(unsubmitted, pending, verified, rejected), verification\_reason, verified\_by FK, verified\_at |
| `verification_documents` | id, landlord\_id FK, doc\_type, storage\_key (private), created\_at |
| `campus_gates` | id, name, latitude, longitude |
| `hostels` | id, landlord\_id FK, title, description, rules, zone ENUM(6 zones), address, latitude, longitude, status ENUM(draft, pending\_review, published, rejected, suspended), review\_reason, created\_at, updated\_at |
| `hostel_gate_distances` | hostel\_id, gate\_id, distance\_m (composite PK) |
| `hostel_images` | id, hostel\_id FK, storage\_key, thumb\_key, position, is\_primary |
| `amenities` | id, name UNIQUE |
| `hostel_amenities` | hostel\_id, amenity\_id (composite PK) |
| `room_types` | id, hostel\_id FK, label, annual\_rent DECIMAL(10,2) CHECK > 0, total\_units INT CHECK > 0, is\_hidden |
| `bookings` | id, student\_id FK, room\_type\_id FK, status ENUM(PENDING, APPROVED, REJECTED, CANCELLED, EXPIRED), student\_note, decision\_note, requested\_at, decided\_at, expires\_at, **Active-booking rule** a partial unique index on (student\_id, room\_type\_id) WHERE status IN ('PENDING', 'APPROVED') |
| `notifications` | id, user\_id FK, type, payload JSON, sent\_at, read\_at |
| `audit_logs` | id, actor\_id, action, entity\_type, entity\_id, meta JSON, created\_at |

Indexes: `hostels(status, zone)`, `room_types(hostel_id, annual_rent)`, `bookings(room_type_id, status)`, `bookings(student_id, status)`.

Availability for a room type in a session = `total_units − approved bookings in that session − blocked units`. Never stored.

**Schema additions from the edge-case review:** new tables `academic_sessions`, `unit_blocks`, `listing_reports`, `banned_identifiers`. New columns: `bookings.session_id`, `bookings.rent_at_request`, `hostels.last_confirmed_at`, `hostels.street_text`, `hostels.exact_address` (private), `hostel_images.tag`, `hostel_images.room_type_id` (nullable), `hostel_images.captured_at` and capture coordinates (admin only), `hostel_images.phash`, `landlords.id_document_hash`. A partial unique index on (student\_id, session\_id) WHERE status = 'APPROVED'. A user can hold both a `students` and a `landlords` profile, so the single `role` column becomes a set of profiles.

**Location design (zones as the base):** the six thesis zones are the required location field. New fields: `hostels.nearest_gate_id`, `hostels.walk_time_band` (under 5, 5–10, 10–20, 20+ minutes), `hostels.maps_url` (private, allow-listed Google hosts), `hostels.location_verified` (set by admin). A `zones` table holds each zone's name and an admin-set reference point. `campus_gates` coordinates are seeded for the 4 core UNN gates: **Second Gate** (primary gate for Behind Flat / Beach / Franco), **Hilltop Gate** (serves Hilltop, Green House, Odenigwe), **Odim Gate** (serves Odim, Ofulonu, Vet), and **First / Main Gate** (Abuja Building). Distance is calculated via the Haversine formula and labelled as straight-line, since walking routes are longer.

**Location tests:** TC-024 coordinates outside the Nsukka bounding box are rejected. TC-025 a short link that redirects to a non-Google host is refused. TC-026 coordinates far from the declared zone are flagged to the admin, not blocked. TC-027 the exact address and Maps link are hidden from students until approval.

## 9. Security Requirements

- **Passwords:** bcrypt, cost 12; minimum 8 chars with complexity check; never logged.
- **Sessions:** JWT in HttpOnly, Secure, SameSite=Lax cookie; 15-min access, rotating refresh token stored hashed server side; revoke on password change and suspension.
- **CSRF:** Origin/Referer check plus CSRF token on state-changing requests (cookies make this necessary).
- **SQL injection:** ORM or prepared statements only; no string-built SQL.
- **XSS:** React output escaping, no `dangerouslySetInnerHTML`, server-side input sanitisation, Content-Security-Policy header.
- **Uploads:** check magic bytes not extension or MIME header alone (TC-004), re-encode with `sharp`, random filenames, size limits, verification documents in private storage served via short-lived signed URLs.
- **Abuse:** rate limiting on login, register, reset, and booking endpoints; helmet headers; TLS 1.3 / HTTPS only.
- **Authorisation:** every query scoped to the acting user (a landlord can only touch their own hostels; a student only their own bookings). Test for IDOR explicitly.
- **Admin:** all actions audited; consider 2FA for admin accounts (Phase 2).

## 10. Architecture and Stack

**Pattern:** Three-tier, as specified (Presentation, Logic, Data). The logic tier is a purely modular monolith: one deployable, with strictly bounded modules.

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript, TanStack Query, Tailwind |
| API | Next.js route handlers (Node runtime) calling module controllers, Zod validation, `sharp` for images, Gmail API v1 (via `@googleapis/gmail` with OAuth2 refresh token) for system emails (verification, notifications), cron-triggered routes for scheduled jobs (no in-process queue) |
| Data | PostgreSQL on Supabase (database only; auth stays in the app per the thesis), Drizzle or Prisma, migrations owned per module |
| Storage | S3-compatible object storage from day one (Supabase Storage or AWS S3) (public images, private documents) |
| Hosting | Arranged separately by the developer, with HTTPS. If it is not the thesis's Ubuntu 22.04 VM with Nginx (Ch.3.10), justify the departure in the report. |
| CI | GitHub Actions: lint, typecheck, tests, build |

**Layout:** one Next.js project. `src/app` holds routes only (thin handlers, no business logic), `src/modules` holds the domain, `src/shared` holds the shared kernel (db client, config, errors, logger, event bus, storage/mail adapters).

```
src/modules/<module>/
  index.ts              public API; the only file other modules may import
  <m>.controller.ts     auth context -> validate -> service -> response
  <m>.service.ts        business logic, transactions
  <m>.repo.ts           the only file touching this module's tables
  <m>.schema.ts         Zod schemas; DTO types inferred from them
  <m>.dto.ts            input/output types
  <m>.mapper.ts         row <-> DTO
  <m>.policy.ts         who may do what (role, ownership, state)
  <m>.errors.ts         typed domain errors
  <m>.events.ts         events emitted
  <m>.constants.ts      enums, state machines
  listeners/            handlers for other modules' events
  jobs/                 cron and retries (e.g. booking expiry)
  db/                   table definitions + migrations
  ui/                   optional components and hooks
  __tests__/            *.spec.ts, fixtures, factories
  README.md             owns / exposes / depends on
```

Modules: auth, users, landlords, verification, properties, media, locations, search, bookings, notifications, moderation, audit. Admin is routes and UI over these services.

**Rules:** cross-module imports go through `index.ts` only (enforced in CI with eslint-plugin-boundaries or dependency-cruiser); a module's tables are queried only by its own repo; side effects travel as events; transactions live in services; authorisation lives in policy files.

**Hosting constraints (Supabase + serverless host):**

- Connect through Supabase's pooled (transaction-mode) connection string, because serverless functions open many short connections. Turn off prepared statements in the driver (Drizzle with postgres-js: `prepare: false`; Prisma: `pgbouncer=true`).
- Do not use Supabase Auth or Row Level Security. Authentication stays bcrypt + JWT in the app, as the thesis specifies (3.13). The database is reached from server code only.
- Photo uploads go directly to object storage via signed URLs, then a server route compresses them and strips EXIF. Photos are not streamed through the API.
- Scheduled work (booking expiry, reconfirmation, image cleanup) runs as cron-triggered routes secured with a secret. On Vercel's free plan these run at most daily, anywhere within the scheduled hour, in UTC, so jobs must be idempotent. No in-process queues.
- Supabase's free plan pauses a project after one week of inactivity and caps the database at 500 MB and file storage at 1 GB. Use the paid plan or keep traffic up before a live demo.

## 11. API Surface (REST, JSON, `/api/v1`)

- **Auth:** `POST /auth/register/student`, `/auth/register/landlord`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `GET /me`
- **Public:** `GET /hostels` (filters, sort, page), `GET /hostels/:id`, `GET /gates`, `GET /amenities`
- **Landlord:** `POST /landlord/verification`, `GET /landlord/verification`, `POST/GET/PATCH /landlord/hostels`, `POST /landlord/hostels/:id/submit`, `POST /landlord/hostels/:id/images`, `POST/PATCH /landlord/hostels/:id/room-types`, `GET /landlord/bookings`, `POST /landlord/bookings/:id/approve|reject|defer`, `GET /landlord/occupancy`
- **Student:** `POST /bookings`, `GET /bookings`, `POST /bookings/:id/cancel`
- **Admin:** `GET /admin/verifications`, `POST /admin/verifications/:id/approve|reject`, `GET /admin/listings/pending`, `POST /admin/listings/:id/approve|reject|suspend`, `GET/PATCH /admin/users`, `POST /admin/users/:id/suspend|reactivate`, `GET /admin/metrics`, `GET /admin/audit-logs`, CRUD `/admin/gates`, `/admin/amenities`

## 12. Screens

**Public/Student:** Home with search bar; Results grid with filter drawer; Listing detail; Register/Login/Reset; My Bookings; Profile. **Landlord:** Dashboard (occupancy, pending requests); Verification submission; Hostels list; Hostel editor (details, images, location, room types); Booking inbox. **Admin:** Metrics dashboard; Verification queue; Listing queue; Users; Gates and amenities; Audit log.

## 13. Resolved Specifications & Architectural Decisions (Sign-Off Baseline)

All 11 project questions and ambiguities have been formally resolved as the project baseline:

1. **[Q1] Payments and Financial Scope: RESOLVED.** Zero money flow on platform. No rent collection, escrow, or commission fees. The system is strictly a trusted reservation and discovery engine. Students reserve for free, physically inspect the room, and pay the landlord directly off-platform.
2. **[Q2] Landlord Verification & Caretaker Authority: RESOLVED.** Two-path verification accepted by admin:
   - *Direct Owners:* Government ID (NIN, Driver's License, or Voter's Card) + Property Deed / Allocation paper / Tax receipt.
   - *Authorized Caretakers:* Caretaker's Government ID + signed Letter of Authority from property owner + copy of owner's ID.
3. **[Q3] Image Upload Limits & Compression: RESOLVED.** Uploads accepted up to 5 MB (accommodating modern smartphone cameras), automatically compressed server-side via `sharp` to WebP format under 300 KB with 300px thumbnail variants for fast loading on 3G student networks.
4. **[Q4] Student Booking Request Cap: RESOLVED.** Hard limit of 3 concurrent PENDING booking requests per student. Once any landlord approves a request, the student's remaining pending requests are automatically cancelled ("Accepted elsewhere") to release units to other students.
5. **[Q5] Campus Gates & Benchmark Coordinates: RESOLVED.** Four primary UNN gates seeded into `campus_gates`:
   - **Second Gate (2nd Gate):** Primary benchmark gate for the *Behind Flat* / Beach / Franco lodge cluster.
   - **Hilltop Gate (Charly's Gate):** Primary benchmark for *Hilltop*, *Green House*, and *Odenigwe*.
   - **Odim Gate:** Primary benchmark for *Odim* and *Ofulonu*.
   - **First / Main Gate (Abuja Building Gate):** Front commercial town entrance.
   Straight-line distance (Haversine formula) and landlord walking-time bands are displayed publicly.
6. **[Q6] Pricing Basis: RESOLVED.** Strictly Annual Rent per academic session (reflecting standard Nsukka off-campus practice).
7. **[Q7] Email Service Provider: RESOLVED.** **Gmail API v1** (using `@googleapis/gmail` with OAuth2 client credentials and refresh token). Completely free (up to 500 emails/day), zero external subscription fees, and optimal inbox deliverability for verification and booking alerts.
8. **[Q8] Student Eligibility & Authentication: RESOLVED.** Standard personal emails permitted (Gmail, Yahoo, etc.) to accommodate students without active institutional mail, verified against a mandatory, regex-validated UNN Registration Number and Department.
9. **[Q9] Academic Session Management: RESOLVED.** Bookings tied to an active `academic_sessions` record (e.g., 2025/2026). Room availability dynamically resets when the admin transitions the platform to a new session.
10. **[Q10] Admin Staffing & Onboarding: RESOLVED.** Student Project Team (Group A) holds seeded Super Admin credentials for the demo and thesis defense; conceptual production model delegates operational administration to UNN Student Affairs / verified Campus Reps.
11. **[Q11] SMS Notifications: RESOLVED.** Email notifications (via Gmail API v1) prioritized for MVP and thesis defense (zero cost); system architecture includes an SMS adapter interface (e.g. for Termii) ready for activation once SMS credits/funding are allocated post-defense.

## 14. Acceptance Tests (extends Table 3.5)

| ID | Scenario | Expected |
| --- | --- | --- |
| TC-001 | Register with valid details | User row created, bcrypt hash stored, verification email sent |
| TC-002 | Register with invalid email and weak password | Blocked client and server side with field errors |
| TC-003 | Search Hilltop, max ₦250,000 | Parameterised query returns only published, verified, available matches |
| TC-004 | Upload `.exe` renamed to `.png` | Rejected on signature check, logged |
| TC-005 | Landlord approves request | Status APPROVED in a transaction, audit row written, student notified, contact details revealed |
| TC-006 | Two students request the last unit; landlord approves both concurrently | Exactly one succeeds, the other gets a clear error; no over-allocation |
| TC-007 | Student requests the same room type twice | Second request refused (DB constraint) |
| TC-008 | Unverified landlord's published listing | Not visible in search |
| TC-009 | Landlord A requests landlord B's booking by ID | 403 (IDOR test) |
| TC-010 | Pending request untouched for 72 h | Marked EXPIRED, student notified |
| TC-011 | Admin suspends landlord | Listings unpublished, pending requests cancelled, login blocked |
| TC-012 | 1,000 concurrent sessions, search and detail mix | p95 ≤ 2.5 s |
| TC-013 | Photo with GPS EXIF uploaded | Stored image has no EXIF |

**Additional acceptance tests (edge cases):**

- **TC-014** A student with one approval cannot get a second in the same session; the first approval auto-cancels their other pending requests.
- **TC-015** Landlord lowers `total_units` below approved plus blocked: refused (409).
- **TC-016** Approve clicked twice: the second call is a no-op returning the current state.
- **TC-017** Rent changed after a request: the booking keeps `rent_at_request`.
- **TC-018** A listing within 30 m of another landlord's is flagged to the admin queue.
- **TC-019** Three reports from distinct users auto-hide a listing.
- **TC-020** No reply 7 days after a reconfirmation link: listing hidden; one tap restores it.
- **TC-021** HEIC photo upload is converted and stored.
- **TC-022** A listing without admin-confirmed coordinates cannot be published.
- **TC-023** A banned phone number or ID document hash at registration is held for admin review.

## 15. Build Plan

Rough solo estimate: 5–7 weeks for MVP. Order matters; each phase ends with something demoable.

1. **Foundation:** Next.js project, module template with import-boundary linting, CI, database migrations, seed data (zones, amenities, gates, admin), error handling, logging.
2. **Auth and roles:** register, login, email verification, reset, RBAC middleware, rate limiting.
3. **Landlord:** verification upload, hostel and room-type CRUD, image pipeline, submit for review.
4. **Admin:** verification and listing queues, user suspension, audit log.
5. **Student discovery:** search with filters and gate distance, listing detail with map, public caching.
6. **Booking engine:** request, approve/reject/defer, sessions and unit blocks, concurrency-safe approval, expiry job, reminders and notifications, listing reports, occupancy dashboard, student bookings page.
7. **Hardening:** metrics dashboard, security pass (IDOR, CSRF, headers), load test, Lighthouse mobile pass, backups, deployment on Nginx with TLS.
8. **Phase 2 (after MVP):** messaging, saved listings, reports.

**Definition of done for MVP:** TC-001 to TC-013 pass, no critical or high findings in the security checklist, and a seeded demo with at least 3 landlords, 10 hostels, and 30 bookings across all states.
