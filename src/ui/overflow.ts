// Page-overflow lint, shared by the preview badge and the one-click
// worksheet retry loop. Measure ONLY inside the visible preview — the
// hidden print root has no layout and would read as overflowing.

export function findOverflowingPages(root: Element): number[] {
  const bad: number[] = [];
  root.querySelectorAll('.sheet-page').forEach((page) => {
    if (page.scrollHeight > page.clientHeight + 2) {
      const n = Number(page.getAttribute('data-page'));
      if (Number.isFinite(n)) bad.push(n);
    }
  });
  return bad;
}
