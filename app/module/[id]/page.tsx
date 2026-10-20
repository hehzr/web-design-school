export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation'; import { read, lessons, locked } from '@/lib/db'; import { user } from '@/lib/auth';
export default async function M({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, u = await user('student'), d = await read(), m = d.modules.find(x => x.id === Number(id));
  if (!m) notFound(); if (locked(d, u.id, m.id)) redirect('/dashboard');
  const done = d.progress.find(p => p.u === u.id && p.m === m.id)?.done.length ?? 0;
  redirect(done >= lessons(m.theory).length ? `/module/${id}/task` : `/module/${id}/lesson/${done}`);
}
