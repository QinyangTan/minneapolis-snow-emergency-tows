<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { shares, type NeighborhoodGeoJSON, type AreaProperties, countInScope } from './analytics';
  import type { DayRow } from './preliminary';

  export let geography: NeighborhoodGeoJSON;
  export let selectedEvent = 'all';
  export let selectedNeighborhood = 'all';
  const dispatch = createEventDispatcher<{ select: string }>();

  const featured = ['Central', 'Marcy Holmes', 'Near - North', 'South Uptown', 'Willard - Hay'];
  let ranking: 'featured' | 'volume' | 'day1' | 'day2' | 'day3' = 'featured';
  let minN = 20;

  function dayRows(p: AreaProperties): DayRow[] {
    return [1, 2, 3].map((day) => ({ day, count: countInScope(p, selectedEvent, day) }));
  }

  $: areas = geography.features.map((feature) => feature.properties);
  $: eligible = areas.filter((p) => countInScope(p, selectedEvent, 0) >= minN);
  $: sorted = [...eligible].sort((a, b) => {
    if (ranking === 'featured') {
      const ai = featured.indexOf(a.name), bi = featured.indexOf(b.name);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
    }
    if (ranking.startsWith('day')) {
      const day = Number(ranking.slice(3));
      const as = countInScope(a, selectedEvent, day) / Math.max(1, countInScope(a, selectedEvent, 0));
      const bs = countInScope(b, selectedEvent, day) / Math.max(1, countInScope(b, selectedEvent, 0));
      if (bs !== as) return bs - as;
    }
    return countInScope(b, selectedEvent, 0) - countInScope(a, selectedEvent, 0);
  });
  $: chosen = areas.find((p) => p.name === selectedNeighborhood);
  $: rows = chosen && !sorted.some((p) => p.name === chosen.name)
    ? [chosen, ...sorted.slice(0, 11)]
    : sorted.slice(0, 12);
</script>

<div class="signature-tools">
  <label>COMPARE
    <select bind:value={ranking}>
      <option value="featured">FP1 contrasted neighborhoods</option>
      <option value="volume">Most observed records</option>
      <option value="day1">Largest Day 1 share</option>
      <option value="day2">Largest Day 2 share</option>
      <option value="day3">Largest Day 3 share</option>
    </select>
  </label>
  <label>MINIMUM SAMPLE
    <select bind:value={minN}>
      <option value={20}>20 records</option>
      <option value={50}>50 records</option>
      <option value={100}>100 records</option>
    </select>
  </label>
</div>

<div class="signature-legend" aria-label="Colors for Day 1, Day 2, and Day 3">
  <span><i class="day-1"></i>Day 1</span><span><i class="day-2"></i>Day 2</span><span><i class="day-3"></i>Day 3</span>
</div>
<div class="signature-list">
  {#each rows as area (area.name)}
    {@const n = countInScope(area, selectedEvent, 0)}
    {@const portions = shares(dayRows(area))}
    <button class:focused={selectedNeighborhood === area.name} class="signature-row"
      onclick={() => dispatch('select', area.name)}
      title={`${area.name}: ${n} observed records; Day 1 ${(portions[0]*100).toFixed(1)}%, Day 2 ${(portions[1]*100).toFixed(1)}%, Day 3 ${(portions[2]*100).toFixed(1)}%. Select neighborhood.`}>
      <span class="signature-name">{area.name}</span>
      <span class="signature-track" aria-hidden="true">
        {#each portions as portion, i}
          <span class={'day-' + (i+1)} style:width={(portion*100)+'%'}></span>
        {/each}
      </span>
      <span class="signature-sample">n={n}</span>
    </button>
  {/each}
  {#if rows.length === 0}<p>No neighborhoods meet this sample threshold for the current event.</p>{/if}
</div>
<p class="mini-note">Each row sums to 100% of observed tow records for that neighborhood and selected emergency. This comparison describes composition, <b>not towing probability</b>. Small samples are hidden unless you explicitly select their neighborhood.</p>
