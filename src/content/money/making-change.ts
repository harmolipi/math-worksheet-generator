// Making change: "You pay with $1 for something that costs 37¢." By
// construction: pick the price, derive the change (always positive).

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, lineH, promptH, promptLines } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, writeBox } from '../../render/problem';

interface MakingChangeData extends Record<string, unknown> {
  bill: number; // dollar bill amount: 1 or 5
  price: number; // cents, 1..bill*100-1
  change: number; // bill*100 - price
}

/** Money display shared with answer keys: 50¢, $1.25, $1 (integer cents in). */
export function formatMoney(cents: number): string {
  if (cents < 100) return `${cents}¢`;
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? `$${dollars}` : `$${dollars}.${String(rest).padStart(2, '0')}`;
}

export const makingChange: QuestionType = {
  id: 'making-change',
  subject: 'money',
  name: 'Making change',
  description: 'You pay with a bill — how much change do you get back?',
  gradeRange: ['G2', 'G3'],
  difficultyPresets: {
    G2: { bill: '1' },
    G3: { bill: '5' },
  },
  params: [
    { key: 'bill', label: 'Pay with', type: 'select', options: ['1', '5'], default: '1' },
  ],

  generate(rng, params): Problem {
    const bill = Number(params.bill as string);
    const price = rng.int(1, bill * 100 - 1);
    const change = bill * 100 - price;

    const data: MakingChangeData = { bill, price, change };
    return {
      typeId: 'making-change',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: formatMoney(change) },
      fingerprint: fingerprintOf(['making-change', data.bill, data.price]),
    };
  },

  render(p): string {
    const { bill, price } = p.data as unknown as MakingChangeData;
    return (
      `<div class="making-change">` +
      prompt(`You pay with <b>$${bill}</b>. It costs <b>${price}¢</b>. How much change?`) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { bill, price } = data as unknown as MakingChangeData;
    const text = `You pay with $${bill}. It costs ${price}¢. How much change?`;
    return (promptLines(text, ctx) - 1) * lineH(ctx) + promptH(ctx) + answerH(ctx);
  },
};
