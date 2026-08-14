// Fractions (G2 – G5)
// One file per question type; register each type in `fractionTypes`.

import type { QuestionType } from '../../engine/spec';
import { fractionShade } from './fraction-shade';
import { fractionOfWhole } from './fraction-of-whole';
import { fractionCompare } from './fraction-compare';

export const fractionsSubject = {
  id: 'fractions',
  name: 'Fractions',
  gradeRange: ['G2', 'G5'] as const,
};

export const fractionTypes: QuestionType[] = [fractionShade, fractionOfWhole, fractionCompare];
