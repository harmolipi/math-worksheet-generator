import { describe, expect, it } from 'vitest';
import { generateSections } from '../../src/engine/generate';
import { packSheet } from '../../src/engine/pack';
import { decodeSpec, encodeSpec } from '../../src/engine/serialize';
import { registry } from '../helpers/registry';
import { baseSpec } from '../helpers/fake-type';

function manualSpec(questions: unknown[], counts?: number): ReturnType<typeof baseSpec> {
  return baseSpec({
    seed: 'manual-seed',
    sections: [
      {
        typeIds: ['manual'],
        counts: [counts ?? questions.length],
        params: { manual: { questions } },
      },
    ],
  });
}

describe('manual question type', () => {
  it('renders a horizontal prompt with an escaped body', () => {
    const spec = manualSpec([{ prompt: '34 + 57 =', answer: '91' }]);
    const problems = generateSections(spec, registry)[0].problems;
    expect(problems).toHaveLength(1);
    const html = registry.get('manual')!.render(problems[0]);
    expect(html).toContain('34 + 57 =');
    expect(html).toContain('manual-horizontal');
  });

  it('escapes user prompts (XSS surface)', () => {
    const cases: [string, string][] = [
      ['<script>alert(1)</script> 2 + 2 =', '&lt;script&gt;'],
      ['<img src=x onerror=alert(1)>', '&lt;img'],
    ];
    for (const [prompt, escapedMarker] of cases) {
      const spec = manualSpec([{ prompt }]);
      const problem = generateSections(spec, registry)[0].problems[0];
      const html = registry.get('manual')!.render(problem);
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img');
      expect(html).toContain(escapedMarker);
    }
  });

  it('renders vertical layout as stacked rows above an answer line', () => {
    const spec = manualSpec([{ prompt: '34\n+ 57', layout: 'vertical', answer: '91' }]);
    const problem = generateSections(spec, registry)[0].problems[0];
    const html = registry.get('manual')!.render(problem);
    expect(html).toContain('manual-vertical');
    expect(html).toContain('manual-answer-row');
    const rows = html.match(/manual-row">/g) ?? [];
    expect(rows).toHaveLength(2);
  });

  it('puts answers on the answer key with matching labels', () => {
    const questions = [
      { prompt: '1 + 1 =', answer: '2' },
      { prompt: '2 + 2 =', answer: '4' },
      { prompt: 'no answer here' },
    ];
    const spec = manualSpec(questions);
    const generated = generateSections(spec, registry);
    const { pages } = packSheet(generated, spec.layout, spec.options, registry);
    const key = pages.find((p) => p.kind === 'answerKey');
    expect(key).toBeDefined();
    expect(key!.keyEntries.map((e) => [e.label, e.value])).toEqual([
      ['1.', '2'],
      ['2.', '4'],
      // no-answer prompt excluded
    ]);
  });

  it('round-trips manual questions through the URL hash', () => {
    const questions = [
      { prompt: '7 × 8 =', answer: '56' },
      { prompt: '100\n- 47', layout: 'vertical', answer: '53', workspace: 'box' },
    ];
    const spec = manualSpec(questions);
    const decoded = decodeSpec('#' + encodeSpec(spec), registry);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.spec).toEqual(spec);
  });

  it('repeats the last question instead of crashing on count mismatch', () => {
    const spec = manualSpec([{ prompt: 'last one', answer: 'x' }], 3);
    const problems = generateSections(spec, registry)[0].problems;
    expect(problems).toHaveLength(3);
    for (const p of problems) {
      expect((p.data as { prompt: string }).prompt).toBe('last one');
    }
  });

  it('produces the same sheet with any seed (no RNG)', () => {
    const questions = [{ prompt: '5 + 5 =', answer: '10' }];
    const a = generateSections(manualSpec(questions, 3), registry);
    const b = generateSections(
      baseSpec({
        seed: 'completely-different',
        sections: [
          { typeIds: ['manual'], counts: [3], params: { manual: { questions } } },
        ],
      }),
      registry,
    );
    expect(a).toEqual(b);
  });

  it('validateParams rejects bad manual questions', () => {
    const manual = registry.get('manual')!;
    const cases: [string, unknown][] = [
      ['too many questions', Array.from({ length: 61 }, () => ({ prompt: '1' }))],
      ['empty prompt', [{ prompt: '   ' }]],
      ['overlong prompt', [{ prompt: 'x'.repeat(301) }]],
      ['overlong answer', [{ prompt: '1 + 1', answer: 'x'.repeat(201) }]],
      ['bad layout', [{ prompt: '1 + 1', layout: 'diagonal' }]],
      ['bad workspace', [{ prompt: '1 + 1', workspace: 'lines' }]],
      ['non-object entry', [42]],
      ['not an array', { prompt: '1 + 1' }],
    ];
    for (const [name, questions] of cases) {
      const errors = manual.validateParams!({ questions });
      expect(errors.length, name).toBeGreaterThan(0);
    }
    expect(manual.validateParams!({})).toEqual([]);
    expect(manual.validateParams!({ questions: [{ prompt: 'ok', answer: 'fine' }] })).toEqual([]);
  });
});
