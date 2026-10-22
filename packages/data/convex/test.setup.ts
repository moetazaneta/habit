/// <reference types="vite-plus/client" />

// The modules of the Convex functions, for `convexTest`. It skips files with two dots, such as the
// tests, this file and the `.d.ts` files, as the Convex CLI does.
export const modules = import.meta.glob(["./**/*.{js,ts}", "!./**/*.*.*"]);
