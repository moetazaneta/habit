/** Marks a function of the contract that has no implementation yet. */
export function notImplemented(name: string): never {
  throw new Error(`@habit/core: ${name} is not implemented yet`);
}
