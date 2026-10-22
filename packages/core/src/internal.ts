/** True when two plain values (JSON-like: primitives, arrays and objects) are equal in depth. */
export function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  // An absent key and a key set to undefined are the same, as in JSON.
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (!isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }
  return true;
}

/** Marks a function of the contract that has no implementation yet. */
export function notImplemented(name: string): never {
  throw new Error(`@habit/core: ${name} is not implemented yet`);
}
