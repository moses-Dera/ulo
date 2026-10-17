import postgres from "postgres";
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { gmail, auth } from "@googleapis/gmail";
import fs from "fs";
import path from "path";

// Load .env.local manually
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

async function runAllTests() {
  console.log("=================================================");
  console.log("       ỤLỌ SYSTEM ENVIRONMENT TEST SUITE         ");
  console.log("=================================================\n");

  let passedCount = 0;
  let totalCount = 0;

  // -----------------------------------------------------------------
  // TEST 1: SUPABASE POSTGRESQL POOLER
  // -----------------------------------------------------------------
  totalCount++;
  console.log(">>> [1/4] Testing Supabase PostgreSQL Database...");
  const dbUrl = process.env.SUPABASE_DATABASE_URL;
  if (!dbUrl) {
    console.log("❌ SUPABASE_DATABASE_URL is not set in .env.local\n");
  } else {
    try {
      const sql = postgres(dbUrl, { connect_timeout: 10, ssl: "require" });
      const [res] = await sql`SELECT NOW() as current_time, version() as version;`;
      console.log("✅ Supabase PostgreSQL connected successfully!");
      console.log(`   Server Time: ${res.current_time}`);
      console.log(`   Engine: ${res.version.split(" ").slice(0, 2).join(" ")}`);

      // Check existing tables
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      console.log(`   Public Tables Count in Supabase DB: ${tables.length}`);
      if (tables.length > 0) {
        console.log(`   Tables: ${tables.map((t: any) => t.table_name).slice(0, 8).join(", ")}${tables.length > 8 ? "..." : ""}`);
      }
      await sql.end();
      passedCount++;
    } catch (err: any) {
      console.log(`❌ Supabase PostgreSQL connection failed: ${err.message}`);
    }
  }
  console.log("");

  // -----------------------------------------------------------------
  // TEST 2: SUPABASE S3-COMPATIBLE STORAGE
  // -----------------------------------------------------------------
  totalCount++;
  console.log(">>> [2/4] Testing Supabase S3-Compatible Storage...");
  const s3Endpoint = process.env.SUPABASE_S3_ENDPOINT;
  const s3Region = process.env.SUPABASE_S3_REGION || "eu-west-1";
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

  if (!s3Endpoint || !accessKeyId || !secretAccessKey) {
    console.log("❌ Supabase S3 credentials incomplete in .env.local\n");
  } else {
    try {
      const s3Client = new S3Client({
        endpoint: s3Endpoint,
        region: s3Region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true,
      });

      const response = await s3Client.send(new ListBucketsCommand({}));
      console.log("✅ Supabase S3 API connection successful!");
      const buckets = response.Buckets || [];
      console.log(`   Available Buckets in Storage: ${buckets.length}`);
      buckets.forEach((b) => {
        console.log(`   - Bucket: "${b.Name}" (Created: ${b.CreationDate?.toISOString()})`);
      });

      if (buckets.length > 0) {
        const testBucket = buckets[0].Name!;
        console.log(`   Testing write & read on bucket "${testBucket}"...`);
        await s3Client.send(
          new PutObjectCommand({
            Bucket: testBucket,
            Key: "ulo-test-probe.txt",
            Body: "Ụlọ campus accommodation storage connection verified.",
            ContentType: "text/plain",
          })
        );
        console.log(`   ✅ S3 Write OK: Successfully saved "ulo-test-probe.txt" to bucket "${testBucket}"!`);

        const getRes = await s3Client.send(
          new GetObjectCommand({
            Bucket: testBucket,
            Key: "ulo-test-probe.txt",
          })
        );
        const text = await getRes.Body?.transformToString();
        console.log(`   ✅ S3 Read OK: Fetched content "${text}"`);

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: testBucket,
            Key: "ulo-test-probe.txt",
          })
        );
        console.log(`   ✅ S3 Cleanup: Successfully removed test probe from bucket "${testBucket}".`);
      }
      passedCount++;
    } catch (err: any) {
      console.log(`❌ Supabase S3 connection failed: ${err.message}`);
    }
  }
  console.log("");

  // -----------------------------------------------------------------
  // TEST 3: SUPABASE CLIENT SDK (REST API)
  // -----------------------------------------------------------------
  totalCount++;
  console.log(">>> [3/4] Testing Supabase Client SDK...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("❌ Supabase URL or Anon Key missing in .env.local\n");
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.log(`⚠️ Supabase Client connected, but listBuckets note: ${bucketError.message}`);
      } else {
        console.log("✅ Supabase Client SDK connected successfully!");
        console.log(`   Visible Storage Buckets: ${bucketList.length}`);
        bucketList.forEach((b) => console.log(`   - ${b.name} (Public: ${b.public})`));
      }
      passedCount++;
    } catch (err: any) {
      console.log(`❌ Supabase Client SDK test failed: ${err.message}`);
    }
  }
  console.log("");

  // -----------------------------------------------------------------
  // TEST 4: GOOGLE OAUTH2 & GMAIL API
  // -----------------------------------------------------------------
  totalCount++;
  console.log(">>> [4/4] Testing Google OAuth2 & Gmail API Credentials...");
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const emailFrom = process.env.EMAIL_FROM || process.env.GMAIL_USER;

  if (!clientId || !clientSecret || !refreshToken) {
    console.log("❌ Google OAuth credentials incomplete in .env.local\n");
  } else {
    try {
      const oauth2Client = new auth.OAuth2(
        clientId,
        clientSecret,
        "https://developers.google.com/oauthplayground"
      );
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      // Attempt to retrieve a fresh access token
      const tokenRes = await oauth2Client.getAccessToken();
      if (tokenRes.token) {
        console.log("✅ Google OAuth2 refresh token verified & active access token generated!");
        console.log(`   Configured Sender: ${emailFrom}`);

        const gmailClient = gmail({ version: "v1", auth: oauth2Client });
        try {
          const profile = await gmailClient.users.getProfile({ userId: "me" });
          console.log(`   Authenticated Gmail Mailbox: ${profile.data.emailAddress}`);
          console.log(`   Total Messages in Mailbox: ${profile.data.messagesTotal}`);
        } catch (profileErr: any) {
          console.log(`   (Profile query note: ${profileErr.message})`);
        }
        passedCount++;
      } else {
        console.log("❌ Failed to obtain access token from Google OAuth2");
      }
    } catch (err: any) {
      console.log(`❌ Google OAuth2 / Gmail API authentication failed: ${err.message}`);
    }
  }
  console.log("");

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log("=================================================");
  console.log(`TEST SUMMARY: ${passedCount}/${totalCount} SERVICE CHECKS PASSED`);
  console.log("=================================================");

  if (passedCount === totalCount) {
    console.log("🎉 ALL SERVICES CONNECTED & AUTHENTICATED SUCCESSFULLY!");
  }
}

runAllTests().catch((e) => {
  console.error("FATAL ERROR IN TEST SUITE:", e);
  process.exit(1);
});
