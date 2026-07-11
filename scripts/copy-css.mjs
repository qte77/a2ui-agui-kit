// Tiny build step: tsc (tsconfig.build.json) only emits JS/d.ts, so copy the shared A2UI
// stylesheet into dist/ alongside it. Keeps the "./styles.css" export (dist/styles.css) in sync
// with styles/a2ui.css without pulling in a bundler for one file.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("styles/a2ui.css", "dist/styles.css");
