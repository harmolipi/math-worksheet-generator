<script lang="ts">
  import {
    assembleSheet,
    encodeSpec,
    typeMap,
    type SheetResult,
    variantSeedString,
  } from './engine';
  import ConfigPanel from './ui/ConfigPanel.svelte';
  import Preview from './ui/Preview.svelte';
  import { loadFromHash, store } from './ui/state.svelte';

  // svelte-eslint-disable svelte/no-at-html-tags (see eslint.config.js)
  loadFromHash();

  const spec = $derived(store.spec);
  const hashError = $derived(store.hashError);

  const SET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  type SheetOutcome =
    | { ok: true; result: SheetResult }
    | { ok: false; error: string };

  /** The sheets to render: one, or six variants in Sets A–F mode. */
  const sheets = $derived.by((): SheetOutcome[] => {
    const build = (s: typeof spec): SheetOutcome => {
      try {
        return { ok: true, result: assembleSheet(s, typeMap) };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : 'Something went wrong building this sheet.',
        };
      }
    };
    if (!store.setsMode) return [build(spec)];
    return SET_LETTERS.map((letter) =>
      build({
        ...spec,
        seed: variantSeedString(spec.seed, SET_LETTERS.indexOf(letter)),
        title: `${spec.title ? `${spec.title} — ` : ''}Set ${letter}`,
      }),
    );
  });

  const sheetsOk = $derived(sheets.every((s) => s.ok));
  const sheetError = $derived(sheets.find((s) => !s.ok));

  // Style + markup as ONE raw string: Svelte treats <style> elements in
  // component markup specially (hoisting), so the stylesheet must travel
  // inside {@html} to land in the DOM verbatim.
  const sheetMarkup = $derived.by(() => {
    if (!sheetsOk) return '';
    const good = sheets as { ok: true; result: SheetResult }[];
    return `<style>${good[0].result.css}</style>` + good.map((s) => s.result.html).join('');
  });

  // Keep the shareable URL in sync with the config (replaceState: no history spam).
  $effect(() => {
    const encoded = encodeSpec(spec);
    history.replaceState(null, '', `#${encoded}`);
  });

  const pageMeta = $derived.by(() => {
    if (!sheetsOk) return '—';
    const good = sheets as { ok: true; result: SheetResult }[];
    const w = good.reduce((sum, s) => sum + s.result.worksheetPageCount, 0);
    const k = good.reduce((sum, s) => sum + s.result.keyPageCount, 0);
    return (
      `${w} page${w === 1 ? '' : 's'}` +
      (k > 0 ? ` · key: ${k} page${k === 1 ? '' : 's'}` : '')
    );
  });

  /** Total print job size — banner a warning before big jobs hit the printer. */
  const totalPages = $derived.by(() => {
    if (!sheetsOk) return 0;
    const good = sheets as { ok: true; result: SheetResult }[];
    return good.reduce(
      (sum, s) => sum + s.result.worksheetPageCount + s.result.keyPageCount,
      0,
    );
  });
</script>

<div class="topbar no-print">
  <div class="wordmark">
    <span class="wordmark-name">Worksheet Desk</span>
    <span class="wordmark-note">print-perfect math practice</span>
  </div>
  <div class="topbar-meta">
    <span class="page-meta">{pageMeta}</span>
    <button
      type="button"
      class="print-btn"
      onclick={() => window.print()}
    >
      Print / Save as PDF
    </button>
  </div>
</div>

{#if hashError !== ''}
  <div class="error-banner no-print" role="alert">
    That link couldn't be opened: {hashError}. Showing a fresh sheet instead.
  </div>
{/if}

{#if !sheetsOk && sheetError}
  <div class="error-banner no-print" role="alert">
    {sheetError.error}
  </div>
{/if}

{#if sheetsOk && totalPages > 16}
  <div class="overflow-badge no-print" role="status">
    This print job is {totalPages} pages. Print one test page first, then check
    Margins: None and scale 100% in the dialog.
  </div>
{/if}

<div class="layout no-print">
  <ConfigPanel />
  <Preview {sheetMarkup} pageWidthPt={612} />
</div>

<div class="print-only">
  {@html sheetMarkup}
</div>
