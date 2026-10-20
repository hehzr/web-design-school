export const dynamic = 'force-dynamic';
import { signIn, signUp } from '@/actions'; import { getCurrentUser } from '@/lib/auth'; import { S } from '@/lib/ui'; import { redirect } from 'next/navigation';
export default async function P({ searchParams }: { searchParams: Promise<{ e?: string; out?: string }> }) {
  const { e, out } = await searchParams;
  const current = await getCurrentUser();
  if (current) redirect(current.role === 'admin' ? '/admin' : '/dashboard');
  return (<>
    <h1 className="a">Учитесь <span className="grad">веб-дизайну</span><br />системно</h1>
    <p className="lead a" style={S(1)}>Готовые модули с теорией и практикой. Проходите по порядку, сдавайте задания, следите за прогрессом.</p>
    {out && <p className="success">Вы вышли из аккаунта. Чтобы продолжить, войдите снова.</p>}
    {e && <p className="err">{e === '1' ? 'Неверный email или пароль' : e === '2' ? 'Этот email уже зарегистрирован. Войдите или укажите другой email.' : e === '3' ? 'Укажите имя (не менее 2 символов) и пароль длиной от 8 символов.' : 'Не удалось выполнить действие. Проверьте данные и попробуйте ещё раз.'}</p>}
    <div className="grid2" style={{ marginTop: 36 }}>
      <form action={signIn} className="card a" style={S(2)}><h2>Вход</h2><input name="email" type="email" placeholder="Email" autoComplete="email" required /><input name="password" type="password" placeholder="Пароль" autoComplete="current-password" required /><button>Войти</button></form>
      <form action={signUp} className="card a" style={S(3)}><h2>Регистрация</h2><input name="name" placeholder="Имя" minLength={2} autoComplete="name" required /><input name="email" type="email" placeholder="Email" autoComplete="email" required /><input name="password" type="password" placeholder="Пароль (от 8 символов)" autoComplete="new-password" minLength={8} required /><button>Создать аккаунт</button></form></div>
    </>);
}
