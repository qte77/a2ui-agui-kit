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

This package is the CORE (dependency-light) layer: zod-validated contracts and plain
logic, no React. Do not add React components, styles, or a runtime-specific provider
implementation (Cloudflare/OpenRouter/fetch) here — those belong in the consuming app or
a later `./react` entry point.

## Tests

- Tests live in `tests/` (flat); import the module under test via `../src/….js`.
- **Test what matters:** contract validation, `applyA2UIEvent`, `detectInjection`,
  `runChain` — real logic. Skip trivial config/type-only files; don't chase coverage.
- **Red-Green-Refactor:** for load-bearing module logic, write the failing behavior test
  **first** (Red), implement the minimum to pass (Green), then refactor.

## Commits & PRs

- Conventional-commit prefixes (`feat`/`fix`/`chore`/`docs`/`test(...)`); one topic per
  branch; open a PR; merge when CI is green (typecheck, lint, test, build, security).

## Style

Plain text in docs and output — no emoji, no decorative glyphs.
