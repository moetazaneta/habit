import { useState } from "react";

/**
 * The last value that was not undefined. A sheet that closes keeps showing its content while it
 * animates out, after the URL no longer names it. Pass a primitive (such as the search param), so
 * that equal values compare equal.
 */
export function useRetained<T extends string | number | boolean>(
  value: T | undefined,
): T | undefined {
  const [retained, setRetained] = useState(value);
  if (value !== undefined && value !== retained) setRetained(value);
  return value ?? retained;
}
