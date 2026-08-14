// Base-10 blocks: count the flats (100), rods (10), and units (1) — or the
// reverse later. Rendered as deterministic SVG.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, writeBox } from '../../render/problem';

interface Base10Data extends Record<string, unknown> {
  number: number;
  flats: number;
  rods: number;
  units: number;
}

const UNIT_W = 20;
const ROD_W = 100;

function unitSvg(x: number, y: number): string {
  return `<rect x="${x}" y="${y}" width="${UNIT_W}" height="${UNIT_W}" class="b10-cell"/>`;
}

function rodSvg(x: number, y: number): string {
  const cells = Array.from(
    { length: 10 },
    (_, i) => `<rect x="${x + i * UNIT_W}" y="${y}" width="${UNIT_W}" height="${UNIT_W}" class="b10-cell"/>`,
  ).join('');
  return `<g>${cells}<rect x="${x}" y="${y}" width="${ROD_W}" height="${UNIT_W}" class="b10-frame"/></g>`;
}

function flatSvg(x: number, y: number): string {
  let cells = '';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      cells += `<rect x="${x + c * (UNIT_W / 2)}" y="${y + r * (UNIT_W / 2)}" width="${UNIT_W / 2}" height="${UNIT_W / 2}" class="b10-cell"/>`;
    }
  }
  return `<g>${cells}<rect x="${x}" y="${y}" width="${ROD_W}" height="${ROD_W}" class="b10-frame"/></g>`;
}

function blocksSvg(flats: number, rods: number, units: number): string {
  // Layout: flats left (big squares), rods next, units last — stacked in rows.
  const parts: string[] = [];
  let y = 0;
  let x = 0;
  for (let i = 0; i < flats; i++) {
    parts.push(flatSvg(x, y));
    x += ROD_W + 8;
    if (x + ROD_W > 300) {
      x = 0;
      y += ROD_W + 8;
    }
  }
  for (let i = 0; i < rods; i++) {
    parts.push(rodSvg(x, y));
    x += ROD_W + 8;
    if (x + ROD_W > 300) {
      x = 0;
      y += UNIT_W + 8;
    }
  }
  for (let i = 0; i < units; i++) {
    parts.push(unitSvg(x, y));
    x += UNIT_W + 6;
    if (x + UNIT_W > 300) {
      x = 0;
      y += UNIT_W + 8;
    }
  }
  return `<svg class="base10" viewBox="0 0 300 ${Math.max(80, y + 28)}" aria-hidden="true">${parts.join('')}</svg>`;
}

export const base10Blocks: QuestionType = {
  id: 'base10-blocks',
  subject: 'placevalue',
  name: 'Base-10 blocks',
  description: 'Count the hundreds, tens, and ones blocks to find the number.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { maxNumber: 99, useFlats: false },
    G2: { maxNumber: 999, useFlats: true },
    G3: { maxNumber: 999, useFlats: true },
  },
  params: [
    { key: 'maxNumber', label: 'Biggest number', type: 'int', min: 10, max: 999, default: 99 },
    { key: 'useFlats', label: 'Include hundreds', type: 'bool', default: false },
  ],

  generate(rng, params): Problem {
    const maxNumber = params.maxNumber as number;
    const useFlats = params.useFlats as boolean;
    const maxFlats = useFlats ? Math.floor(maxNumber / 100) : 0;
    const flats = rng.int(0, maxFlats);
    const maxRods = Math.min(9, Math.floor((maxNumber - flats * 100) / 10));
    const rods = rng.int(0, maxRods);
    const maxUnits = Math.min(9, maxNumber - flats * 100 - rods * 10);
    const units = rng.int(0, maxUnits);
    // Avoid the all-zeros problem
    if (flats + rods + units === 0) {
      const fallback: Base10Data = { number: 12, flats: 0, rods: 1, units: 2 };
      return {
        typeId: 'base10-blocks',
        index: 0,
        gradeLevel: 0,
        data: fallback,
        answer: { value: String(fallback.number) },
        fingerprint: fingerprintOf(['base10-blocks', 12, 0, 1, 2]),
      };
    }
    const number = flats * 100 + rods * 10 + units;
    const data: Base10Data = { number, flats, rods, units };
    return {
      typeId: 'base10-blocks',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(number) },
      fingerprint: fingerprintOf(['base10-blocks', data.number, data.flats, data.rods, data.units]),
    };
  },

  render(p): string {
    const { flats, rods, units } = p.data as unknown as Base10Data;
    return (
      `<div class="base10-problem">` +
      prompt('Count the blocks. Write the number.') +
      blocksSvg(flats, rods, units) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 128,
};
