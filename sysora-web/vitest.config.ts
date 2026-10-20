import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * `server-only` throws when it is imported outside a React Server
 * Component, which is the whole point of the package and also means
 * none of the server modules can be unit tested without a stub. The
 * alias swaps it for an empty module; nothing else about the modules
 * changes.
 */
export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
