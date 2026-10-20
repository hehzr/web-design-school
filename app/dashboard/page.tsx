export const dynamic = 'force-dynamic';
import { read, label, lessons } from '@/lib/db'; import { signOut } from '@/actions'; import { user } from '@/lib/auth'; import { S } from '@/lib/ui';
export default async function D() {
  const u = await user('student'), d = await read(), mine = d.progress.filter(p => p.u === u.id);
  const get = (id: number) => mine.find(p => p.m === id), ok = (id: number) => get(id)?.status === 'accepted';
  const done = d.modules.filter(m => ok(m.id)).length, rev = mine.filter(p => p.status === 'submitted').length;
  const total = d.modules.reduce((s, m) => s + lessons(m.theory).length, 0),
  seen = mine.reduce((s, p) => {
    const m = d.modules.find(x => x.id === p.m);
    return s + (m ? Math.min(p.done.length, lessons(m.theory).length) : 0);
  }, 0),
  pct = total ? Math.round(seen / total * 100) : 0;
  return (<>
    <div className="account-head a"><p className="tag">Личный кабинет · {u.email}</p><form action={signOut}><button type="submit" className="g">Выйти</button></form></div>
    <h1 className="a" style={S(1)}>Привет, <span className="grad">{u.name}</span></h1>
    <div className="bar a" style={S(2)}><i style={{ width: pct + '%' }} /></div>
    <p className="tag a" style={S(2)}>Пройдено уроков: {seen} из {total}</p>
    <div className="stats">
      <div className="card stat a" style={S(3)}><b>{done}/{d.modules.length}</b><span className="tag">модулей сдано</span></div>
      <div className="card stat a" style={S(4)}><b>{rev}</b><span className="tag">работ на проверке</span></div>
      <div className="card stat a" style={S(5)}><b>{pct}%</b><span className="tag">курс пройден</span></div></div>
    {d.modules.map((m, i) => { const lock = i > 0 && !ok(d.modules[i - 1].id), n = lessons(m.theory).length, st = label(get(m.id), n); return lock ?
      (<div key={m.id} className="card lock a" style={S(i + 6)}><span className="num">{i + 1}</span><div style={{ flex: 1 }}><b>{m.title}</b><div className="tag">🔒 Откроется после сдачи предыдущего модуля</div></div></div>) :
      (<a key={m.id} href={`/module/${m.id}`} className="card a" style={S(i + 6)}><span className="num">{i + 1}</span><div style={{ flex: 1 }}><b>{m.title}</b><div className="tag">{m.lead} · {n} уроков</div></div><span className={'pill ' + (st === 'Принято' ? 'ok' : st === 'На проверке' ? 'wait' : '')}>{st}</span></a>); })}</>);
}
