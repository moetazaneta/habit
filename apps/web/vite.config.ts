import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  // The router plugin must run before React's.
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  run: {
    // This package's tests as a cached task, so `vp run ready` replays them when nothing they read
    // changed.
    tasks: {
      unit: "vp test",
      // The end-to-end check on the real backend (e2e/real-backend.ts). It needs the network and
      // the Convex CLI's login, so `vp run ready` does not run it, and it is never cached.
      e2e: { command: "node e2e/real-backend.ts", cache: false },
    },
  },
  test: {
    name: "web",
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
