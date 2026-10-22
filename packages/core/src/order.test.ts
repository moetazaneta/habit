import { describe, expect, test } from "vite-plus/test";

import { orderBetween } from "./order";

describe("orderBetween", () => {
  test("makes a first key without neighbours", () => {
    expect(orderBetween()).toEqual(expect.any(String));
  });

  test("sorts after `before` and before `after`", () => {
    const first = orderBetween();
    const last = orderBetween(first);
    const start = orderBetween(undefined, first);
    const middle = orderBetween(first, last);

    expect(first < last).toBe(true);
    expect(start < first).toBe(true);
    expect(first < middle && middle < last).toBe(true);
  });

  test("keeps finding room between two keys", () => {
    // Moving one habit to the second place many times puts each new key between the first and
    // the last new key.
    const first = orderBetween();
    let next = orderBetween(first);
    for (let move = 0; move < 100; move++) {
      const key = orderBetween(first, next);
      expect(first < key && key < next).toBe(true);
      next = key;
    }
  });

  test("keys added at the end sort in the order they were added", () => {
    const keys: string[] = [];
    for (let index = 0; index < 200; index++) keys.push(orderBetween(keys.at(-1)));
    // A plain comparison of the text, as `visibleHabits` sorts.
    expect(keys.toSorted((a, b) => (a < b ? -1 : a > b ? 1 : 0))).toEqual(keys);
  });

  test("for two neighbours with the same key, sorts after both", () => {
    // A restore can give two Habits the same order. A drop between them must not throw.
    const first = orderBetween();
    const key = orderBetween(first, first);
    expect(key > first).toBe(true);
  });
});
