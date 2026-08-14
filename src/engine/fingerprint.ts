// Canonical serialization + fingerprinting for dedupe within a sheet.
// Canonical form sorts object keys recursively so {a:1,b:2} and {b:2,a:1}
// produce the same fingerprint.

import { fnv1a } from './seed';

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

/** Stable string hash of a problem's structure + data, for dedupe. */
export function fingerprintOf(parts: unknown[]): string {
  return fnv1a(parts.map(canonicalJson).join('|')).toString(36);
}
