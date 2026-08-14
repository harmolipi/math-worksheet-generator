// Regenerates golden fixtures. Run ONLY when a change to generator/renderer
// output is deliberate (additive-only rule still applies — old seeds must
// keep their behavior; a changed fixture means changed output for a fixed
// seed, which is a version bump, not a casual edit).

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { typeMap } from '../src/engine/registry';
import { perTypeGolden, wholeSheetGolden } from '../tests/helpers/golden-specs';

const fixturesDir = resolve(import.meta.dirname, '../tests/golden/fixtures');
mkdirSync(fixturesDir, { recursive: true });

for (const type of typeMap.values()) {
  if (type.id === 'manual') continue;
  const file = resolve(fixturesDir, `type-${type.id}.txt`);
  writeFileSync(file, perTypeGolden(type));
  console.log(`wrote ${file}`);
}

const whole = wholeSheetGolden();
writeFileSync(resolve(fixturesDir, 'demo-sheet.html'), whole.html);
writeFileSync(resolve(fixturesDir, 'demo-sheet.css'), whole.css);
console.log('wrote demo-sheet.html + demo-sheet.css');
