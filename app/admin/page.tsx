import { read, label, lessons } from '@/lib/db'; import { user } from '@/lib/auth'; import { delModule, review, signOut } from '@/actions'; import { S } from '@/lib/ui';
export default async function A() {
  await user('admin'); const d = await read(), st = d.users.filter(u => u.role === 'student'), P = (u: number, m: number) => d.progress.find(p => p.u === u && p.m === m);
  const subs = d.progress.filter(p => p.status === 'submitted');
  return (<>
    <div className="account-head a"><p className="tag">Панель администратора</p><form action={signOut}><button type="submit" className="g">Выйти</button></form></div><h1 className="a" style={S(1)}>Управление <span className="grad">курсом</span></h1>
    <div className="stats"><div className="card stat a" style={S(2)}><b>{st.length}</b><span className="tag">учеников</span></div><div className="card stat a" style={S(3)}><b>{d.modules.length}</b><span className="tag">модулей</span></div><div className="card stat a" style={S(4)}><b>{subs.length}</b><span className="tag">на проверке</span></div></div>
    <h2>Модули <a href="/admin/module/new" style={{ fontSize: 15 }}>+ добавить</a></h2>
    {d.modules.map((m, i) => (<div key={m.id} className="card a" style={S(i)}><span className="num">{i + 1}</span><div style={{ flex: 1 }}><b>{m.title}</b><div className="tag">Уроков: {lessons(m.theory).length}</div></div><a href={`/admin/module/${m.id}`}>Редактировать</a>
      <form action={delModule}><input type="hidden" name="id" value={m.id} /><button className="g">Удалить</button></form></div>))}
    <h2>Работы на проверке</h2>{!subs.length && <p className="tag">Новых работ нет</p>}
    {subs.map(p => (<div key={p.u + '-' + p.m} className="card a"><div><b>{d.users.find(u => u.id === p.u)?.name}</b> · <span className="tag">{d.modules.find(m => m.id === p.m)?.title}</span><br />{p.answer}</div>
      <form action={review} style={{ display: 'flex', gap: 8 }}><input type="hidden" name="u" value={p.u} /><input type="hidden" name="m" value={p.m} /><button name="s" value="accepted">Принять</button><button name="s" value="rework" className="g">Доработка</button></form></div>))}
    <h2>Прогресс учеников</h2>
    <div className="card" style={{ display: 'block', overflowX: 'auto' }}><table><thead><tr><th>Ученик</th>{d.modules.map((m, i) => <th key={m.id}>Модуль {i + 1}</th>)}</tr></thead><tbody>
      {st.map(u => (<tr key={u.id}><td>{u.name}</td>{d.modules.map(m => <td key={m.id} className="tag">{label(P(u.id, m.id), lessons(m.theory).length)}</td>)}</tr>))}</tbody></table></div></>);
}
