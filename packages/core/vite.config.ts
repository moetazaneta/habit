import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: { unit: "vp test" },
  },
  test: {
    name: "core",
    include: ["src/**/*.test.ts"],
    env: {
      // Chile moves its clocks at midnight, so a Day that is computed from a local midnight plus
      // 24 hours lands on the wrong date here. The tests of the Day math run in this zone.
      TZ: "America/Santiago",
    },
  },
});
