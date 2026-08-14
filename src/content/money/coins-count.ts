// Count the coins: a row of coins (pennies, nickels, dimes, quarters),
// child writes the total value. By construction: pick coins, sum them.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { coinGroup } from '../../render/svg';
import { prompt, writeBox } from '../../render/problem';

interface CoinsCountData extends Record<string, unknown> {
  coins: number[]; // denominations, ascending (canonical — fingerprint order)
  total: number;
}

export const coinsCount: QuestionType = {
  id: 'coins-count',
  subject: 'money',
  name: 'Count the coins',
  description: 'A group of coins to count — write how much money.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { denoms: '1,5,10', maxCoins: 8 },
    G2: { denoms: '1,5,10,25', maxCoins: 10 },
    G3: { denoms: '1,5,10,25', maxCoins: 12 },
  },
  params: [
    { key: 'denoms', label: 'Coins', type: 'select', options: ['1,5', '1,5,10', '1,5,10,25'], default: '1,5,10' },
    { key: 'maxCoins', label: 'Biggest pile', type: 'int', min: 2, max: 15, default: 8 },
  ],

  generate(rng, params): Problem {
    const denoms = (params.denoms as string).split(',').map(Number);
    const maxCoins = params.maxCoins as number;
    const count = rng.int(1, maxCoins);
    const coins = Array.from({ length: count }, () => rng.pick(denoms)).sort((a, b) => a - b);
    const total = coins.reduce((sum, d) => sum + d, 0);

    const data: CoinsCountData = { coins, total };
    return {
      typeId: 'coins-count',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: `${total}¢` },
      fingerprint: fingerprintOf(['coins-count', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { coins } = p.data as unknown as CoinsCountData;
    return (
      `<div class="coins-count">` +
      prompt('Count the coins. How much money?') +
      coinGroup(coins) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 96,
};
