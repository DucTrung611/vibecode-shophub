/** Distribution helpers used throughout the seed script — everything here exists
 * to avoid flat/uniform randomness, which is what makes generated data read as
 * obviously synthetic. */

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function pickMany<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  const result: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = randomInt(0, pool.length - 1);
    result.push(pool[index]);
    pool.splice(index, 1);
  }
  return result;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Zipf-style weights (rank 1 heaviest) — used so ~20% of items (low rank) absorb
 * ~80% of weighted picks (order items, reviews, wishlists), instead of every
 * product being equally likely. */
export function zipfWeights(n: number, s = 1.05): number[] {
  const weights: number[] = [];
  for (let rank = 1; rank <= n; rank++) {
    weights.push(1 / Math.pow(rank, s));
  }
  return weights;
}

export class WeightedPicker<T> {
  private readonly cumulative: number[] = [];
  private readonly total: number;

  constructor(private readonly items: T[], weights: number[]) {
    let sum = 0;
    for (const w of weights) {
      sum += w;
      this.cumulative.push(sum);
    }
    this.total = sum;
  }

  pick(): T {
    const threshold = Math.random() * this.total;
    let lo = 0;
    let hi = this.cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.cumulative[mid] < threshold) lo = mid + 1;
      else hi = mid;
    }
    return this.items[lo];
  }
}

/** Box-Muller transform for a normal-ish distribution, clamped to [min, max]. */
export function gaussian(mean: number, stdDev: number, min?: number, max?: number): number {
  const u1 = Math.random() || Number.EPSILON;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  let value = mean + z * stdDev;
  if (min !== undefined) value = Math.max(min, value);
  if (max !== undefined) value = Math.min(max, value);
  return value;
}

/** Skews toward the low end of [min, max] on a log scale (more budget items than
 * premium ones within a category), then rounds to a "psychological" price ending
 * in 000/900 like real VN e-commerce listings. */
export function skewedPriceInRange(min: number, max: number): number {
  const t = Math.pow(Math.random(), 1.6);
  const raw = min * Math.pow(max / min, t);
  const rounded = Math.round(raw / 1000) * 1000;
  // ~40% of listings use a "...900,000"-style psychological price
  if (Math.random() < 0.4 && rounded > 20000) {
    return rounded - 1000;
  }
  return rounded;
}

export function randomDateBetween(start: Date, end: Date): Date {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addHours(date: Date, hours: number): Date {
  const copy = new Date(date);
  copy.setHours(copy.getHours() + hours);
  return copy;
}
