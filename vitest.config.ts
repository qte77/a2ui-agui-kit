import { defineConfig } from "vitest/config";

// Node environment: this core layer is dependency-light (contract/event/guard/provider logic
// only) and has no DOM — no jsdom, no @testing-library. The React surface (a later phase) will
// need its own jsdom-based config alongside its own package entry point.
export default defineConfig({
  test: {
    environment: "node",
  },
});
