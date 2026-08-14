// Fraction shading: "What fraction of the shape is shaded?" — shaded parts
// are hatch-patterned SVG (prints even without background graphics).

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { fractionBarSvg, fractionPieSvg } from '../../render/svg';
import { prompt, writeBox } from '../../render/problem';

interface ShadeData extends Record<string, unknown> {
  numerator: number;
  denominator: number;
  shape: 'bar' | 'pie';
}

const DENOMINATORS = [2, 3, 4, 6, 8];

export const fractionShade: QuestionType = {
  id: 'fraction-shade',
  subject: 'fractions',
  name: 'What fraction is shaded?',
  description: 'Count the shaded parts and write the fraction.',
  gradeRange: ['G2', 'G4'],
  difficultyPresets: {
    G2: { denominators: '2,3,4' },
    G3: { denominators: '3,4,6' },
    G4: { denominators: '4,6,8' },
  },
  params: [
    {
      key: 'denominators',
      label: 'Denominators',
      type: 'select',
      options: ['2,3,4', '3,4,6', '4,6,8'],
      default: '2,3,4',
    },
    {
      key: 'shape',
      label: 'Shape',
      type: 'select',
      options: ['bar', 'pie', 'random'],
      default: 'random',
    },
  ],

  generate(rng, params): Problem {
    const allowed = (params.denominators as string).split(',').map(Number);
    const denominator = rng.pick(allowed.filter((d) => DENOMINATORS.includes(d)));
    const numerator = rng.int(1, denominator - 1);
    const shapeParam = params.shape as string;
    const shape: 'bar' | 'pie' =
      shapeParam === 'random' ? (rng.int(0, 1) === 0 ? 'bar' : 'pie') : (shapeParam as 'bar' | 'pie');

    const data: ShadeData = { numerator, denominator, shape };
    return {
      typeId: 'fraction-shade',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: `${numerator}/${denominator}` },
      fingerprint: fingerprintOf(['fraction-shade', data.numerator, data.denominator, data.shape]),
    };
  },

  render(p): string {
    const { numerator, denominator, shape } = p.data as unknown as ShadeData;
    const suffix = p.fingerprint;
    const svg =
      shape === 'bar'
        ? fractionBarSvg(numerator, denominator, suffix)
        : fractionPieSvg(numerator, denominator, suffix);
    return (
      `<div class="fraction-shade">` +
      prompt('What fraction is shaded?') +
      svg +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { shape } = data as unknown as ShadeData;
    // Pie is a fixed 96pt svg; the bar is 160pt wide × 32pt tall.
    return shape === 'pie'
      ? promptH(ctx) + 96 + answerH(ctx) + 3
      : promptH(ctx) + 32 + answerH(ctx) + 3;
  },
};
