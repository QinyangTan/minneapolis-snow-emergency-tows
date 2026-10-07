<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EventRow } from './preliminary';
  import { countInScope, eventRecurrence, type AreaProperties, type NeighborhoodGeoJSON } from './analytics';

  export let geography: NeighborhoodGeoJSON;
  export let events: EventRow[];
  export let selectedDay = 0;
  export let selectedEvent = 'all';
  export let selectedNeighborhood = 'all';

  const dispatch = createEventDispatcher<{ select: { neighborhood: string; event: string } }>();
  let order: 'total' | 'presence' = 'total';
  let limit = 15;
  $: areas = geography.features.map((feature) => feature.properties).filter((p) => p.total > 0);
  $: ranked = [...areas].sort((a, b) => {
    const aTotal = countInScope(a, 'all', selectedDay);
    const bTotal = countInScope(b, 'all', selectedDay);
    const comparison = order === 'total'
      ? bTotal - aTotal || eventRecurrence(b, events, selectedDay) - eventRecurrence(a, events, selectedDay)
      : eventRecurrence(b, events, selectedDay) - eventRecurrence(a, events, selectedDay) || bTotal - aTotal;
    return comparison || a.name.localeCompare(b.name);
  });
  $: rows = ranked.slice(0, limit);
  $: ceiling = Math.max(1, ...areas.flatMap((p) => events.map((e) => countInScope(p, e.id, selectedDay))));

  function tint(count: number): string {
    if (count === 0) return '#eef2f5';
    const t = Math.sqrt(count / ceiling);
    return `rgb(${Math.round(225-120*t)},${Math.round(237-146*t)},${Math.round(246-118*t)})`;
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
      <th scope="col">EVENTS</th>
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
          <td class="summary-count">{countInScope(area, 'all', selectedDay)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<p class="mini-note">Cells show observed tow counts, {selectedDay ? `Day ${selectedDay} only` : 'all three days'}. The “Events” column counts emergencies with at least one record in that neighborhood — <b>presence is not a hotspot or risk ranking</b>. Select any cell to inspect that neighborhood and event.</p>
