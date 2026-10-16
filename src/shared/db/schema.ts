import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull(), // 'student' | 'landlord' | 'admin'
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).unique().notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(), // 'active' | 'suspended'
    emailVerifiedAt: timestamp("email_verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_role").on(table.role),
    index("idx_users_status").on(table.status),
  ]
);

// 2. Students Profile Table
export const students = pgTable("students", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  regNumber: varchar("reg_number", { length: 50 }).unique().notNull(),
  department: varchar("department", { length: 150 }).notNull(),
});

// 3. Landlords Profile Table
export const landlords = pgTable("landlords", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  verificationStatus: varchar("verification_status", { length: 50 })
    .default("unsubmitted")
    .notNull(), // 'unsubmitted' | 'pending' | 'verified' | 'rejected'
  verificationReason: text("verification_reason"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  idDocumentHash: varchar("id_document_hash", { length: 255 }),
});

// 4. Verification Documents Table
export const verificationDocuments = pgTable("verification_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => landlords.userId, { onDelete: "cascade" }),
  docType: varchar("doc_type", { length: 50 }).notNull(), // 'nin' | 'drivers_license' | 'deed' | 'authority_letter'
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Academic Sessions Table
export const academicSessions = pgTable("academic_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 50 }).unique().notNull(), // e.g. "2025/2026"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isCurrent: boolean("is_current").default(false).notNull(),
});

// 6. Campus Gates Table (UNN Nsukka)
export const campusGates = pgTable("campus_gates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).unique().notNull(), // e.g. "Second Gate", "Hilltop Gate", "Odim Gate", "Main Gate"
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
});

// 7. Zones Table (6 Nsukka Lodging Zones)
export const zones = pgTable("zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).unique().notNull(), // Hilltop, Odim Gate, Behind Flat, Green House, Ofulonu, Umunkaka
  refLat: numeric("ref_lat", { precision: 10, scale: 7 }),
  refLng: numeric("ref_lng", { precision: 10, scale: 7 }),
});

// 8. Amenities Table
export const amenities = pgTable("amenities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).unique().notNull(),
});

// 9. Hostels Table
export const hostels = pgTable(
  "hostels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => landlords.userId, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    rules: text("rules"),
    zone: varchar("zone", { length: 100 }).notNull(),
    streetText: varchar("street_text", { length: 255 }).notNull(), // Public landmark text
    exactAddress: varchar("exact_address", { length: 255 }).notNull(), // Private until booking approval
    nearestGateId: uuid("nearest_gate_id").references(() => campusGates.id),
    walkTimeBand: varchar("walk_time_band", { length: 50 }).notNull(), // 'under_5_min' | '5_to_10_min' | '10_to_20_min' | '20_plus_min'
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    mapsUrl: text("maps_url"), // Private until booking approval
    locationVerified: boolean("location_verified").default(false).notNull(),
    status: varchar("status", { length: 50 }).default("draft").notNull(), // 'draft' | 'pending_review' | 'published' | 'rejected' | 'suspended'
    reviewReason: text("review_reason"),
    lastConfirmedAt: timestamp("last_confirmed_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_hostels_status_zone").on(table.status, table.zone),
    index("idx_hostels_landlord").on(table.landlordId),
  ]
);

// 10. Hostel Gate Distances (Precomputed Haversine)
export const hostelGateDistances = pgTable(
  "hostel_gate_distances",
  {
    hostelId: uuid("hostel_id")
      .notNull()
      .references(() => hostels.id, { onDelete: "cascade" }),
    gateId: uuid("gate_id")
      .notNull()
      .references(() => campusGates.id, { onDelete: "cascade" }),
    distanceM: integer("distance_m").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.hostelId, table.gateId] }),
    index("idx_gate_dist_hostel").on(table.hostelId),
    index("idx_gate_dist_gate").on(table.gateId),
  ]
);

// 11. Hostel Amenities (Many-to-Many)
export const hostelAmenities = pgTable(
  "hostel_amenities",
  {
    hostelId: uuid("hostel_id")
      .notNull()
      .references(() => hostels.id, { onDelete: "cascade" }),
    amenityId: uuid("amenity_id")
      .notNull()
      .references(() => amenities.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.hostelId, table.amenityId] }),
  ]
);

// 12. Room Types Table
export const roomTypes = pgTable(
  "room_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hostelId: uuid("hostel_id")
      .notNull()
      .references(() => hostels.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 100 }).notNull(), // e.g. "Self-Contain", "Single Room", "2-Bedroom Flat"
    annualRent: numeric("annual_rent", { precision: 12, scale: 2 }).notNull(),
    totalUnits: integer("total_units").notNull(),
    isHidden: boolean("is_hidden").default(false).notNull(),
    description: text("description"),
  },
  (table) => [
    index("idx_room_types_hostel_rent").on(table.hostelId, table.annualRent),
  ]
);

// 13. Unit Blocks Table (Off-platform occupancy)
export const unitBlocks = pgTable("unit_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomTypeId: uuid("room_type_id")
    .notNull()
    .references(() => roomTypes.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => academicSessions.id, { onDelete: "cascade" }),
  unitsBlocked: integer("units_blocked").notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Hostel Images Table
export const hostelImages = pgTable(
  "hostel_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hostelId: uuid("hostel_id")
      .notNull()
      .references(() => hostels.id, { onDelete: "cascade" }),
    roomTypeId: uuid("room_type_id").references(() => roomTypes.id, {
      onDelete: "set null",
    }),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    thumbKey: varchar("thumb_key", { length: 500 }).notNull(),
    tag: varchar("tag", { length: 50 }).notNull(), // 'exterior' | 'room' | 'bathroom' | 'kitchen_or_other'
    isPrimary: boolean("is_primary").default(false).notNull(),
    position: integer("position").default(0).notNull(),
    phash: varchar("phash", { length: 100 }),
    capturedAt: timestamp("captured_at"),
    captureLat: numeric("capture_lat", { precision: 10, scale: 7 }),
    captureLng: numeric("capture_lng", { precision: 10, scale: 7 }),
  },
  (table) => [
    index("idx_hostel_images_hostel").on(table.hostelId),
  ]
);

// 15. Bookings Table (Concurrency-safe reservation engine)
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.userId, { onDelete: "cascade" }),
    roomTypeId: uuid("room_type_id")
      .notNull()
      .references(() => roomTypes.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => academicSessions.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).default("PENDING").notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED'
    rentAtRequest: numeric("rent_at_request", { precision: 12, scale: 2 }).notNull(),
    studentNote: text("student_note"),
    decisionNote: text("decision_note"),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    decidedAt: timestamp("decided_at"),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    // Partial unique index: A student cannot have multiple active (PENDING or APPROVED) requests for the same room type
    uniqueIndex("uniq_student_room_active")
      .on(table.studentId, table.roomTypeId)
      .where(sql`status IN ('PENDING', 'APPROVED')`),
    // Partial unique index: At most 1 APPROVED booking per student per academic session
    uniqueIndex("uniq_student_session_approved")
      .on(table.studentId, table.sessionId)
      .where(sql`status = 'APPROVED'`),
    index("idx_bookings_room_status").on(table.roomTypeId, table.status),
    index("idx_bookings_student_status").on(table.studentId, table.status),
  ]
);

// 16. Listing Reports Table
export const listingReports = pgTable("listing_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id")
    .notNull()
    .references(() => hostels.id, { onDelete: "cascade" }),
  reporterUserId: uuid("reporter_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 100 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 17. Banned Identifiers Table
export const bannedIdentifiers = pgTable("banned_identifiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 50 }).notNull(), // 'phone' | 'document_hash'
  identifierValue: varchar("identifier_value", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 18. Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  payload: text("payload").notNull(), // JSON string
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// 19. Audit Logs Table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    meta: text("meta"), // JSON string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_entity").on(table.entityType, table.entityId),
    index("idx_audit_actor").on(table.actorId),
  ]
);

// -------------------------------------------------------------
// Drizzle Relations
// -------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  landlordProfile: one(landlords, {
    fields: [users.id],
    references: [landlords.userId],
  }),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const landlordsRelations = relations(landlords, ({ one, many }) => ({
  user: one(users, {
    fields: [landlords.userId],
    references: [users.id],
  }),
  hostels: many(hostels),
  documents: many(verificationDocuments),
}));

export const hostelsRelations = relations(hostels, ({ one, many }) => ({
  landlord: one(landlords, {
    fields: [hostels.landlordId],
    references: [landlords.userId],
  }),
  nearestGate: one(campusGates, {
    fields: [hostels.nearestGateId],
    references: [campusGates.id],
  }),
  roomTypes: many(roomTypes),
  images: many(hostelImages),
  amenities: many(hostelAmenities),
  gateDistances: many(hostelGateDistances),
  reports: many(listingReports),
}));

export const roomTypesRelations = relations(roomTypes, ({ one, many }) => ({
  hostel: one(hostels, {
    fields: [roomTypes.hostelId],
    references: [hostels.id],
  }),
  bookings: many(bookings),
  blocks: many(unitBlocks),
  images: many(hostelImages),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(students, {
    fields: [bookings.studentId],
    references: [students.userId],
  }),
  roomType: one(roomTypes, {
    fields: [bookings.roomTypeId],
    references: [roomTypes.id],
  }),
  session: one(academicSessions, {
    fields: [bookings.sessionId],
    references: [academicSessions.id],
  }),
}));
