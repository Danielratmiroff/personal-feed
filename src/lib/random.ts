/** Returns a random integer in [min, max] inclusive. */
export function randomCount(min = 8, max = 12): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
