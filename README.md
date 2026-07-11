# @qte77/a2ui-agui-kit

> Shared AG-UI + A2UI protocol bridge — contract validation, event vocabulary, an
> injection guard, and a runtime-agnostic tool-call combinator for agents that render
> A2UI surfaces.

[![License](https://img.shields.io/badge/license-Apache%202.0-58f4c2.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-58f4c2.svg)](CHANGELOG.md)
[![CI](https://github.com/qte77/a2ui-agui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/qte77/a2ui-agui-kit/actions/workflows/ci.yml)
[![CodeQL](https://github.com/qte77/a2ui-agui-kit/actions/workflows/codeql.yml/badge.svg)](https://github.com/qte77/a2ui-agui-kit/actions/workflows/codeql.yml)

> Two layers, one package: the CORE (dependency-light, zod-validated contracts and plain
> logic, no React) is the default entry point. An optional `@qte77/a2ui-agui-kit/react` entry
> point adds the presentation layer (A2UISurface, CatalogViewer, EventStream), and
> `@qte77/a2ui-agui-kit/styles.css` ships the flattened A2UI surface styles. Both are optional —
> a consumer that only needs contract validation never pulls in React.

## What

Extracted from agenthud-agui-a2ui (the canonical superset) and ldnmxx-hack (the
domain-agnostic subset) so both apps — and any future one — validate and prompt against
the same A2UI contract instead of hand-copying it:

- `contract.ts` — zod schemas for the A2UI wire format (beginRendering / surfaceUpdate /
  dataModelUpdate), with an acyclic-tree guard, plus a generic recording/decision-tree shape
- `events.ts` — the AG-UI event-type vocabulary, `EventLogEntry`/`AgentEvent`, and
  `appendLogEntry` (coalesces streamed text deltas)
- `applyA2UIEvent.ts` — the seam that validates an event's A2UI batch and hands it to an
  injected `render` callback; unknown event types pass through untouched
- `guard.ts` — `detectInjection`: a cheap first-pass prompt-injection/jailbreak check
- `renderTool.ts` — the `render_ui` tool JSON schema + `isSelfContainedBatch` validator
- `providers.ts` — `Provider`/`ToolSpec`/`runChain`: a transport-agnostic first-valid-wins
  combinator for chaining forced-tool-call backends
- `prompt.ts` — `buildSystemPrompt`: a parameterized A2UI system-prompt builder (the app
  supplies its own domain instructions)

Optional React presentation layer (`@qte77/a2ui-agui-kit/react`, peer-deps `react` +
`@a2ui/react`):

- `A2UISurfaceProvider` / `A2UISurface` — wraps `@a2ui/react`'s `A2UIProvider` +
  `A2UIRenderer`, pre-registers the default component catalog, and applies the kit's theme.
  `onAction` is a plain callback prop (`(actionName: string) => void`) — wire it to your own
  agent/transport, or omit it for a no-op.
- `CatalogViewer` — a modal listing the A2UI standard component catalog.
- `EventStream` — renders an `EventLogEntry[]` event log; accepts an optional
  `renderExtra?: (entry) => ReactNode` to append per-entry content (e.g. a consumer's own usage
  chip) without forking the component.
- `qteA2uiTheme` (from `a2uiTheme.ts`) — routes the A2UI catalog's themeable components to the
  kit's `qte-*` class hooks, styled in `styles/a2ui.css`.

`@qte77/a2ui-agui-kit/styles.css` — the `.a2ui-surface .qte-*` component rules `qteA2uiTheme`
targets, plus the surface's motion/skeleton/busy states. **Flat by design** (per qte77's
`brand/DESIGN.md` "Motion & effects"): elevation is a `border` + surface-tone step, never a
`box-shadow`; there is no gradient shimmer and no pill radii (only the border-radius scale,
4/6/12px). Motion is limited to a subtle entrance and a low-contrast "working" pulse, both
collapsed under `prefers-reduced-motion`. It expects `@qte77/ui-theme`'s CSS custom properties
(`--color-*` / `--radius-*` / `--font-*`) to already be in scope — import that stylesheet first.

## How

### Install

GitHub Packages requires an auth token even to *install* a public package. Add an
`.npmrc` next to your `package.json` (see [`.npmrc.example`](.npmrc.example)):

```ini
@qte77:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Locally, export `NODE_AUTH_TOKEN` as a PAT (or fine-grained token) with `read:packages`.
In CI, set it from the job's `GITHUB_TOKEN` (with `permissions: packages: read`) or a
dedicated secret.

```bash
npm install @qte77/a2ui-agui-kit zod
```

### Use

```ts
import {
  A2UIMessageBatchSchema,
  applyA2UIEvent,
  appendLogEntry,
  detectInjection,
  RENDER_UI_TOOL,
  isSelfContainedBatch,
  runChain,
  buildSystemPrompt,
  type Provider,
  type ToolSpec,
} from "@qte77/a2ui-agui-kit";

const entry = applyA2UIEvent(event, Date.now(), (messages) => renderSurface(messages));
const log = appendLogEntry(previousLog, entry);
```

To use the React presentation layer, install `react`, `react-dom`, and `@a2ui/react` alongside
this package, import `@qte77/ui-theme` (or your own tokens) and this kit's styles once, then
render the surface:

```ts
import "@qte77/ui-theme/tailwind/tokens.css"; // --color-*/--radius-*/--font-* tokens
import "@qte77/a2ui-agui-kit/styles.css";

import { A2UISurfaceProvider, A2UISurface, EventStream } from "@qte77/a2ui-agui-kit/react";
```

```tsx
<A2UISurfaceProvider onAction={(name) => sendAction(name)}>
  <A2UISurface fallback={<div className="qte-skeleton" />} />
</A2UISurfaceProvider>
<EventStream events={log} renderExtra={(entry) => <UsageChip entry={entry} />} />
```

## Why

Two apps (agenthud-agui-a2ui, ldnmxx-hack) independently grew the same A2UI contract,
event-log shape, and injection guard, with agenthud's superset drifting from ldnmxx's
subset each time either changed. Extracting the shared, dependency-light pieces into one
package keeps both — and any future AG-UI/A2UI consumer — validating against one schema
instead of two that can silently diverge. Executes
[qte77/agenthud-agui-a2ui#211](https://github.com/qte77/agenthud-agui-a2ui/issues/211).

## Refs

- [A2UI specification](https://a2ui.org/specification/v0.9-a2ui/) ·
  [AG-UI](https://docs.ag-ui.com/introduction)
- [Contributing](CONTRIBUTING.md) — dev setup, tests, releasing
- [AGENTS.md](AGENTS.md) — behavioral rules for AI agents working on this repo
- [agenthud-agui-a2ui](https://github.com/qte77/agenthud-agui-a2ui) — superset source
- [ldnmxx-hack](https://github.com/qte77/ldnmxx-hack) — subset source

## License

Apache-2.0 — see [LICENSE](LICENSE). Ported code is attributed in [NOTICE](NOTICE).
