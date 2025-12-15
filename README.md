# Polish Vocabulary Trainer 🇵🇱

A small educational project built with **React + TypeScript**, hosted on **GitHub Pages**, designed to help learn the Polish language.

The project is built with a focus on:
- a fast MVP
- convenient data manipulation
- future expansion (tester, statistics)

---

## Features (MVP)

### 1. Vocabulary and Phrases

There is a single data source — a table of entries.

Each entry contains:
- Polish (pl)
- English (en)
- `isWord: boolean` — word or phrase

In the UI, this is displayed as **two tables**:
- Words
- Phrases

### 2. Table

For each table:
- column sorting
- filtering
- inline editing
- deleting entries
- adding a new entry (`+`)

### 3. Editing and Saving Mode

Editing follows a **“game save system”** approach:

- all changes live in the application state
- data is **not committed automatically**
- the user explicitly clicks **Save changes**

Before saving:
- data is considered a *draft*
- changes are persistently stored locally

---

## Data Persistence (important)

To prevent data loss on:
- page reload
- temporary network loss
- tab or browser close

a hybrid approach is used.

### Draft storage

- all unsaved changes are stored in `localStorage`
- example key: `vocabulary:draft`

Behavior:
- on application start:
  - if a draft exists → it is used
  - otherwise → data is loaded from GitHub
- on **Save changes**:
  - data is committed to GitHub
  - the draft is cleared

As a result:
- GitHub = source of truth
- localStorage = temporary reliability buffer

---

## Tech Stack

### Core
- React 18
- TypeScript
- Vite

### Tables and logic
- **@tanstack/react-table** — all table logic

> Headless table — full control over the UI

### UI
- **Mantine**
  - layout
  - inputs
  - buttons
  - modals
  - typography

> Mantine is **not used as a ready-made data table**,  
> only as a UI layer.

### Icons
- lucide

### Data storage
- GitHub repository (`data` branch)
- JSON file: `data/vocabulary.json`

### Deployment
- GitHub Pages

---

## Git Architecture

```txt
main      → application source code
gh-pages  → build output for GitHub Pages
data      → data (vocabulary.json)
```

- the app **reads from and writes only to the `data` branch**
- code and data are fully separated

---

## Data Model

```ts
export type Entry = {
  id: string;
  pl: string;
  en: string;
  isWord: boolean;
};
```

```ts
export type VocabularyFile = {
  version: number;
  updatedAt: string;
  entries: Entry[];
};
```

---

## Project Structure

```txt
src/
├─ app/
│   ├─ App.tsx
│   ├─ providers/
│   │   └─ StorageProvider.tsx
│   └─ routes/               # future (tester)
│
├─ features/
│   └─ vocabulary/
│       ├─ components/
│       │   ├─ VocabularyTable.tsx
│       │   ├─ EditableCell.tsx
│       │   ├─ SaveBar.tsx
│       │   └─ PolishKeyboard.tsx (future)
│       │
│       ├─ hooks/
│       │   └─ useVocabulary.ts
│       │
│       ├─ application/
│       │   ├─ loadVocabulary.ts
│       │   ├─ saveVocabulary.ts
│       │   └─ types.ts
│       │
│       └─ domain/
│           ├─ Entry.ts
│           ├─ Vocabulary.ts
│           └─ vocabularyRules.ts
│
├─ shared/
│   ├─ ui/
│   │   ├─ Table.tsx
│   │   └─ ConfirmDialog.tsx
│   │
│   ├─ lib/
│   │   └─ debounce.ts
│   │
│   └─ types/
│       └─ Brand.ts
│
├─ infrastructure/
│   └─ storage/
│       ├─ VocabularyStorage.ts   # interface
│       ├─ GitHubStorage.ts
│       ├─ LocalDraftStorage.ts
│       └─ index.ts
│
├─ styles/
│   └─ theme.ts
│
├─ main.tsx
└─ env.d.ts
```

### Upper-level scheme

```txt
UI (React)
 ↓
Application layer (use cases)
 ↓
Domain (models, rules)
 ↓
Infrastructure (storage, api)
```

---

## Future Plans
### Tester

- mode selection: words / phrases
- number of questions selection
- random sampling
- Polish translation input
- answer validation

### Polish Keyboard

On-screen buttons:

```
ą ć ę ł ń ó ś ż ź
```

- inserts characters into the active input
- used in both the tester and editing modes

---

> If an MVP can’t be built in a couple of evenings, the stack is chosen incorrectly.
