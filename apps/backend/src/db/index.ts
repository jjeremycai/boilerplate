import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import type { Env } from '../index';

// Type for the database with schema
export type Database = ReturnType<typeof createDb>;

// Create a database instance with the schema
export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}

// Export schema types for convenience
export * from './schema';