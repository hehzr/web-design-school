import { notFound, redirect } from 'next/navigation'; import { read, lessons, locked } from '@/lib/db'; import { user } from '@/lib/auth'; import { submitTask } from '@/actions'; import { Side, S } from '@/lib/ui';
export default async function T({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, u = await user('student'), d = await read(), m = d.modules.find(x => x.id === Number(id)); if (!m) notFound();
  const p = d.progress.find(x => x.u === u.id && x.m === m.id), done = p?.done ?? [];
  if (locked(d, u.id, m.id) || done.length < lessons(m.theory).length) redirect(`/module/${id}`);
  return (<div className="lay"><Side m={m} cur="task" done={done} /><article>
    <p className="tag a">Практика</p><h1 className="a grad" style={S(1)}>Практическое задание</h1>
    <section className="task a" style={S(2)}><p style={{ fontSize: 18 }}>{m.task}</p>
      {p?.status && <span className={'pill ' + (p.status === 'accepted' ? 'ok' : 'wait')}>{p.status === 'accepted' ? 'Принято ✓' : p.status === 'rework' ? 'Нужна доработка' : 'На проверке'}</span>}
      <form action={submitTask} style={{ marginTop: 18 }}><input type="hidden" name="m" value={m.id} />
        <textarea name="answer" rows={5} defaultValue={p?.answer} disabled={p?.status === 'accepted'} required placeholder="Ссылка на работу и комментарий" />
        <button disabled={p?.status === 'accepted'}>Отправить на проверку</button></form></section></article></div>);
}
