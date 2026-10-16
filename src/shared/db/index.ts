import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "../config";

// Notice: prepare: false is required for connection pooling / transaction-mode proxy compatibility
const queryClient = postgres(config.db.url, {
  prepare: false,
  max: 10,
});

export const db = drizzle(queryClient, { schema });
export * from "./schema";
