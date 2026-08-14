// Time (G1 – G4)
// One file per question type; register each type in `timeTypes`.

import type { QuestionType } from '../../engine/spec';
import { clockRead } from './clock-read';
import { elapsedTime } from './elapsed-time';

export const timeSubject = {
  id: 'time',
  name: 'Time',
  gradeRange: ['G1', 'G4'] as const,
};

export const timeTypes: QuestionType[] = [clockRead, elapsedTime];
