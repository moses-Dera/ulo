# Ụlọ — Curated Campus Living

> **Ụlọ** (/ˈʊ.lɔː/ — *Home / Shelter* in Igbo) is a curated off-campus student hostel discovery and reservation platform specifically designed for the **University of Nigeria, Nsukka (UNN)** student and landlord ecosystem.

---

## 🏛️ Architecture Overview: Domain-Driven Modular Monolith

Ụlọ is built as a **strict modular monolith** on top of Next.js 16 (App Router), TypeScript, PostgreSQL 18, and Drizzle ORM. 

Rather than scattering database queries, route handlers, and domain rules across arbitrary utility folders, each business capability resides in its own isolated domain module inside `src/modules/<module>/`.

### The 12-File Module Anatomy

Every module strictly adheres to an autonomous 12-file internal structure:

```
src/modules/<module>/
├── index.ts              # 1. Public API; the ONLY file exported outside the module
├── <m>.controller.ts     # 2. HTTP transport: parses cookies/headers, invokes service
├── <m>.service.ts        # 3. Pure domain business logic & ACID transactions
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

#### Why All 12 Files Are Essential for a Complete Backend:

| Component | Responsibility & Architectural Necessity |
| :--- | :--- |
| **`index.ts`** | **Strict Boundary Enforcement**: Exports only public interfaces, services, and schemas. Disallows internal file imports from other modules. |
| **`controller.ts`** | **HTTP Transport Isolation**: Extracts auth cookies, route parameters, and query strings. Keeps Next.js API route handlers thin (`src/app/api/v1/`). |
| **`service.ts`** | **Business Logic & ACID Safety**: Orchestrates multi-step workflows, invariants, and database transactions (e.g. row-level locking during booking approval). |
| **`repo.ts`** | **Data Layer Isolation**: Exclusive home for Drizzle ORM queries. Database schemas and SQL queries can evolve without leaking into business logic. |
| **`schema.ts`** | **Untrusted Input Sanitization**: Zod validation rules enforcing UNN student registration numbers (`202X/XXXXXX`), Nigerian phone numbers (`+234...`), and coordinate bounds. |
| **`dto.ts`** | **Type Contracts**: Explicit TypeScript interfaces decoupling internal database row types from API payload shapes. |
| **`policy.ts`** | **RBAC Enforcement**: Centralized security rules verifying permissions before operations execute (e.g. ensuring a student can only cancel their own bookings). |
| **`mapper.ts`** | **Privacy Barrier**: Strips sensitive fields (e.g. password hashes, landlord phone numbers before booking approval, NDPA privacy scrubbing). |
| **`errors.ts`** | **Typed Domain Failures**: Maps business rule violations directly to standard HTTP status codes (`400`, `401`, `403`, `404`, `409 Conflict`). |
| **`events.ts`** | **Decoupled Asynchrony**: Dispatches domain events (`USER_REGISTERED`, `BOOKING_APPROVED`) so notifications and audit logs execute without tight coupling. |
| **`db/index.ts`** | **Schema Ownership**: Exposes the relational tables owned by this domain module. |
| **`jobs/index.ts`** | **Autonomous Scheduled Tasks**: Encapsulates cron routines (e.g. 72-hour booking auto-expiry, token retention cleanups). |

---

## 👥 Identity & User Management Architecture: `auth` vs `users`

A common question in modular design is why authentication and user management are divided into distinct modules:

* [**`src/modules/auth/`**](src/modules/auth) — **Credentials & Identity Verification**:
  * Registration with regex validation for UNN student matriculation numbers and Nigerian telephone numbers.
  * Secure password hashing using bcrypt with cost factor 12.
  * Dual-token authentication (short-lived access tokens and rotated refresh tokens).
  * HttpOnly, SameSite cookie management for session durability.

* [**`src/modules/users/`**](src/modules/users) — **Identity Lifecycle & NDPA Compliance**:
  * Profile inspection and modification (`GET /api/v1/users/me`, `PATCH /api/v1/users/me`).
  * Student departmental / academic level management.
  * **NDPA 2023 Account Anonymization** (`POST /api/v1/users/me/anonymize`): Irreversibly scrubs personal identifying information upon student or landlord account closure, with hard-coded invariants preventing deletion or anonymization of the last active platform administrator.

* [**`src/modules/landlords/`**](src/modules/landlords) — **Property Owner Profiles**:
  * Verification document submissions (National Identity Number - NIN, Deed of Ownership, Caretaker Letter of Authority).
  * Real-time property occupancy calculations (`occupiedUnits / totalUnits`).

* [**`src/modules/moderation/`**](src/modules/moderation) — **Administrative Oversight**:
  * Review queues for landlord verifications and property listings.
  * User suspension and reactivation cascades.
  * Automated 3-strike student lodge report auto-hiding.

---

## 📦 Complete Module Inventory (All 11 Modules)

All 11 domain modules are implemented and integrated into the global event bus:

1. [**`auth`**](src/modules/auth) — Registration, authentication, JWT token rotation, and HttpOnly cookies.
2. [**`users`**](src/modules/users) — Student/landlord profile inspection, updates, and NDPA 2023 anonymization.
3. [**`landlords`**](src/modules/landlords) — Document submissions (NIN/deeds) and live occupancy metrics.
4. [**`properties`**](src/modules/properties) — Hostels, room types, unit blocks, amenities, and 4–10 photo enforcement.
5. [**`locations`**](src/modules/locations) — UNN gate proximities, Haversine walking distances, and Nsukka bounding box checks.
6. [**`search`**](src/modules/search) — Public lodge search filtered by zone, price, gate distance, and verified badge.
7. [**`bookings`**](src/modules/bookings) — Concurrency-safe reservations, row locking (`FOR UPDATE`), 72-hour expiry, contact unlock.
8. [**`media`**](src/modules/media) — Magic-byte file validation (blocks disguised `.exe`), EXIF GPS stripping, WebP compression, thumbnails.
9. [**`moderation`**](src/modules/moderation) — Verification queues, 3-strike report auto-hiding, platform health metrics.
10. [**`notifications`**](src/modules/notifications) — In-app notification creation, unread count queries, and event listeners.
11. [**`audit`**](src/modules/audit) — Immutable event-driven audit logging for security and compliance.

---

## 🔒 Key Invariants & Test Cases Enforced

* **TC-001 (Student Registration)**: UNN reg number format (`202X/XXXXXX`), phone format (`+234...`), bcrypt cost 12.
* **TC-002 (Authentication)**: Seeded credential authentication, JWT access + refresh token rotation.
* **TC-003 (Public Discovery)**: Visibility filter ensures only `PUBLISHED` hostels from `VERIFIED` landlords with `ACTIVE` accounts appear in student search.
* **TC-004 (Media Security)**: Sharp image pipeline with magic-byte verification rejects disguised executables and malicious scripts.
* **TC-005 & TC-006 (Booking Concurrency & Privacy)**:
  * Room approval executes inside a serializable transaction with `SELECT ... FOR UPDATE` row locking.
  * Landlord phone number and exact street address are hidden from visitors and students, unlocked **only after** booking approval.
* **TC-010 (72-Hour Auto-Expiry)**: Pending booking requests automatically expire after 72 hours via background task, returning the slot to the hostel pool.
* **TC-014 (Auto-Cancellation Cascade)**: Approving a student's reservation automatically cancels their other pending requests for that academic session.
* **TC-024 (Geographic Integrity)**: Coordinates outside the Nsukka/UNN bounding box (Lat: 6.80 to 6.95, Lon: 7.35 to 7.46) are strictly rejected.
* **FR-E19 (Admin Safeguard)**: The last active administrator account cannot be deleted, suspended, or anonymized.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 20+
* PostgreSQL 18

### 1. Database Setup
A local PostgreSQL instance is pre-configured in `~/.local/share/ulo_pg` (port 5433):

```bash
# Start local PostgreSQL service
./scripts/db.sh start

# Check PostgreSQL status
./scripts/db.sh status
```

### 2. Push Schema & Seed Initial Data
```bash
# Push Drizzle schema (19 tables + partial unique indexes)
npm run db:push

# Seed UNN campus gates, zones, verified landlords, and lodges
npm run db:seed
```

### 3. Run Backend Verification Suite
Execute the comprehensive end-to-end acceptance test suite covering all critical domain rules:

```bash
npx tsx tests/backend.test.ts
```

Output:
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

### 4. Run the Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000` to interact with the API and web application.
