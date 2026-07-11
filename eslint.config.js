import js from "@eslint/js";
import globals from "globals";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

// Mirrors agenthud-agui-a2ui/ui/eslint.config.js's stack (@eslint/js + typescript-eslint +
// eslint-plugin-sonarjs), minus the React-only plugins (react-hooks/react-refresh) — this
// package is the dependency-light core layer and ships no React/JSX.
export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
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
  // Disable type-aware rules on plain JS config files (e.g. eslint.config.js itself).
  { files: ["**/*.js"], extends: [tseslint.configs.disableTypeChecked] },
);
