// Read the clock: an analog face, the child writes the digital time.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { clockSvg } from '../../render/svg';
import { prompt, writeBox } from '../../render/problem';

interface ClockReadData extends Record<string, unknown> {
  hour: number;
  minute: number;
}

export const clockRead: QuestionType = {
  id: 'clock-read',
  subject: 'time',
  name: 'Read the clock',
  description: 'Look at the clock and write the time.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { minuteStep: '60' },
    G2: { minuteStep: '15' },
    G3: { minuteStep: '5' },
  },
  params: [
    {
      key: 'minuteStep',
      label: 'Minute precision',
      type: 'select',
      options: ['60', '30', '15', '5'],
      default: '15',
    },
  ],

  generate(rng, params): Problem {
    const step = Number(params.minuteStep as string);
    const hour = rng.int(1, 12);
    const steps = Math.floor(60 / step);
    const minute = rng.int(0, steps - 1) * step;

    const data: ClockReadData = { hour, minute };
    return {
      typeId: 'clock-read',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: `${hour}:${String(minute).padStart(2, '0')}` },
      fingerprint: fingerprintOf(['clock-read', data.hour, data.minute]),
    };
  },

  render(p): string {
    const { hour, minute } = p.data as unknown as ClockReadData;
    return (
      `<div class="clock-read">` +
      prompt('What time is it?') +
      clockSvg(hour, minute, 'clock-face-svg') +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 130,
};
