# Project 2 Data Studio Frontend

React + Vite frontend for the Data Studio project.

## Deployed URLs

- Frontend (GitHub Pages): `https://khiankhun.github.io/15113-project2-R-Frontend/`
- Backend (Render): `https://one5113-project2-r-backend.onrender.com`

## Features

- CSV upload + dataset preview table
- Schema / NA summary panel
- Transform panel (whitelist-only operations)
- Undo last transform + download current CSV
- Plot Studio:
  - histogram, scatter, boxplot, line, bar
  - variable/axis/parameter controls
  - plot preview + PNG download
- Regression Studio:
  - linear / polynomial / kernel / knn / spline / additive / logistic
  - fit model + draw fitted curve + PNG download
- Prediction Studio:
  - predict from fitted model
  - show prediction result
  - curve overlay support when plot_x matches
- Accordion sections for left and right panels
- Fixed preview window with internal scrolling

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Recommended local `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

4. Start dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Production Build (GitHub Pages)

For repo-based Pages URL, build with base path:

```bash
npm run build -- --base=/15113-project2-R-Frontend/
```

Then publish the `dist` output to GitHub Pages.

## API Connection Rules

- API client source: `src/api/client.js`
- Runtime base URL:
  - `VITE_API_BASE_URL` if provided
  - otherwise relative `/api` path
- Vite dev proxy (`vite.config.js`) forwards `/api/*` to `VITE_API_BASE_URL` or `http://localhost:8000`

## Required Backend CORS

Render backend must include:

```env
ALLOWED_ORIGINS=https://khiankhun.github.io,http://localhost:5173
```

After changing Render env vars, redeploy backend.

## Troubleshooting

- Blank GitHub page:
  - usually missing `--base=/15113-project2-R-Frontend/` during build
- `Failed to fetch` on GitHub Pages:
  - check Render service is live
  - verify `ALLOWED_ORIGINS` includes `https://khiankhun.github.io`
  - verify frontend was built with correct `VITE_API_BASE_URL`
- Works locally but fails online:
  - local `.env` does not affect already deployed static files; rebuild and republish

## Security Notes

- Frontend never executes user-submitted code.
- Transform, plotting, and regression actions are backend whitelist endpoints.
- Errors are shown as readable UI messages.

## Folder Structure

```text
.
|-- src/
|   |-- api/client.js
|   |-- App.jsx
|   |-- components/
|   `-- styles/app.css
|-- vite.config.js
|-- .env.example
|-- prompt_log.md
`-- README.md
```
