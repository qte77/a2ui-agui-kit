# Contributing

Thanks for considering a contribution to **@qte77/a2ui-agui-kit** — the shared AG-UI +
A2UI protocol bridge consumed by agenthud-agui-a2ui and ldnmxx-hack.

## Documentation hierarchy

One audience per file — reference, don't duplicate:

| File | Audience | Owns |
| --- | --- | --- |
| [README.md](README.md) | users / evaluators | what this is, why, how — the front door |
| CONTRIBUTING.md (this file) | contributors | dev setup, conventions, releasing |
| [AGENTS.md](AGENTS.md) | AI agents | behavioral rules |
| [CHANGELOG.md](CHANGELOG.md) | everyone | notable changes by version |

## Development

Requires Node.js 22+.

```bash
npm install        # dependencies (zod is a peerDependency; also listed as a devDependency for local work)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm test           # vitest run
npm run build      # tsc -p tsconfig.build.json -> dist/
```

### Local registry auth

Copy [`.npmrc.example`](.npmrc.example) to `.npmrc` (gitignored) and export
`NODE_AUTH_TOKEN` as a PAT with `read:packages` (add `write:packages` if you'll publish
manually). CI sets `NODE_AUTH_TOKEN` from the job's `GITHUB_TOKEN`.

## Test-first policy

Non-trivial module logic (contract validation, `applyA2UIEvent`, `detectInjection`,
`runChain`) is test-first: write the failing behavior test (Red), implement the minimum
to pass (Green), then refactor. Tests live flat in `tests/`, importing the module under
test via `../src/…`. Skip unit tests for trivial config/type-only files — verify those by
effect (build/lint passing) instead.

## Pull requests

- One concern per PR, one topic per branch; reference issues (`Closes #123`).
- Pre-merge: `npm run typecheck && npm run lint && npm test && npm run build` green, plus
  the CI `security` job (gitleaks + semgrep) clean.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) — `feat`, `fix`, `chore`,
`docs`, `refactor`, `test`. One topic per branch.

## Releasing

The version bump is a manual PR (bump `package.json` `version`, roll `CHANGELOG.md`
`[Unreleased]` into a dated section); merging to `main` triggers
[`publish.yml`](.github/workflows/publish.yml), which publishes to GitHub Packages
(idempotent — skips if that version is already published).
