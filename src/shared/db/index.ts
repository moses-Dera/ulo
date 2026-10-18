import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "../config";

// Notice: prepare: false is required for connection pooling / transaction-mode proxy compatibility.
// PG_MAX_POOL defaults to 30 — raise in Vercel env vars for high-traffic periods.
const queryClient = postgres(config.db.url, {
  prepare: false,
  max: Number(process.env.PG_MAX_POOL ?? 30),
  idle_timeout: 20,   // release idle connections after 20 s (reduces Supabase connection count)
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });
export * from "./schema";
