// Count and write: icons, then an equals sign and a box for the numeral.
// (Sibling of count-objects, but the "3 = ___" phrasing some teachers prefer.)

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { ICON_SETS } from '../../render/icons';
import { iconGroup, writeBox } from '../../render/problem';

interface CountWriteData extends Record<string, unknown> {
  count: number;
  icons: string[];
}

export const countAndWrite: QuestionType = {
  id: 'count-and-write',
  subject: 'counting',
  name: 'Count and write',
  description: 'Count the pictures, then write the number in the box.',
  gradeRange: ['preK', 'K'],
  difficultyPresets: {
    preK: { maxCount: 5 },
    K: { maxCount: 10 },
  },
  params: [
    { key: 'maxCount', label: 'Biggest count', type: 'int', min: 1, max: 10, default: 10 },
    {
      key: 'iconSet',
      label: 'Pictures',
      type: 'select',
      options: ['mixed', 'shapes', 'fruit', 'animals', 'objects', 'polygons', 'vehicles', 'foods', 'weather', 'moreAnimals', 'moreObjects', 'mixedPlus'],
      default: 'mixed',
    },
  ],

  generate(rng, params): Problem {
    const maxCount = params.maxCount as number;
    const count = rng.int(1, maxCount);
    const pool = ICON_SETS[params.iconSet as string] ?? ICON_SETS.mixed;
    const one = rng.pick(pool);
    const icons = Array.from({ length: count }, () => one);

    const data: CountWriteData = { count, icons };
    return {
      typeId: 'count-and-write',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(count) },
      fingerprint: fingerprintOf(['count-and-write', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { icons } = p.data as unknown as CountWriteData;
    return (
      `<div class="count-and-write">` +
      iconGroup(icons, 'icon-group row') +
      `<div class="count-write-line"><span class="equals-sign">=</span>${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 84,
};
