CREATE TABLE "academic_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	CONSTRAINT "academic_sessions_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "amenities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"meta" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banned_identifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"identifier_value" varchar(255) NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"room_type_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"rent_at_request" numeric(12, 2) NOT NULL,
	"student_note" text,
	"decision_note" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"decided_at" timestamp,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_gates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	CONSTRAINT "campus_gates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hostel_amenities" (
	"hostel_id" uuid NOT NULL,
	"amenity_id" uuid NOT NULL,
	CONSTRAINT "hostel_amenities_hostel_id_amenity_id_pk" PRIMARY KEY("hostel_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "hostel_gate_distances" (
	"hostel_id" uuid NOT NULL,
	"gate_id" uuid NOT NULL,
	"distance_m" integer NOT NULL,
	CONSTRAINT "hostel_gate_distances_hostel_id_gate_id_pk" PRIMARY KEY("hostel_id","gate_id")
);
--> statement-breakpoint
CREATE TABLE "hostel_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hostel_id" uuid NOT NULL,
	"room_type_id" uuid,
	"storage_key" varchar(500) NOT NULL,
	"thumb_key" varchar(500) NOT NULL,
	"tag" varchar(50) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"phash" varchar(100),
	"captured_at" timestamp,
	"capture_lat" numeric(10, 7),
	"capture_lng" numeric(10, 7)
);
--> statement-breakpoint
CREATE TABLE "hostels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landlord_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"rules" text,
	"zone" varchar(100) NOT NULL,
	"street_text" varchar(255) NOT NULL,
	"exact_address" varchar(255) NOT NULL,
	"nearest_gate_id" uuid,
	"walk_time_band" varchar(50) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"maps_url" text,
	"video_url" text,
	"location_verified" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"review_reason" text,
	"last_confirmed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landlords" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"verification_status" varchar(50) DEFAULT 'unsubmitted' NOT NULL,
	"verification_reason" text,
	"verified_by" uuid,
	"verified_at" timestamp,
	"id_document_hash" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "listing_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hostel_id" uuid NOT NULL,
	"reporter_user_id" uuid NOT NULL,
	"reason" varchar(100) NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"payload" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hostel_id" uuid NOT NULL,
	"label" varchar(100) NOT NULL,
	"annual_rent" numeric(12, 2) NOT NULL,
	"total_units" integer NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "students" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"reg_number" varchar(50) NOT NULL,
	"department" varchar(150) NOT NULL,
	CONSTRAINT "students_reg_number_unique" UNIQUE("reg_number")
);
--> statement-breakpoint
CREATE TABLE "unit_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_type_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"units_blocked" integer NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"email_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verification_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landlord_id" uuid NOT NULL,
	"doc_type" varchar(50) NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"ref_lat" numeric(10, 7),
	"ref_lng" numeric(10, 7),
	CONSTRAINT "zones_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_session_id_academic_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."academic_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_amenities" ADD CONSTRAINT "hostel_amenities_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_amenities" ADD CONSTRAINT "hostel_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_gate_distances" ADD CONSTRAINT "hostel_gate_distances_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_gate_distances" ADD CONSTRAINT "hostel_gate_distances_gate_id_campus_gates_id_fk" FOREIGN KEY ("gate_id") REFERENCES "public"."campus_gates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_images" ADD CONSTRAINT "hostel_images_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_images" ADD CONSTRAINT "hostel_images_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_landlord_id_landlords_user_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlords"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_nearest_gate_id_campus_gates_id_fk" FOREIGN KEY ("nearest_gate_id") REFERENCES "public"."campus_gates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_blocks" ADD CONSTRAINT "unit_blocks_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_blocks" ADD CONSTRAINT "unit_blocks_session_id_academic_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."academic_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_landlord_id_landlords_user_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlords"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_student_room_active" ON "bookings" USING btree ("student_id","room_type_id") WHERE status IN ('PENDING', 'APPROVED');--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_student_session_approved" ON "bookings" USING btree ("student_id","session_id") WHERE status = 'APPROVED';--> statement-breakpoint
CREATE INDEX "idx_bookings_room_status" ON "bookings" USING btree ("room_type_id","status");--> statement-breakpoint
CREATE INDEX "idx_bookings_student_status" ON "bookings" USING btree ("student_id","status");--> statement-breakpoint
CREATE INDEX "idx_bookings_pending_expires" ON "bookings" USING btree ("expires_at") WHERE status = 'PENDING';--> statement-breakpoint
CREATE INDEX "idx_bookings_status_requested_at" ON "bookings" USING btree ("status","requested_at");--> statement-breakpoint
CREATE INDEX "idx_gate_dist_hostel" ON "hostel_gate_distances" USING btree ("hostel_id");--> statement-breakpoint
CREATE INDEX "idx_gate_dist_gate" ON "hostel_gate_distances" USING btree ("gate_id");--> statement-breakpoint
CREATE INDEX "idx_hostel_images_hostel" ON "hostel_images" USING btree ("hostel_id");--> statement-breakpoint
CREATE INDEX "idx_hostels_status_zone" ON "hostels" USING btree ("status","zone");--> statement-breakpoint
CREATE INDEX "idx_hostels_landlord" ON "hostels" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "idx_room_types_hostel_rent" ON "room_types" USING btree ("hostel_id","annual_rent");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");