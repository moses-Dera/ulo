import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// Load .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const s3Client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

async function syncLodgeImages() {
  console.log("🚀 Syncing local lodge media files to Supabase Storage bucket 'ulo'...\n");

  const localLodgesDir = path.resolve(process.cwd(), "public/images/lodges");
  const files = fs.readdirSync(localLodgesDir);

  let uploadedCount = 0;

  for (const filename of files) {
    const filePath = path.join(localLodgesDir, filename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const fileBuffer = fs.readFileSync(filePath);
    const key = `images/lodges/${filename}`;

    console.log(`-> Uploading ${filename} (${(stat.size / 1024).toFixed(1)} KB) -> s3://ulo/${key}...`);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: "ulo",
        Key: key,
        Body: fileBuffer,
        ContentType: "image/webp",
      })
    );

    uploadedCount++;
  }

  console.log(`\n✅ Synced ${uploadedCount} lodge photography assets to Supabase Storage!`);
  console.log(`Public CDN Base URL: https://rkfjmokmtovotbrcizqi.supabase.co/storage/v1/object/public/ulo/images/lodges/`);
}

syncLodgeImages().catch((err) => {
  console.error("❌ Media sync failed:", err);
  process.exit(1);
});
