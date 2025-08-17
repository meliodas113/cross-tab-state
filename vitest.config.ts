import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // gives you describe, it, expect, etc.
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
