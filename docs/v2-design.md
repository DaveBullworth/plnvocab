# plnvocab v2 — design doc

**Status:** Draft, 2026-05-12
**Author:** обсуждение с Claude
**Baseline:** см. `perf-baseline/BASELINE.md`

---

## 1. Motivation

MVP — это «один общий словарь у владельца сайта, остальные смотрят read-only». v2 — другой продукт: «каждый юзер ведёт свой персональный словарь локально».

**Это не perf-рефакторинг.** Synthetic baseline показал что MVP в зелёной зоне по Core Web Vitals (LCP 921 мс под Slow 4G + CPU 4x). Мотивация — функциональная:

1. Поддержать несколько изучаемых языков (сейчас только польский).
2. Убрать авторизацию и серверные write-paths — каждый юзер сам себе админ.
3. Подготовить почву для распространения готовых словарей через файлы / GitHub data branches (future, не сейчас).

Все 4 perf root cause из `project_v2_perf_findings` снимаются как побочный эффект архитектурной чистки.

---

## 2. Non-goals (явно не делаем в v2)

- Синхронизация между устройствами.
- Real-time collaboration.
- Готовые встроенные словари (демо в комплекте). Юзер импортирует JSON сам.
- Шеринг словарей между юзерами через UI (готовится почва, но без UI).
- Speed Insights / RUM подключение (отдельная задача).
- Доработка стилей — Tailwind + дефолтные классы, Figma в самом конце.
- Любые миграции БД, A/B флаги, бэтч-операции. Это игрушка для одного юзера.

---

## 3. Architecture summary

| Слой | MVP | v2 |
| --- | --- | --- |
| Framework | Next.js 16 + App Router | **то же** |
| UI | Tailwind 4, @tanstack/react-table, lucide-react | **то же** |
| Storage (read) | GitHub Contents API → server cache | **IndexedDB через Dexie.js** |
| Storage (write) | Server Action → GitHub Contents API PUT | **IndexedDB напрямую из клиента** |
| Auth | ADMIN_SECRET + cookie session | **удалён целиком** |
| Theme | Cookie + server-read в RootLayout | **localStorage + no-FOUC inline script** |
| Hosting | Vercel | **то же** |

Главный архитектурный сдвиг: source of truth переезжает **с сервера на устройство юзера**. Сервер становится статическим shell'ом — раздаёт HTML/JS, ничего не знает про содержимое словарей.

Это значит, что для `/[lng]/words`, `/[lng]/phrases`, `/[lng]/tester` можно использовать **static rendering** (либо чистый client-side rendering для всего, что зависит от Dexie). Vercel cold-start, force-dynamic, server-side fetch — всё уходит.

---

## 4. Data model

```ts
// src/lib/domain/Lng.ts
export type Lng = 'pl' | 'en';
export const LANGUAGES: readonly Lng[] = ['pl', 'en'] as const;
export const LANGUAGE_LABELS: Record<Lng, string> = {
  pl: 'Polish',
  en: 'English',
};

// src/lib/domain/Entry.ts
export interface Entry {
  id: string;        // crypto.randomUUID()
  origin: string;    // термин на изучаемом языке (raw, без normalisation)
  ru: string;        // перевод на русский
  isWord: boolean;   // true = одно слово, false = фраза
  lng: Lng;
  createdAt: number; // Date.now() ms
  updatedAt: number;
}
```

**Изменения vs MVP:**

- `pl` → `origin` + новое поле `lng`. Это позволит хранить и польские, и английские entries в одной таблице с фильтром по `lng`.
- Добавлены `createdAt`/`updatedAt` — нужны для сортировки и для будущего merge на import.
- `uuid` пакет уходит, используем `crypto.randomUUID()` (доступен везде).

---

## 5. Routes

```
/                           — redirect → /pl/words (или последний посещённый lng)
/[lng]/words                — таблица Word entries для языка
/[lng]/phrases              — таблица Phrase entries для языка
/[lng]/tester               — тестер для языка
/import                     — отдельная страница импорта JSON (или модалка в любом view, см. ниже)
```

**`[lng]` как dynamic segment** позволяет шарить ссылку на конкретный язык + раздел. В layout `/[lng]/` — переключатель языка (`/pl ↔ /en`) и nav между Words/Phrases/Tester.

Валидация: `[lng]` должно быть в `LANGUAGES`, иначе 404. Сделать через `generateStaticParams` + `notFound()` в layout.

---

## 6. Storage — Dexie schema

```ts
// src/lib/db/db.ts
import Dexie, { type Table } from 'dexie';
import type { Entry } from '@/lib/domain/Entry';

class VocabDB extends Dexie {
  entries!: Table<Entry, string>; // primary key = id (string)

  constructor() {
    super('plnvocab');
    this.version(1).stores({
      // Indices:
      // - id (PK)
      // - lng (filter by current language)
      // - composite [lng+isWord] (filter view: Words vs Phrases)
      // - updatedAt (sort)
      entries: 'id, lng, [lng+isWord], updatedAt',
    });
  }
}

export const db = new VocabDB();
```

**Доступ из React:** через `useLiveQuery` из `dexie-react-hooks` — он автоматически переподписывается на изменения таблицы. Это альтернатива нашему текущему `useSyncExternalStore` подходу — Dexie сам делает invalidation, и это соответствует [[feedback_react_patterns]] (не useEffect).

```ts
// src/lib/db/queries.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export function useEntries(lng: Lng, isWord: boolean) {
  return useLiveQuery(
    () => db.entries.where('[lng+isWord]').equals([lng, isWord ? 1 : 0]).toArray(),
    [lng, isWord],
  );
}
```

**Зависимости (новые):**
- `dexie` (~3 KB gzipped)
- `dexie-react-hooks` (минимальный)

---

## 7. Import / Export

**Формат JSON:**

```json
{
  "version": 2,
  "exportedAt": "2026-05-12T10:00:00.000Z",
  "entries": [
    { "id": "...", "origin": "...", "ru": "...", "isWord": true, "lng": "pl", "createdAt": 1715500000000, "updatedAt": 1715500000000 }
  ]
}
```

**Поведение при импорте:**

- Парсинг + валидация версии и schema (zod или ручной guard).
- Спросить: **Replace all** (очистить базу) vs **Merge** (добавить новые id, обновить совпадающие по id).
- Если в файле есть entries с lng, которых нет в LANGUAGES → отфильтровать с warning.

**Legacy migration (одноразовая утилита):**
- Кнопка «Import from plnvocab MVP» — fetch `https://raw.githubusercontent.com/DaveBullworth/plnvocab/data/data/vocabulary.json`, конвертация старого `{pl, ru}` → `{origin: pl, lng: 'pl', createdAt: Date.now(), updatedAt: Date.now(), ...}`.
- Только для удобства миграции существующих юзеров MVP. В v2 design сама фича одноразовая.

**Export:**
- Кнопка → blob URL → download. Имя `plnvocab-${YYYY-MM-DD}.json`.

UI размещения: модалка `Import` доступна из Nav. Export тоже через Nav. Отдельной страницы `/import` не нужно.

---

## 8. Theme — client-only

Сейчас тема хранится в cookie и читается в `RootLayout` (`getThemeFromCookies`). Это force-dynamic root. В v2:

- Хранение: `localStorage['theme']`.
- No-FOUC: inline `<script>` в `<head>` через `dangerouslySetInnerHTML` читает localStorage **до** hydration и ставит `class="dark"` на `<html>` синхронно.
- Toggle: client component с `useSyncExternalStore` (subscribe → storage event).

Это снимает 🔴 #1 из perf findings (force-dynamic из cookies).

---

## 9. Polish letters popover

`PolishLettersPopover` помогает вводить `ą ć ę ł ń ó ś ź ż`. В v2:

- Рендерится только если `lng === 'pl'`.
- Проверка в `EditableCell` (props.lng) и в `TesterRound` (props.lng).
- Для `lng === 'en'` popover скрыт. Никакого fallback — обычная клавиатура.

В будущем (не в v2) — словарь спецсимволов на язык: `Record<Lng, string[]>`.

---

## 10. Что выкидываем (v2 cleanup)

| Категория | Файлы / папки |
| --- | --- |
| Auth | `src/lib/auth/*`, `src/components/auth/*`, `src/app/login/*` |
| Server actions | `loginAction.ts`, `logoutAction.ts`, `saveVocabularyAction.ts` |
| Server storage | `src/lib/storage/GitHubStorage.ts` целиком, `src/lib/storage/LocalDraftStorage.ts` (старый драфт-механизм) |
| Theme cookie | `src/lib/theme/themeCookie.ts` |
| Domain (старая модель) | `src/lib/domain/Entry.ts` (заменён), `src/lib/domain/Vocabulary.ts` (заменён) |
| Route groups | `src/app/(vocabulary)/*` (заменено на `src/app/[lng]/*`) |
| Env vars | `ADMIN_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_DATA_BRANCH`, `GITHUB_DATA_PATH` — все уходят |
| Зависимости | `uuid` (заменён на `crypto.randomUUID()`) |

---

## 11. Что остаётся (минимальные правки)

| Файл/папка | Что меняется |
| --- | --- |
| `next.config.ts` | Добавить `experimental.optimizePackageImports: ['lucide-react', '@tanstack/react-table', 'dexie']` |
| `package.json` | + `dexie`, `dexie-react-hooks`; − `uuid` |
| `src/app/layout.tsx` | Удалить cookies, AdminProvider, server-fetch темы. Оставить html/body + no-FOUC theme script. |
| `src/components/layout/Nav.tsx` | Удалить login-link и admin-aware элементы. Добавить переключатель языка + кнопки Import/Export. |
| `src/components/ThemeToggle.tsx` | Перевести на localStorage. |
| `src/components/vocabulary/*` | Пропустить через рефактор: убрать `pl/ru` API, использовать `origin/lng`. Передавать `lng` пропом. |
| `src/components/tester/*` | То же + поддержка обоих языков. |
| Tailwind config, globals.css | Без изменений. |

---

## 12. Implementation phases

Каждая фаза — отдельный коммит (или серия) в ветке `v2`. После каждой фазы проект должен **компилироваться** и **проходить базовый dev-флоу**.

### Phase 1 — Setup
- `git checkout -b v2`
- Удалить весь cleanup list из §10 одним коммитом.
- `npm i dexie dexie-react-hooks && npm uninstall uuid`
- Создать `src/lib/domain/Entry.ts`, `Lng.ts`, `src/lib/db/db.ts`, `src/lib/db/queries.ts` (заглушки).
- `next.config.ts` — добавить optimizePackageImports.

### Phase 2 — Routes scaffold
- `app/page.tsx` → redirect /pl/words.
- `app/[lng]/layout.tsx` — Nav со switcher.
- `app/[lng]/words/page.tsx`, `phrases/page.tsx`, `tester/page.tsx` — пустые placeholder'ы.
- `generateStaticParams` для статической генерации.
- `loading.tsx` где нужно.

### Phase 3 — Words/Phrases CRUD
- `VocabularyView` рефактор: принимает `lng` + `isWord` пропами.
- `useEntries` через Dexie + `useLiveQuery`.
- `EditableCell` с `key={value}` (см. [[feedback_react_patterns]] вместо derive state from props).
- Add / Delete entries через прямые `db.entries.add/delete`.
- `PolishLettersPopover` под условием `lng==='pl'`.

### Phase 4 — Tester
- `TesterView` рефактор: подтягивает entries из Dexie по `lng`.
- `TesterRound` — popover только для `pl`.

### Phase 5 — Import/Export + Theme
- Модалка Import (replace/merge), Export download.
- Legacy import-from-MVP кнопка.
- `ThemeToggle` на localStorage + no-FOUC script в `<head>`.

### Phase 6 — Final cleanup + perf audit
- Удалить все осиротевшие файлы (что не удалили на Phase 1).
- Запустить трейсы из `perf-baseline/BASELINE.md` на v2 deployment.
- Сравнить, обновить `perf-baseline/BASELINE.md` секцией «v2 results».
- Squash merge `v2 → main`. После merge MVP полностью уходит.

---

## 13. Open questions / TBD

- **Sort default** для Words/Phrases: `updatedAt desc` или `createdAt asc`? Пока поставим `updatedAt desc` — последние правки сверху.
- **Pagination vs scroll** — `pageSize=10` сейчас, оставляем. Virtualization добавим только если RUM покажет проблему.
- **Tester при пустом словаре** — disable «Start test» с подсказкой «Add entries or import a file».
- **lng-switcher behaviour** при переходе с раздела где много entries → раздел где их 0: показать empty state. Не редиректить.
- **Сохранение текущего lng между сессиями** — простой `localStorage['lastLng']`, читается при заходе на `/`.

---

## 14. Acceptance criteria (готовность к merge)

- [ ] Открыл `/`, попал на `/pl/words` (если впервые) или последний `lng`.
- [ ] Пустая база — показывается «No words yet» + кнопка Import.
- [ ] Import JSON работает: merge и replace варианты.
- [ ] Legacy import из MVP `data/vocabulary.json` импортирует 279 PL + 13 phrases.
- [ ] Переключился на `/en/words` — пустая таблица. Добавил English entry — отобразилась только в EN, не в PL.
- [ ] Polish letters popover виден в `/pl/words` editing, скрыт в `/en/words`.
- [ ] Тестер работает на обоих языках, popover только в PL.
- [ ] Hard reload любой страницы — сразу темная/светлая тема без FOUC.
- [ ] No `cookies()` в коде. Нет ADMIN_SECRET / GITHUB_TOKEN в env.
- [ ] Synthetic LCP на v2 prod ≤ baseline MVP (921 мс под Slow 4G + CPU 4x).

---

## 15. Risks & mitigations

| Риск | Mitigation |
| --- | --- |
| IndexedDB blocked / quota exceeded | Catch error в db.ts, показать toast + предложить export. Reasonable size: 1000 entries ≈ 200 KB. |
| Юзер импортирует «битый» JSON | Schema-guard в parse, конкретные сообщения об ошибке. |
| Hard reload теряет prefetch + Suspense fallback | `loading.tsx` в каждой ветке `[lng]/*` (см. фикс /tester на MVP). |
| Юзер очищает browser storage | Документировать в README + предупреждать в UI «no cloud backup, export regularly». |
| Legacy migration ломается если data branch недоступен | Graceful fallback: показать ошибку, оставить базу пустой. Это **не** критичный flow. |
