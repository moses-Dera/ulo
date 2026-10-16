# The Hostel Hub — Backend Architecture & Module Blueprint

This document specifies the technical backend architecture, directory contracts, Role-Based Access Control (RBAC), and image processing pipelines for **The Hostel Hub**.

---

## 1. Role-Based Access Control (RBAC) Matrix

Every API route and page enforces role-based permissions at the middleware and module policy layer (`*.policy.ts`):

| Feature / Resource | Visitor | Student | Landlord | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse & search published hostels | ✅ | ✅ | ✅ | ✅ |
| View public hostel details (zone, walking time, rent) | ✅ | ✅ | ✅ | ✅ |
| View landlord phone & exact address | ❌ | Unlocked **only after** booking approval | ❌ (Own hostels only) | ✅ (Always) |
| Request a room booking (max 3 concurrent) | ❌ | ✅ | ❌ | ❌ |
| Cancel own pending booking | ❌ | ✅ | ❌ | ❌ |
| View "My Bookings" tracking screen | ❌ | ✅ | ❌ | ❌ |
| Submit landlord verification documents (NIN / Deed) | ❌ | ❌ | ✅ | ❌ |
| Create hostel & add room types | ❌ | ❌ | ✅ (Verified only) | ✅ (Assisted listing) |
| Upload & tag hostel images (4–10 photos) | ❌ | ❌ | ✅ (Own hostels) | ✅ |
| Approve / Reject / Defer student booking requests | ❌ | ❌ | ✅ (Own hostels) | ❌ |
| View landlord occupancy dashboard | ❌ | ❌ | ✅ (Own hostels) | ✅ |
| Review verification queue & approve landlords | ❌ | ❌ | ❌ | ✅ |
| Moderate & publish listings queue | ❌ | ❌ | ❌ | ✅ |
| Suspend / Reactivate users | ❌ | ❌ | ❌ | ✅ |
| Access system audit log & metrics | ❌ | ❌ | ❌ | ✅ |

---

## 2. Landlord Image Upload & Processing Pipeline

Landlords upload images during hostel creation or editing:

1. **Upload Rules:**
   * Minimum: **4 images** | Maximum: **10 images**.
   * Accepted Formats: JPEG, PNG, WebP, HEIC (converted automatically).
   * Upload Limit: Up to **5 MB per file** (catering to modern smartphone cameras).
   * **Tagging Required:** Each image must be tagged with a category:
     * `exterior` (compound, gate, front view)
     * `room` (bedroom interior — at least 1 mandatory)
     * `bathroom` (toilet / bath)
     * `kitchen_or_other` (kitchen, balcony, water tank, generator)
   * **Primary Cover:** Landlord selects or drags one image to be the primary display card.

2. **Automated Server-Side Processing (`media` module with `sharp`):**
   * **Security Check:** Magic-byte signature verification (blocks `.exe` or scripts disguised as `.jpg`).
   * **Privacy & EXIF Stripping:** GPS coordinates and camera EXIF data are stripped from public images, but capture date/coordinates are archived internally for admin duplicate/fraud inspection.
   * **Optimization:** Re-encoded into modern **WebP** at 80% quality (target size: ~200 KB – 300 KB).
   * **Thumbnails:** Generates a lightweight 300px thumbnail variant for fast grid card loading on mobile 3G.

---

## 3. Module Internal Anatomy (`src/modules/<module>/`)

Each module operates as an autonomous domain unit:

```
src/modules/<module>/
├── index.ts              # Public API; only file exported to the rest of the app
├── <m>.controller.ts     # HTTP request parsing, auth context, calls service
├── <m>.service.ts        # Pure domain business logic & ACID transactions
├── <m>.repo.ts           # Database queries (Drizzle ORM) - exclusive access
├── <m>.schema.ts         # Zod schemas for request validation & sanitization
├── <m>.dto.ts            # Input / Output TypeScript interfaces
├── <m>.policy.ts         # Authorization rules (who can do what)
├── <m>.mapper.ts         # Data transformation & private field stripping
├── <m>.errors.ts         # Custom typed domain errors
├── <m>.events.ts         # Dispatched domain events
├── db/                   # Drizzle table schemas and migrations
└── jobs/                 # Cron tasks (e.g. 72-hour booking auto-expiry)
```

---

## 4. Concurrency-Safe Booking Approval Workflow

```
[ Student Requests Room ] ──► Status: PENDING (72-hour expiry timer starts)
                                      │
                         [ Landlord Reviews in Inbox ]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        [ Click REJECT / DEFER ]              [ Click APPROVE ]
                   │                                     │
           Status: REJECTED                      BEGIN TRANSACTION
           Student Notified                              │
                                              SELECT room FOR UPDATE (Lock Row)
                                                         │
                                              Vacancy Available? (Total - Approved - Blocked > 0)
                                                         │
                                           ┌─────────────┴─────────────┐
                                          YES                          NO
                                           │                            │
                                   Set APPROVED                 Throw Conflict (409)
                                   Reveal Contact Details       Rollback Transaction
                                           │
                           Auto-cancel student's other
                           PENDING requests in this session
                                           │
                           Last unit taken?
                           Auto-reject other pending requests
                                           │
                                   COMMIT TRANSACTION
```

---

## 5. Gmail API v1 Notification Architecture

All transactional emails (email verification, booking alert to landlord, booking approval to student, 72h expiry reminder) are dispatched via **Gmail API v1**:
* **Authentication:** Google OAuth2 Client ID, Client Secret, and Refresh Token.
* **Format:** RFC 2822 standard email structure with HTML templates styled in The Hostel Hub's emerald brand palette.
* **Benefits:** 100% free (up to 500 emails/day), zero spam folder relegation, and direct delivery.
