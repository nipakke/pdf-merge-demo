import type { Arrayable } from "type-fest";

/**
 * Converts a value to an array. If the value is already an array, it is returned as-is.
 * Otherwise, the value is wrapped in a new array. This function acts as a type guard,
 * ensuring the returned value is always an array of the correct type.
 *
 * @param val - The value to convert to an array.
 * @returns An array containing the value(s).
 */
export function toArray<T>(val: Arrayable<T>): T[] {
  return Array.isArray(val) ? val : [val];
}
