import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/test/**/*.test.ts"],
    coverage: {
      reporter: ["text", "lcov"],
      exclude: ["src/test/**", "**/node_modules/**"],
    },
  },
  resolve: {
    // This helps with the ESM/CommonJS compatibility issue
    conditions: ["import", "require"],
  },
});
