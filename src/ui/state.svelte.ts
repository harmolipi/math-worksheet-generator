// Config state — module-level runes (.svelte.ts). All spec mutations go
// through these actions so URL sync, preview, and validation stay consistent.

import {
  decodeSpec,
  encodeSpec,
  typeMap,
  type GradeBand,
  type LayoutSpec,
  type OptionsSpec,
  type SectionSpec,
  type WorksheetSpec,
} from '../engine';
import type { ManualQuestion } from '../content/manual/manual';
import { defaultSpec, randomSeed } from './spec-factory';

// Exported as a $state store: components read `store.spec` reactively.
// (Svelte forbids exporting module-level $derived values.)
export const store = $state({
  spec: defaultSpec() as WorksheetSpec,
  /** Error from a shared link, shown once in a banner. */
  hashError: '',
  /** Sets A–F mode: render six variant sheets (anti-cheating) for the spec. */
  setsMode: false,
});

export function setTitle(value: string): void {
  const t = value.trim();
  store.spec.title = t === '' ? undefined : t;
}

export function setGradeBand(band: GradeBand): void {
  store.spec.gradeBand = band;
}

export function newNumbers(): void {
  store.spec.seed = randomSeed();
}

export function toggleSets(): void {
  store.setsMode = !store.setsMode;
}

export function addSection(): void {
  if (store.spec.sections.length < 8) {
    store.spec.sections.push({ typeIds: [], counts: [] });
  }
}

export function removeSection(index: number): void {
  if (store.spec.sections.length > 1) store.spec.sections.splice(index, 1);
}

export function addTypeToSection(index: number, typeId: string): void {
  const section = store.spec.sections[index];
  if (!section.typeIds.includes(typeId) && section.typeIds.length < 8) {
    section.typeIds.push(typeId);
    if (typeId === 'manual') {
      // Manual sections start with one empty question; count tracks the list.
      section.params ??= {};
      section.params['manual'] = { questions: [{ prompt: '', layout: 'horizontal' }] };
      section.counts.push(1);
    } else {
      section.counts.push(5);
    }
  }
}

export function removeTypeFromSection(index: number, typeId: string): void {
  const section = store.spec.sections[index];
  const at = section.typeIds.indexOf(typeId);
  if (at >= 0) {
    section.typeIds.splice(at, 1);
    section.counts.splice(at, 1);
    // Params for a removed type would fail validation ("params for a type
    // not in this section").
    if (section.params) delete section.params[typeId];
  }
}

export function setTypeCount(index: number, typeId: string, count: number): void {
  const section = store.spec.sections[index];
  const at = section.typeIds.indexOf(typeId);
  if (at >= 0) section.counts[at] = Math.min(60, Math.max(1, count));
}

export function setSectionDifficulty(index: number, difficulty: SectionSpec['difficulty']): void {
  store.spec.sections[index].difficulty = difficulty;
}

// ── Manual question editor ───────────────────────────────────────────────
// The `manual` type's params carry the teacher's questions. Every mutation
// keeps section.counts in sync with the list length (the manual generator
// emits one problem per question).

function manualSlot(section: SectionSpec): { questions: ManualQuestion[] } {
  section.params ??= {};
  section.params['manual'] ??= { questions: [] };
  return section.params['manual'] as { questions: ManualQuestion[] };
}

export function manualQuestions(sectionIndex: number): ManualQuestion[] {
  return manualSlot(store.spec.sections[sectionIndex]).questions;
}

export function addManualQuestion(sectionIndex: number): void {
  const section = store.spec.sections[sectionIndex];
  const at = section.typeIds.indexOf('manual');
  if (at < 0) return;
  const { questions } = manualSlot(section);
  if (questions.length >= 60) return;
  questions.push({ prompt: '', layout: 'horizontal' });
  section.counts[at] = questions.length;
}

export function updateManualQuestion(
  sectionIndex: number,
  qIndex: number,
  patch: Partial<ManualQuestion>,
): void {
  const section = store.spec.sections[sectionIndex];
  const { questions } = manualSlot(section);
  const q = questions[qIndex];
  if (!q) return;
  if (patch.workspace === undefined) {
    delete q.workspace; // '' in the select means "use the sheet default"
  } else {
    q.workspace = patch.workspace;
  }
  if (patch.prompt !== undefined) q.prompt = patch.prompt;
  if (patch.answer !== undefined) q.answer = patch.answer === '' ? undefined : patch.answer;
  if (patch.layout !== undefined) q.layout = patch.layout;
}

export function removeManualQuestion(sectionIndex: number, qIndex: number): void {
  const section = store.spec.sections[sectionIndex];
  const { questions } = manualSlot(section);
  if (questions.length <= 1) return; // a section must keep at least one
  questions.splice(qIndex, 1);
  const at = section.typeIds.indexOf('manual');
  if (at >= 0) section.counts[at] = questions.length;
}

export function moveManualQuestion(sectionIndex: number, qIndex: number, dir: -1 | 1): void {
  const section = store.spec.sections[sectionIndex];
  const { questions } = manualSlot(section);
  const to = qIndex + dir;
  if (to < 0 || to >= questions.length) return;
  [questions[qIndex], questions[to]] = [questions[to], questions[qIndex]];
}

export function patchLayout(patch: Partial<LayoutSpec>): void {
  store.spec.layout = { ...store.spec.layout, ...patch };
}

export function patchHeader(patch: Partial<LayoutSpec['header']>): void {
  store.spec.layout.header = { ...store.spec.layout.header, ...patch };
}

export function patchOptions(patch: Partial<OptionsSpec>): void {
  store.spec.options = { ...store.spec.options, ...patch };
}

/** Read a shared link from the URL hash; keep local state when absent/invalid. */
export function loadFromHash(): void {
  if (!location.hash) return;
  const result = decodeSpec(location.hash, typeMap);
  if (result.ok) {
    store.spec = result.spec;
  } else {
    store.hashError = result.error;
  }
}

/** The canonical share URL for the current sheet. */
export function shareLink(): string {
  return location.origin + location.pathname + '#' + encodeSpec(store.spec);
}
