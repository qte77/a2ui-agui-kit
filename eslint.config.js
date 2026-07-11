import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

// Mirrors agenthud-agui-a2ui/ui/eslint.config.js's stack (@eslint/js + typescript-eslint +
// eslint-plugin-sonarjs). The core layer (src/*.ts) ships no React/JSX; the optional
// presentation layer (src/react/**/*.tsx + tests/react/**/*.tsx) additionally gets
// eslint-plugin-react-hooks, scoped so the dependency-light core rules stay React-free.
export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        projectService: { allowDefaultProject: ["vitest.config.ts"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { sonarjs },
    rules: {
      // Catch the "Complex Method" class locally + in CI (CodeFactor uses similar metrics).
      complexity: ["error", 12],
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },
  // React-only rules, scoped to the presentation layer (src/react) and its tests.
  {
    files: ["src/react/**/*.tsx", "tests/react/**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Idiomatic React event handlers like `onClick={() => setX(v)}` return void expressions.
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
  // Disable type-aware rules on plain JS config files (e.g. eslint.config.js itself).
  { files: ["**/*.js"], extends: [tseslint.configs.disableTypeChecked] },
);
