export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Ụlọ",
    tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Curated campus living.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    env: process.env.NODE_ENV || "development",
    isDev: process.env.NODE_ENV !== "production",
  },
  db: {
    url: process.env.DATABASE_URL || "postgresql://postgres@localhost:5433/ulo",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "ulo_jwt_access_super_secret_key_development_32chars",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "ulo_jwt_refresh_super_secret_key_development_32chars",
    accessExpiresIn: "15m",
    refreshExpiresInDays: 7,
  },
  cron: {
    secret: process.env.CRON_SECRET || "ulo_cron_super_secret_key_development_32chars",
  },
  mail: {
    clientId: process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    sender: process.env.EMAIL_FROM || process.env.GMAIL_USER || "notifications@ulo.ng",
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as "local" | "supabase" | "s3") || "local",
    uploadDir: process.env.UPLOAD_DIR || "./public/uploads",
    supabase: {
      url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      publicBucket: process.env.SUPABASE_STORAGE_PUBLIC_BUCKET || "ulo",
      privateBucket: process.env.SUPABASE_STORAGE_PRIVATE_BUCKET || "ulo",
    },
    s3: {
      endpoint: process.env.SUPABASE_S3_ENDPOINT || process.env.S3_ENDPOINT || "https://rkfjmokmtovotbrcizqi.storage.supabase.co/storage/v1/s3",
      region: process.env.SUPABASE_S3_REGION || process.env.S3_REGION || "eu-west-1",
      accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY,
      publicBucket: process.env.S3_PUBLIC_BUCKET || "ulo",
      privateBucket: process.env.S3_PRIVATE_BUCKET || "ulo",
    },
  },
  limits: {
    maxStudentPendingBookings: 3,
    bookingExpiryHours: 72,
    reconfirmationDays: 30,
    reconfirmationGraceDays: 7,
    minHostelImages: 4,
    maxHostelImages: 10,
    maxImageUploadSizeMB: 5,
  },
} as const;
