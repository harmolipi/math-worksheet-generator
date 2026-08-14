<script lang="ts">
  // WYSIWYG preview: the exact sheet markup inside a transform-scaled wrapper.
  // Also runs the page-overflow lint — pack estimates are conservative, but
  // rendering can still exceed them; catch it here, not in a classroom printer.

  import { findOverflowingPages } from './overflow';

  let { sheetMarkup, pageWidthPt }: { sheetMarkup: string; pageWidthPt: number } = $props();

  let viewportEl: HTMLDivElement | undefined = $state();
  let viewportW = $state(800);
  let overflowing = $state<number[]>([]);

  $effect(() => {
    const el = viewportEl;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      viewportW = entries[0].contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Overflow lint: after each sheet render, flag pages whose content is clipped.
  $effect(() => {
    void sheetMarkup;
    const el = viewportEl;
    if (!el) return;
    overflowing = findOverflowingPages(el);
  });

  const scale = $derived(Math.min(1, (viewportW - 32) / pageWidthPt));
</script>

{#if overflowing.length > 0}
  <div class="overflow-badge" role="alert">
    Page {overflowing.join(', ')} may be too full — trim some questions or switch pages.
  </div>
{/if}
<div class="preview-viewport" bind:this={viewportEl}>
  <div
    class="scaler"
    style={`transform: scale(${scale}); transform-origin: top left;`}
  >
    {@html sheetMarkup}
  </div>
</div>
