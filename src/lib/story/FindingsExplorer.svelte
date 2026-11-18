<script lang="ts">
  import StoryGraphic from './StoryGraphic.svelte';
  import { X_ATTRIBUTES } from './storyModel.mjs';

  type Props = { story: any; geography: any; selected?: string | null; onselect?: (name: string) => void };
  let { story, geography, selected = null, onselect = () => {} }: Props = $props();

  const views = [
    { id: 'storms-snow', label: 'Storm timeline', finding: 'Finding 1 · When',
      how: 'Hover or tab to a column to see the storm, its date, tows per rule day and snowfall.',
      takeaway: 'Average tows per storm fell 46% from 2015–20 to 2022–25, and snowfall barely tracks tows (ρ = −0.21).' },
    { id: 'map-snow', label: 'Snow map', finding: 'Finding 2 · Where',
      how: 'Switch between the three maps; the shapes and scale stay put while only the color meaning changes. Click a neighborhood to select it everywhere.',
      takeaway: 'Snow tows cluster around the University, Uptown, Loring Park and Powderhorn.' },
    { id: 'map-ordinary', label: 'Everyday map', finding: 'Finding 2 · Where',
      how: 'Same map, ordinary winter police-stop tows outside storms.',
      takeaway: 'Everyday tows cluster in North Minneapolis, Phillips and Downtown West.' },
    { id: 'map-gap', label: 'Gap map', finding: 'Finding 2 · Where',
      how: 'Blue gains share in storms, orange loses it. Hover for exact values.',
      takeaway: 'Only 3 neighborhoods sit in both top-10 lists; compare where, not how many.' },
    { id: 'dumbbell', label: 'Biggest swings', finding: 'Finding 2 · Where',
      how: 'Each row joins a neighborhood’s ordinary share (gray) and snow share (blue). Click a row to select it.',
      takeaway: 'Marcy Holmes gains 9.6 points in storms; Jordan loses 5.9.' },
    { id: 'map-street', label: 'Per street-km', finding: 'Finding 3 · Why',
      how: 'Color shows snow tows per kilometer of public street, a fairer yardstick than residents.',
      takeaway: 'Steven’s Square, East Bde Maka Ska, South Uptown and Marcy Holmes lead; tiny-population artifacts disappear.' },
    { id: 'scatter-notes', label: 'Who carries it', finding: 'Finding 3 · Why',
      how: 'Choose the x-axis trait. Each dot is a neighborhood; size is residents; color is the storm share gap.',
      takeaway: 'Car-free households show the strongest link with snow tows per street-km (ρ 0.47); street length alone shows none.' },
    { id: 'groups', label: 'Income groups', finding: 'Finding 3 · Why',
      how: 'Compare each group’s share of streets with its share of snow tows and of ordinary tows.',
      takeaway: 'Snow tows peak in the lower-middle group, not the poorest; everyday tows peak in the poorest.' }
  ];

  let current = $state('storms-snow');
  let xKey = $state('noVehicle');
  const info = $derived(views.find((v) => v.id === current) ?? views[0]);
</script>

<section class="findings-explorer" aria-labelledby="explorer-title">
  <div class="section-heading">
    <p class="eyebrow">FINDINGS EXPLORER · REPLAY EVERY CHART</p>
    <h2 id="explorer-title">Three findings.<br /><em>Your controls.</em></h2>
    <p>Every chart from the story, with its own controls. The neighborhood you select here is the same one the dashboard highlights.</p>
  </div>
  <div class="explorer-controls">
    <div class="view-tabs" role="tablist" aria-label="Choose a chart">
      {#each views as v (v.id)}
        <button type="button" role="tab" aria-selected={current === v.id} class:active={current === v.id} onclick={() => current = v.id}>{v.label}</button>
      {/each}
    </div>
    {#if current.startsWith('scatter')}
      <label class="x-select">X-axis
        <select bind:value={xKey}>
          {#each Object.entries(X_ATTRIBUTES) as [key, label]}<option value={key}>{label}</option>{/each}
        </select>
      </label>
    {/if}
  </div>
  <div class="explorer-layout">
    <div class="explorer-chart">
      <StoryGraphic {story} {geography} view={current} {xKey} {selected} {onselect} />
    </div>
    <aside class="explorer-notes">
      <p class="finding-tag">{info.finding}</p>
      <h3>How to use</h3>
      <p>{info.how}</p>
      <h3>What it shows</h3>
      <p>{info.takeaway}</p>
      {#if selected}<p class="selected-note">Selected: <strong>{selected}</strong> <button type="button" onclick={() => onselect('all')}>Clear</button></p>{/if}
      <p class="source-note">Sources: City of Minneapolis Snow Emergency tow layers and Police Stop Data, City ACS neighborhood profiles, Public Works street centerline, NOAA MSP snowfall. Descriptive associations only, not causes or individual risk.</p>
    </aside>
  </div>
</section>

<style>
  .findings-explorer { padding: 90px max(5%, calc((100vw - 1240px) / 2)); background: #ffffff; border-top: 1px solid #dde7ef; scroll-margin-top: 20px; }
  .explorer-controls { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin-bottom: 14px; }
  .view-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
  .view-tabs button { border: 1px solid #c8d8e4; background: #ffffff; color: #1f3b56; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; }
  .view-tabs button.active { background: #0b1d32; border-color: #0b1d32; color: #ffffff; }
  .view-tabs button:focus-visible, .x-select select:focus-visible { outline: 3px solid #2f7db8; outline-offset: 2px; }
  .x-select { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #38566d; display: flex; gap: 8px; align-items: center; }
  .x-select select { padding: 7px 10px; border: 1px solid #c8d8e4; border-radius: 6px; background: #ffffff; }
  .explorer-layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(240px, 0.75fr); gap: 26px; align-items: start; }
  .explorer-notes { background: #f4f8fb; border: 1px solid #d5e2ec; border-radius: 10px; padding: 18px 20px; }
  .explorer-notes h3 { font: 700 14px 'Space Grotesk', sans-serif; color: #0b1d32; margin: 14px 0 4px; }
  .explorer-notes p { font-size: 14.5px; line-height: 1.6; color: #2b3f55; margin: 0; }
  .finding-tag { font: 700 12px 'Space Grotesk', sans-serif !important; letter-spacing: 0.12em; color: #215a89 !important; text-transform: uppercase; }
  .selected-note { margin-top: 14px !important; }
  .selected-note button { margin-left: 6px; border: 1px solid #c8d8e4; background: #ffffff; border-radius: 4px; font-size: 12px; }
  .source-note { margin-top: 16px !important; font-size: 12px !important; color: #5a6f86 !important; }
  @media (max-width: 900px) { .explorer-layout { grid-template-columns: 1fr; } }
</style>
