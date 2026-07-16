# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Types of changes**: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`

## [Unreleased]

### Changed

- Version 0.3.0: restore **functional depth** to `styles/a2ui.css` — cards, the loading skeleton,
  and the "working" chip regain `box-shadow: var(--shadow-card)`, and the skeleton's loading
  **shimmer** is a token-driven `linear-gradient` background-position sweep again (0.2.0 had
  flattened it to a solid opacity pulse). The generating chip stays non-pill (`var(--radius-md)`).
  Adds `@qte77/ui-theme` (>= 0.2.0) as an optional peer for the `--shadow-card` token.
  `.stylelintrc.json` drops the `box-shadow`/`*-gradient` bans — functional depth is now sanctioned
  by qte77 `brand/DESIGN.md` "Motion & effects"; `color-no-hex` stays so the surface remains
  token-driven. Reverses the 0.2.0 flattening, which was based on a misread of the brand intent.

### Added

- `docs/decisions/0001-keep-a2ui-render-layer.md`: ADR recording the decision to keep A2UI as the
  render layer (bet on the protocol, not the `@a2ui/react` renderer; no dual-render hedge), with
  revisit triggers tracked in #4. From a 2026-07 A2UI-vs-Vercel-json-render deep-research pass.
- Version 0.2.0: React presentation layer + flattened A2UI surface styles as new package entry
  points. `src/react/` (exported as `@qte77/a2ui-agui-kit/react`): `A2UISurface.tsx`
  (`A2UISurfaceProvider`/`A2UISurface`, ported from agenthud-agui-a2ui's `ui/src/A2UISurface.tsx`
  — de-coupled from its app-specific action-bridge singleton in favor of a plain `onAction` prop),
  `CatalogViewer.tsx` (ported unchanged from `ui/src/CatalogViewer.tsx`), `EventStream.tsx`
  (ported from `ui/src/EventStream.tsx`, now importing `EventLogEntry` from the core layer's
  `events.ts` instead of an app-specific module, plus a new optional `renderExtra?: (entry) =>
  ReactNode` prop so a consumer can append its own per-entry content — e.g. a usage status chip —
  without forking the component), `a2uiTheme.ts` (ported from `ui/src/theme/a2uiTheme.ts`).
  `styles/a2ui.css` (exported as `@qte77/a2ui-agui-kit/styles.css`): the `.a2ui-surface .qte-*`
  component rules + motion/skeleton/busy states, ported from agenthud-agui-a2ui's
  `ui/src/index.css` and **flattened** per qte77's `brand/DESIGN.md` "Motion & effects" mandate —
  no `box-shadow` (card/skeleton/chip elevation is a `border` + surface-tone step), the skeleton
  shimmer is a solid opacity pulse instead of a `linear-gradient` background-position animation,
  and the generating chip's `border-radius: 999px` pill is now `var(--radius-md)`. Colors and
  radii are all `@qte77/ui-theme` CSS custom properties (no raw hex). `react` and `@a2ui/react`
  are optional peer dependencies — the core layer stays usable without React.
- `.stylelintrc.json` + `npm run stylelint`: the flat-design enforcement gate —
  `declaration-property-value-disallowed-list` bans `box-shadow` and any `*-gradient` in
  `background`/`background-image`, `color-no-hex` forces token-var colors. Wired into
  `.github/workflows/ci.yml`'s build job.
- `vitest.config.ts`: split into a `core` project (plain Node, existing core-layer tests) and a
  `react` project (jsdom + `@testing-library/react` + `@testing-library/jest-dom`, `tests/react/`).
  `eslint.config.js`: `.tsx` coverage + `eslint-plugin-react-hooks`, scoped to `src/react` and
  `tests/react`.
- Initial core (dependency-light) package: `src/contract.ts` (zod A2UI wire-format
  schemas + acyclic-tree guard + recording/decision-tree shape, ported from
  agenthud-agui-a2ui), `src/events.ts` (AG-UI event vocabulary + `EventLogEntry`/
  `AgentEvent`/`appendLogEntry`), `src/applyA2UIEvent.ts` (render-injection seam, ported
  from agenthud-agui-a2ui), `src/guard.ts` (`detectInjection`, ported from ldnmxx-hack),
  `src/renderTool.ts` (`RENDER_UI_TOOL` + `isSelfContainedBatch`, ported from
  ldnmxx-hack), `src/providers.ts` (`Provider`/`ToolSpec`/`runChain` — a runtime-agnostic
  first-valid-wins combinator extracted from ldnmxx-hack's Cloudflare-specific provider
  chain), `src/prompt.ts` (`buildSystemPrompt`, combining agenthud-agui-a2ui's and
  ldnmxx-hack's A2UI catalog-authoring rules). Executes
  qte77/agenthud-agui-a2ui#211
- `.github/workflows/ci.yml`: security job (gitleaks + semgrep, mirroring ldnmxx-hack) +
  build job (typecheck + lint + test + build, mirroring agenthud-agui-a2ui)
- `.github/workflows/codeql.yml`: CodeQL analysis, mirroring agenthud-agui-a2ui
- `.github/workflows/publish.yml`: publish to GitHub Packages on a `package.json` version
  bump, mirroring qte77/qte77's `publish-ui-theme.yml`
