import { defineConfig } from "vitest/config";

// Two projects in one config (Vitest 3.2+ `test.projects`, replaces a separate
// vitest.workspace.ts): "core" runs the dependency-light layer's tests under plain Node (no
// DOM, no @testing-library); "react" runs the presentation layer's component tests under jsdom
// with @testing-library/react + jest-dom matchers.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "core",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "react",
          environment: "jsdom",
          include: ["tests/react/**/*.test.tsx"],
          setupFiles: ["tests/react/setup.ts"],
          // Matches agenthud-agui-a2ui/ui/vite.config.ts: globals lets each test file import
          // the plain "@testing-library/jest-dom" (jest-style global `expect`) rather than
          // requiring the vitest-specific "/vitest" entry point everywhere.
          globals: true,
        },
      },
    ],
  },
});
