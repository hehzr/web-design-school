# Школа веб-дизайна (Next.js 15 + TypeScript)

## Локальный запуск

```bash
npm install
npm run dev
```

Локально без `DATABASE_URL` проект использует `data/db.json`. Не используйте файловый режим в production: файловая система Vercel не является постоянным хранилищем.

## Развёртывание на Vercel — обязательная настройка базы

1. Создайте проект PostgreSQL в [Neon](https://neon.tech/) (можно подключить через Vercel Marketplace).
2. Скопируйте pooled connection string и добавьте в Vercel → Project → Settings → Environment Variables переменную `DATABASE_URL`.
3. Создайте `AUTH_SECRET` командой `openssl rand -base64 48` и добавьте её для Production, Preview и Development.
4. Добавьте `ADMIN_EMAIL` и уникальный `ADMIN_PASSWORD` длиной не менее 12 символов. Они используются только при первом создании базы, чтобы не оставлять демонстрационный пароль администратора.
5. Повторно выполните Deploy. При первом запросе приложение создаст таблицу `webdesign_school_state` и заполнит её стартовой программой курса.

Если `DATABASE_URL` не задан на production, приложение намеренно выдаст понятную ошибку вместо сохранения данных в недолговечный файл.

### Что хранится в базе и где смотреть домашние задания

При первом запросе приложение создаёт `webdesign_school_state`. В строке `id = 1` в поле `data` находится JSON-документ с `users`, `modules` и `progress`. Сданная домашняя работа сохраняется в `progress` как запись с `u` (ID ученика), `m` (ID модуля), `answer` и `status`. Это постоянное PostgreSQL-хранилище, не локальный файл.

Администратор просматривает работы в панели `/admin` в разделе «Работы на проверке». Если `DATABASE_URL` не задан или невалиден, регистрация и отправка работ в production не должны считаться успешно работающими. После добавления переменных в Vercel нужно сделать новый deployment.

**Важно:** это компактная схема для небольшого учебного проекта: прогресс и работы хранятся в одном JSONB-документе. Для большого числа одновременных пользователей стоит мигрировать данные в отдельные таблицы `users`, `modules`, `progress` с транзакциями, чтобы исключить потерю параллельных обновлений.


## Авторизация

- Пароли хранятся в виде scrypt-хешей с уникальной солью; открытый пароль в базу не записывается.
- Сессия хранится в подписанной `HttpOnly` cookie с `SameSite=Lax` на 30 дней.
- `AUTH_SECRET`, `ADMIN_EMAIL` и `ADMIN_PASSWORD` обязательны в production при первичной инициализации базы. После создания базы смена этих переменных сама по себе не меняет уже созданный аккаунт администратора.
- После выхода cookie удаляется; закрытые страницы проверяют сессию на сервере.

## Содержание курса

16 модулей с отдельными заданиями. Модуль «Figma: инструменты и рабочий процесс» включает схемы интерфейса с пояснениями по Frame, Layers, Design properties, Auto Layout, Components, Variants, Prototype и Export. Это авторские учебные схемы интерфейса, а не скриншоты из аккаунта Figma; интерфейс сервиса может меняться.

## Литература и источники для дальнейшего изучения

- Don Norman, *The Design of Everyday Things* — понятность действий, обратная связь и модель пользователя.
- Robin Williams, *The Non-Designer’s Design Book* — контраст, повторение, выравнивание и близость.
- Ellen Lupton, *Thinking with Type* — типографическая иерархия и работа с текстом.
- Jenifer Tidwell, *Designing Interfaces* — паттерны пользовательских интерфейсов.
- Steve Krug, *Don’t Make Me Think* — удобство использования и проверка сценариев.
- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*: https://www.w3.org/TR/WCAG22/
- Figma Help Center: https://help.figma.com/
- MDN Web Docs, Responsive design: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design


## Рекомендуемая литература и источники

Курс расширен по мотивам идей и упражнений из следующих книг и первичных источников. Это список для самостоятельного чтения, а не копирование текста книг:

- William Lidwell, Kritina Holden, Jill Butler — *Universal Principles of Design*: гештальт, близость, сходство, иерархия, Fitts’ Law и другие принципы. https://universalprinciplesofdesign.com/books
- Don Norman — *The Design of Everyday Things*: обратная связь, affordance, ограничения и ментальные модели. https://mitpress.mit.edu/9780262525671/the-design-of-everyday-things/
- Steve Krug — *Don't Make Me Think, Revisited*: понятность навигации и проверка usability. https://www.pearson.com/en-us/subject-catalog/p/don-t-make-me-think-revisited-a-common-sense-approach-to-web-usability/P200000000385/9780321965516
- Ellen Lupton — *Thinking with Type*, 3rd edition: типографика, кернинг, трекинг, выравнивание, сетки и гештальт. https://ellenlupton.com/Thinking-with-Type
- Adam Wathan, Steve Schoger — *Refactoring UI*: практические приёмы композиции и интерфейсного дизайна. https://refactoringui.com/
- Figma Learn — Design Basics: основы, практические упражнения и примеры. https://www.figma.com/resource-library/design-basics/
- Figma Help Center — Auto Layout: гибкие фреймы, resizing и адаптивные компоненты. https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma
- Figma Help Center — Accessibility: доступность в Figma и проектировании интерфейсов. https://help.figma.com/hc/en-us/articles/35063862380311-Accessibility-at-Figma

