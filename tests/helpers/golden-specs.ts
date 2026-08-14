// Shared golden-fixture generators. The test suite and the regeneration
// script (scripts/update-golden.ts) MUST produce identical output — any
// change to these generators changes the golden contract, so treat edits as
// a deliberate version bump.

import { assembleSheet } from '../../src/engine/assemble';
import { generateSections } from '../../src/engine/generate';
import { SCHEMA_VERSION, type GradeBand, type QuestionType, type WorksheetSpec } from '../../src/engine/spec';
import { typeMap } from '../../src/engine/registry';

export const GOLDEN_SEEDS = ['golden-a', 'golden-b'];

function bandOf(type: QuestionType): GradeBand {
  return type.gradeRange[0];
}

/** Per-type golden: rendered HTML of every problem, two seeds, at the
 *  type's lowest grade band. Includes the fingerprint line so changes to
 *  generation or rendering both trip the golden. */
export function perTypeGolden(type: QuestionType): string {
  const band = bandOf(type);
  const lines: string[] = [`# ${type.id} @ ${band}`];
  for (const seed of GOLDEN_SEEDS) {
    const spec: WorksheetSpec = {
      schemaVersion: SCHEMA_VERSION,
      seed,
      gradeBand: band,
      sections: [{ typeIds: [type.id], counts: [5] }],
      layout: {
        pageSize: 'letter',
        columns: 1,
        numbering: 'sequential',
        header: { title: false, name: false, date: false, classLine: false },
        workspace: 'none',
      },
      options: {
        answerKey: false,
        answerKeyStyle: 'list',
        inkSaver: false,
        accentColor: null,
        showPageNumbers: false,
        largePrint: false,
      },
    };
    const problems = generateSections(spec, typeMap)[0].problems;
    for (const p of problems) {
      lines.push(`${p.fingerprint} | ${type.render(p)}`);
    }
  }
  return lines.join('\n') + '\n';
}

/** Whole-sheet golden spec: a representative mixed sheet, all chrome on. */
export function demoScreenSpec(): WorksheetSpec {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed: 'golden-demo',
    title: 'Golden Demo',
    gradeBand: 'G1',
    sections: [
      { typeIds: ['count-objects', 'number-recognition'], counts: [3, 3] },
      { typeIds: ['add-facts', 'ten-frame'], counts: [4, 4] },
    ],
    layout: {
      pageSize: 'letter',
      columns: 2,
      numbering: 'sequential',
      header: { title: true, name: true, date: true, classLine: true },
      workspace: 'box',
    },
    options: {
      answerKey: true,
      answerKeyStyle: 'list',
      inkSaver: false,
      accentColor: null,
      showPageNumbers: true,
      largePrint: false,
    },
  };
}

export function wholeSheetGolden(): { html: string; css: string } {
  const result = assembleSheet(demoScreenSpec(), typeMap);
  return { html: result.html, css: result.css };
}
