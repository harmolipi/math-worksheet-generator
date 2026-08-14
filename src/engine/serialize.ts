// URL-hash serialization: #s=<base64url(JSON spec)>.
// Specs are typically 300–1500 bytes, so no compression — just ASCII-safe base64url.

import {
  SCHEMA_VERSION,
  SheetError,
  type QuestionType,
  type WorksheetSpec,
} from './spec';
import { validateSpec } from './validate';

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSpec(spec: WorksheetSpec): string {
  return 's=' + toBase64Url(JSON.stringify(spec));
}

export type DecodeResult =
  | { ok: true; spec: WorksheetSpec }
  | { ok: false; error: string };

/** Migrations for past schemaVersions. Additive-only: never mutate old behavior. */
const migrations: Record<number, (spec: WorksheetSpec) => WorksheetSpec> = {
  // Example for the future:
  // 1: (s) => ({ ...s, schemaVersion: 2, layout: { ...s.layout, workspace: 'none' } }),
};

export function migrate(spec: WorksheetSpec, fromVersion: number): WorksheetSpec {
  let s = spec;
  for (let v = fromVersion; v < SCHEMA_VERSION; v++) {
    const m = migrations[v];
    if (m) s = m(s);
    s.schemaVersion = v + 1;
  }
  return s;
}

/**
 * Parse a URL hash into a validated spec.
 * Pass `types` to run deep validation (param checks) too; the UI always passes it.
 */
export function decodeSpec(
  hash: string,
  types?: Map<string, QuestionType>,
): DecodeResult {
  let payload = hash.trim();
  if (payload.startsWith('#')) payload = payload.slice(1);
  if (!payload.startsWith('s=')) return { ok: false, error: 'Not a worksheet link.' };

  let json: string;
  try {
    json = fromBase64Url(payload.slice(2));
  } catch {
    return { ok: false, error: 'Not a worksheet link.' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Not a worksheet link.' };
  }
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Not a worksheet link.' };
  }

  const version = (raw as { schemaVersion?: unknown }).schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: 'Worksheet link is missing its version.' };
  }
  if (version > SCHEMA_VERSION) {
    return { ok: false, error: 'This link was made by a newer version of the app.' };
  }

  const migrated = migrate(raw as unknown as WorksheetSpec, version);
  if (types) {
    const result = validateSpec(migrated, types);
    if (!result.ok) return { ok: false, error: result.errors.join(' ') };
    return { ok: true, spec: result.spec };
  }
  return { ok: true, spec: migrated };
}

/** Serialize + decode round-trip helper used by tests and the share-link UI. */
export function parseSpecOrThrow(hash: string, types: Map<string, QuestionType>): WorksheetSpec {
  const result = decodeSpec(hash, types);
  if (!result.ok) throw new SheetError('validation', result.error);
  return result.spec;
}
