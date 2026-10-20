import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { read, type Role, type User } from './db';

const COOKIE = 's';
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const secret = () => {
  const value = process.env.AUTH_SECRET || process.env.SECRET;
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error('Set AUTH_SECRET in the production environment before enabling authentication.');
  }
  return value || 'development-only-secret-change-before-deploying';
};
const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');
const safeEqual = (a: string, b: string) => {
  const aa = Buffer.from(a, 'hex'), bb = Buffer.from(b, 'hex');
  return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa, bb);
};

export async function login(id: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${id}.${expiresAt}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
    expires: new Date(expiresAt * 1000),
  });
}

export async function getCurrentUser(): Promise<User | undefined> {
  const value = (await cookies()).get(COOKIE)?.value ?? '';
  const [idRaw, expiryRaw, signature] = value.split('.');
  const id = Number(idRaw), expiresAt = Number(expiryRaw);
  const payload = `${idRaw}.${expiryRaw}`;
  const valid = Number.isSafeInteger(id) && id > 0 && Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000)
    && !!signature && safeEqual(signature, sign(payload));
  return valid ? (await read()).users.find(x => x.id === id) : undefined;
}

export async function user(role?: Role): Promise<User> {
  const account = await getCurrentUser();
  if (!account) redirect('/login');
  if (role && account.role !== role) redirect(account.role === 'admin' ? '/admin' : '/dashboard');
  return account;
}
