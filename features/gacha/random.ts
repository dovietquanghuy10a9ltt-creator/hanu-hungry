import { randomInt } from "node:crypto";

export function pickRandom<T>(items: readonly T[]): T | null {
  return items.length ? items[randomInt(items.length)] : null;
}
