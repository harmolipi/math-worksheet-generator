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
import { defaultSpec, randomSeed } from './spec-factory';

// Exported as a $state store: components read `store.spec` reactively.
// (Svelte forbids exporting module-level $derived values.)
export const store = $state({
  spec: defaultSpec() as WorksheetSpec,
  /** Error from a shared link, shown once in a banner. */
  hashError: '',
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
    section.counts.push(5);
  }
}

export function removeTypeFromSection(index: number, typeId: string): void {
  const section = store.spec.sections[index];
  const at = section.typeIds.indexOf(typeId);
  if (at >= 0) {
    section.typeIds.splice(at, 1);
    section.counts.splice(at, 1);
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
