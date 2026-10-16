import { db } from "./index";
import {
  users,
  students,
  landlords,
  academicSessions,
  campusGates,
  zones,
  amenities,
  hostels,
  hostelGateDistances,
  hostelAmenities,
  roomTypes,
  hostelImages,
  bookings,
} from "./schema";
import { hashPassword } from "../security/password";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Ụlọ database seed...");

  // 1. Seed Academic Session
  console.log("-> Seeding Academic Session...");
  const [currentSession] = await db
    .insert(academicSessions)
    .values({
      label: "2025/2026",
      startDate: new Date("2025-10-01T00:00:00Z"),
      endDate: new Date("2026-07-31T23:59:59Z"),
      isCurrent: true,
    })
    .onConflictDoUpdate({
      target: academicSessions.label,
      set: { isCurrent: true },
    })
    .returning();

  // 2. Seed UNN Campus Gates
  console.log("-> Seeding UNN Campus Gates...");
  const gatesData = [
    { name: "Second Gate", latitude: "6.8687200", longitude: "7.4093500" },
    { name: "Hilltop Gate", latitude: "6.8775000", longitude: "7.4112000" },
    { name: "Odim Gate", latitude: "6.8621000", longitude: "7.4189000" },
    { name: "Main Gate (Abuja)", latitude: "6.8582000", longitude: "7.4051000" },
  ];

  const seededGates = await Promise.all(
    gatesData.map(async (g) => {
      const [record] = await db
        .insert(campusGates)
        .values(g)
        .onConflictDoUpdate({
          target: campusGates.name,
          set: { latitude: g.latitude, longitude: g.longitude },
        })
        .returning();
      return record;
    })
  );

  const gateMap = new Map(seededGates.map((g) => [g.name, g.id]));

  // 3. Seed 6 Nsukka Lodging Zones
  console.log("-> Seeding 6 Nsukka Lodging Zones...");
  const zonesData = [
    { name: "Behind Flat", refLat: "6.8695000", refLng: "7.4120000" },
    { name: "Hilltop", refLat: "6.8790000", refLng: "7.4135000" },
    { name: "Odim Gate", refLat: "6.8635000", refLng: "7.4205000" },
    { name: "Green House", refLat: "6.8820000", refLng: "7.4100000" },
    { name: "Ofulonu", refLat: "6.8600000", refLng: "7.4240000" },
    { name: "Umunkaka", refLat: "6.8540000", refLng: "7.4090000" },
  ];

  await Promise.all(
    zonesData.map((z) =>
      db
        .insert(zones)
        .values(z)
        .onConflictDoUpdate({
          target: zones.name,
          set: { refLat: z.refLat, refLng: z.refLng },
        })
    )
  );

  // 4. Seed Amenities
  console.log("-> Seeding Amenities...");
  const amenitiesList = [
    "Borehole / Running Water",
    "Dedicated Transformer",
    "Standby Generator",
    "Uniformed Security Guard",
    "Fenced Compound & Gate",
    "Pre-paid Meter",
    "Personal Kitchenette",
    "Waste Disposal Service",
    "POP Ceiling & Tiled Floor",
    "Motorable Access Road",
  ];

  const seededAmenities = await Promise.all(
    amenitiesList.map(async (name) => {
      const [item] = await db
        .insert(amenities)
        .values({ name })
        .onConflictDoUpdate({
          target: amenities.name,
          set: { name },
        })
        .returning();
      return item;
    })
  );

  // 5. Seed Super Admin
  console.log("-> Seeding Super Admin Account...");
  const adminPasswordHash = await hashPassword("SuperAdmin123!");
  const [adminUser] = await db
    .insert(users)
    .values({
      email: "admin@ulo.ng",
      fullName: "Super Admin (Group A)",
      passwordHash: adminPasswordHash,
      phone: "+2348011223344",
      role: "admin",
      status: "active",
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { status: "active" },
    })
    .returning();

  // 6. Seed Landlords
  console.log("-> Seeding Landlords & Hostels...");
  const landlordPasswordHash = await hashPassword("Landlord123!");

  // Landlord 1: Verified
  const [l1User] = await db
    .insert(users)
    .values({
      email: "okey.nnamdi@example.com",
      fullName: "Chief Okey Nnamdi",
      passwordHash: landlordPasswordHash,
      phone: "+2348033001122",
      role: "landlord",
      status: "active",
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({ target: users.email, set: { status: "active" } })
    .returning();

  await db
    .insert(landlords)
    .values({
      userId: l1User.id,
      verificationStatus: "verified",
      verificationReason: "Verified with National Identity Card and Certificate of Occupancy",
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
      idDocumentHash: "hash_okey_nin_verified_1234",
    })
    .onConflictDoUpdate({
      target: landlords.userId,
      set: { verificationStatus: "verified" },
    });

  // Landlord 2: Verified
  const [l2User] = await db
    .insert(users)
    .values({
      email: "emeka.ugwu@example.com",
      fullName: "Engr. Emeka Ugwu",
      passwordHash: landlordPasswordHash,
      phone: "+2348055443322",
      role: "landlord",
      status: "active",
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({ target: users.email, set: { status: "active" } })
    .returning();

  await db
    .insert(landlords)
    .values({
      userId: l2User.id,
      verificationStatus: "verified",
      verificationReason: "Verified property deed with Student Affairs stamp",
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
      idDocumentHash: "hash_emeka_deed_verified_5678",
    })
    .onConflictDoUpdate({
      target: landlords.userId,
      set: { verificationStatus: "verified" },
    });

  // Landlord 3: Verified
  const [l3User] = await db
    .insert(users)
    .values({
      email: "ngozi.eze@example.com",
      fullName: "Mrs. Ngozi Eze",
      passwordHash: landlordPasswordHash,
      phone: "+2348077665544",
      role: "landlord",
      status: "active",
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({ target: users.email, set: { status: "active" } })
    .returning();

  await db
    .insert(landlords)
    .values({
      userId: l3User.id,
      verificationStatus: "verified",
      verificationReason: "Owner verified with Lagos driver's license and local deed",
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: landlords.userId,
      set: { verificationStatus: "verified" },
    });

  // Seed Hostel 1 (Behind Flat - St. Jude's Luxury Lodge)
  const [hostel1] = await db
    .insert(hostels)
    .values({
      landlordId: l1User.id,
      title: "St. Jude's Luxury Lodge",
      description:
        "Modern, serene lodge located in the heart of Behind Flat. Featuring constant borehole water, dedicated private generator, uniform security guards, and fully tiled rooms with private kitchenettes and balconies.",
      rules: "Gate firmly locked at 10:30 PM. No unauthorized subletting. Keep common corridors clean.",
      zone: "Behind Flat",
      streetText: "Behind Flat, directly opposite Franco Annex Junction",
      exactAddress: "Plot 14, Franco Extension Road, Behind Flat, UNN Nsukka",
      nearestGateId: gateMap.get("Second Gate"),
      walkTimeBand: "under_5_min",
      latitude: "6.8698000",
      longitude: "7.4118000",
      mapsUrl: "https://maps.google.com/?q=6.8698000,7.4118000",
      locationVerified: true,
      status: "published",
    })
    .returning();

  // Hostel 1 Gate Distances
  await db.insert(hostelGateDistances).values([
    { hostelId: hostel1.id, gateId: gateMap.get("Second Gate")!, distanceM: 350 },
    { hostelId: hostel1.id, gateId: gateMap.get("Hilltop Gate")!, distanceM: 1400 },
    { hostelId: hostel1.id, gateId: gateMap.get("Odim Gate")!, distanceM: 1250 },
    { hostelId: hostel1.id, gateId: gateMap.get("Main Gate (Abuja)")!, distanceM: 1600 },
  ]);

  // Hostel 1 Amenities
  await db.insert(hostelAmenities).values(
    seededAmenities.slice(0, 7).map((a) => ({
      hostelId: hostel1.id,
      amenityId: a.id,
    }))
  );

  // Hostel 1 Room Types
  const [h1Room1] = await db
    .insert(roomTypes)
    .values({
      hostelId: hostel1.id,
      label: "Self-Contain (Tiled, Balcony)",
      annualRent: "280000.00",
      totalUnits: 12,
      description: "Spacious ensuite room with tiled floors, modern sanitary ware, and private kitchen area.",
    })
    .returning();

  const [h1Room2] = await db
    .insert(roomTypes)
    .values({
      hostelId: hostel1.id,
      label: "Single Room",
      annualRent: "170000.00",
      totalUnits: 8,
      description: "Comfortable private single room with shared premium bathroom and water heater.",
    })
    .returning();

  // Hostel 1 Images
  await db.insert(hostelImages).values([
    {
      hostelId: hostel1.id,
      storageKey: "/images/lodges/st-judes-exterior.webp",
      thumbKey: "/images/lodges/st-judes-exterior-thumb.webp",
      tag: "exterior",
      isPrimary: true,
      position: 1,
    },
    {
      hostelId: hostel1.id,
      roomTypeId: h1Room1.id,
      storageKey: "/images/lodges/st-judes-room.webp",
      thumbKey: "/images/lodges/st-judes-room-thumb.webp",
      tag: "room",
      isPrimary: false,
      position: 2,
    },
    {
      hostelId: hostel1.id,
      storageKey: "/images/lodges/st-judes-bath.webp",
      thumbKey: "/images/lodges/st-judes-bath-thumb.webp",
      tag: "bathroom",
      isPrimary: false,
      position: 3,
    },
    {
      hostelId: hostel1.id,
      storageKey: "/images/lodges/st-judes-kitchen.webp",
      thumbKey: "/images/lodges/st-judes-kitchen-thumb.webp",
      tag: "kitchen_or_other",
      isPrimary: false,
      position: 4,
    },
  ]);

  // Seed Hostel 2 (Hilltop - Hilltop Heights Residency)
  const [hostel2] = await db
    .insert(hostels)
    .values({
      landlordId: l2User.id,
      title: "Hilltop Heights Residency",
      description:
        "Premier student accommodation in Hilltop. Only 4 minutes walk to Hilltop Gate (Charly's Gate). High perimeter fence, quiet study ambiance, and borehole with constant pumping schedule.",
      rules: "No loud music after 9 PM. Generator runs from 7 PM to 11 PM daily.",
      zone: "Hilltop",
      streetText: "Hilltop, 100m past Charly's Gate towards Odobido",
      exactAddress: "22 Hilltop Gate Link Road, Nsukka",
      nearestGateId: gateMap.get("Hilltop Gate"),
      walkTimeBand: "under_5_min",
      latitude: "6.8782000",
      longitude: "7.4125000",
      mapsUrl: "https://maps.google.com/?q=6.8782000,7.4125000",
      locationVerified: true,
      status: "published",
    })
    .returning();

  await db.insert(hostelGateDistances).values([
    { hostelId: hostel2.id, gateId: gateMap.get("Hilltop Gate")!, distanceM: 280 },
    { hostelId: hostel2.id, gateId: gateMap.get("Second Gate")!, distanceM: 1300 },
    { hostelId: hostel2.id, gateId: gateMap.get("Odim Gate")!, distanceM: 1800 },
    { hostelId: hostel2.id, gateId: gateMap.get("Main Gate (Abuja)")!, distanceM: 2100 },
  ]);

  await db.insert(hostelAmenities).values(
    seededAmenities.slice(0, 6).map((a) => ({
      hostelId: hostel2.id,
      amenityId: a.id,
    }))
  );

  const [h2Room1] = await db
    .insert(roomTypes)
    .values({
      hostelId: hostel2.id,
      label: "Executive Self-Contain",
      annualRent: "320000.00",
      totalUnits: 10,
      description: "Generous layout with wardrobe, pre-wired AC point, and separate kitchenette.",
    })
    .returning();

  await db.insert(hostelImages).values([
    {
      hostelId: hostel2.id,
      storageKey: "/images/lodges/hilltop-exterior.webp",
      thumbKey: "/images/lodges/hilltop-exterior-thumb.webp",
      tag: "exterior",
      isPrimary: true,
      position: 1,
    },
    {
      hostelId: hostel2.id,
      roomTypeId: h2Room1.id,
      storageKey: "/images/lodges/hilltop-room.webp",
      thumbKey: "/images/lodges/hilltop-room-thumb.webp",
      tag: "room",
      isPrimary: false,
      position: 2,
    },
    {
      hostelId: hostel2.id,
      storageKey: "/images/lodges/hilltop-bath.webp",
      thumbKey: "/images/lodges/hilltop-bath-thumb.webp",
      tag: "bathroom",
      isPrimary: false,
      position: 3,
    },
    {
      hostelId: hostel2.id,
      storageKey: "/images/lodges/hilltop-compound.webp",
      thumbKey: "/images/lodges/hilltop-compound-thumb.webp",
      tag: "kitchen_or_other",
      isPrimary: false,
      position: 4,
    },
  ]);

  // Seed Hostel 3 (Odim Gate - Palm View Student Lodge)
  const [hostel3] = await db
    .insert(hostels)
    .values({
      landlordId: l3User.id,
      title: "Palm View Student Lodge",
      description:
        "Affordable and secure student lodge located along Odim Gate road. Clean environment with dedicated caretaker on ground, steady municipal water backed by private tank.",
      rules: "Lock compound gate after entry. Visitors must depart before 10:00 PM.",
      zone: "Odim Gate",
      streetText: "Odim Road, near Veterinary Faculty Junction",
      exactAddress: "5 Palm Avenue, Off Odim Gate Road, Nsukka",
      nearestGateId: gateMap.get("Odim Gate"),
      walkTimeBand: "5_to_10_min",
      latitude: "6.8640000",
      longitude: "7.4210000",
      mapsUrl: "https://maps.google.com/?q=6.8640000,7.4210000",
      locationVerified: true,
      status: "published",
    })
    .returning();

  await db.insert(hostelGateDistances).values([
    { hostelId: hostel3.id, gateId: gateMap.get("Odim Gate")!, distanceM: 450 },
    { hostelId: hostel3.id, gateId: gateMap.get("Second Gate")!, distanceM: 1550 },
    { hostelId: hostel3.id, gateId: gateMap.get("Hilltop Gate")!, distanceM: 1950 },
    { hostelId: hostel3.id, gateId: gateMap.get("Main Gate (Abuja)")!, distanceM: 1650 },
  ]);

  await db.insert(hostelAmenities).values(
    seededAmenities.slice(0, 5).map((a) => ({
      hostelId: hostel3.id,
      amenityId: a.id,
    }))
  );

  const [h3Room1] = await db
    .insert(roomTypes)
    .values({
      hostelId: hostel3.id,
      label: "Self-Contain with Kitchenette",
      annualRent: "220000.00",
      totalUnits: 14,
      description: "Standard self-contained unit with personal toilet and kitchen sink.",
    })
    .returning();

  await db.insert(hostelImages).values([
    {
      hostelId: hostel3.id,
      storageKey: "/images/lodges/palm-exterior.webp",
      thumbKey: "/images/lodges/palm-exterior-thumb.webp",
      tag: "exterior",
      isPrimary: true,
      position: 1,
    },
    {
      hostelId: hostel3.id,
      roomTypeId: h3Room1.id,
      storageKey: "/images/lodges/palm-room.webp",
      thumbKey: "/images/lodges/palm-room-thumb.webp",
      tag: "room",
      isPrimary: false,
      position: 2,
    },
    {
      hostelId: hostel3.id,
      storageKey: "/images/lodges/palm-bath.webp",
      thumbKey: "/images/lodges/palm-bath-thumb.webp",
      tag: "bathroom",
      isPrimary: false,
      position: 3,
    },
    {
      hostelId: hostel3.id,
      storageKey: "/images/lodges/palm-kitchen.webp",
      thumbKey: "/images/lodges/palm-kitchen-thumb.webp",
      tag: "kitchen_or_other",
      isPrimary: false,
      position: 4,
    },
  ]);

  // 7. Seed Students
  console.log("-> Seeding Test Students & Bookings...");
  const studentPasswordHash = await hashPassword("Password123!");

  const [s1User] = await db
    .insert(users)
    .values({
      email: "chinedu.okeke@unn.edu.ng",
      fullName: "Chinedu Okeke",
      passwordHash: studentPasswordHash,
      phone: "+2348123456789",
      role: "student",
      status: "active",
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({ target: users.email, set: { status: "active" } })
    .returning();

  await db
    .insert(students)
    .values({
      userId: s1User.id,
      regNumber: "2021/245892",
      department: "Computer Science",
    })
    .onConflictDoUpdate({
      target: students.userId,
      set: { regNumber: "2021/245892" },
    });

  const [s2User] = await db
    .insert(users)
    .values({
      email: "amaka.nwosu@unn.edu.ng",
      fullName: "Amaka Nwosu",
      passwordHash: studentPasswordHash,
      phone: "+2348134567890",
      role: "student",
      status: "active",
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({ target: users.email, set: { status: "active" } })
    .returning();

  await db
    .insert(students)
    .values({
      userId: s2User.id,
      regNumber: "2022/248102",
      department: "Mass Communication",
    })
    .onConflictDoUpdate({
      target: students.userId,
      set: { regNumber: "2022/248102" },
    });

  // Create an initial sample booking for Student 1
  const expiryTime = new Date(Date.now() + 72 * 60 * 60 * 1000);
  await db
    .insert(bookings)
    .values({
      studentId: s1User.id,
      roomTypeId: h1Room1.id,
      sessionId: currentSession.id,
      status: "PENDING",
      rentAtRequest: h1Room1.annualRent,
      studentNote: "Hello Landlord, I am a 300L CS student looking to move in by next month. Hoping to inspect this Saturday.",
      expiresAt: expiryTime,
    })
    .onConflictDoNothing();

  console.log("✅ Ụlọ database seeded successfully!");
  console.log("--------------------------------------------------");
  console.log("Super Admin: admin@ulo.ng | SuperAdmin123!");
  console.log("Landlord:    okey.nnamdi@example.com | Landlord123!");
  console.log("Student:     chinedu.okeke@unn.edu.ng | Password123!");
  console.log("--------------------------------------------------");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
