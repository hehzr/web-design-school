import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
if (!url) {
  console.error('DATABASE_URL is missing. Set it in .env.local or pass it in the environment.');
  process.exit(1);
}
try {
  const sql = neon(url);
  await sql`SELECT 1 AS connected`;
  const rows = await sql`SELECT to_regclass('public.webdesign_school_state') AS table_name`;
  console.log('PostgreSQL connection: OK');
  console.log('Application table:', rows[0]?.table_name || 'not created yet (it will be created on the first app request)');
} catch (error) {
  console.error('Could not connect to PostgreSQL:', error instanceof Error ? error.message : error);
  process.exit(1);
}
