// Money (G1 – G3)
// One file per question type; register each type in `moneyTypes`.

import type { QuestionType } from '../../engine/spec';
import { coinsCount } from './coins-count';
import { makingChange } from './making-change';
import { moneyAdd } from './money-add';

export const moneySubject = {
  id: 'money',
  name: 'Money',
  gradeRange: ['G1', 'G3'] as const,
};

export const moneyTypes: QuestionType[] = [coinsCount, makingChange, moneyAdd];
