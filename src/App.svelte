<script lang="ts">
  import { assembleSheet, encodeSpec, typeMap } from './engine';
  import ConfigPanel from './ui/ConfigPanel.svelte';
  import Preview from './ui/Preview.svelte';
  import { loadFromHash, store } from './ui/state.svelte';

  // svelte-eslint-disable svelte/no-at-html-tags (see eslint.config.js)
  loadFromHash();

  const spec = $derived(store.spec);
  const hashError = $derived(store.hashError);

  const sheet = $derived.by(() => {
    try {
      const result = assembleSheet(spec, typeMap);
      return { ok: true as const, result };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : 'Something went wrong building this sheet.',
      };
    }
  });

  // Style + markup as ONE raw string: Svelte treats <style> elements in
  // component markup specially (hoisting), so the stylesheet must travel
  // inside {@html} to land in the DOM verbatim.
  const sheetMarkup = $derived(
    sheet.ok ? `<style>${sheet.result.css}</style>${sheet.result.html}` : '',
  );

  // Keep the shareable URL in sync with the config (replaceState: no history spam).
  $effect(() => {
    const encoded = encodeSpec(spec);
    history.replaceState(null, '', `#${encoded}`);
  });

  const pageMeta = $derived(
    sheet.ok
      ? `${sheet.result.worksheetPageCount} page${sheet.result.worksheetPageCount === 1 ? '' : 's'}` +
        (sheet.result.keyPageCount > 0
          ? ` · key: ${sheet.result.keyPageCount} page${sheet.result.keyPageCount === 1 ? '' : 's'}`
          : '')
      : '—',
  );
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

{#if !sheet.ok}
  <div class="error-banner no-print" role="alert">
    {sheet.error}
  </div>
{/if}

<div class="layout no-print">
  <ConfigPanel />
  <Preview {sheetMarkup} pageWidthPt={612} />
</div>

<div class="print-only">
  {@html sheetMarkup}
</div>
