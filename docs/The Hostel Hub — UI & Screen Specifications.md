# The Hostel Hub — UI/UX & Screen Specifications

This document defines the complete visual and interactive component specification for **The Hostel Hub**, incorporating the real-world UI design benchmarks (inspired by the high-conversion sports/court reservation layout by Dharaka Pranamya and modern real estate mobile flows by Sarup Halder & Sk Abu Hasan).

---

## 1. Design Language & Tokens

* **Primary Color (Academic Trust):** Emerald Green (`#059669` / `bg-emerald-600`)
* **Background Canvas:** Crisp Slate White (`#F8FAFC` / `bg-slate-50`)
* **Card Surfaces:** Pure White (`#FFFFFF`) with subtle border (`border-slate-200/80`)
* **Text / Ink:** Deep Slate (`#0F172A` for headings, `#475569` for body/metadata)
* **Status Colors:**
  * Approved / Verified: Emerald (`#059669`)
  * Pending / Expiry Warning: Golden Amber (`#D97706`)
  * Cancelled / Rejected: Rose Red (`#E11D48`)
* **Typography:**
  * Headings: `Plus Jakarta Sans` / `Outfit` (Bold, geometric)
  * Numbers & Interface: `Inter` (Precise tabular currency formatting: `₦220,000 / yr`)

---

## 2. Core Screen Recreations

### Screen 1: Student Discovery & Search (Desktop & Mobile)
* **Header Bar:**
  * Clean greeting: *"Find Your UNN Lodge"*
  * Search bar with integrated filter drawer trigger.
* **Zone Filter Pills (Horizontal Scroll):**
  * Interactive chips: `[ All ]`, `[ Behind Flat ]`, `[ Hilltop ]`, `[ Odim Gate ]`, `[ Green House ]`, `[ Ofulonu ]`.
* **Hostel Listing Card:**
  * 16:9 photo preview with swipeable indicators (dots).
  * Floating Badges: `🛡️ Verified Landlord` and `🟢 Vacant`.
  * Annual Rent: **`₦220,000 / yr`** in bold high-contrast text.
  * **Gate Proximity Badge:** e.g., `🟢 5 min to Second Gate (Behind Flat)`.
  * Amenities text: `Running Water • Standby Gen • Fenced Compound`.

---

### Screen 2: Listing Detail View (2-Column Desktop + Sticky Mobile)
* **Desktop Layout (60% Left / 40% Right):**
  * **Left Column:**
    * 1 Large Hero photo + 4-thumbnail gallery underneath (Exterior, Bedroom, Bathroom, Compound).
    * **"Facilities at Fingertips" Icon Grid:**
      * 💧 *Borehole / Running Water*
      * ⚡ *Dedicated Transformer / Generator*
      * 🛡️ *Uniformed Security*
      * 🚶 *Walking time to campus gates*
    * Full description, lodge rules (e.g. *"Gate closes at 10:00 PM"*), and location landmark text.
  * **Right Column (Floating Sticky Reservation Card):**
    * Card Title: *"Reserve A Room in This Lodge"*
    * **Interactive Room Type Selector Chips:**
      * `[ Self-Contain | ₦240,000/yr ]` (Clickable chip)
      * `[ Single Room  | ₦150,000/yr ]` (Clickable chip)
    * Real-time Vacancy counter: `2 Units Left!`
    * Action button: **`Request Booking (Free)`**.
* **Mobile Layout:**
  * Edge-to-edge photo carousel with swipe tabs.
  * Verified Landlord Profile card.
  * **Sticky Bottom Bar:** Stays permanently pinned at the bottom of the phone screen showing price (`₦240,000/yr`) and the full-width **`Request Booking (Free)`** CTA.

---

### Screen 3: "Request Booking" Sheet / Modal
* **Modal Trigger:** Opens when student taps *"Request Booking"*.
* **Contents:**
  * Selected Room Type preview (`Self-Contain — ₦240,000/yr`).
  * Student Academic Info pre-filled (`Name`, `UNN Reg Number`, `Department`).
  * Target Academic Session: `2025/2026 Academic Session`.
  * Optional student note textarea for the landlord.
  * Notice: *"Never pay rent before physical inspection. Reservation is 100% free."*
  * Button: **`Submit Free Reservation`**.

---

### Screen 4: Student "My Bookings" Tracker
* **Segmented Status Tabs:**
  * `[ Pending Requests (2) ]` | `[ Approved (1) ]` | `[ Past / Cancelled ]`
* **Pending Card Elements:**
  * Thumbnail, hostel title, room type, session.
  * Pulsing Amber status badge: `🟡 Pending Landlord Decision`.
  * Live **72-hour countdown progress bar**.
  * Action: `[ Cancel Request ]`.
* **Approved Card Elements:**
  * Green badge: `🟢 Approved! Congratulations`.
  * **Unlocked Landlord Information:**
    * Landlord name and verified phone number.
    * One-tap actions: **`Call Landlord`** & **`WhatsApp`**.
    * Exact street address in Nsukka.

---

### Screen 5: Landlord Dashboard & Booking Inbox
* **Occupancy Summary Bar:**
  * Visual progress bar: `Total Units: 16 | Occupied: 13 | Vacant: 3`.
* **Incoming Booking Requests:**
  * Cards showing student name, department, registration number, requested room type, and student note.
  * Action Buttons: **`[ ✓ Approve ]`**, **`[ ✕ Reject ]`**, and **`[ Defer (with note) ]`**.

---

### Screen 6: Admin Split-Screen Verification Console (Desktop)
* **Left Pane (50%):** Embedded Document Viewer displaying landlord government ID, property deed, or caretaker Letter of Authority.
* **Right Pane (50%):** Landlord profile, phone normalization check, duplicate photo detection alerts, and action buttons (`[ ✓ Verify Landlord ]`, `[ ✕ Reject with reason ]`).
