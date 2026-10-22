import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vite-plus/test";

// The router splits each route into its own module, and the first visit to a route loads and
// transforms it. On a slow CI runner that takes more than the default 1 s of `findBy…`.
configure({ asyncUtilTimeout: 5000 });

// jsdom lays nothing out and has no `scrollTo`, which the router's scroll restoration calls on each
// navigation.
if (typeof window !== "undefined") window.scrollTo = () => {};

afterEach(cleanup);
