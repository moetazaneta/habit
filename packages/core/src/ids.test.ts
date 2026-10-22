import { describe, expect, test } from "vite-plus/test";

import { newId } from "./ids";

// Version 7 in the 13th digit, the RFC 9562 variant (8, 9, a or b) in the 17th.
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("newId", () => {
  test("makes a UUIDv7", () => {
    expect(newId()).toMatch(UUID_V7);
  });

  test("starts with the current time in milliseconds", () => {
    const before = Date.now();
    const id = newId();
    const after = Date.now();
    const time = Number.parseInt(id.replaceAll("-", "").slice(0, 12), 16);
    expect(time).toBeGreaterThanOrEqual(before);
    expect(time).toBeLessThanOrEqual(after);
  });

  test("makes unique ids that sort in the order they were made", () => {
    const ids = Array.from({ length: 1000 }, () => newId());
    expect(new Set(ids).size).toBe(1000);
    expect(ids.toSorted()).toEqual(ids);
  });
});
