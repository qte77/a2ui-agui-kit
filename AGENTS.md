# AGENTS.md

Working agreement for AI agents in `a2ui-agui-kit` — the shared AG-UI + A2UI protocol
bridge consumed by agenthud-agui-a2ui and ldnmxx-hack. Derived from agenthud's AGENTS.md;
self-contained and tracked — treat it as the source of truth.

## Principles

- **KISS / DRY / YAGNI** — simplest solution that works; single source of truth (this
  package IS that source for the A2UI contract — never let a consumer re-fork it); build
  only what's asked, no speculative features.
- **Concise & focused** — minimal change for the task; touch only task-related code.

## Scope

This package has two layers. `src/*.ts` (default export, `@qte77/a2ui-agui-kit`) is the CORE
dependency-light layer: zod-validated contracts and plain logic, no React. `src/react/*.tsx`
(`@qte77/a2ui-agui-kit/react`, optional peer deps `react` + `@a2ui/react`) is the presentation
layer — A2UISurface/CatalogViewer/EventStream/a2uiTheme — plus `styles/a2ui.css`
(`@qte77/a2ui-agui-kit/styles.css`). Do not add a runtime-specific provider implementation
(Cloudflare/OpenRouter/fetch) to either layer — that belongs in the consuming app. Never let the
core layer import from `src/react/` — the core must stay usable without React installed.

## Tests

- Core tests live in `tests/` (flat); react tests live in `tests/react/` (jsdom project). Import
  the module under test via `../src/….js` or `../../src/react/….js`.
- **Test what matters:** contract validation, `applyA2UIEvent`, `detectInjection`,
  `runChain`, and react-layer behavior (props, callbacks, DOM output) — real logic. Skip trivial
  config/type-only files and CSS/styling; don't chase coverage.
- **Red-Green-Refactor:** for load-bearing module logic, write the failing behavior test
  **first** (Red), implement the minimum to pass (Green), then refactor.

## Commits & PRs

- Conventional-commit prefixes (`feat`/`fix`/`chore`/`docs`/`test(...)`); one topic per
  branch; open a PR; merge when CI is green (typecheck, lint, test, build, security).

## Style

Plain text in docs and output — no emoji, no decorative glyphs.
