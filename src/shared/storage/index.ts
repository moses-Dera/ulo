import fs from "fs/promises";
import path from "path";
import { config } from "@/shared/config";
import { logger } from "@/shared/logger";

export interface UploadFileOptions {
  bucket: "public" | "private";
  folder: "lodges" | "verifications";
  filename: string;
  buffer: Buffer;
  contentType: string;
}

export interface UploadResult {
  storageKey: string;
  url: string;
}

export interface StorageDriver {
  upload(options: UploadFileOptions): Promise<UploadResult>;
  getUrl(storageKey: string, bucket?: "public" | "private"): Promise<string>;
}

/**
 * Local Storage Driver (Default for Development / Localhost)
 * Writes files directly to local disk under public/uploads/{folder}/
 * Instantaneous, offline-ready, zero cloud cost.
 */
class LocalStorageDriver implements StorageDriver {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), "public/uploads");
  }

  async upload(options: UploadFileOptions): Promise<UploadResult> {
    const targetDir = path.join(this.baseDir, options.folder);
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, options.filename);
    await fs.writeFile(filePath, options.buffer);

    const storageKey = `/uploads/${options.folder}/${options.filename}`;
    return {
      storageKey,
      url: storageKey,
    };
  }

  async getUrl(storageKey: string): Promise<string> {
    // In local development, the storageKey is already a web-accessible route
    return storageKey;
  }
}

/**
 * Supabase Storage Driver (For Cloud / Production)
 * Uses Supabase Storage REST API for public & private buckets.
 * - Public bucket ("hostel-images"): free global CDN, public URLs.
 * - Private bucket ("verification-documents"): sensitive landlord NIN/Deeds with signed URLs.
 */
class SupabaseStorageDriver implements StorageDriver {
  private supabaseUrl: string;
  private serviceKey: string;
  private publicBucket: string;
  private privateBucket: string;

  constructor() {
    this.supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
    this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
    this.publicBucket = process.env.SUPABASE_STORAGE_PUBLIC_BUCKET || "hostel-images";
    this.privateBucket = process.env.SUPABASE_STORAGE_PRIVATE_BUCKET || "verification-documents";
  }

  private isConfigured(): boolean {
    return !!(this.supabaseUrl && this.serviceKey);
  }

  async upload(options: UploadFileOptions): Promise<UploadResult> {
    if (!this.isConfigured()) {
      logger.warn(
        "[Storage] Supabase credentials not found. Falling back to local storage driver.",
        "StorageService"
      );
      const fallback = new LocalStorageDriver();
      return fallback.upload(options);
    }

    const bucketName = options.bucket === "public" ? this.publicBucket : this.privateBucket;
    const objectPath = `${options.folder}/${options.filename}`;

    const uploadEndpoint = `${this.supabaseUrl}/storage/v1/object/${bucketName}/${objectPath}`;

    const res = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        "Content-Type": options.contentType,
        "x-upsert": "true",
      },
      body: new Uint8Array(options.buffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error(`[Storage] Supabase upload failed (${res.status}): ${errText}`, "StorageService");
      throw new Error(`Failed to upload to Supabase Storage: ${res.statusText}`);
    }

    if (options.bucket === "public") {
      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`;
      return {
        storageKey: publicUrl,
        url: publicUrl,
      };
    } else {
      // Private bucket: store object path as storageKey
      return {
        storageKey: `${bucketName}/${objectPath}`,
        url: `${bucketName}/${objectPath}`,
      };
    }
  }

  async getUrl(storageKey: string, bucket: "public" | "private" = "public"): Promise<string> {
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://") || storageKey.startsWith("/uploads/")) {
      return storageKey;
    }

    if (!this.isConfigured()) {
      return storageKey;
    }

    if (bucket === "public") {
      return `${this.supabaseUrl}/storage/v1/object/public/${storageKey}`;
    }

    // Generate signed URL (expires in 15 mins / 900 seconds) for private audit documents
    try {
      const signEndpoint = `${this.supabaseUrl}/storage/v1/object/sign/${storageKey}`;
      const res = await fetch(signEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          apikey: this.serviceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 900 }),
      });

      if (res.ok) {
        const data = await res.json();
        return `${this.supabaseUrl}/storage/v1${data.signedURL}`;
      }
    } catch (e) {
      logger.error(`[Storage] Error creating signed URL for ${storageKey}`, "StorageService", { error: e });
    }

    return storageKey;
  }
}

/**
 * Storage Factory: Automatically picks driver based on environment
 */
function createStorageDriver(): StorageDriver {
  const driverType = process.env.STORAGE_DRIVER || "local";

  if (driverType === "supabase" && (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    logger.info("[Storage] Using Supabase Storage driver", "StorageService");
    return new SupabaseStorageDriver();
  }

  // Default to local storage driver on localhost
  return new LocalStorageDriver();
}

export const storageService = createStorageDriver();
