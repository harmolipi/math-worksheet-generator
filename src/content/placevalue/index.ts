// Place Value (G1 – G4)
// One file per question type; register each type in `placevalueTypes`.

import type { QuestionType } from '../../engine/spec';
import { base10Blocks } from './base10-blocks';
import { expandedForm } from './expanded-form';
import { valueOfDigit } from './value-of-digit';
import { compareNumbers } from './compare-numbers';
import { oddEven } from './odd-even';

export const placevalueSubject = {
  id: 'placevalue',
  name: 'Place Value',
  gradeRange: ['G1', 'G4'] as const,
};

export const placevalueTypes: QuestionType[] = [
  base10Blocks,
  expandedForm,
  valueOfDigit,
  compareNumbers,
  oddEven,
];
