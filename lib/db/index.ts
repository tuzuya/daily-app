import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

type GlobalDbCache = {
  client?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle>;
};

const globalForDb = globalThis as typeof globalThis & {
  __dailyAppDb?: GlobalDbCache;
};

const cache = globalForDb.__dailyAppDb ?? {};
if (!cache.client) {
  cache.client = postgres(connectionString, {
    ssl: "require",
    max: 2,
    connect_timeout: 10,
    idle_timeout: 20,
    prepare: false,
  });
}
if (!cache.db) {
  cache.db = drizzle(cache.client, { schema });
}
globalForDb.__dailyAppDb = cache;

export const db = cache.db;
