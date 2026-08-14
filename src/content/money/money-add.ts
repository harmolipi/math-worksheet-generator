// Money addition: two groups of coins shown as pictures, child adds the
// amounts. By construction: pick both amounts, the total is the sum; each
// amount decomposes into coins greedily (1/5/10/25 is a canonical coin
// system, so greedy decomposition is always exact).

import { fingerprintOf } from '../../engine/fingerprint';
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

  estHeightPt: () => 112,
};
