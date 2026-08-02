import { WeightedPicker, randomInt } from './random';

/** Fixed-date VN shopping campaigns (double-digit days) — checked against month/day
 * regardless of year so the spike applies whenever it falls inside the seeding window. */
const FIXED_SHOPPING_DAYS: { month: number; day: number }[] = [
  { month: 9, day: 9 },
  { month: 10, day: 10 },
  { month: 11, day: 11 },
  { month: 12, day: 12 },
];

/** Lunar New Year has no fixed Gregorian date — hardcode the known dates for the
 * years this script is realistically run in rather than compute the lunar calendar. */
const TET_DATES = ['2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26'];

function isNearTet(date: Date): boolean {
  const ms = date.getTime();
  return TET_DATES.some((iso) => Math.abs(new Date(iso).getTime() - ms) <= 4 * 86_400_000);
}

function isShoppingEventDay(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (FIXED_SHOPPING_DAYS.some((d) => d.month === month && d.day === day)) return true;
  return isNearTet(date);
}

interface DayWeight {
  date: Date;
  weight: number;
}

function buildDailyWeights(start: Date, end: Date): DayWeight[] {
  const days: DayWeight[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor = new Date(cursor.getTime() + 86_400_000)) {
    const dow = cursor.getDay();
    let weight = 1;
    if (dow === 0 || dow === 6) weight *= 2.2; // weekend boost
    if (isShoppingEventDay(cursor)) weight *= 6; // campaign-day spike
    days.push({ date: new Date(cursor), weight });
  }
  return days;
}

// Evening browsing/checkout is far more common than mid-morning in VN e-commerce.
const HOUR_WEIGHTS: { hour: number; weight: number }[] = [
  ...Array.from({ length: 7 }, (_, h) => ({ hour: h, weight: 0.2 })), // 0-6
  { hour: 7, weight: 1 },
  { hour: 8, weight: 1.4 },
  { hour: 9, weight: 1.6 },
  { hour: 10, weight: 1.8 },
  { hour: 11, weight: 1.6 },
  { hour: 12, weight: 1.4 },
  { hour: 13, weight: 1.6 },
  { hour: 14, weight: 1.8 },
  { hour: 15, weight: 1.8 },
  { hour: 16, weight: 1.6 },
  { hour: 17, weight: 1.6 },
  { hour: 18, weight: 1.8 },
  { hour: 19, weight: 2.4 },
  { hour: 20, weight: 3.0 },
  { hour: 21, weight: 3.2 },
  { hour: 22, weight: 2.6 },
  { hour: 23, weight: 1.4 },
];

export class OrderTimeSampler {
  private readonly dayPicker: WeightedPicker<DayWeight>;
  private readonly hourPicker: WeightedPicker<{ hour: number; weight: number }>;

  constructor(start: Date, end: Date) {
    const days = buildDailyWeights(start, end);
    this.dayPicker = new WeightedPicker(
      days,
      days.map((d) => d.weight),
    );
    this.hourPicker = new WeightedPicker(
      HOUR_WEIGHTS,
      HOUR_WEIGHTS.map((h) => h.weight),
    );
  }

  sample(): Date {
    const day = this.dayPicker.pick().date;
    const { hour } = this.hourPicker.pick();
    const minute = randomInt(0, 59);
    const second = randomInt(0, 59);
    const result = new Date(day);
    result.setHours(hour, minute, second, 0);
    return result;
  }
}
