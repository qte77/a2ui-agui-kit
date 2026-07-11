# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Types of changes**: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`

## [Unreleased]

### Added

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
