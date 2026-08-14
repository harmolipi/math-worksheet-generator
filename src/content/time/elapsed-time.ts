// Elapsed time: "Start 2:30 · End 5:15 — how long?" By construction: pick
// start + elapsed, derive the end. Same-day, clean minute steps.

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, lineH, promptH, promptLines } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, writeBox } from '../../render/problem';

interface ElapsedData extends Record<string, unknown> {
  startMinutes: number; // minutes since midnight
  endMinutes: number;
  elapsedMinutes: number;
  startLabel: string;
  endLabel: string;
}

function label(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${String(min).padStart(2, '0')}`;
}

const STEPS = [15, 30, 45, 60, 90, 120];

export const elapsedTime: QuestionType = {
  id: 'elapsed-time',
  subject: 'time',
  name: 'How long did it take?',
  description: 'Work out the time between a start and an end.',
  gradeRange: ['G2', 'G4'],
  difficultyPresets: {
    G2: { minuteStep: '30', maxElapsed: '90' },
    G3: { minuteStep: '15', maxElapsed: '120' },
    G4: { minuteStep: '5', maxElapsed: '180' },
  },
  params: [
    { key: 'minuteStep', label: 'Minute precision', type: 'select', options: ['30', '15', '5'], default: '15' },
    { key: 'maxElapsed', label: 'Longest gap (minutes)', type: 'select', options: ['60', '90', '120', '180'], default: '120' },
  ],

  generate(rng, params): Problem {
    const step = Number(params.minuteStep as string);
    const maxElapsed = Number(params.maxElapsed as string);
    const startHour = rng.int(1, 7); // mornings only: same-day, no wrap
    const startMinute = rng.int(0, Math.floor(60 / step) - 1) * step;
    const elapsedMinutes = rng.pick(STEPS.filter((s) => s <= maxElapsed));
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + elapsedMinutes;

    const data: ElapsedData = {
      startMinutes,
      endMinutes,
      elapsedMinutes,
      startLabel: label(startMinutes),
      endLabel: label(endMinutes),
    };
    return {
      typeId: 'elapsed-time',
      index: 0,
      gradeLevel: 0,
      data,
      answer: {
        value:
          elapsedMinutes >= 60
            ? `${Math.floor(elapsedMinutes / 60)} h ${elapsedMinutes % 60 || ''}${elapsedMinutes % 60 ? ' min' : ''}`.trim()
            : `${elapsedMinutes} min`,
      },
      fingerprint: fingerprintOf(['elapsed-time', data.startMinutes, data.endMinutes]),
    };
  },

  render(p): string {
    const { startLabel, endLabel } = p.data as unknown as ElapsedData;
    return (
      `<div class="elapsed-time">` +
      prompt(`Start at <b>${startLabel}</b>. End at <b>${endLabel}</b>. How long did it take?`) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { startLabel, endLabel } = data as unknown as ElapsedData;
    const text = `Start at ${startLabel}. End at ${endLabel}. How long did it take?`;
    return (promptLines(text, ctx) - 1) * lineH(ctx) + promptH(ctx) + answerH(ctx);
  },
};
