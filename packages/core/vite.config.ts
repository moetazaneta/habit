import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: { unit: "vp test" },
  },
  test: {
    name: "core",
    include: ["src/**/*.test.ts"],
    // Until the first tests land with the implementation.
    passWithNoTests: true,
  },
});
