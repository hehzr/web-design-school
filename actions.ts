'use server';
import { redirect } from 'next/navigation'; import { revalidatePath } from 'next/cache'; import { cookies } from 'next/headers';
import { read, write, hash, verifyPassword, lessons, type DB, type Status } from '@/lib/db'; import { login, user } from '@/lib/auth';
const f = (fd: FormData, k: string) => String(fd.get(k) ?? '');
export async function signIn(fd: FormData) {
  const email = f(fd, 'email').trim().toLowerCase();
  const password = f(fd, 'password');
  const d = await read();
  const u = d.users.find(x => x.email.trim().toLowerCase() === email);
  if (!u || !verifyPassword(password, u.password)) redirect('/login?e=1');
  // Миграция старых SHA-256-хешей на более стойкий scrypt при первом успешном входе.
  if (!u.password.startsWith('scrypt$')) { u.password = hash(password); await write(d); }
  await login(u.id);
  redirect(u.role === 'admin' ? '/admin' : '/dashboard');
}
export async function signUp(fd: FormData) {
  const d = await read();
  const name = f(fd, 'name').trim();
  const email = f(fd, 'email').trim().toLowerCase();
  const password = f(fd, 'password');
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) redirect('/login?e=3');
  if (d.users.some(x => x.email.trim().toLowerCase() === email)) redirect('/login?e=2');
  const id = Date.now();
  d.users.push({ id, name, email, password: hash(password), role: 'student' });
  await write(d);
  await login(id);
  redirect('/dashboard');
}
export async function signOut() { (await cookies()).set('s', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0, expires: new Date(0) }); redirect('/login?out=1'); }
const pr = (d: DB, u: number, m: number) => { let p = d.progress.find(x => x.u === u && x.m === m); if (!p) { p = { u, m, done: [], answer: '', status: '' }; d.progress.push(p); } return p; };
export async function completeLesson(fd: FormData) {
  const u = await user(), d = await read(), id = +f(fd, 'm'), n = +f(fd, 'n'), m = d.modules.find(x => x.id === id); if (!m) return;
  const p = pr(d, u.id, id); if (n === p.done.length) p.done.push(n); await write(d);
  redirect(n + 1 >= lessons(m.theory).length ? `/module/${id}/task` : `/module/${id}/lesson/${n + 1}`);
}
export async function submitTask(fd: FormData) { const u = await user(), d = await read(), id = +f(fd, 'm'), m = d.modules.find(x => x.id === id), p = pr(d, u.id, id); if (!m || p.done.length < lessons(m.theory).length || p.status === 'accepted') return; p.answer = f(fd, 'answer'); p.status = 'submitted'; await write(d); revalidatePath('/', 'layout'); }
export async function saveModule(fd: FormData) { await user('admin'); const d = await read(); let m = d.modules.find(x => x.id === +f(fd, 'id')); if (!m) { m = { id: Date.now(), title: '', lead: '', theory: '', task: '' }; d.modules.push(m); } Object.assign(m, { title: f(fd, 'title'), lead: f(fd, 'lead'), theory: f(fd, 'theory'), task: f(fd, 'task') }); await write(d); redirect('/admin'); }
export async function delModule(fd: FormData) { await user('admin'); const d = await read(), id = +f(fd, 'id'); d.modules = d.modules.filter(m => m.id !== id); d.progress = d.progress.filter(p => p.m !== id); await write(d); revalidatePath('/admin'); }
export async function review(fd: FormData) { await user('admin'); const d = await read(); pr(d, +f(fd, 'u'), +f(fd, 'm')).status = f(fd, 's') as Status; await write(d); revalidatePath('/', 'layout'); }
