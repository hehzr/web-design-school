import { read } from '@/lib/db'; import { user } from '@/lib/auth'; import { saveModule } from '@/actions';
export default async function E({ params }: { params: Promise<{ id: string }> }) {
  await user('admin'); const { id } = await params, m = (await read()).modules.find(x => x.id === Number(id));
  return (<><a href="/admin" className="tag">← Назад</a><h1 className="a">{m ? 'Редактирование модуля' : 'Новый модуль'}</h1>
    <form action={saveModule} className="card a" style={{ display: 'block' }}><input type="hidden" name="id" value={m?.id ?? 0} />
      <label>Название</label><input name="title" defaultValue={m?.title} required />
      <label>Краткое описание</label><input name="lead" defaultValue={m?.lead} required />
      <label>Уроки (10–12). Каждый урок начинается со строки «# Название | ключ-иллюстрации». Ключи: layout, hierarchy, balance, contrast, rhythm, grid, spacing, proximity, space, fpattern — или ссылка на картинку вида /img/a.png из папки public. Внутри урока: абзацы через пустую строку, «- пункт», «&gt; врезка».</label>
      <textarea name="theory" rows={26} defaultValue={m?.theory} required />
      <label>Практическое задание (в конце модуля)</label><textarea name="task" rows={5} defaultValue={m?.task} required /><button>Сохранить модуль</button></form></>);
}
