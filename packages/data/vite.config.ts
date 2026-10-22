import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: { unit: "vp test" },
  },
  test: {
    name: "data",
    // The Convex functions' tests choose the edge-runtime environment in their first line, as the
    // Convex runtime is closer to it than to Node.
    include: ["src/**/*.test.{ts,tsx}", "convex/**/*.test.ts"],
  },
});
