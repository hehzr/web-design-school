import type { CSSProperties } from 'react'; import { lessons, type Mod } from './db';
export const S = (i: number) => ({ '--i': i } as CSSProperties);
export function Prose({ text }: { text: string }) {
  return (<div className="prose">{text.split(/\n\n+/).map((b, i) => {
    if (b.startsWith('## ')) return <h2 key={i}>{b.slice(3)}</h2>;
    if (b.startsWith('- ')) return <ul key={i}>{b.split('\n').map((l, j) => <li key={j}>{l.replace(/^- /, '')}</li>)}</ul>;
    if (b.startsWith('> ')) return <div key={i} className="callout">{b.slice(2)}</div>;
    return <p key={i}>{b}</p>;
  })}</div>);
}
export function Side({ m, cur, done }: { m: Mod; cur: number | 'task'; done: number[] }) {
  const ls = lessons(m.theory), all = done.length >= ls.length;
  return (<aside className="side"><a href="/dashboard" className="tag">← Все модули</a><b style={{ margin: '8px 0 10px' }}>{m.title}</b>
    {ls.map((l, i) => i <= done.length
      ? <a key={i} href={`/module/${m.id}/lesson/${i}`} className={'si ' + (cur === i ? 'on' : '')}><em className={done.includes(i) ? 'ok' : ''}>{done.includes(i) ? '✓' : i + 1}</em>{l.title}</a>
      : <span key={i} className="si lock"><em>{i + 1}</em>{l.title}</span>)}
    {all ? <a href={`/module/${m.id}/task`} className={'si ' + (cur === 'task' ? 'on' : '')}><em>★</em>Практическое задание</a> : <span className="si lock"><em>★</em>Практическое задание</span>}</aside>);
}
