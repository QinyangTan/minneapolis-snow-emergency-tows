<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EventRow } from './preliminary';
  import { countInScope, eventRecurrence, type AreaProperties, type NeighborhoodGeoJSON } from './analytics';
  import { prominentRecurrence } from './eventAnalysis.mjs';

  export let geography: NeighborhoodGeoJSON;
  export let events: EventRow[];
  export let selectedDay = 0;
  export let selectedEvent = 'all';
  export let selectedNeighborhood = 'all';

  const dispatch = createEventDispatcher<{ select: { neighborhood: string; event: string } }>();
  let order: 'total' | 'presence' | 'prominence' = 'total';
  let topK = 10;
  let limit = 15;
  $: areas = geography.features.map((feature) => feature.properties).filter((p) => p.total > 0);
  $: prominent = prominentRecurrence(geography, events.map((event) => event.id), selectedDay, topK, 5);
  $: ranked = [...areas].sort((a, b) => {
    const aTotal = countInScope(a, 'all', selectedDay);
    const bTotal = countInScope(b, 'all', selectedDay);
    const comparison = order === 'total'
      ? bTotal-aTotal
      : order === 'presence'
        ? eventRecurrence(b, events, selectedDay)-eventRecurrence(a, events, selectedDay)
        : (prominent.get(b.name) ?? 0)-(prominent.get(a.name) ?? 0);
    return comparison || a.name.localeCompare(b.name);
  });
  $: rows = ranked.slice(0, limit);
  $: ceiling = Math.max(1, ...areas.flatMap((p) => events.map((e) => countInScope(p, e.id, selectedDay))));

  function tint(count: number): string {
    if (count === 0) return '#eef2f5';
    const t = Math.sqrt(count / ceiling);
    // Keep even the highest-intensity cells light enough for navy numerals (WCAG AA).
    return `rgb(${Math.round(225-75*t)},${Math.round(237-87*t)},${Math.round(246-66*t)})`;
  }
  function select(area: AreaProperties, event: string) {
    dispatch('select', { neighborhood: area.name, event });
  }
</script>

<div class="matrix-tools">
  <label>RANK BY
    <select bind:value={order}>
      <option value="total">Observed record count</option>
      <option value="presence">Number of events with records</option>
      <option value="prominence">Recurring prominent neighborhoods</option>
    </select>
  </label>
  <label>PROMINENCE
    <select bind:value={topK}>
      <option value={5}>Top 5 per event</option>
      <option value={10}>Top 10 per event</option>
      <option value={15}>Top 15 per event</option>
    </select>
  </label>
  <label>SHOW
    <select bind:value={limit}>
      <option value={15}>Top 15 neighborhoods</option>
      <option value={30}>Top 30 neighborhoods</option>
      <option value={87}>All neighborhoods with records</option>
    </select>
  </label>
</div>
<div class="matrix-scroll" role="region" aria-label="Scroll the neighborhood by Snow Emergency event matrix horizontally">
  <table class="recurrence-matrix">
    <thead><tr>
      <th scope="col" class="sticky-name">NEIGHBORHOOD</th>
      {#each events as event}
        <th scope="col" class:column-active={selectedEvent === event.id} title={event.season}>{event.id}</th>
      {/each}
      <th scope="col" title="Emergency events with at least one tow here">ANY RECORD</th>
      <th scope="col" title="Events in which neighborhood ranks among top K by count, with at least five tows">PROMINENT</th>
      <th scope="col">TOWS</th>
    </tr></thead>
    <tbody>
      {#each rows as area (area.name)}
        <tr class:row-active={selectedNeighborhood === area.name}>
          <th scope="row" class="sticky-name">
            <button onclick={() => select(area, 'all')}>{area.name}</button>
          </th>
          {#each events as event}
            {@const count = countInScope(area, event.id, selectedDay)}
            <td>
              <button
                class:cell-active={selectedEvent === event.id && selectedNeighborhood === area.name}
                style:background={tint(count)}
                aria-label={`${area.name}, ${event.id}: ${count} observed ${selectedDay ? 'Day ' + selectedDay : 'all-day'} tows; filter`}
                title={`${area.name} / ${event.id}: ${count} records`}
                onclick={() => select(area, event.id)}
              >{count || '–'}</button>
            </td>
          {/each}
          <td class="summary-count">{eventRecurrence(area, events, selectedDay)}/{events.length}</td>
          <td class="summary-count">{prominent.get(area.name) ?? 0}/{events.length}</td>
          <td class="summary-count">{countInScope(area, 'all', selectedDay)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<p class="mini-note">Cells show observed tow counts, {selectedDay ? `Day ${selectedDay} only` : 'all three days'}. <b>ANY RECORD</b> counts events with at least one tow. <b>PROMINENT</b> counts events where this neighborhood is among the top {topK} ranked by observed tow count (including ties) and has at least 5 tows. Both are descriptive recurrence definitions, not exposure-adjusted risk. Change the top-K threshold to check sensitivity; click any cell to inspect its source event.</p>
