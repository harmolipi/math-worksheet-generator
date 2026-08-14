import { describe, expect, it } from 'vitest';
import { generateSections } from '../../src/engine/generate';
import { packSheet } from '../../src/engine/pack';
import { baseSpec, fakeType, fakeTypeMap } from '../helpers/fake-type';

// Letter content capacity: floor((792 - 72 - 88 - 28) * 0.92) = 555pt.
// fakeType estHeightPt = 100pt → 5 problems per page.

describe('packSheet', () => {
  const types = fakeTypeMap([fakeType()]);

  it('packs 12 problems into 3 pages of 5/5/2', () => {
    const spec = baseSpec({ sections: [{ typeIds: ['fake'], counts: [12] }] });
    const generated = generateSections(spec, types);
    const { pages, worksheetPageCount, keyPageCount } = packSheet(
      generated, spec.layout, spec.options, types,
    );
    expect(worksheetPageCount).toBe(3);
    expect(pages.filter((p) => p.kind === 'worksheet').map((p) => p.problems.length))
      .toEqual([5, 5, 2]);
    expect(keyPageCount).toBe(1);
  });

  it('never overfills a page and tracks content height', () => {
    const spec = baseSpec({ sections: [{ typeIds: ['fake'], counts: [12] }] });
    const { pages } = packSheet(generateSections(spec, types), spec.layout, spec.options, types);
    for (const page of pages.filter((p) => p.kind === 'worksheet')) {
      expect(page.contentHeightPt).toBeLessThanOrEqual(555);
    }
  });

  it('labels sequentially across pages', () => {
    const spec = baseSpec({ sections: [{ typeIds: ['fake'], counts: [7] }] });
    const { pages } = packSheet(generateSections(spec, types), spec.layout, spec.options, types);
    const labels = pages.flatMap((p) => p.problems.map((x) => x.label));
    expect(labels).toEqual(['1.', '2.', '3.', '4.', '5.', '6.', '7.']);
  });

  it('labels restart per page in page mode', () => {
    const spec = baseSpec({
      sections: [{ typeIds: ['fake'], counts: [7] }],
      layout: { ...baseSpec().layout, numbering: 'page' },
    });
    const { pages } = packSheet(generateSections(spec, types), spec.layout, spec.options, types);
    const labels = pages.flatMap((p) => p.problems.map((x) => x.label));
    expect(labels).toEqual(['1.', '2.', '3.', '4.', '5.', '1.', '2.']);
  });

  it('labels by column in column mode', () => {
    const spec = baseSpec({
      sections: [{ typeIds: ['fake'], counts: [7] }],
      layout: { ...baseSpec().layout, numbering: 'column', columns: 2 },
    });
    const { pages } = packSheet(generateSections(spec, types), spec.layout, spec.options, types);
    const labels = pages.flatMap((p) => p.problems.map((x) => x.label));
    expect(labels).toEqual(['A1', 'B1', 'A2', 'B2', 'A3', 'A1', 'B1']);
  });

  it('answer key entries carry worksheet labels and answers', () => {
    const spec = baseSpec({ sections: [{ typeIds: ['fake'], counts: [3] }] });
    const { pages } = packSheet(generateSections(spec, types), spec.layout, spec.options, types);
    const keyPages = pages.filter((p) => p.kind === 'answerKey');
    expect(keyPages.length).toBe(1);
    expect(keyPages[0].number).toBe(1); // key pages number separately
    const entries = keyPages[0].keyEntries;
    expect(entries.map((e) => e.label)).toEqual(['1.', '2.', '3.']);
    for (const e of entries) expect(Number(e.value)).toBeGreaterThanOrEqual(1);
  });

  it('no answer key pages when answerKey is off', () => {
    const spec = baseSpec({ options: { ...baseSpec().options, answerKey: false } });
    const { keyPageCount } = packSheet(generateSections(spec, types), spec.layout, spec.options, types);
    expect(keyPageCount).toBe(0);
  });

  it('rejects sheets over the page limit', () => {
    const spec = baseSpec({
      sections: Array.from({ length: 8 }, () => ({ typeIds: ['fake'], counts: [60] })),
    });
    const generated = generateSections(spec, types);
    expect(() => packSheet(generated, spec.layout, spec.options, types)).toThrow(/pages/);
  });
});
