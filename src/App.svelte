<script lang="ts">
  import { assembleSheet, typeMap } from './engine';
  import { defaultSpec } from './ui/spec-factory';

  // Phase 1 preview: fixed demo spec. The config UI (task 7) replaces this.
  const spec = $state(defaultSpec());
  const sheet = $derived.by(() => assembleSheet(spec, typeMap));
  // Style + markup as ONE raw string: Svelte treats <style> elements in
  // component markup specially (hoisting), so the stylesheet must travel
  // inside {@html} to land in the DOM verbatim.
  const sheetMarkup = $derived(`<style>${sheet.css}</style>${sheet.html}`);

  let viewportEl: HTMLDivElement | undefined = $state();
  let viewportW = $state(800);

  $effect(() => {
    const el = viewportEl;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      viewportW = entries[0].contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Letter page width = 612pt; fit it inside the viewport with a little air.
  const scale = $derived(Math.min(1, (viewportW - 32) / 612));
</script>

<!-- svelte-eslint-disable svelte/no-at-html-tags — sheet HTML below is engine-generated;
     every user-supplied string (title, manual prompts, answers) is escaped at render
     (see render/html.ts + tests/unit/manual.test.ts). -->
<div class="app no-print">
  <header class="topbar">
    <h1>Math Worksheet Generator</h1>
    <button class="print-btn" onclick={() => window.print()}>Print / Save as PDF</button>
  </header>
  <p class="print-hint">
    In the print dialog: set <b>Margins</b> to None, turn off <b>headers &amp; footers</b>, and keep
    <b>Scale at 100%</b> — the page layout is built to those settings.
  </p>
  <div class="preview-viewport" bind:this={viewportEl}>
    <div
      class="scaler"
      style={`transform: scale(${scale}); transform-origin: top left;`}
    >
      {@html sheetMarkup}
    </div>
  </div>
</div>

<div class="print-only">
  {@html sheetMarkup}
</div>

<style>
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 22px;
    background: #fff;
    border-bottom: 1px solid #e3e0da;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .topbar h1 {
    font-size: 1.1rem;
    margin: 0;
  }

  .print-btn {
    font: inherit;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 999px;
    border: none;
    background: #2f6fed;
    color: #fff;
    cursor: pointer;
  }

  .print-btn:hover {
    background: #2459c4;
  }

  .print-hint {
    text-align: center;
    color: #6b675f;
    font-size: 0.85rem;
    margin: 10px 16px;
  }

  .preview-viewport {
    padding: 0 16px 48px;
    overflow-x: auto;
  }

  .scaler {
    width: 612pt;
  }
</style>
