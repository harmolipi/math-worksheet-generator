// Addition & Subtraction (K – G5)
// One file per question type; register each type in `addsubTypes`.

import type { QuestionType } from '../../engine/spec';

export const addsubSubject = {
  id: 'addsub',
  name: 'Addition & Subtraction',
  gradeRange: ['K', 'G5'] as const,
};

export const addsubTypes: QuestionType[] = [];
