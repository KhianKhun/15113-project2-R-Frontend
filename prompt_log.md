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
- Added fit flow + stored `model_id` + "drawning regression line" + curve download.
- Added prediction model + drawing prediction points in plot

## Human vs AI Contribution

- Human: requirements, API contract, UI scope.
- AI: component scaffolding, API integration, styling, docs templates.
