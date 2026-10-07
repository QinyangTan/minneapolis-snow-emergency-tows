<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import NeighborhoodMap from './NeighborhoodMap.svelte';
  import { commonDayDomain, mappedCount, type NeighborhoodGeoJSON } from './analytics';

  export let geography: NeighborhoodGeoJSON;
  export let selectedDay = 0;
  export let selectedEvent = 'all';
  export let selectedNeighborhood = 'all';

  const dispatch = createEventDispatcher<{
    selectDay: number;
    selectNeighborhood: string;
  }>();
  const days = [1, 2, 3];
  $: domain = commonDayDomain(geography, selectedEvent);
</script>

<div class="small-multiples">
  {#each days as day}
    <article class:focused={selectedDay === day} class="small-map-panel">
      <button
        class="small-map-heading"
        aria-pressed={selectedDay === day}
        onclick={() => dispatch('selectDay', selectedDay === day ? 0 : day)}
      >
        <span>DAY {day}</span>
        <strong>{mappedCount(geography, selectedEvent, day).toLocaleString('en-US')} mapped tows</strong>
      </button>
      <NeighborhoodMap
        {geography} selectedDay={day} {selectedEvent} {selectedNeighborhood}
        maxDomain={domain} compact={true}
        on:select={(event) => dispatch('selectNeighborhood', event.detail)}
      />
    </article>
  {/each}
</div>
<div class="map-key scale-common">
  <span>0</span><div class="map-gradient" aria-hidden="true"></div>
  <span>{domain} tows / neighborhood</span>
</div>
<p class="mini-note">All three maps use one shared count scale for the selected event. Counts exclude unmatched points; citywide totals include them. Select a neighborhood on any map to link it to the explorer.</p>
