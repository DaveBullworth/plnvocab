# plnvocab MVP — performance baseline

**Date:** 2026-05-12
**Target:** https://plnvocab.vercel.app (production, MVP)
**Tool:** Chrome DevTools MCP (`chrome-devtools-mcp@latest`)
**Purpose:** Зафиксировать synthetic baseline ДО v2-рефакторинга. После v2 повторить замер этими же сценариями.

---

## TL;DR

Все Core Web Vitals в зелёной зоне даже под `Slow 4G + CPU 4x`. Жалоба «очень лагучий» **не подтверждается** synthetic-замером на `/words`. Реальная картина юзера требует RUM (Vercel Speed Insights — MCP пока не авторизован).

| Метрика | Desktop, no throttle | Mobile (Slow 4G + CPU 4x), cold isolated | Порог Good |
| --- | --- | --- | --- |
| TTFB | 225 ms | 60 ms¹ | < 800 ms |
| LCP | 546 ms | 921 ms | < 2 500 ms |
| CLS | 0.00 | 0.00 | < 0.1 |
| INP (SPA-nav click) | — | 13 ms | < 200 ms |
| INP (typing in filter) | — | 35 ms | < 200 ms |

¹ Vercel edge раздаёт HTML за ~60 мс независимо от пути и cookies — теория про `cookies()` force-dynamic как critical bottleneck **не подтверждена**.

---

## Сценарии и артефакты

| Сценарий | Trace | Conditions |
| --- | --- | --- |
| Cold load `/words`, desktop | `trace-desktop-cold.json` | No throttle |
| Cold load `/words`, mobile (HTTP cache hot) | `trace-mobile-slow4g-cpu4x.json` | Slow 4G + CPU 4x |
| Cold load `/words`, fresh isolated context | `trace-mobile-cold-isolated.json` | Slow 4G + CPU 4x |
| Hard nav `/words` → `/tester` через `navigate_page` | `trace-nav-words-to-tester.json` | Slow 4G + CPU 4x |
| SPA-nav через клик по `<Link>` | `trace-spa-nav-click-tester.json` | Slow 4G + CPU 4x |
| Typing в filter input | `trace-filter-typing.json` | Slow 4G + CPU 4x |

Скриншоты: `screenshot-desktop.png`, `screenshot-tester.png`.

Trace-файлы можно открыть в `chrome://tracing` или DevTools Performance panel (Load profile).

---

## Network breakdown (cold `/words`)

20 запросов на cold load. HTML 50 KB decoded, общий transfer ~190 KB encoded / ~640 KB decoded.

**JS chunks (decoded):**

| chunk | encoded | decoded |
| --- | --- | --- |
| `07lhk_q6pmm3r.js` | 72 KB | **228 KB** — крупнейший |
| `07-r11g6lpgb8.js` | 30 KB | 110 KB |
| `10jz7oa293407.js` | 19 KB | 64 KB |
| `0d3shmwh5_nmn.js` | 13 KB | 55 KB |
| `0cje14_narrpx.js` | 11 KB | 53 KB |
| `00p-41jq4urj5.js` | 10 KB | 32 KB |
| прочие 6 chunks | < 30 KB | < 70 KB |

Имена обфусцированы Turbopack — конкретное соответствие (`react-table` vs `lucide-react` vs framework) нужно вытянуть из bundle analyzer уже на исходниках v2.

**RSC prefetch:** при загрузке `/words` подгружаются `_rsc=` payloads для `/login`, `/tester`, `/phrases` **и снова `/words`** — все по **два раза**, с разными `_rsc` query-параметрами. Каждый ~600 байт encoded, итого 7 fetch'ей × ~0.6 KB. Дублирование может быть особенностью Next 15 Link prefetch (раз в visibilityChange + раз на hover), уточнить.

---

## Mapping на гипотезы из `project_v2_perf_findings`

| Гипотеза | Статус после baseline | Комментарий |
| --- | --- | --- |
| 🔴 1. `RootLayout` cookies() → force-dynamic → высокий TTFB | **Опровергнут** | TTFB 60–225 ms. Vercel edge маскирует cost dynamic-рендера. v2 уберёт это «бесплатно» вместе с auth, но это не главная боль. |
| 🔴 2. Каждая страница хайдратирует весь словарь | **Не измерим напрямую, но не критичен** | HTML 50 KB на 279 entries ≈ 180 байт/entry. Полная фильтрация на клиенте идёт за <50 ms в `trace-filter-typing.json`. |
| 🔴 3. `next.config.ts` пустой, нет `optimizePackageImports` | **Подтверждён частично** | Самый большой chunk 228 KB decoded. Bundle analyzer на v2 покажет точно. |
| 🔴 4. `cache: "no-store"` внутри `unstable_cache` — code smell | Не виден в RUM, чисто smell | В v2 GitHubStorage уходит. |
| 🟡 5. `EditableCell` derive-state-from-props | Не замерено | Требует логина / write-path, в baseline не покрыт. |
| 🟡 6. `VocabularyTable` без виртуализации | **Не проблема при pageSize=10** | INP 35 ms на typing. Станет проблемой при росте до 1 000+ entries. |

**Главный вывод:** «лагучесть», о которой говорит юзер, по synthetic данным **не существует на /words read-path**. Если ощущение реально, источник, вероятно, в одном из:

- write-path (`/login`, edit, save через GitHub Contents API) — не покрыт baseline;
- cold-start Vercel functions после долгого простоя — не воспроизводится в активной сессии;
- сабъективное «slow feel» от утилитарного стиля без полировки.

Это меняет вес аргументов для v2 design doc: основная мотивация **не perf**, а архитектура (личный словарь, удаление auth, multi-language). Perf — побочный приятный эффект.

---

## Что не измерено

- **RUM (Vercel Speed Insights)** — MCP `vercel` нужен OAuth (`/mcp` → vercel). См. `project_mcp_setup`.
- **Write-path** (логин, сохранение, GitHub PUT) — требует учётки админа.
- **Cold-start функций Vercel** — для отдельной сессии после ≥ часа простоя.
- **`/phrases` и `/tester` ход теста** — взяли только цифру навигации, не interactive раунд.
- **PolishLettersPopover open** — UI которого касается v2 (отключить для `lng=en`).

---

## Воспроизводимость

1. Открыть Chrome через MCP `new_page` с `isolatedContext` для чистого кэша.
2. Установить `emulate(cpuThrottlingRate: 4, networkConditions: "Slow 4G")` либо без throttle.
3. `navigate_page` на target URL.
4. `performance_start_trace(reload: true)` → autoStop собирает данные до `loadEvent + 5 s`.
5. Сохранять trace в `perf-baseline/trace-*.json`.

После v2 — повторить теми же сценариями и сравнить trace pair-wise.
