import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof createDatabase>;

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Copy .env.example to .env.local.",
    );
  }

  const client = postgres(databaseUrl, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return drizzle(client, { schema });
}

const globalDatabase = globalThis as typeof globalThis & {
  beaverDatabase?: Database;
};

export function getDatabase(): Database {
  if (!globalDatabase.beaverDatabase) {
    globalDatabase.beaverDatabase = createDatabase();
  }
  return globalDatabase.beaverDatabase;
}

export type BeaverDatabase = Database;
