import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const globalForDb = globalThis as typeof globalThis & {
  neonSql?: ReturnType<typeof neon>;
};

const sql = globalForDb.neonSql ?? neon(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.neonSql = sql;
}

export const db = drizzle(sql, { schema });

export { schema };
export * from './schema';
