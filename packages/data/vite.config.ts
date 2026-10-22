import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: { unit: "vp test" },
  },
  test: {
    name: "data",
    include: ["src/**/*.test.{ts,tsx}"],
    // Until the first tests land with the implementation.
    passWithNoTests: true,
  },
});
