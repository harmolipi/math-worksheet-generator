// Multiplication & Division (G2 – G5)
// One file per question type; register each type in `multdivTypes`.

import type { QuestionType } from '../../engine/spec';
import { multFacts } from './mult-facts';
import { divFacts } from './div-facts';
import { multVertical } from './mult-vertical';
import { missingFactor } from './missing-factor';
import { multOf10 } from './mult-of-10';

export const multdivSubject = {
  id: 'multdiv',
  name: 'Multiplication & Division',
  gradeRange: ['G2', 'G5'] as const,
};

export const multdivTypes: QuestionType[] = [
  multFacts,
  divFacts,
  multVertical,
  missingFactor,
  multOf10,
];
