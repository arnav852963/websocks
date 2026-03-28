import { db, sql } from './db.js';

/**
 * Verifies DB connectivity.
 * Throws if the connection string is invalid / DB is unreachable.
 */
export async function connectDb() {
  // Using the underlying Neon client for a simple ping.
  await sql`select 1 as ok`;
  return db;
}

export { db };

