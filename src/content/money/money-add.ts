// Money addition: two groups of coins shown as pictures, child adds the
// amounts. By construction: pick both amounts, the total is the sum; each
// amount decomposes into coins greedily (1/5/10/25 is a canonical coin
// system, so greedy decomposition is always exact).

import { fingerprintOf } from '../../engine/fingerprint';
import { coinPt, lineH, promptH, promptLines, rowsFor } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { coinGroup } from '../../render/svg';
import { blank, prompt } from '../../render/problem';

interface MoneyAddData extends Record<string, unknown> {
  a: number; // cents
  b: number; // cents
  total: number;
  aCoins: number[]; // ascending
  bCoins: number[]; // ascending
}

/** Greedy coin decomposition of a cent amount (canonical system: exact). */
export function decomposeCents(cents: number): number[] {
  const coins: number[] = [];
  let rest = cents;
  for (const denom of [25, 10, 5, 1]) {
    while (rest >= denom) {
      coins.push(denom);
      rest -= denom;
    }
  }
  return coins;
}

export const moneyAdd: QuestionType = {
  id: 'money-add',
  subject: 'money',
  name: 'Add the money',
  description: 'Two groups of coins — how much money altogether?',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { maxAmount: 25 },
    G2: { maxAmount: 50 },
    G3: { maxAmount: 99 },
  },
  params: [
    { key: 'maxAmount', label: 'Biggest group (cents)', type: 'int', min: 10, max: 99, default: 50 },
  ],

  generate(rng, params): Problem {
    const maxAmount = params.maxAmount as number;
    const a = rng.int(1, maxAmount);
    const b = rng.int(1, maxAmount);
    const total = a + b;

    const data: MoneyAddData = { a, b, total, aCoins: decomposeCents(a), bCoins: decomposeCents(b) };
    return {
      typeId: 'money-add',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: `${total}¢` },
      fingerprint: fingerprintOf(['money-add', data.a, data.b]),
    };
  },

  render(p): string {
    const { aCoins, bCoins } = p.data as unknown as MoneyAddData;
    return (
      `<div class="money-add">` +
      prompt('Add the money. How much altogether?') +
      `<div class="money-add-row">` +
      coinGroup(aCoins) +
      `<span class="money-op">+</span>` +
      coinGroup(bCoins) +
      `<span class="money-op">=</span>${blank()}` +
      `</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { aCoins, bCoins } = data as unknown as MoneyAddData;
    const coin = coinPt(ctx);
    // Each coin group caps at 132pt wide (CSS) and wraps internally.
    const groupW = (n: number): number => Math.min(132, n * (coin + 4));
    const groupH = (n: number): number => {
      const rows = rowsFor(n, coin, 4, 132);
      return rows * coin + 4 * (rows - 1);
    };
    // Greedy line-wrap of [a, +, b, =, blank] mirroring flex-wrap: fit as
    // many children as width allows, each line as tall as its tallest child.
    const widths = [groupW(aCoins.length), 30, groupW(bCoins.length), 30, 44];
    const heights = [groupH(aCoins.length), 30, groupH(bCoins.length), 30, 44];
    const lineHeights: number[] = [];
    let cur = 0;
    let curMax = 0;
    for (let i = 0; i < widths.length; i++) {
      const step = widths[i] + (cur > 0 ? 8 : 0);
      if (cur + step > ctx.contentWidthPt && cur > 0) {
        lineHeights.push(curMax);
        cur = widths[i];
        curMax = heights[i];
      } else {
        cur += step;
        curMax = Math.max(curMax, heights[i]);
      }
    }
    lineHeights.push(curMax);
    const total = lineHeights.reduce((a, b) => a + b, 0) + 8 * (lineHeights.length - 1);
    return (
      promptH(ctx) +
      (promptLines('Add the money. How much altogether?', ctx) - 1) * lineH(ctx) +
      total
    );
  },
};
