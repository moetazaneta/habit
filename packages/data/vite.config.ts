import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: { unit: "vp test" },
  },
  test: {
    name: "data",
    include: ["src/**/*.test.{ts,tsx}", "convex/**/*.test.ts"],
    // The provider's tests run in jsdom. The Convex functions' tests choose edge-runtime in their
    // first line, as the Convex runtime is closer to it than to Node.
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
