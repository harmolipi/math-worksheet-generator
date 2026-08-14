// Counting & Number Sense (pre-K – G1)
// One file per question type; register each type in `countingTypes`.

import type { QuestionType } from '../../engine/spec';

export const countingSubject = {
  id: 'counting',
  name: 'Counting & Number Sense',
  gradeRange: ['preK', 'G1'] as const,
};

export const countingTypes: QuestionType[] = [];
