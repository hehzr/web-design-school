import './globals.css'; import type { Metadata } from 'next'; import { Manrope } from 'next/font/google';
const f = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--f' });
export const metadata: Metadata = { title: 'Школа веб-дизайна' };
export default function L({ children }: { children: React.ReactNode }) {
  return (<html lang="ru" className={f.variable}><body>
    <nav><a href="/">◐ <span>Школа веб-дизайна</span></a><div className="nav-actions"><a href="/dashboard">Мой кабинет</a><a href="/login">Вход / регистрация</a></div></nav>
    <main>{children}</main></body></html>);
}
