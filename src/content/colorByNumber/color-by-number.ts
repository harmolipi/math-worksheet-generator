// Color by number: each region shows a number (pre-K) or a small addition
// fact (G1); a text legend maps each value to a color, and the child colors
// the regions. B&W-safe by design: the numbers are the functional layer and
// the legend is text ("3 = red"), so an uncolored print still works.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import { legendW, lineH, promptH, rowsFor } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt } from '../../render/problem';

interface CbnCell extends Record<string, unknown> {
  label: string; // "4" or "3+4"
  value: number; // the key into the legend
}

interface ColorByNumberData extends Record<string, unknown> {
  kind: 'numbers' | 'add';
  cells: CbnCell[];
  legend: { value: number; color: string }[];
}

const PALETTE = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];

export const colorByNumber: QuestionType = {
  id: 'color-by-number',
  subject: 'colorByNumber',
  name: 'Color by number',
  description: 'Color each shape using the number key — addition facts or plain numbers.',
  gradeRange: ['preK', 'G1'],
  difficultyPresets: {
    preK: { kind: 'numbers', colorCount: 4 },
    K: { kind: 'numbers', colorCount: 6 },
    G1: { kind: 'add', colorCount: 5 },
  },
  params: [
    { key: 'kind', label: 'Key uses', type: 'select', options: ['numbers', 'add'], default: 'numbers' },
    { key: 'colorCount', label: 'Colors', type: 'int', min: 3, max: 6, default: 5 },
  ],

  generate(rng, params): Problem {
    const kind = params.kind as 'numbers' | 'add';
    const colorCount = params.colorCount as number;
    const cellCount = kind === 'add' ? 9 : 6;

    // Values 1..colorCount (numbers) or sums 2..colorCount+1 (add).
    const values = Array.from({ length: colorCount }, (_, i) => i + (kind === 'add' ? 2 : 1));
    const legend = values.map((value, i) => ({ value, color: PALETTE[i] }));

    // Guarantee every value appears at least once, then fill the rest
    // randomly and shuffle — the shuffled positions keep each sheet varied.
    const cellValues: number[] = [];
    for (let i = 0; i < cellCount; i++) {
      cellValues.push(i < colorCount ? values[i] : rng.pick(values));
    }
    rng.shuffle(cellValues);

    const cells: CbnCell[] = cellValues.map((value) => {
      let label: string;
      if (kind === 'add') {
        const a = rng.int(1, value - 1); // add mode values start at 2
        label = `${a}+${value - a}`;
      } else {
        label = String(value);
      }
      return { label, value };
    });

    const data: ColorByNumberData = { kind, cells, legend };
    return {
      typeId: 'color-by-number',
      index: 0,
      gradeLevel: 0,
      data,
      answer: {
        value: cells.map((c) => legend.find((l) => l.value === c.value)!.color).join(', '),
        detail: legend.map((l) => `${l.value} = ${l.color}`).join(' · '),
      },
      fingerprint: fingerprintOf(['color-by-number', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { cells, legend } = p.data as unknown as ColorByNumberData;
    const cellDivs = cells
      .map((c) => `<span class="cbn-cell">${c.label}</span>`)
      .join('');
    const legendSpans = legend
      .map((l) => `<span class="cbn-key">${l.value} = ${l.color}</span>`)
      .join('');
    return (
      `<div class="color-by-number">` +
      prompt('Color each shape using the key.') +
      `<div class="cbn-grid">${cellDivs}</div>` +
      `<div class="cbn-legend">${legendSpans}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const d = data as unknown as ColorByNumberData;
    const cell = ctx.largePrint ? 48 : 40;
    const gridRows = Math.ceil(d.cells.length / 3); // fixed 3-column grid
    const legendRows = rowsFor(d.legend.length, legendW(ctx), 12, ctx.contentWidthPt);
    return (
      promptH(ctx) +
      gridRows * (cell + 8) +
      8 * (gridRows - 1) +
      legendRows * lineH(ctx) +
      8 * (legendRows - 1)
    );
  },
};
