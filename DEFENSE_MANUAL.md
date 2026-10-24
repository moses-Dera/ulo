# ỤLỌ — FINAL BSc PROJECT DEFENSE MANUAL & ORAL EXAMINATION SCRIPT
**Department of Computer Science, Faculty of Physical Sciences, University of Nigeria, Nsukka (UNN)**  
**Academic Session:** 2025/2026 | **Defense Window:** October 28–29, 2026  
**Final Submission Deadline:** Wednesday, November 4, 2026  

---

## 📌 PROJECT METADATA CARD
* **Project Title:** Design and Implementation of an Automated Off-Campus Student Hostel Discovery and Reservation System
* **Platform Brand Name:** **Ụlọ** (/ˈʊ.lɔː/ — *Home / Shelter* in Igbo)
* **Case Study:** University of Nigeria, Nsukka (UNN) Off-Campus Lodging Zones (Hilltop, Odim Gate, Behind Flat, Green House, Ofulonu, Umunkaka)
* **Supervisor:** Dr. Mrs. Adaora Obayi
* **Software Architecture:** Domain-Driven Modular Monolith (11 Autonomous Modules, 12-File Architecture)
* **Core Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 5, PostgreSQL 17/18, Drizzle ORM, TailwindCSS v4, Docker & Adminer
* **Defense Format:** Strict 20-minute protocol with individual scoring (5 min Slides, 10 min Live Demo, 5 min Q&A)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DEFENSE DAY CHEAT SHEET                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. 20 Mins Before Entering:                                                            │
│    - Plug in laptop power and set screen to "Never Sleep".                             │
│    - Start system: ./start_all.sh (Linux/Mac) OR double-click start_all.bat (Windows).│
│                                                                                        │
│ 2. Browser Tabs Pre-Opened in Chrome:                                                  │
│    - Tab 1: http://localhost:3000                 (Student Portal)                     │
│    - Tab 2: http://localhost:3000/landlord/dashboard (Landlord Portal - Incognito)     │
│    - Tab 3: http://localhost:3000/admin/verifications (Admin Portal - Incognito)       │
│    - Tab 4: http://localhost:8080                 (Adminer DB GUI)                     │
│                                                                                        │
│ 3. The 20-Minute Defense Execution:                                                    │
│    - 00:00 - 05:00: PowerPoint Slides (6 Slides strictly as written in Manual)         │
│    - 05:00 - 08:20: Member 1 demonstrates Table Schema & Form-to-DB live insertion    │
│    - 08:20 - 11:40: Member 2 demonstrates the 4 Study Objectives on the running UI    │
│    - 11:40 - 15:00: Member 3 demonstrates Unit Functions, BFF Auth & System Modules    │
│    - 15:00 - 20:00: Individual Examiner Q&A and Scoring                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# SECTION 1: THE 20-MINUTE DEFENSE TIMETABLE & PRE-DEFENSE WARMUP

### 1.1 Strict 20-Minute Defense Execution Schedule
The department strictly penalizes groups that exceed time limits. A stopwatch begins the moment the team steps forward.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              20-MINUTE DEFENSE TIMETABLE                               │
├───────────────┬──────────┬─────────────────────────────────────────────────────────────┤
│ Timestamp     │ Speaker  │ Core Focus & Responsibility                                 │
├───────────────┼──────────┼─────────────────────────────────────────────────────────────┤
│ 00:00 - 05:00 │ Member 1 │ Formal Presentation (Strictly 6 PowerPoint Slides)          │
│ 05:00 - 08:20 │ Member 1 │ Live Database Demonstration & Real-Time Form Ingestion      │
│ 08:20 - 11:40 │ Member 2 │ Verification of the 4 Specific Objectives on Running UI     │
│ 11:40 - 15:00 │ Member 3 │ Software Architecture, Unit Functions & Integrated Modules  │
│ 15:00 - 20:00 │ All 3    │ Individual Defense Panel Q&A and Examiner Scoring           │
└───────────────┴──────────┴─────────────────────────────────────────────────────────────┘
```

---

### 1.2 Hallway Checklist (20 Minutes Before Entering Defense Hall)
**THE GOLDEN RULE:** *Never run `npm install`, edit code, or run unverified database migrations in the hallway or inside the defense hall. Everything must be warm, cached, and tested.*

- [ ] **Power & Display Settings:**
  - Connect laptop AC charger.
  - Set OS Screen Timeout / Sleep Mode to **"Never"**.
  - Set Screen Resolution to **1920x1080** (avoids projector scaling distortions).
- [ ] **Network Independence (100% Offline Resilience):**
  - Verify that the entire stack runs entirely on `localhost` without requiring UNN Wi-Fi or mobile hotspot.
  - Seeded photos and WebP thumbnails are served from local storage (`/public/images/`).
- [ ] **Single Command System Startup:**
  - On Linux / macOS: Execute `./start_all.sh`
  - On Windows: Double-click `start_all.bat`
- [ ] **Split-Screen Arrangement:**
  - **Left 50% of Screen:** Google Chrome showing the running web portal (`http://localhost:3000`).
  - **Right 50% of Screen:** Google Chrome showing the Adminer Database GUI (`http://localhost:8080`) focused on the `ulo` PostgreSQL database.
- [ ] **Pre-Authenticated Browser Tabs (Ready to Switch via `Ctrl+Tab`):**
  - **Tab 1:** Student Portal (`http://localhost:3000`) — Logged in as `chinedu.okeke@unn.edu.ng`.
  - **Tab 2:** Landlord Portal (`http://localhost:3000/landlord/dashboard`) — Incognito Tab, logged in as `okey.nnamdi@example.com`.
  - **Tab 3:** Admin Moderation Portal (`http://localhost:3000/admin/verifications`) — Incognito Tab, logged in as `admin@ulo.ng`.
  - **Tab 4:** Adminer Web DB GUI (`http://localhost:8080`) — Filtered on table `bookings` sorted by `requested_at DESC`.

---

# SECTION 2: VERBATIM POWERPOINT SLIDE DECK (6 SLIDES IN EXACT ORDER)

> **Examiner Instruction Note:** The department mandates an exact 6-slide structure. Do not insert screenshots into Slides 5 and 6; examiners require structural tabular wireframes and data dictionaries.

---

### SLIDE 1: Title & Academic Identification
* **Slide Title:** DESIGN AND IMPLEMENTATION OF AN AUTOMATED OFF-CAMPUS STUDENT HOSTEL DISCOVERY AND RESERVATION SYSTEM
* **Platform Name:** Ụlọ (Curated Campus Living)
* **Case Study:** University of Nigeria, Nsukka (UNN) Off-Campus Lodging Ecosystem
* **Presented by (Group A):**
  1. **Member 1:** [Full Name] — Reg. No: 2021/24XXXX (Database Architecture & Data Ingestion)
  2. **Member 2:** [Full Name] — Reg. No: 2021/24XXXX (Functional Requirements & Objectives Verification)
  3. **Member 3:** [Full Name] — Reg. No: 2021/24XXXX (Software Architecture, Security & Subsystems)
* **Project Supervisor:** Dr. Mrs. Adaora Obayi
* **Department:** Department of Computer Science, Faculty of Physical Sciences, University of Nigeria, Nsukka

---

### SLIDE 2: Abstract
* **Background:** Rapid annual influx of undergraduate and postgraduate students into the University of Nigeria, Nsukka consistently overwhelms internal hostel capacity, forcing over 70% of students into unregulated private lodges across Hilltop, Odim Gate, Behind Flat, Green House, Ofulonu, and Umunkaka.
* **Problem Statement:** The legacy off-campus housing search relies on informal touts and unregistered agents. This creates severe student exploitation: non-refundable "bussing/inspection" fees (₦2,000–₦5,000), extortionate commissions (10–15%), multiple payments to rogue caretakers for identical rooms (over-allocation/double-booking), and privacy abuses.
* **Proposed Solution:** This work presents **Ụlọ**, a robust, web-based, domain-driven modular platform that directly interconnects verified property owners with verified UNN students.
* **Methodology & Implementation:** Built on Next.js 16 (App Router), TypeScript, PostgreSQL, and Drizzle ORM. The system incorporates an administrative two-tier verification gatekeeper, geospatial Haversine gate proximity filtering, row-level locking (`SELECT ... FOR UPDATE SKIP LOCKED`) for atomic room reservation, 72-hour auto-expiring bookings, and NDPA 2023-compliant contact masking.
* **Evaluation & Results:** Stress-tested against concurrent booking collisions with zero double-booking occurrences. Query latency remained under 120ms for full-text and geospatial searches across 19 relational tables, providing a dependable, secure digital marketplace.

---

### SLIDE 3: Objectives of the Study
* **General Objective:**
  To design and implement a secure, automated, and concurrency-resilient web-based platform for off-campus hostel discovery and reservation tailored to the University of Nigeria, Nsukka.
* **Specific Measurable Objectives:**
  1. **Objective 1 (Identity & Ownership Verification):** To develop a two-tier verification gatekeeper requiring landlords to submit verifiable proof of ownership (NIN, Deeds of Conveyance, or Caretaker Authority Letters) audited by platform administrators before any lodge listing is publicly indexed.
  2. **Objective 2 (Geospatial & Multi-Criteria Discovery):** To formulate and implement a localized geospatial discovery engine calculating walking distances to key UNN campus gates (Second Gate, Hilltop Gate, Odim Gate, Main Gate) and filtering by pricing, lodging zones, and validated amenities.
  3. **Objective 3 (ACID Concurrency Control & Auto-Expiry):** To architect a serializable reservation algorithm that eliminates double-booking race conditions through pessimistic row locking, enforcing an automated 72-hour booking lifecycle.
  4. **Objective 4 (Privacy Preservation & NDPA Compliance):** To design a contact revelation protocol that shields landlord contact numbers and exact street addresses until a formal booking is approved, enforcing account anonymization in compliance with the Nigeria Data Protection Act (NDPA) 2023.

---

### SLIDE 4: Level-1 / Level-2 Data Flow Diagram (DFD)

```
                              LEVEL-1 DATA FLOW DIAGRAM (DFD)
                              
  ┌───────────────┐                                                         ┌───────────────┐
  │               │ ─── 1. Reg Data & UNN Matric No (202X/XXXXXX) ────────> │               │
  │               │ <── 2. JWT Access/Refresh Cookies & Session State ───── │     [1.0]     │
  │               │                                                         │   IDENTITY,   │
  │               │ ─── 3. Search Filters (Zone, Rent, Gate Distance) ────> │  AUTH & RBAC  │
  │               │ <── 4. Filtered Public Lodge Gallery & Thumbnails ───── │    GATEWAY    │
  │               │                                                         └───────┬───────┘
  │               │ ─── 5. Room Reservation Request (Student Note) ───────┐         │ (Validates)
  │    STUDENT    │ <── 6. Booking Confirmation & Landlord Contact ─────┐ │         ▼
  │               │                                                     │ │   ┌───────────┐
  │               │ ─── 7. Lodge Flag / Misrepresentation Report ─────┐ │ │   │    D1     │ Users, Students &
  │               │                                                   │ │ │   │           │ Tokens Store
  └───────────────┘                                                   │ │ │   └───────────┘
                                                                      │ │ │
  ┌───────────────┐                                                   │ │ │   ┌───────────┐
  │               │ ─── 8. Landlord Profile & NIN/Deed Docs ───────┐  │ │ └──>│    D2     │ Hostels, Gates &
  │   LANDLORD    │ ─── 9. Lodge Listing & Room Unit Inventory ──┐ │  │ │     │           │ Geodata Store
  │   / OWNER     │ <── 10. Live Occupancy & Booking Notification│ │  │ │     └───────────┘
  │               │ <── 11. Booking Approval / Rejection ────────┼─┼──┘ │           ▲
  └───────────────┘                                              │ │    │           │ (Reads/Writes)
                                                                 │ │    ▼           │
  ┌───────────────┐                                              │ │  ┌─────────────┴─────┐
  │     ADMIN     │ ─── 12. Landlord Audit & Verification Status ┤ └─>│       [2.0]        │
  │  / MODERATOR  │ ─── 13. Listing Moderation (Approve/Reject) ─┤    │     PROPERTY &     │
  │               │ <── 14. 3-Strike Lodge Auto-Hiding Queue ────┤    │     ONBOARDING     │
  └───────────────┘                                              │    └─────────────┬─────┘
                                                                 │                  │ (Populates)
                                                                 ▼                  ▼
  ┌──────────────────────────────────────────────────────────────┴──────────────────┴─────┐
  │                                      CORE ENGINE PROCESSES                            │
  │                                                                                       │
  │   [3.0] GEOSPATIAL SEARCH & HAVERSINE GATE PROXIMITY CALCULATOR                       │
  │   - Reads D2 (Hostels + Campus Gates: Lat/Lng). Computes geodesic walking distance.   │
  │                                                                                       │
  │   [4.0] ACID CONCURRENCY RESERVATION ENGINE                                           │
  │   - SELECT ... FOR UPDATE SKIP LOCKED on D3 (Room Vacancy). Enforces 1 approved room. │
  │                                                                                       │
  │   [5.0] PRIVACY SCRUBBER & CONTACT DISCLOSURE                                         │
  │   - Filters landlord phone & exact street text until status = 'APPROVED'.             │
  │                                                                                       │
  │   [6.0] SCHEDULED 72-HOUR AUTO-EXPIRY & EVENT BUS DISPATCHER                          │
  │   - Scans D3 (idx_bookings_pending_expires). Flips stale requests -> EXPIRED.         │
  └──────────────────────────────┬──────────────────────────────────┬─────────────────────┘
                                 │                                  │
                                 ▼                                  ▼
                         ┌───────────────┐                  ┌───────────────┐
                         │      D3       │ Bookings &       │      D4       │ Audit Logs &
                         │               │ Unit Blocks      │               │ Notifications
                         └───────────────┘                  └───────────────┘
```

#### Detailed DFD Component Specifications:
* **(i) External Entities:**
  1. `Student`: UNN authenticated student browsing lodges and requesting room bookings.
  2. `Landlord`: Verified property owner or caretaker submitting lodges and approving bookings.
  3. `Admin / Moderator`: Departmental/platform staff auditing NIN/deeds and listing integrity.
  4. `Notification Gateway`: SMTP/Gmail API dispatcher delivering transaction notifications.
* **(ii) Primary Processes:**
  * `1.0 Authentication & RBAC Gateway`: Enforces UNN matric format, bcrypt hashing, and JWT cookies.
  * `2.0 Property & Onboarding Engine`: Validates image magic bytes, tags (4–10 photos), and coordinates.
  * `3.0 Geospatial Search & Haversine Distance Engine`: Maps lodge coordinates to 4 UNN gates.
  * `4.0 Concurrency Control & Reservation Engine`: Manages ACID transactional reservation states.
  * `5.0 Privacy Scrubber & Mapper`: Scrubs private phone numbers and street text for unapproved viewers.
  * `6.0 Expiry Cron & Moderation Cascade`: Auto-expires requests after 72 hours; flags 3-strike listings.
* **(iii) Data Stores:**
  * `D1: Users, Students & Landlords Store`: Core credentials, roles, and verification states.
  * `D2: Properties, Room Types & Gates Store`: Lodges, unit counts, amenities, and gate coordinates.
  * `D3: Bookings & Unit Blocks Store`: Concurrency reservations, active statuses, and manual blocks.
  * `D4: Audit Trail & Notifications Store`: Immutable security logs and user inbox alerts.

---

### SLIDE 5: Input Design Specifications (Tabular Wireframe & Data Dictionary)
*Examiner Note: Per guidelines, structural tabular specifications are presented in lieu of UI screenshots.*

| Form Name | Field Label | HTML Input Type | Data Type | Constraints & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Student Registration** (`FR-A1`) | Full Name | `text` | `VARCHAR(255)` | Required; 3–255 characters; alphabetical & spaces only. |
| | Email Address | `email` | `VARCHAR(255)` | Unique; standard RFC 5322 regex; `@unn.edu.ng` accepted. |
| | Phone Number | `tel` | `VARCHAR(50)` | Unique; E.164 Nigerian format (`^\+234[789][01]\d{8}$`). |
| | Password | `password` | `VARCHAR(255)` | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol. |
| | UNN Reg Number | `text` | `VARCHAR(50)` | Unique; strict UNN matric pattern: `^202[0-6]/\d{6}$`. |
| | Department | `select` | `VARCHAR(150)` | Required; selected from accredited UNN departmental list. |
| **Landlord Verification** (`FR-L1`) | Document Type | `select` | `VARCHAR(50)` | Options: `nin`, `drivers_license`, `deed`, `authority_letter`. |
| | Document File | `file` | `BLOB / S3` | Magic byte validated; PDF/JPEG/PNG only; Max size 5MB. |
| **Hostel Creation** (`FR-L3`) | Hostel Title | `text` | `VARCHAR(255)` | Required; 5–100 characters; e.g. "St. Anthony Luxury Lodge". |
| | Lodging Zone | `select` | `VARCHAR(100)` | Restricted enum: `Hilltop`, `Odim Gate`, `Behind Flat`, `Green House`, `Ofulonu`, `Umunkaka`. |
| | Landmark / Street | `text` | `VARCHAR(255)` | Public display landmark; e.g. "Behind Franco Hostel". |
| | Exact Address | `text` | `VARCHAR(255)` | Private until approval; e.g. "Plot 14 Ofulonu Street". |
| | Nearest Campus Gate | `select` | `UUID` | Foreign Key referencing `campus_gates.id`. |
| | Latitude & Longitude | `number` | `NUMERIC(10,7)`| Strict Nsukka Bounding Box: Lat `[6.80, 6.95]`, Lng `[7.35, 7.46]`. |
| | Walk Time Band | `select` | `VARCHAR(50)` | Enum: `under_5_min`, `5_to_10_min`, `10_to_20_min`, `20_plus_min`. |
| | Hostel Photos | `file[]` | `ARRAY` | Minimum 4, Maximum 10 photos; at least 1 photo tagged `room`. |
| **Room Type Creation** (`FR-L4`) | Room Label | `text` | `VARCHAR(100)` | Required; e.g. "Single Room", "Self-Contain with Balcony". |
| | Annual Rent (₦) | `number` | `NUMERIC(12,2)`| Required; Positive currency value (> ₦10,000.00). |
| | Total Unit Count | `number` | `INTEGER` | Required; Positive integer (≥ 1). |
| **Booking Request** (`FR-S4`) | Room Type | `hidden` | `UUID` | Foreign Key referencing selected `room_types.id`. |
| | Student Note | `textarea` | `TEXT` | Optional inquiry message to landlord (Max 500 chars). |

---

### SLIDE 6: Output Design Specifications (Tabular Wireframe & Reports)

| Output Document / View | Destination / Viewport | Output Fields Displayed | Triggering Logic & Security Rules |
| :--- | :--- | :--- | :--- |
| **Lodge Search Result Card** (`FR-S2`) | Public Web Portal (`/search`) | • Primary WebP Thumbnail<br>• Hostel Title & Zone<br>• Annual Rent Range (e.g. ₦180,000)<br>• Nearest Gate & Distance in Meters<br>• Verified Landlord Badge | Generated dynamically via SQL index scan. Only lodges with `status = 'published'` and `landlords.verification_status = 'verified'` are rendered. |
| **Lodge Inspection Detail View** (`FR-S3`) | Student Viewport (`/hostels/[id]`) | • High-Res Photo Carousel (WebP)<br>• Verified Amenities Badges<br>• Room Types with Vacancy Counters<br>• Distance to all 4 UNN Gates<br>• Public Landmark Description | Landlord telephone number and exact street address are masked and suppressed by `properties.mapper.ts`. |
| **Booking Approval Slip** (`FR-S6`) | Student Dashboard (`/student/bookings`) | • Booking ID & Approved Status<br>• Room Type & Locked Annual Rent<br>• Landlord Full Name & Phone Number<br>• Exact Street Address & Google Maps Pin<br>• Inspection Window Instructions | Triggered immediately when Landlord clicks "Approve". `bookings.mapper.ts` decrypts and unmasks landlord contact information. |
| **Landlord Occupancy Dashboard** (`FR-L8`) | Landlord Portal (`/landlord/dashboard`) | • Total Configured Room Units<br>• Real-Time Active Bookings (Occupied)<br>• Off-Platform Blocked Units<br>• Available Vacant Units<br>• Pending Student Inquiries Queue | Derived dynamically: `Vacant = total_units - (approved_bookings + units_blocked)`. Prevents over-booking. |
| **Admin Moderation Docket** (`FR-M1`) | Admin Portal (`/admin/verifications`) | • Landlord Identification Record<br>• NIN / Deed Document Download Link<br>• Verification Decision (Approve / Reject)<br>• Mandatory Rejection Reason Field | Renders unapproved landlord submissions. Action flips `verification_status` and sends automated event notification. |
| **Audit Log Ledger** (`FR-E20`) | Admin Security Console (`/admin/audit`) | • Timestamp (UTC ISO 8601)<br>• Actor User ID & Role<br>• Action Type (`BOOKING_APPROVED`, etc.)<br>• Entity ID & State Metadata Diff | Immutable, append-only log record generated by `EventBus` listener. Cannot be altered or deleted. |

---

# SECTION 3: MEMBER 1 DEMONSTRATION SCRIPT
### Focus: Relational Database Architecture, Schema Design & Live Ingestion
**Time Allocation:** Exactly 3 Minutes, 20 Seconds (05:00 – 08:20)

---

### 3.1 Verbatim Speaking Script
> *"Good day, respected Chairman and esteemed members of the Examination Panel. My name is [Member 1 Name]. I am responsible for the Database Architecture and Data Ingestion Pipeline of Ụlọ.*
> 
> *As shown on our split screen, the production database is hosted on PostgreSQL 18. Rather than using an unnormalized flat file or arbitrary schema, our database is structured into exactly 19 Third Normal Form (3NF) relational tables managed via Drizzle ORM.*
> 
> *Our architecture solves two critical database challenges: first, preventing race-condition over-allocation through atomic constraints; and second, optimizing read-heavy search operations across Nsukka lodging zones.*
> 
> *Observe the 19 tables in Adminer on the right: we separate `users` from `students` and `landlords` using table inheritance with 1-to-1 foreign keys. Property data is decomposed into `hostels`, `room_types`, `amenities`, and `hostel_gate_distances`, where walking distances to UNN's Second Gate, Hilltop Gate, Odim Gate, and Main Gate are precomputed using the Haversine formula.*
> 
> *Now, watch a live database ingestion: on the left, I will log in as student Chinedu Okeke and submit a reservation request for a Self-Contain room at St. Anthony Luxury Lodge. Watch the Adminer table `bookings` on the right.*
> 
> *[Action: Member 1 clicks 'Submit Booking' on the UI].*
> 
> *Notice that upon refreshing the `bookings` table in Adminer, a new row is instantly ingested with a UUID primary key, `student_id`, `room_type_id`, `session_id` for 2025/2026, status set to `'PENDING'`, and an `expires_at` timestamp set exactly 72 hours into the future.*
> 
> *Furthermore, notice our partial unique index: if I attempt to click submit again, PostgreSQL raises an immediate unique constraint violation (`uniq_student_room_active`), guaranteeing that no student can flood a landlord with duplicate pending inquiries. I now yield to Member 2 to demonstrate our study objectives."*

---

### 3.2 Inventory of the 19 Relational Tables

```
┌────┬──────────────────────────┬─────────────────────────────┬────────────────────────────────────────────────────────┐
│ #  │ Table Name               │ Primary Key (PK)            │ Foreign Keys (FK) & Core Purpose                       │
├────┼──────────────────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1  │ users                    │ id (UUID)                   │ Central auth, unique email, phone, bcrypt hash, status │
│ 2  │ students                 │ user_id (UUID)              │ FK -> users.id; reg_number (unique), department        │
│ 3  │ landlords                │ user_id (UUID)              │ FK -> users.id; verification_status, verified_by       │
│ 4  │ verification_documents   │ id (UUID)                   │ FK -> landlords.user_id; doc_type (NIN/deed), file key │
│ 5  │ academic_sessions        │ id (UUID)                   │ label (e.g. '2025/2026'), is_current (Boolean)         │
│ 6  │ campus_gates             │ id (UUID)                   │ UNN gates (Second, Hilltop, Odim, Main), lat/lng       │
│ 7  │ zones                    │ id (UUID)                   │ 6 lodging zones (Hilltop, Odim, Behind Flat, etc.)     │
│ 8  │ amenities                │ id (UUID)                   │ Standard lodge facilities (Borehole, Generator, etc.)  │
│ 9  │ hostels                  │ id (UUID)                   │ FK -> landlords.userId; title, status, street, lat/lng │
│ 10 │ hostel_gate_distances    │ (hostel_id, gate_id) [Comp] │ FK -> hostels.id, campus_gates.id; distance_m (int)    │
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

### 3.3 Top 3 Likely Examiner Questions & Exact Rehearsed Answers (Member 1)

#### Q1: "Why did you choose PostgreSQL over MySQL when your initial thesis proposal cited MySQL?"
> **Rehearsed Answer (Member 1):**  
> *"Thank you for that insightful question, sir/ma. While MySQL is an established relational database, PostgreSQL was selected because it natively supports **Partial Conditional Indexes** and **`SKIP LOCKED` concurrency semantics**.  
> In our `bookings` table, we enforce the invariant that a student cannot have multiple active bookings for the same room type using:  
> `CREATE UNIQUE INDEX uniq_student_room_active ON bookings (student_id, room_type_id) WHERE status IN ('PENDING', 'APPROVED');`  
> In standard MySQL, partial indexes with `WHERE` clauses are unsupported, which would require table-level triggers or locking entire tables during inserts. Furthermore, PostgreSQL provides robust support for GIS extensions and row-level locks without phantom read anomalies."*

#### Q2: "How does your database handle orphaned records if a student or landlord deletes their account?"
> **Rehearsed Answer (Member 1):**  
> *"We implement a dual approach balancing relational integrity with the Nigeria Data Protection Act (NDPA) 2023.  
> For operational transactional integrity, operational profiles use `ON DELETE CASCADE` from `users` to `students` and `landlords`. However, in production, user accounts are never hard-deleted. Instead, we perform **Cryptographic Account Anonymization** (`POST /api/v1/users/me/anonymize`).  
> The user's full name, phone number, and email are overwritten with irreversible cryptographic hashes, and their password hash is purged. This preserves historical foreign key relationships in `bookings` and `audit_logs` for institutional reporting without retaining identifiable personal data."*

#### Q3: "What indexing strategy did you implement to ensure fast queries during peak accommodation rush?"
> **Rehearsed Answer (Member 1):**  
> *"We implemented four targeted composite and partial indexes:  
> 1. `idx_bookings_pending_expires`: A partial index indexing only `WHERE status = 'PENDING'`. When our background auto-expiry cron runs, it performs an instant index seek instead of a full table scan.  
> 2. `idx_bookings_status_requested_at`: A covering index for the landlord inbox query filtering by status and sorting by timestamp.  
> 3. `idx_hostels_status_zone`: A compound index filtering published hostels by zone.  
> 4. `idx_notifications_user_read`: Facilitates instantaneous calculation of unread notification badges."*

---

# SECTION 4: MEMBER 2 DEMONSTRATION SCRIPT
### Focus: Functional Verification of the 4 Specific Study Objectives
**Time Allocation:** Exactly 3 Minutes, 20 Seconds (08:20 – 11:40)

---

### 4.1 Verbatim Speaking Script
> *"Good day, distinguished panel. My name is [Member 2 Name]. I will demonstrate how Ụlọ practically satisfies each of the 4 specific academic objectives established in Chapter 1 of our project report.*
> 
> *First, **Objective 1: The Two-Tier Verification Gatekeeper**.  
> Off-campus exploitation occurs because unregistered agents advertise lodges they do not own. In Ụlọ, unverified listings are mathematically invisible. Watch the screen: I am logged in as an administrator. Under `/admin/verifications`, Landlord Chief Okey Nnamdi has submitted his National Identity Number and Certificate of Occupancy. Only when I review and click 'Verify Landlord' does the system unlock his ability to publish lodges. If an unverified landlord creates a lodge, our query filter `WHERE hostels.status = 'published' AND landlords.verification_status = 'verified'` prevents it from ever rendering in student searches.*
> 
> *Second, **Objective 2: Multi-Criteria Geospatial Discovery**.  
> On the public search portal, a student does not need to wander Hilltop in the sun. I will filter lodges by:  
> Zone: 'Odim Gate', Maximum Rent: '₦250,000', Amenity: 'Borehole / Running Water', and Proximity: 'Under 10 minutes walk to Second Gate'.  
> The platform performs an instant multi-criteria filter and uses our precomputed Haversine distance matrix to rank results, showing exact walking bands and distance in meters.*
> 
> *Third, **Objective 3: ACID Concurrency Control & Double-Booking Prevention**.  
> This is our core algorithmic breakthrough. Suppose a lodge has only 1 vacant self-contain unit left. In Tab 1, student Chinedu has a PENDING request. In Tab 2, Landlord Okey reviews his booking inbox. When the landlord clicks 'Approve', our backend executes a database transaction with `SELECT ... FOR UPDATE SKIP LOCKED` on the room type.*
> 
> *[Action: Member 2 clicks 'Approve Booking'].*
> 
> *Notice what occurred: the room unit count was atomically decremented. Simultaneously, our cascading trigger located all other pending requests submitted by Chinedu for this academic session and automatically cancelled them with the note 'Room secured'. No double-booking can physically occur.*
> 
> *Fourth, **Objective 4: Privacy Preservation & Contact Revelation**.  
> Notice that before booking approval, the student could only see a general landmark ('Near Franco Junction') and the landlord's phone number was completely hidden. Now that the booking is APPROVED, the student's dashboard dynamically unlocks Chief Okey's phone number (`+2348033001122`), his exact street address, and a direct Google Maps pin. Private data is revealed only when a legitimate tenancy intent is ratified.*
> 
> *Finally, watch our **Negative Boundary Test**: if I attempt to register a student with an invalid UNN registration number like `2021/INVALID`, our Zod validation schema instantly halts execution with a 400 Bad Request. I now invite Member 3 to present our software architecture."*

---

### 4.2 Objective Verification Matrix

```
┌─────────────────────────────────┬──────────────────────┬──────────────────────┬──────────────────────────────────┐
│ Study Objective                 │ Triggering Form / UI │ Backend Action       │ Measurable Output                │
├─────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ Obj 1: Verification Gatekeeper  │ Admin Docket         │ Review NIN / Deed    │ Status -> 'verified';            │
│                                 │ /admin/verifications │ Flip landlord status │ Unlocks lodge publication        │
├─────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ Obj 2: Geospatial Search        │ Search Engine        │ Haversine Gate Query │ Filtered lodges ranked by        │
│                                 │ /search              │ Composite SQL Filter │ distance in meters to UNN gates  │
├─────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ Obj 3: ACID Concurrency Control │ Landlord Inbox       │ Atomic Transaction   │ Vacancy count decremented;       │
│                                 │ /landlord/bookings   │ SELECT FOR UPDATE    │ Cascade-cancels student's others │
├─────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ Obj 4: Privacy & Contact Reveal │ Booking Details      │ Dynamic Policy Mask  │ Landlord phone & exact address   │
│                                 │ /student/bookings    │ Mapper Decryption    │ revealed only post-approval      │
└─────────────────────────────────┴──────────────────────┴──────────────────────┴──────────────────────────────────┘
```

---

### 4.3 Top 3 Likely Examiner Questions & Exact Rehearsed Answers (Member 2)

#### Q1: "How do you calculate distance to UNN gates without incurring expensive Google Maps API charges?"
> **Rehearsed Answer (Member 2):**  
> *"We utilize the spherical Haversine trigonometric formula implemented natively within our backend application layer.  
> We surveyed and stored the exact GPS coordinates of UNN's 4 major access gates: Second Gate (`6.86872°N, 7.40935°E`), Hilltop Gate (`6.87750°N, 7.41120°E`), Odim Gate (`6.86210°N, 7.41890°E`), and Main Gate (`6.85820°N, 7.40510°E`).  
> When a landlord creates a hostel, the system computes the great-circle distance in meters between the hostel's verified coordinates and all four gates, caching them in `hostel_gate_distances`. Student search queries are pure integer lookups against this table, incurring zero external API cost and zero network latency."*

#### Q2: "What happens if a landlord never responds to a student's booking request?"
> **Rehearsed Answer (Member 2):**  
> *"To prevent students from having their housing plans stalled indefinitely, we implemented **TC-010: The 72-Hour Auto-Expiry Engine**.  
> Every booking insertion assigns an `expires_at` timestamp set strictly to `requested_at + 72 hours`. Our scheduled background cron worker (`/api/v1/cron/expire-bookings`) queries our partial index `idx_bookings_pending_expires` every hour. Any pending request that crosses 72 hours is automatically transitioned to `'EXPIRED'`, releasing the student's reservation slot and dispatching an in-app and email notification."*

#### Q3: "Why is rent payment not handled directly through an online payment gateway like Paystack or Flutterwave?"
> **Rehearsed Answer (Member 2):**  
> *"Per Section 1.5 of our project scope, online rent collection was intentionally designated as a non-goal for three critical reasons:  
> 1. **Local Tenancy Norms:** Off-campus student tenancy in Nsukka legally requires in-person physical inspection of facilities (water flow, roof leakage, pre-paid meter balance) before financial commitment.  
> 2. **Fraud Prevention:** Escrow and payment processing without institutional legal custody introduces severe fraud liability if a caretaker collects payment before the property deed is verified.  
> 3. **Focus on Discovery & Anti-Overbooking:** Ụlọ solves the core problem of discovery, verification, and reservation locking. Once reservation is approved and contact unlocked, the student conducts a physical walkthrough before signing traditional tenancy agreements."*

---

# SECTION 5: MEMBER 3 DEMONSTRATION SCRIPT
### Focus: Software Architecture, Modular Monolith Anatomy & Subsystems
**Time Allocation:** Exactly 3 Minutes, 20 Seconds (11:40 – 15:00)

---

### 5.1 Verbatim Speaking Script
> *"Good day, respected members of the panel. My name is [Member 3 Name]. I am responsible for the Software Engineering Architecture, System Modularity, and Security Subsystems of Ụlọ.*
> 
> *From an architectural standpoint, Ụlọ is built as a **Domain-Driven Modular Monolith** on Next.js 16 and TypeScript. While many university projects scatter code across unstructured folders, Ụlọ divides all business capabilities into **11 isolated domain modules** inside `src/modules/`.*
> 
> *Every single module adheres to a strict **12-File Autonomous Anatomy**.  
> Take our `bookings` module as an example:  
> - `index.ts` serves as the strict public boundary gatekeeper.  
> - `bookings.controller.ts` acts as the HTTP transport layer.  
> - `bookings.service.ts` encapsulates ACID business rules.  
> - `bookings.repo.ts` contains the Drizzle database queries.  
> - `bookings.schema.ts` enforces Zod input sanitization.  
> - `bookings.dto.ts` defines TypeScript contracts.  
> - `bookings.policy.ts` enforces fine-grained Role-Based Access Control.  
> - `bookings.mapper.ts` strips sensitive private fields.  
> - `bookings.errors.ts` maps domain exceptions to HTTP status codes.  
> - `bookings.events.ts` publishes domain events.  
> - `db/index.ts` declares schema ownership.  
> - `jobs/index.ts` encapsulates autonomous cron routines.*
> 
> *We differentiate between **Unit Functions** and **Integrated Subsystems**:  
> A **Unit Function** is a single-responsibility, pure utility. Examples include our `calculateHaversineDistance()` function in `locations`, our `validateMagicBytes()` in `media` which inspects binary image headers to reject disguised executables, and our regex validator for UNN matriculation numbers.  
> 
> An **Integrated Subsystem**, by contrast, orchestrates multiple modules across our decoupled **Event Bus**.  
> Watch our **Authentication & Token Lifecycle Subsystem**: we implement dual-token authentication. Access tokens live for 15 minutes in `HttpOnly`, `SameSite=Lax`, encrypted cookies.  
> To prevent students from being unceremoniously logged out while filling a long lodge registration form, we engineered the `useTokenRefresh` custom hook: it silently pings `/api/v1/auth/refresh` 60 seconds before expiration, issuing fresh tokens without disrupting the UI.  
> 
> Simultaneously, our **Event-Driven Audit Subsystem** decouples business operations: when a booking is approved, `bookings.service` emits a `BOOKING_APPROVED` event. The notification module listens and creates in-app alerts, while the audit module writes an immutable ledger entry—without either module touching the other's code.  
> 
> This architecture guarantees that Ụlọ is maintainable, enterprise-grade, and ready for deployment across the University of Nigeria community. Thank you, and we welcome your questions."*

---

### 5.2 The 12-File Module Anatomy Reference

```
src/modules/<module-name>/
├── index.ts              # 1. Public Boundary Gatekeeper (Only file accessible by other modules)
├── <m>.controller.ts     # 2. HTTP Transport Handler (Parses cookies, query params & status codes)
├── <m>.service.ts        # 3. Pure Business Domain Service (ACID transactions & workflows)
├── <m>.repo.ts           # 4. Exclusive Data Access Layer (Drizzle ORM SQL queries)
├── <m>.schema.ts         # 5. Zod Input Sanitization Schemas (Regex, bounds & string parsing)
├── <m>.dto.ts            # 6. Explicit TypeScript Contracts (Decouples API payloads from DB rows)
├── <m>.policy.ts         # 7. Fine-Grained RBAC Matrix (Visitor, Student, Landlord, Admin)
├── <m>.mapper.ts         # 8. Privacy & Data Scrubbing Mapper (NDPA compliance filtering)
├── <m>.errors.ts         # 9. Custom Typed Domain Errors (Mapped to 400, 401, 403, 404, 409)
├── <m>.events.ts         # 10. Domain Event Definitions (Pub/Sub for notifications & audit)
├── db/index.ts           # 11. Schema Ownership (Relational table definitions owned by module)
└── jobs/index.ts         # 12. Scheduled Background Routines (Autonomous 72h cron tasks)
```

---

### 5.3 Top 3 Likely Examiner Questions & Exact Rehearsed Answers (Member 3)

#### Q1: "What is a Modular Monolith, and why is it superior to Microservices for this university project?"
> **Rehearsed Answer (Member 3):**  
> *"A Modular Monolith is an architectural pattern where the entire application runs as a single deployable artifact, but its internal codebase is strictly partitioned into independent, loosely coupled domain modules with explicit boundaries.  
> Microservices introduce massive distributed systems overhead: network latency between services, distributed transaction complexities (Two-Phase Commit / Sagas), container orchestration (Kubernetes), and high cloud hosting costs.  
> For a university campus ecosystem like UNN, a Modular Monolith provides the perfect balance: it delivers 100% of the clean domain boundaries and testability of microservices while executing in-memory with sub-millisecond inter-module communication, single-database ACID transaction safety, and zero deployment friction on a single virtual server."*

#### Q2: "How does your system prevent malicious users from uploading harmful scripts disguised as hostel pictures?"
> **Rehearsed Answer (Member 3):**  
> *"We enforce a multi-stage security pipeline in `src/modules/media/`:  
> 1. **Magic-Byte Header Verification:** We do not trust file extensions like `.jpg` or `.png` because an attacker can rename `shell.php` or `malware.exe`. We inspect the binary buffer's first 4 to 8 magic bytes (e.g. `\xFF\xD8\xFF` for JPEG, `\x89\x50\x4E\x47` for PNG). Any non-matching file is immediately aborted.  
> 2. **Sharp Image Re-Encoding & EXIF GPS Scrubbing:** Valid buffers are passed to the `sharp` image processing pipeline. Sharp decompresses the raw pixels and recompresses them into optimized WebP formats at 80% quality, generating a 400px thumbnail. This process inherently strips all malicious payload embeddings, PHP shell strings, and sensitive EXIF camera metadata."*

#### Q3: "How is Role-Based Access Control (RBAC) enforced across API routes?"
> **Rehearsed Answer (Member 3):**  
> *"RBAC is enforced hierarchically at two layers:  
> First, at the **HTTP Middleware & Controller Layer**, where incoming requests must provide valid JWT cookies. The token payload contains the user's authenticated `role` (`student`, `landlord`, or `admin`).  
> Second, at the **Domain Policy Layer** inside each module's `<module>.policy.ts`. Before a service executes an action, it invokes a policy check. For example, `bookingsPolicy.canApprove(user, booking)` validates that the calling user has role `'landlord'` AND is the verified owner of the specific hostel being booked. Even if a student crafts a direct HTTP `POST` request to an approval endpoint, the policy layer rejects it with a `403 Forbidden` error."*

---

# SECTION 6: DOCKER SETUP, 1-CLICK SCRIPTS & POST-DEFENSE SUBMISSION PROTOCOL

### 6.1 Docker Compose Configuration (`docker-compose.yml`)
This file is pre-configured in the project root to spin up PostgreSQL and Adminer with zero manual setup.

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: ulo_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: ulo
    ports:
      - "5433:5432"
    volumes:
      - ulo_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d ulo"]
      interval: 3s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:latest
    container_name: ulo_adminer
    restart: always
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  ulo_pgdata:
```

---

### 6.2 1-Click Startup & Shutdown Scripts

#### Linux / macOS: `start_all.sh`
```bash
#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🚀 Starting Ụlọ Defense Stack..."
docker compose up -d postgres adminer
until docker compose ps postgres | grep -q "(healthy)"; do sleep 1; done

echo "📦 Synchronizing Database Schema..."
npm run db:push || true

echo "🌱 Seeding Demonstration Accounts..."
npm run db:seed || true

echo "✅ System Ready: http://localhost:3000 | Adminer: http://localhost:8080"
exec npm run dev
```

#### Windows: `start_all.bat`
```batch
@echo off
TITLE Ulo Project Defense 1-Click Launcher
CLS
echo [1/3] Starting Docker Database and Adminer...
docker compose up -d postgres adminer
timeout /t 5 /nobreak >nul
echo [2/3] Synchronizing Database Schema...
call npm run db:push
echo [3/3] Seeding University Demonstration Data...
call npm run db:seed
echo.
echo ========================================================================
echo   SYSTEM READY FOR DEFENSE: http://localhost:3000
echo   Adminer Web DB GUI:       http://localhost:8080
echo ========================================================================
call npm run dev
```

---

### 6.3 Post-Defense Submission Protocol (Department of Computer Science Guidelines)
Failure to adhere strictly to the post-defense protocol forfeits final grading. Follow these steps immediately after the panel concludes:

1. **Immediate Action (Hall Exit):**
   - Retrieve all soft-bound copies from the panel members.
   - Do not lose any copy containing examiner red-pen corrections or margin remarks.
2. **3-Day Supervisor Correction Window:**
   - Meet with your supervisor, **Dr. Mrs. Adaora Obayi**, within 72 hours of defense completion.
   - Present a tabular itemization of all corrections noted by the examiners alongside the amended manuscript sections.
   - Obtain formal supervisor endorsement and signature on the Approval Page.
3. **Four (4) Black Hard-Bound Copies Specifications:**
   - **Cover Color:** Black Rexine hard cover.
   - **Spine Lettering:** Gold embossed lettering displaying: `[Project Title]`, `[Group A / Student Names]`, `[B.Sc. Computer Science]`, `[2026]`.
   - **Distribution Allocation:**
     * **Copy 1:** Project Supervisor (Dr. Mrs. Adaora Obayi) for final grading.
     * **Copy 2:** General Office (submitted to Mr. Iyke) for departmental records.
     * **Copy 3:** Departmental Library archive.
     * **Copy 4:** Group Personal Archive (retained for personal records and NYSC mobilization).
4. **Two (2) Archive CDs:**
   - Enclosed in durable plastic jewel cases and securely cellotaped inside the back cover of Copy 2 and Copy 3.
   - **CD Labeling:** Laser-printed or permanent marker indicating: Project Title, Group Members, Reg Numbers, Supervisor, Department, and Date.
   - **Mandatory CD Contents:**
     * `Report/`: Complete project report in both editable Microsoft Word (`.docx`) and Adobe PDF (`.pdf`) formats.
     * `SourceCode/`: Complete, uncompiled source code repository (exclude `node_modules/` and `.next/` build artifacts).
     * `Screenshots/`: High-resolution PNG screenshots of all input forms, database tables, and system outputs.
     * `Presentation/`: The official 6-slide PowerPoint presentation deck (`.pptx`).
5. **Strict Deadline:**
   - All submissions to Mr. Iyke in the General Office must be concluded on or before **Wednesday, November 4, 2026**.
   - No extensions or excuses will be granted by the Departmental Defense Board.

---
*Manual compiled and verified for Department of Computer Science, University of Nigeria, Nsukka.*
