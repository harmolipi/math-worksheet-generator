import { describe, expect, it } from 'vitest';
import { decodeSpec, encodeSpec, migrate } from '../../src/engine/serialize';
import { SCHEMA_VERSION, type WorksheetSpec } from '../../src/engine/spec';
import { baseSpec, fakeType, fakeTypeMap } from '../helpers/fake-type';

describe('serialize', () => {
  const types = fakeTypeMap([fakeType()]);

  it('round-trips a spec through the URL hash', () => {
    const spec = baseSpec({ seed: 'round-trip', title: 'Test sheet' });
    const decoded = decodeSpec('#' + encodeSpec(spec), types);
    expect(decoded).toEqual({ ok: true, spec });
  });

  it('rejects garbage input with friendly errors', () => {
    expect(decodeSpec('', types).ok).toBe(false);
    expect(decodeSpec('hello', types).ok).toBe(false);
    expect(decodeSpec('#s=!!!not-base64!!!', types).ok).toBe(false);
    expect(decodeSpec('#s=eyJub3QiOiJhIHNwZWMifQ', types).ok).toBe(false); // valid b64, not a spec
  });

  it('rejects specs from a newer app version', () => {
    const future = { ...baseSpec(), schemaVersion: SCHEMA_VERSION + 1 } as unknown as WorksheetSpec;
    const result = decodeSpec('#' + encodeSpec(future), types);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/newer version/);
  });

  it('deep-validates when types are provided', () => {
    const bad = baseSpec({ sections: [{ typeIds: ['nope'], counts: [3] }] });
    const result = decodeSpec('#' + encodeSpec(bad), types);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Unknown question type/);
  });

  it('migrate() is identity for current version', () => {
    const spec = baseSpec();
    expect(migrate(spec, SCHEMA_VERSION)).toEqual(spec);
  });

  it('encoded hash is URL-safe (no +, /, or =)', () => {
    const hash = encodeSpec(baseSpec({ seed: 'a/+/= ' }));
    expect(hash).toMatch(/^s=[A-Za-z0-9_-]+$/);
  });
});
