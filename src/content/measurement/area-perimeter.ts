// Area and perimeter: a w×h rectangle on a grid. Area mode shows the cell
// grid (hatched) — count the squares; perimeter mode shows only the outline
// — count the edges. By construction: pick w and h, compute the answer.

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, lineH, promptH, promptLines } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { hatchId } from '../../render/svg';
import { prompt, writeBox } from '../../render/problem';

interface AreaPerimeterData extends Record<string, unknown> {
  w: number;
  h: number;
  mode: 'area' | 'perimeter';
  answer: number;
}

const CELL = 22;

export const areaPerimeter: QuestionType = {
  id: 'area-perimeter',
  subject: 'measurement',
  name: 'Area or perimeter',
  description: 'A rectangle on a grid — count the squares or the edges.',
  gradeRange: ['G3', 'G4'],
  difficultyPresets: {
    G3: { maxSide: 6, mode: 'area' },
    G4: { maxSide: 8, mode: 'mixed' },
  },
  params: [
    { key: 'maxSide', label: 'Biggest side', type: 'int', min: 2, max: 10, default: 6 },
    { key: 'mode', label: 'Ask for', type: 'select', options: ['area', 'perimeter', 'mixed'], default: 'area' },
  ],

  generate(rng, params): Problem {
    const maxSide = params.maxSide as number;
    const w = rng.int(2, maxSide);
    const h = rng.int(2, maxSide);
    const modeParam = params.mode as string;
    const mode: 'area' | 'perimeter' =
      modeParam === 'mixed'
        ? rng.int(0, 1) === 0
          ? 'area'
          : 'perimeter'
        : (modeParam as 'area' | 'perimeter');
    const answer = mode === 'area' ? w * h : 2 * (w + h);

    const data: AreaPerimeterData = { w, h, mode, answer };
    return {
      typeId: 'area-perimeter',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: mode === 'area' ? `${answer} square units` : `${answer} units` },
      fingerprint: fingerprintOf(['area-perimeter', data.w, data.h, data.mode]),
    };
  },

  render(p): string {
    const { w, h, mode } = p.data as unknown as AreaPerimeterData;
    const suffix = p.fingerprint;
    const cells: string[] = [];
    if (mode === 'area') {
      // Full grid, hatched so each square reads as one countable unit.
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          cells.push(
            `<rect x="${c * CELL}" y="${r * CELL}" width="${CELL}" height="${CELL}" ` +
              `class="ap-cell" fill="url(#${hatchId(suffix)})"/>`,
          );
        }
      }
    }
    return (
      `<div class="area-perimeter">` +
      prompt(mode === 'area' ? 'What is the <b>area</b>? Count the squares.' : 'What is the <b>perimeter</b>? Count the edges.') +
      `<svg class="ap-grid" viewBox="0 0 ${w * CELL + 2} ${h * CELL + 2}" aria-hidden="true">` +
      `<defs><pattern id="${hatchId(suffix)}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
      `<line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="1.6"/>` +
      `</pattern></defs>` +
      cells +
      `<rect x="1" y="1" width="${w * CELL}" height="${h * CELL}" class="ap-frame"/>` +
      `</svg>` +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { w, h, mode } = data as unknown as AreaPerimeterData;
    const gridW = Math.min(ctx.contentWidthPt, 180); // CSS max-width
    const gridH = Math.min(172, Math.ceil(((h * 22 + 2) * gridW) / (w * 22 + 2)) + 2); // CSS max-height
    const text =
      mode === 'area'
        ? 'What is the <b>area</b>? Count the squares.'
        : 'What is the <b>perimeter</b>? Count the edges.';
    const wrap = (promptLines(text, ctx) - 1) * lineH(ctx);
    return promptH(ctx) + wrap + gridH + answerH(ctx);
  },
};
