import { db } from "@/shared/db";
import { campusGates, zones } from "./db";

export class LocationsRepo {
  async findAllGates() {
    return db.select().from(campusGates);
  }

  async findAllZones() {
    return db.select().from(zones);
  }

  async createGate(data: { name: string; latitude: string; longitude: string }) {
    const [gate] = await db.insert(campusGates).values(data).returning();
    return gate;
  }
}

export const locationsRepo = new LocationsRepo();
