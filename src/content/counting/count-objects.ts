// Count the objects: icons in a row / grid / scatter, child writes the number.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { ICON_SETS } from '../../render/icons';
import { iconGroup, iconScatter, prompt, writeBox } from '../../render/problem';

interface CountData extends Record<string, unknown> {
  count: number;
  icons: string[];
  arrangement: 'row' | 'grid' | 'scatter';
  positions?: { x: number; y: number }[];
}

export const countObjects: QuestionType = {
  id: 'count-objects',
  subject: 'counting',
  name: 'Count the objects',
  description: 'A group of pictures to count — write the number.',
  gradeRange: ['preK', 'K'],
  difficultyPresets: {
    preK: { maxCount: 5, arrangement: 'row' },
    K: { maxCount: 10 },
    G1: { maxCount: 20 },
  },
  params: [
    { key: 'maxCount', label: 'Biggest count', type: 'int', min: 1, max: 20, default: 10 },
    {
      key: 'arrangement',
      label: 'Arrangement',
      type: 'select',
      options: ['row', 'grid', 'scatter'],
      default: 'row',
    },
    {
      key: 'iconSet',
      label: 'Pictures',
      type: 'select',
      options: ['mixed', 'shapes', 'fruit', 'animals', 'objects'],
      default: 'mixed',
    },
    { key: 'uniform', label: 'Same picture throughout', type: 'bool', default: true, group: 'Look' },
  ],

  generate(rng, params): Problem {
    const maxCount = params.maxCount as number;
    const arrangement = params.arrangement as CountData['arrangement'];
    const count = rng.int(1, maxCount);

    const pool = ICON_SETS[params.iconSet as string] ?? ICON_SETS.mixed;
    let icons: string[];
    if (params.uniform) {
      const one = rng.pick(pool);
      icons = Array.from({ length: count }, () => one);
    } else {
      icons = Array.from({ length: count }, () => rng.pick(pool));
    }

    const data: CountData = { count, icons, arrangement };
    if (arrangement === 'scatter') {
      data.positions = icons.map(() => ({
        x: Math.min(82, Math.max(6, 10 + rng.int(0, 68))),
        y: Math.min(78, Math.max(8, rng.int(8, 78))),
      }));
    }

    return {
      typeId: 'count-objects',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(count) },
      fingerprint: fingerprintOf(['count-objects', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { icons, arrangement, positions } = p.data as unknown as CountData;
    const group =
      arrangement === 'scatter' && positions
        ? iconScatter(icons, positions, 'icon-group scatter')
        : iconGroup(icons, `icon-group ${arrangement}`);
    return (
      `<div class="count-objects">` +
      prompt('How many?') +
      group +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(params): number {
    const arrangement = params.arrangement as string;
    return arrangement === 'grid' ? 118 : arrangement === 'scatter' ? 108 : 92;
  },
};
