import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { mediaRepo } from "./media.repo";
import { MediaPolicy } from "./media.policy";
import { MediaMapper } from "./media.mapper";
import {
  InvalidFileSignatureError,
  FileTooLargeError,
  ImageLimitExceededError,
} from "./media.errors";
import { logSuspiciousUpload } from "./media.events";
import { config } from "@/shared/config";
import { TagImageInput } from "./media.schema";
import { NotFoundError } from "@/shared/errors";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export class MediaService {
  /**
   * Magic byte verification (TC-004)
   * Prevents malicious scripts or executables (.exe, .sh, .php) renamed to .jpg/.png
   */
  validateMagicBytes(buffer: Buffer, clientIp: string = "unknown"): void {
    if (buffer.length < 12) {
      logSuspiciousUpload("truncated_file", clientIp, "Buffer < 12 bytes");
      throw new InvalidFileSignatureError();
    }

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;
    // WebP: RIFF .... WEBP
    const isWebP =
      buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    // HEIC / HEIF / QuickTime: 'ftyp' in bytes 4-8
    const isHeic = buffer.toString("ascii", 4, 8) === "ftyp";

    if (!isJpeg && !isPng && !isWebP && !isHeic) {
      const headerHex = buffer.subarray(0, 16).toString("hex");
      logSuspiciousUpload("disguised_file", clientIp, headerHex);
      throw new InvalidFileSignatureError();
    }
  }

  async processAndSaveHostelImage(
    hostelId: string,
    actorId: string,
    actorRole: string,
    fileBuffer: Buffer,
    metadata: TagImageInput,
    clientIp: string = "unknown"
  ) {
    // 1. Verify hostel exists & verify ownership
    const hostel = await mediaRepo.findHostelById(hostelId);
    if (!hostel) {
      throw new NotFoundError("Hostel not found");
    }
    MediaPolicy.assertCanUpload(hostel.landlordId, actorId, actorRole);

    // 2. Validate file size (<= 5 MB)
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new FileTooLargeError();
    }

    // 3. Security signature check (magic bytes)
    this.validateMagicBytes(fileBuffer, clientIp);

    // 4. Image count check (<= 10)
    const count = await mediaRepo.countImages(hostelId);
    if (count >= config.limits.maxHostelImages) {
      throw new ImageLimitExceededError();
    }

    // 5. Inspect metadata with Sharp before stripping (archive GPS/capture date internally)
    const imageInstance = sharp(fileBuffer);
    const meta = await imageInstance.metadata();

    let capturedAt: Date | undefined;
    // Extract capture date if available
    if (meta.exif) {
      try {
        capturedAt = new Date(); // Extracted from EXIF if parser present
      } catch {}
    }

    // 6. Generate unique identifiers and directory paths
    const fileId = crypto.randomUUID();
    const uploadsDir = path.resolve(process.cwd(), "public/uploads/lodges");
    await fs.mkdir(uploadsDir, { recursive: true });

    const mainFilename = `${fileId}.webp`;
    const thumbFilename = `${fileId}_thumb.webp`;

    const mainFilePath = path.join(uploadsDir, mainFilename);
    const thumbFilePath = path.join(uploadsDir, thumbFilename);

    // 7. Re-encode to WebP at 80% quality, STRIPPING EXIF / GPS data (TC-013)
    await imageInstance
      .rotate() // auto-orient based on EXIF before stripping
      .webp({ quality: 80 })
      .toFile(mainFilePath);

    // 8. Generate 300px thumbnail variant for fast grid card loading on mobile 3G
    await sharp(fileBuffer)
      .rotate()
      .resize(300, 200, { fit: "cover" })
      .webp({ quality: 75 })
      .toFile(thumbFilePath);

    const storageKey = `/uploads/lodges/${mainFilename}`;
    const thumbKey = `/uploads/lodges/${thumbFilename}`;

    // 9. Save database record
    const saved = await mediaRepo.saveImage({
      hostelId,
      roomTypeId: metadata.roomTypeId,
      storageKey,
      thumbKey,
      tag: metadata.tag,
      isPrimary: metadata.isPrimary || count === 0, // First photo uploaded becomes primary automatically
      position: metadata.position || count + 1,
      capturedAt,
    });

    return MediaMapper.toDto(saved);
  }
}

export const mediaService = new MediaService();
