import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { typeMap } from '../../src/engine/registry';
import { perTypeGolden, wholeSheetGolden } from '../helpers/golden-specs';

// Golden tests: committed fixtures pin the exact output of every generator
// and renderer. If these fail, either something changed deliberately (run
// `npm run golden:update` and review the diff as a version bump) or a
// determinism contract was broken accidentally.

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

function fixture(name: string): string {
  return readFileSync(resolve(fixturesDir, name), 'utf8');
}

describe('golden — per-type problem HTML (fixed seeds)', () => {
  for (const type of typeMap.values()) {
    if (type.id === 'manual') continue; // covered by its own unit tests
    it(`${type.id} matches fixture`, () => {
      expect(perTypeGolden(type)).toBe(fixture(`type-${type.id}.txt`));
    });
  }
});

describe('golden — whole sheet', () => {
  it('assembled HTML matches fixture', () => {
    expect(wholeSheetGolden().html).toBe(fixture('demo-sheet.html'));
  });

  it('sheet CSS matches fixture', () => {
    expect(wholeSheetGolden().css).toBe(fixture('demo-sheet.css'));
  });
});
