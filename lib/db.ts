import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import seedData from '../data/seed.json';
export type Role = 'admin' | 'student';
export type User = { id: number; name: string; email: string; password: string; role: Role };
export type Mod = { id: number; title: string; lead: string; theory: string; task: string };
export type Status = '' | 'submitted' | 'accepted' | 'rework';
export type Prog = { u: number; m: number; done: number[]; answer: string; status: Status };
export type DB = { users: User[]; modules: Mod[]; progress: Prog[] };
const localFile = path.join(process.cwd(), 'data', 'db.json');
const seed: DB = seedData as DB;
let neonClient: any;
// Local JSON storage is allowed only during `next dev`; deployed environments must use Postgres.
const useLocalFile = process.env.NODE_ENV === 'development' && !(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);
function mergeSeedModules(data: DB): DB {
  const ids = new Set(data.modules.map(m => m.id));
  const missing = seed.modules.filter(m => !ids.has(m.id));
  if (missing.length) data.modules.push(...missing);
  return data;
}
function initialData(): DB {
  const data = JSON.parse(JSON.stringify(seed)) as DB;
  if (process.env.NODE_ENV === 'production') {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!email || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before initializing the production database.');
    data.users = [{ id: 1, name: 'Администратор', email, password: hash(password), role: 'admin' }];
    data.progress = [];
  }
  return data;
}
async function sqlClient() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!url) throw new Error('DATABASE_URL is required on Vercel. Create a Neon Postgres database and add its connection string to Environment Variables.');
  if (!neonClient) {
    const { neon } = await import('@neondatabase/serverless');
    neonClient = neon(url);
  }
  return neonClient;
}
export async function read(): Promise<DB> {
  if (useLocalFile) {
    if (!fs.existsSync(localFile)) { fs.mkdirSync(path.dirname(localFile), { recursive: true }); fs.writeFileSync(localFile, JSON.stringify(seed, null, 2)); }
    const local = JSON.parse(fs.readFileSync(localFile, 'utf8')) as DB;
    const count = local.modules.length; mergeSeedModules(local);
    if (local.modules.length !== count) fs.writeFileSync(localFile, JSON.stringify(local, null, 2));
    return local;
  }
  const sql = await sqlClient();
  await sql`CREATE TABLE IF NOT EXISTS webdesign_school_state (id integer PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
  const rows = await sql`SELECT data FROM webdesign_school_state WHERE id = 1`;
  if (rows.length) {
    const existing = rows[0].data as DB; const count = existing.modules.length; mergeSeedModules(existing);
    if (existing.modules.length !== count) await sql`UPDATE webdesign_school_state SET data = ${JSON.stringify(existing)}::jsonb, updated_at = now() WHERE id = 1`;
    return existing;
  }
  await sql`INSERT INTO webdesign_school_state (id, data) VALUES (1, ${JSON.stringify(initialData())}::jsonb) ON CONFLICT (id) DO NOTHING`;
  const initialized = await sql`SELECT data FROM webdesign_school_state WHERE id = 1`;
  return initialized[0].data as DB;
}
export async function write(d: DB): Promise<void> {
  if (useLocalFile) {
    fs.mkdirSync(path.dirname(localFile), { recursive: true });
    fs.writeFileSync(localFile, JSON.stringify(d, null, 2));
    return;
  }
  const sql = await sqlClient();
  await sql`CREATE TABLE IF NOT EXISTS webdesign_school_state (id integer PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
  await sql`INSERT INTO webdesign_school_state (id, data, updated_at) VALUES (1, ${JSON.stringify(d)}::jsonb, now()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
}
export const hash = (p: string) => { const salt = crypto.randomBytes(16).toString('hex'); return `scrypt$${salt}$${crypto.scryptSync(p, salt, 64).toString('hex')}`; };
export const verifyPassword = (password: string, stored: string) => {
  try {
    if (stored.startsWith('scrypt$')) { const [, salt, hex] = stored.split('$'); if (!salt || !hex) return false; const expected = Buffer.from(hex, 'hex'), actual = crypto.scryptSync(password, salt, expected.length); return expected.length > 0 && crypto.timingSafeEqual(actual, expected); }
    const expected = Buffer.from(stored, 'hex'), actual = crypto.createHash('sha256').update(password).digest();
    return expected.length === actual.length && expected.length > 0 && crypto.timingSafeEqual(expected, actual);
  } catch { return false; }
};
export const lessons = (t: string) => t.split(/^# /m).filter(s => s.trim()).map(s => { const [h, ...b] = s.split('\n'); const [title, img = ''] = h.split('|').map(x => x.trim()); return { title, img, body: b.join('\n').trim() }; });
export const locked = (d: DB, u: number, id: number) => { const i = d.modules.findIndex(m => m.id === id); return i > 0 && !d.progress.some(p => p.u === u && p.m === d.modules[i - 1].id && p.status === 'accepted'); };
export const label = (p: Prog | undefined, total: number) => !p ? 'Не начат' : p.status === 'accepted' ? 'Принято' : p.status === 'submitted' ? 'На проверке' : p.status === 'rework' ? 'На доработку' : p.done.length >= total ? 'Практика' : p.done.length ? `Урок ${p.done.length}/${total}` : 'Не начат';
