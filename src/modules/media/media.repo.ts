import { db } from "@/shared/db";
import { hostelImages, hostels } from "./db";
import { eq } from "drizzle-orm";

export class MediaRepo {
  async findHostelById(id: string) {
    const [h] = await db.select().from(hostels).where(eq(hostels.id, id)).limit(1);
    return h || null;
  }

  async countImages(hostelId: string) {
    const imgs = await db.select().from(hostelImages).where(eq(hostelImages.hostelId, hostelId));
    return imgs.length;
  }

  async saveImage(data: {
    hostelId: string;
    roomTypeId?: string | null;
    storageKey: string;
    thumbKey: string;
    tag: "exterior" | "room" | "bathroom" | "kitchen_or_other";
    isPrimary: boolean;
    position: number;
    capturedAt?: Date;
    captureLat?: string;
    captureLng?: string;
  }) {
    if (data.isPrimary) {
      // Unset previous primary
      await db
        .update(hostelImages)
        .set({ isPrimary: false })
        .where(eq(hostelImages.hostelId, data.hostelId));
    }

    const [img] = await db
      .insert(hostelImages)
      .values({
        hostelId: data.hostelId,
        roomTypeId: data.roomTypeId || null,
        storageKey: data.storageKey,
        thumbKey: data.thumbKey,
        tag: data.tag,
        isPrimary: data.isPrimary,
        position: data.position,
        capturedAt: data.capturedAt,
        captureLat: data.captureLat,
        captureLng: data.captureLng,
      })
      .returning();

    return img;
  }

  async deleteImage(imageId: string) {
    await db.delete(hostelImages).where(eq(hostelImages.id, imageId));
  }
}

export const mediaRepo = new MediaRepo();
