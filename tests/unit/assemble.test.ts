import { describe, expect, it } from 'vitest';
import { assembleSheet } from '../../src/engine/assemble';
import { typeMap } from '../../src/engine/registry';
import { baseSpec } from '../helpers/fake-type';

const ASSEMBLE_TYPES = typeMap; // real registry: counting + addsub + manual

function assembleSpec(overrides: Record<string, unknown> = {}) {
  return baseSpec({
    seed: 'assemble-test',
    gradeBand: 'G1',
    sections: [
      { typeIds: ['count-objects', 'add-facts'], counts: [6, 10] },
    ],
    ...overrides,
  });
}

describe('assembleSheet', () => {
  it('builds one section per packed page, plus answer-key pages', () => {
    const spec = assembleSpec();
    const result = assembleSheet(spec, ASSEMBLE_TYPES);
    const pageCount = (result.html.match(/class="sheet-page/g) ?? []).length;
    expect(pageCount).toBe(result.worksheetPageCount + result.keyPageCount);
    expect(result.worksheetPageCount).toBeGreaterThanOrEqual(1);
    expect(result.keyPageCount).toBeGreaterThanOrEqual(1);
  });

  it('is pure — byte-identical output across calls', () => {
    const spec = assembleSpec();
    const a = assembleSheet(spec, ASSEMBLE_TYPES);
    const b = assembleSheet(spec, ASSEMBLE_TYPES);
    expect(a.html).toBe(b.html);
    expect(a.css).toBe(b.css);
  });

  it('renders footers with per-kind page counts', () => {
    const spec = assembleSpec();
    const result = assembleSheet(spec, ASSEMBLE_TYPES);
    expect(result.html).toContain(`Page 1 of ${result.worksheetPageCount}`);
    expect(result.html).toContain(`Answer Key · Page 1 of ${result.keyPageCount}`);
  });

  it('labels problems and carries answers on key pages', () => {
    const spec = assembleSpec();
    const result = assembleSheet(spec, ASSEMBLE_TYPES);
    expect(result.html).toContain('problem-label');
    expect(result.html).toContain('key-entry');
    expect(result.html).toContain('data-answer="');
  });

  it('escapes the sheet title', () => {
    const spec = assembleSpec({ title: '<b>Injected</b> Title & "More"' });
    const result = assembleSheet(spec, ASSEMBLE_TYPES);
    expect(result.html).not.toContain('<b>Injected</b>');
    expect(result.html).toContain('&lt;b&gt;Injected&lt;/b&gt;');
  });

  it('adds workspace boxes when requested', () => {
    const none = assembleSheet(assembleSpec(), ASSEMBLE_TYPES);
    const withBox = assembleSheet(
      assembleSpec({ layout: { ...baseSpec().layout, workspace: 'box' } }),
      ASSEMBLE_TYPES,
    );
    expect(none.html).not.toContain('workspace-box');
    expect(withBox.html).toContain('workspace-box');
  });

  it('switches to A4 geometry in the CSS', () => {
    const a4 = assembleSheet(
      assembleSpec({ layout: { ...baseSpec().layout, pageSize: 'a4' } }),
      ASSEMBLE_TYPES,
    );
    expect(a4.css).toContain('size: A4');
    expect(a4.css).toContain('210mm');
    expect(a4.css).toContain('297mm');
  });

  it('respects the answerKey toggle', () => {
    const off = assembleSheet(
      assembleSpec({ options: { ...baseSpec().options, answerKey: false } }),
      ASSEMBLE_TYPES,
    );
    expect(off.keyPageCount).toBe(0);
    expect(off.html).not.toContain('Answer Key');
  });

  it('marks pages with content-height data for the overflow lint', () => {
    const result = assembleSheet(assembleSpec(), ASSEMBLE_TYPES);
    expect(result.html).toContain('data-content-h=');
  });
});
