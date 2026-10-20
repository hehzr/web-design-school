import { user } from '@/lib/auth';
import { read, lessons } from '@/lib/db';
export default async function Home() {
  const modules = (await read()).modules;
  return <section className="hero">
    <p className="tag a">ОНЛАЙН-ШКОЛА · ОТ ОСНОВ ДО ПОРТФОЛИО</p>
    <h1 className="a">Создавай интерфейсы<br/>с <span className="grad">пониманием</span></h1>
    <p className="lead a">Практический курс веб-дизайна: композиция, цвет, типографика, UX, адаптивность и дизайн-системы. Изучайте теорию, выполняйте задания и собирайте проекты в портфолио.</p>
    <div className="hero-actions a"><a className="cta" href="/login">Начать обучение ↗</a><a className="secondary" href="#program">Посмотреть программу</a></div>
    <div className="hero-metrics"><div><b>{modules.length}</b><span>учебных модулей</span></div><div><b>{modules.reduce((n,m)=>n+lessons(m.theory).length,0)}</b><span>уроков</span></div><div><b>Практика</b><span>в каждом модуле</span></div></div>
    <div id="program" className="program-head"><p className="tag">ПРОГРАММА</p><h2>От первого макета до системы</h2><p className="lead">Каждый модуль заканчивается практической работой с критериями проверки.</p></div>
    <div className="program-grid">{modules.map((m,i)=><a className="program-card" key={m.id} href="/login"><span className="num">{String(i+1).padStart(2,'0')}</span><h3>{m.title}</h3><p>{m.lead}</p><span className="tag">{lessons(m.theory).length} уроков · теория + практика</span></a>)}</div>
    <section className="bottom-cta"><h2>Готовы сделать первый шаг?</h2><p className="lead">Войдите или создайте аккаунт, чтобы начать обучение.</p><a className="cta" href="/login">Войти или зарегистрироваться ↗</a></section>
  </section>;
}
