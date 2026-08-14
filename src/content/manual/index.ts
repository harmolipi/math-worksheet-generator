// Manual questions — teacher-authored prompts rendered with the same layout,
// pagination, answer keys, and printing as generated problems.

import type { QuestionType } from '../../engine/spec';
import { manualType } from './manual';

export const manualSubject = {
  id: 'manual',
  name: 'My Own Questions',
  gradeRange: ['preK', 'G5'] as const,
};

export const manualTypes: QuestionType[] = [manualType];
