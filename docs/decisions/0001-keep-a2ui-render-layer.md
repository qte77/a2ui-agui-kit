# 1. Keep A2UI as the render layer; bet on the protocol, not the renderer

- Status: accepted
- Date: 2026-07-16
- Tracking: [issue #4](https://github.com/qte77/a2ui-agui-kit/issues/4) (revisit triggers as a checklist)

## Context

`@qte77/a2ui-agui-kit` is the estate's seam over the agent-driven UI stack: agents emit an A2UI
UI description (rendered via `@a2ui/react`, pre-1.0), streamed over AG-UI, consumed by agenthud and
ldnmxx. `@a2ui/react` being pre-1.0 raised whether to migrate the render layer to Vercel's
json-render (`json-render.dev` / `vercel-labs/json-render`).

A deep-research pass (fan-out + adversarial verification, 2026-07) established:

- **AG-UI is the agent-to-UI event transport, not a renderer.** It already fully supports A2UI and
  is orthogonal to this decision — the estate's AG-UI plumbing is safe whichever renderer wins.
- The real choice is the **render layer: A2UI vs json-render.**
- **json-render** (Vercel Labs, ~16k GitHub stars, multi-framework incl. React Native) has strong
  momentum but its release cadence went quiet ~10 weeks. Critically, it already ships a
  proof-of-concept **A2UI renderer**, and Google itself suggested json-render "could become a
  dedicated renderer for A2UI" — so it is not a strict either/or.
- **A2UI** is a multi-vendor, cross-agent **protocol** with an official React client and native
  AG-UI support; json-render is a single-vendor tool that (also) renders A2UI.
- Both are pre-1.0 "Labs" projects sharing the same catalog-constrained, guardrailed generation
  safety model — neither has a decisive maturity or security edge today.

## Decision

1. **Keep A2UI as the render layer for now.** Do not migrate to json-render at this time.
2. **Treat A2UI-the-protocol as the durable bet, not `@a2ui/react`-the-renderer.** Keep the renderer
   swappable behind this package's seam: `@a2ui/react`-specific types and imports must not leak past
   `src/` / `src/react/` into consumers.
3. **Do not hedge with dual-render support.** A second renderer now is speculative (YAGNI /
   avoid-hasty-abstraction); the seam already makes a future swap a one-package change.

## Consequences

- Consumers (agenthud, ldnmxx) import only from `@qte77/a2ui-agui-kit`, so the protocol dependency
  stays contained; a future renderer swap is a package-internal change, not an app rewrite.
- The A2UI protocol/contract investment (`src/contract.ts`, `src/applyA2UIEvent.ts`) survives even if
  the renderer is later swapped — json-render is building toward rendering A2UI.
- This is a **monitored** decision, not a default: revisit on the triggers below, or at ~mid-2027.
  The triggers live as a checklist in issue #4 so a trip actually surfaces.

## Revisit triggers (summary; full checklist in issue #4)

- **Toward json-render:** its A2UI renderer becomes documented/production-ready; Vercel graduates it
  out of "Labs" or ships 1.0; A2UI 1.0 slips past ~mid-2027, goes stale (90+ days), or Google
  deprioritizes it.
- **Toward staying:** json-render's quiet period becomes a 6+ month stall or the repo is archived;
  it keeps shipping breaking changes with no 1.0 commitment; A2UI reaches 1.0 with broad multi-vendor
  adoption.
