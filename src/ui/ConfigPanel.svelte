<script lang="ts">
  // The prep sheet: grade, title, sections with question types, page setup,
  // print options, and the seed/link row. The worksheet itself stays in the
  // preview — this rail is everything the teacher needs to build it.

  import {
    GRADE_LEVEL,
    createRng,
    typeMap,
    type GradeBand,
    type QuestionType,
  } from '../engine';
  import { sheetCss } from '../render/sheet-css';
  import {
    addSection,
    addTypeToSection,
    newNumbers,
    patchHeader,
    patchLayout,
    patchOptions,
    removeSection,
    removeTypeFromSection,
    setGradeBand,
    setSectionDifficulty,
    setTitle,
    setTypeCount,
    shareLink,
    store,
  } from './state.svelte';

  const spec = $derived(store.spec);

  const GRADE_CHIPS: { band: GradeBand; label: string }[] = [
    { band: 'preK', label: 'Pre-K' },
    { band: 'K', label: 'K' },
    { band: 'G1', label: '1' },
    { band: 'G2', label: '2' },
    { band: 'G3', label: '3' },
    { band: 'G4', label: '4' },
    { band: 'G5', label: '5' },
  ];

  const DIFFICULTIES = [
    { value: 'grade', label: 'At grade level' },
    { value: 'easy', label: 'A step easier' },
    { value: 'challenge', label: 'A step harder' },
    { value: 'mixed', label: 'Mixed levels' },
  ] as const;

  const ACCENTS = [
    { value: null, label: 'None' },
    { value: '#2F6FED', label: 'Blue' },
    { value: '#2E8B57', label: 'Green' },
    { value: '#C0392B', label: 'Red' },
    { value: '#1B7F7A', label: 'Teal' },
  ];

  /** Friendly subject headings for the add-type picker. */
  const SUBJECT_NAMES: Record<string, string> = {
    addsub: 'Addition & Subtraction',
    counting: 'Counting & Number Sense',
    multdiv: 'Multiplication & Division',
    placevalue: 'Place Value',
    fractions: 'Fractions',
    time: 'Time',
    money: 'Money',
    measurement: 'Measurement',
    geometry: 'Geometry',
    patterns: 'Patterns',
    colorByNumber: 'Color by Number',
    manual: 'My Own Questions',
  };

  /** Types grouped by subject, for the add-type picker (registry order). */
  const subjects = $derived.by(() => {
    const order: string[] = [];
    const bySubject: Record<string, QuestionType[]> = {};
    for (const type of typeMap.values()) {
      if (!bySubject[type.subject]) {
        bySubject[type.subject] = [];
        order.push(type.subject);
      }
      bySubject[type.subject].push(type);
    }
    return order.map((subject) => [subject, bySubject[subject]] as const);
  });

  /** A tiny live sample problem per type, deterministic (fixed seed). */
  function sampleFor(type: QuestionType): string | null {
    if (type.id === 'manual') return null; // described by its card copy instead
    const preset = type.difficultyPresets[spec.gradeBand] ?? {};
    const params = { ...preset };
    for (const p of type.params) if (params[p.key] === undefined) params[p.key] = p.default;
    const problem = type.generate(createRng(7), params, {
      gradeLevel: GRADE_LEVEL[spec.gradeBand],
      index: 0,
    });
    return type.render(problem);
  }

  // Which section has its type picker open (one at a time).
  let pickerOpen = $state<number | null>(null);

  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;
  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareLink());
      copied = true;
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => (copied = false), 1600);
    } catch {
      copied = false;
    }
  }

  // The type-picker samples reuse the sheet stylesheet; injected as one raw
  // string (Svelte treats literal <style> elements in markup specially).
  const railCss = $derived(`<style>${sheetCss(spec)}</style>`);
</script>

{@html railCss}

<div class="rail">
  <!-- Title: styled like the worksheet's own name line — the app wears the artifact's uniform. -->
  <label class="title-field">
    <span class="title-prefix">Title</span>
    <input
      class="title-input"
      type="text"
      maxlength="120"
      placeholder="Practice Worksheet"
      value={spec.title ?? ''}
      oninput={(e) => setTitle(e.currentTarget.value)}
    />
  </label>

  <!-- Grade band -->
  <div class="group">
    <div class="chips" role="radiogroup" aria-label="Grade">
      {#each GRADE_CHIPS as chip (chip.band)}
        <button
          type="button"
          role="radio"
          aria-checked={spec.gradeBand === chip.band}
          class:active={spec.gradeBand === chip.band}
          class="chip-btn"
          onclick={() => setGradeBand(chip.band)}
        >
          {chip.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Sections -->
  {#each spec.sections as section, si (si)}
    <div class="group section-card">
      <div class="section-head">
        <h2>Section {si + 1}</h2>
        <div class="section-actions">
          <select
            class="mini-select"
            aria-label={`Difficulty for section ${si + 1}`}
            value={section.difficulty ?? 'grade'}
            onchange={(e) => setSectionDifficulty(si, e.currentTarget.value as never)}
          >
            {#each DIFFICULTIES as d (d.value)}
              <option value={d.value}>{d.label}</option>
            {/each}
          </select>
          <button
            type="button"
            class="icon-btn"
            aria-label={`Remove section ${si + 1}`}
            disabled={spec.sections.length === 1}
            onclick={() => removeSection(si)}
          >
            ×
          </button>
        </div>
      </div>

      {#if section.typeIds.length === 0}
        <p class="section-empty">No question types yet — add one below.</p>
      {/if}

      {#each section.typeIds as typeId (typeId)}
        {@const type = typeMap.get(typeId)}
        {@const at = section.typeIds.indexOf(typeId)}
        <div class="type-row">
          <button
            type="button"
            class="icon-btn"
            aria-label={`Remove ${type?.name ?? typeId}`}
            onclick={() => removeTypeFromSection(si, typeId)}
          >
            ×
          </button>
          <span class="type-name">{type?.name ?? typeId}</span>
          <div class="stepper">
            <button
              type="button"
              aria-label={`Fewer ${type?.name ?? typeId} problems`}
              onclick={() => setTypeCount(si, typeId, section.counts[at] - 1)}
            >
              −
            </button>
            <span class="stepper-value">{section.counts[at]}</span>
            <button
              type="button"
              aria-label={`More ${type?.name ?? typeId} problems`}
              onclick={() => setTypeCount(si, typeId, section.counts[at] + 1)}
            >
              +
            </button>
          </div>
        </div>
      {/each}

      {#if pickerOpen === si}
        <div class="type-picker">
          {#each subjects as [subjectId, types] (subjectId)}
            <div class="subject-group">
              <h3>{SUBJECT_NAMES[subjectId] ?? subjectId}</h3>
              <div class="type-cards">
                {#each types as type (type.id)}
                  <button
                    type="button"
                    class="type-card"
                    disabled={section.typeIds.includes(type.id)}
                    onclick={() => addTypeToSection(si, type.id)}
                  >
                    <span class="type-card-name">{type.name}</span>
                    <span class="type-card-desc">{type.description}</span>
                    {#if sampleFor(type)}
                      <span class="type-sample">{@html sampleFor(type)!}</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        <button type="button" class="link-btn" onclick={() => (pickerOpen = null)}>
          Done adding
        </button>
      {:else}
        <button type="button" class="link-btn" onclick={() => (pickerOpen = si)}>
          + Add question type
        </button>
      {/if}
    </div>
  {/each}

  <button
    type="button"
    class="add-section-btn"
    disabled={spec.sections.length >= 8}
    onclick={addSection}
  >
    + Add section
  </button>

  <!-- Page setup -->
  <details class="group details" open>
    <summary>Page setup</summary>
    <div class="setting-row">
      <span class="setting-label">Columns</span>
      <div class="segmented">
        {#each [1, 2, 3] as cols (cols)}
          <button
            type="button"
            class:active={spec.layout.columns === cols}
            onclick={() => patchLayout({ columns: cols as 1 | 2 | 3 })}
          >
            {cols}
          </button>
        {/each}
      </div>
    </div>
    <div class="setting-row">
      <span class="setting-label">Paper</span>
      <div class="segmented">
        <button
          type="button"
          class:active={spec.layout.pageSize === 'letter'}
          onclick={() => patchLayout({ pageSize: 'letter' })}
        >
          Letter
        </button>
        <button
          type="button"
          class:active={spec.layout.pageSize === 'a4'}
          onclick={() => patchLayout({ pageSize: 'a4' })}
        >
          A4
        </button>
      </div>
    </div>
    <div class="setting-row">
      <span class="setting-label">Numbering</span>
      <select
        class="mini-select"
        value={spec.layout.numbering}
        onchange={(e) => patchLayout({ numbering: e.currentTarget.value as never })}
      >
        <option value="sequential">1, 2, 3 …</option>
        <option value="page">Restart per page</option>
        <option value="column">A1, B1, A2 …</option>
      </select>
    </div>
    <div class="setting-row">
      <span class="setting-label">Work space</span>
      <select
        class="mini-select"
        value={spec.layout.workspace}
        onchange={(e) => patchLayout({ workspace: e.currentTarget.value as never })}
      >
        <option value="none">None</option>
        <option value="box">Box under each problem</option>
        <option value="grid">Grid under each problem</option>
      </select>
    </div>
    <div class="setting-row">
      <span class="setting-label">Header lines</span>
      <div class="toggle-list">
        <label class="toggle"><input type="checkbox" checked={spec.layout.header.title} onchange={(e) => patchHeader({ title: e.currentTarget.checked })} /> Title</label>
        <label class="toggle"><input type="checkbox" checked={spec.layout.header.name} onchange={(e) => patchHeader({ name: e.currentTarget.checked })} /> Name</label>
        <label class="toggle"><input type="checkbox" checked={spec.layout.header.date} onchange={(e) => patchHeader({ date: e.currentTarget.checked })} /> Date</label>
        <label class="toggle"><input type="checkbox" checked={spec.layout.header.classLine} onchange={(e) => patchHeader({ classLine: e.currentTarget.checked })} /> Class</label>
      </div>
    </div>
  </details>

  <!-- Print options -->
  <details class="group details" open>
    <summary>Print options</summary>
    <div class="toggle-list">
      <label class="toggle"><input type="checkbox" checked={spec.options.answerKey} onchange={(e) => patchOptions({ answerKey: e.currentTarget.checked })} /> Answer key on its own pages</label>
      <label class="toggle"><input type="checkbox" checked={spec.options.inkSaver} onchange={(e) => patchOptions({ inkSaver: e.currentTarget.checked })} /> Ink saver (pure line art)</label>
      <label class="toggle"><input type="checkbox" checked={spec.options.largePrint} onchange={(e) => patchOptions({ largePrint: e.currentTarget.checked })} /> Large print</label>
      <label class="toggle"><input type="checkbox" checked={spec.options.showPageNumbers} onchange={(e) => patchOptions({ showPageNumbers: e.currentTarget.checked })} /> Page numbers</label>
    </div>
    <div class="setting-row">
      <span class="setting-label">Accent</span>
      <div class="swatches">
        {#each ACCENTS as accent (accent.label)}
          <button
            type="button"
            class="swatch"
            class:active={spec.options.accentColor === accent.value}
            aria-label={`Accent: ${accent.label}`}
            onclick={() => patchOptions({ accentColor: accent.value })}
          >
            <span
              class="swatch-dot"
              style={accent.value ? `background: ${accent.value}` : ''}
            ></span>
          </button>
        {/each}
      </div>
    </div>
  </details>

  <!-- Seed / share -->
  <div class="group seed-row">
    <div class="seed-meta">
      <span class="seed-label">Numbers set</span>
      <span class="seed-value">{spec.seed}</span>
    </div>
    <div class="seed-actions">
      <button type="button" class="btn-secondary" onclick={newNumbers}>New numbers</button>
      <button type="button" class="btn-secondary" onclick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</button>
    </div>
  </div>
</div>
