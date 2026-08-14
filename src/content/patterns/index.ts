// Patterns (preK – G2)
// One file per question type; register each type in `patternTypes`.

import type { QuestionType } from '../../engine/spec';
import { nextInPattern } from './next-in-pattern';

export const patternsSubject = {
  id: 'patterns',
  name: 'Patterns',
  gradeRange: ['preK', 'G2'] as const,
};

export const patternTypes: QuestionType[] = [nextInPattern];
