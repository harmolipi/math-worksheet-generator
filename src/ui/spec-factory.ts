// UI-side spec construction: defaults for new sheets and demo data.
// (Engine files never construct UI defaults — the spec is always explicit.)

import {
  GRADE_LEVEL,
  SCHEMA_VERSION,
  type GradeBand,
  type WorksheetSpec,
} from '../engine/spec';
import { typeMap } from '../engine/registry';

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

// ── One-click worksheet ──────────────────────────────────────────────────
// "Make me a worksheet": a ready-to-print starting point for the selected
// grade band. Deliberately NON-deterministic (this is a brainstorming tool,
// not engine output) — the generated spec then flows through the normal
// deterministic pipeline like any other sheet.

const BAND_TITLES: Record<GradeBand, string> = {
  preK: 'Pre-K Practice',
  K: 'Kindergarten Practice',
  G1: 'Grade 1 Practice',
  G2: 'Grade 2 Practice',
  G3: 'Grade 3 Practice',
  G4: 'Grade 4 Practice',
  G5: 'Grade 5 Practice',
};

export function randomWorksheet(band: GradeBand): WorksheetSpec {
  const level = GRADE_LEVEL[band];
  const eligible = [...typeMap.values()]
    .filter(
      (t) =>
        t.id !== 'manual' &&
        GRADE_LEVEL[t.gradeRange[0]] <= level &&
        level <= GRADE_LEVEL[t.gradeRange[1]],
    )
    .map((t) => t.id);
  // Fisher–Yates with Math.random (UI-side, non-deterministic on purpose).
  const pool = [...eligible];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const sectionCount = Math.random() < 0.3 ? 1 : 2;
  const sections: WorksheetSpec['sections'] = [];
  let cursor = 0;
  for (let s = 0; s < sectionCount; s++) {
    const typeCount = Math.random() < 0.4 ? 2 : 1;
    const typeIds = Array.from(
      { length: typeCount },
      (_, k) => pool[(cursor + k) % pool.length],
    );
    cursor += typeCount;
    sections.push({
      typeIds,
      counts: typeIds.map(() => 4 + Math.floor(Math.random() * 5)), // 4–8 each
      difficulty: Math.random() < 0.25 ? 'mixed' : 'grade',
    });
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    seed: randomSeed(),
    title: BAND_TITLES[band],
    gradeBand: band,
    sections,
    layout: {
      pageSize: 'letter',
      columns: Math.random() < 0.35 ? 1 : 2,
      numbering: 'sequential',
      header: {
        title: true,
        name: true,
        date: Math.random() < 0.5,
        classLine: false,
      },
      workspace: Math.random() < 0.3 ? 'box' : 'none',
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
