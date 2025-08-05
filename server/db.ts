import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Use Supabase database URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error(
    "DATABASE_URL must be set in production. Get it from your Supabase dashboard.",
  );
}

// For development, use a placeholder if not set
if (!databaseUrl && process.env.NODE_ENV === 'development') {
  console.warn('DATABASE_URL not set. Database operations will fail.');
}

const connectionString = databaseUrl || 'postgresql://localhost:5432/dev';

export const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });