# Project 2 Data Studio Frontend

React + Vite frontend for the Data Studio MVP.

## Features (MVP)

- Upload CSV through UI
- Display preview table
- Display schema and NA counts
- Undo last transform
- Download current processed CSV
- Fixed-height preview window with scrolling
- Apply transforms through whitelist UI:
  - Drop NA rows
  - Filter rows

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Run dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

Keep `VITE_API_BASE_URL` empty for local development so requests use Vite proxy.

## API Connection

- Local development uses Vite proxy:
  - `/api/*` -> `http://localhost:8000`
- Deployment should set:
  - `VITE_API_BASE_URL=https://your-backend-url`

## Safety Notes

- All transforms are server-side whitelist operations.
- Frontend never sends user code for execution.
- Errors from backend are shown as readable messages.

## Folder Structure

```text
.
├─ src/
│  ├─ api/client.js
│  ├─ App.jsx
│  ├─ components/
│  └─ styles/app.css
├─ vite.config.js
├─ .env.example
└─ prompt_log.md
```
