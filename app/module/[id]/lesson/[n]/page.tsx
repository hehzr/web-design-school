export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation'; import { read, lessons, locked } from '@/lib/db'; import { user } from '@/lib/auth'; import { completeLesson } from '@/actions';
import { Prose, Side, S } from '@/lib/ui'; import Art from '@/lib/art'; import ScrollBar from '@/components/ScrollBar';
export default async function L({ params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params, u = await user('student'), d = await read(), m = d.modules.find(x => x.id === Number(id)); if (!m) notFound();
  const ls = lessons(m.theory), i = Number(n), l = ls[i]; if (!l) notFound();
  const done = d.progress.find(p => p.u === u.id && p.m === m.id)?.done ?? [];
  if (locked(d, u.id, m.id) || i > done.length) redirect(`/module/${id}`);
  return (<><ScrollBar /><div className="lay"><Side m={m} cur={i} done={done} />
    <article key={i}><p className="tag a">Урок {i + 1} из {ls.length}</p><h1 className="a grad" style={S(1)}>{l.title}</h1>
      <div className="a" style={S(2)}>{l.img && <Art k={l.img} alt={l.title} />}<Prose text={l.body} /></div>
      <div className="nav2">{i > 0 ? <a href={`/module/${id}/lesson/${i - 1}`}>← Назад</a> : <span />}
        <form action={completeLesson}><input type="hidden" name="m" value={m.id} /><input type="hidden" name="n" value={i} /><button>{done.includes(i) ? 'Далее →' : i + 1 >= ls.length ? 'Завершить теорию →' : 'Урок пройден · далее →'}</button></form></div></article></div></>);
}
