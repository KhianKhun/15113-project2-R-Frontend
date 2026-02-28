# Prompt Log (Frontend)

## Tools / Models Used

- Codex (GPT-5 coding agent)

## Session Notes

### 2026-02-24

- Created React + Vite MVP scaffold.
- Implemented API client for upload/preview/transform.
- Implemented upload panel, preview table, column summary.
- Implemented transform UI for:
  - `drop_na_rows`
  - `filter_rows`
- Added undo button using dataset version history.
- Added CSV download button for current dataset version.
- Added fixed-height preview table with internal scrolling.
- Added Plot Studio panel with variable/parameter controls and render flow.
- Added plot preview area and PNG download action.
- Added Regression panel with 7 model options and parameter controls.
  - `Linear regression`
  - `Polynomial regression`
  - `Kernel Smoother`
  - `KNN Smoother`
  - `Spline Smoother`
  - `Additive Model`
  - `Logistic Regression`
  (Gpt gives the sample code and required package. I change/write based on that.)
- Added fit flow + stored `model_id` + "drawning regression line" + curve download.
- Added prediction model + drawing prediction points in plot

### 2026-02-26

- Refined layout behavior for desktop-first full-width style with horizontal overflow when needed.
- Added accordion collapse/expand interactions for right-side panels:
  - `Columns`
  - `Transforms`
  - `Plots`
  - `Regression`
  - `Prediction`
- Added accordion collapse/expand interactions for left-side panels:
  - `Data Preview`
  - `Plot Preview`
  - `Regression Curve Preview`
  - `Prediction Result`
- Increased size and visibility of `+ / -` section toggle icons.
- Updated transform/filter UX:
  - Removed `Logic` selector from filter UI.
  - Removed `is_in` option.
  - Added split operator selectors:
    - `Operator (factor)`
    - `Operator (numeric)`
  - Added numeric/math operators in filter:
    - `exp`, `log`, `^`, `+`
  - Added checkbox option to control "Add as new column".
  - Added frontend value behavior:
    - `exp` and `log` auto-fill value as `NA`.

### 2026-02-27

- Updated undo/history behavior to avoid duplicate history entries when repeated apply produces unchanged dataset state.
- Added upload-switch reset safeguards:
  - On new CSV upload, clear visualization/prediction state.
  - Force remount/reset for form-driven panels to avoid stale column selections from prior datasets.
- Fixed multiple state carry-over issues between dataset versions and uploads.
- Deployment troubleshooting and configuration checks for GitHub Pages + Render integration:
  - `VITE_API_BASE_URL` production usage.
  - Vite `base` path requirements for repo-hosted pages.
  - Render CORS (`ALLOWED_ORIGINS`) alignment with GitHub Pages origin.

## Human vs AI Contribution

- Human: requirements, API contract, UI scope, deployment target choices.
- AI: component scaffolding, API integration, styling, transform UX iteration, state reset logic, deployment/debug guidance.
