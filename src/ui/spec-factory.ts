// UI-side spec construction: defaults for new sheets and demo data.
// (Engine files never construct UI defaults — the spec is always explicit.)

import { SCHEMA_VERSION, type WorksheetSpec } from '../engine/spec';

export function defaultSpec(): WorksheetSpec {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed: 'demo-seed',
    title: 'Practice Worksheet',
    gradeBand: 'G1',
    sections: [
      { typeIds: ['count-objects', 'number-recognition'], counts: [4, 4] },
      { typeIds: ['add-facts'], counts: [8] },
    ],
    layout: {
      pageSize: 'letter',
      columns: 2,
      numbering: 'sequential',
      header: { title: true, name: true, date: true, classLine: false },
      workspace: 'none',
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

/** A fresh random seed string (UI-only — engine never uses Math.random). */
export function randomSeed(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('');
}
