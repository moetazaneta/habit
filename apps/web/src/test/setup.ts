import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vite-plus/test";

// The router splits each route into its own module, and the first visit to a route loads and
// transforms it. On a slow CI runner that takes more than the default 1 s of `findBy…`.
configure({ asyncUtilTimeout: 5000 });

// jsdom lays nothing out and has no `scrollTo`, which the router's scroll restoration calls on each
// navigation.
if (typeof window !== "undefined") window.scrollTo = () => {};

// jsdom has no `matchMedia`, which Sonner and the responsive sheet read. No query matches: a phone,
// in the light theme, with motion allowed.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

afterEach(cleanup);
