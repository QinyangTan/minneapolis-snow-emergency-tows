<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { geoMercator, geoPath } from 'd3-geo';
  import { countInScope, type NeighborhoodGeoJSON } from './analytics';

  export let geography: NeighborhoodGeoJSON;
  export let selectedDay = 0;
  export let selectedEvent = 'all';
  export let selectedNeighborhood = 'all';
  export let maxDomain: number | null = null;
  export let compact = false;

  const dispatch = createEventDispatcher<{ select: string }>();
  const W = 760;
  const H = 520;

  $: features = geography?.features ?? [];
  $: projection = geoMercator().fitSize([W - 30, H - 30], geography as any);
  $: path = geoPath(projection);
  $: counts = features.map((feature) => countInScope(feature.properties, selectedEvent, selectedDay));
  $: domain = Math.max(1, maxDomain ?? Math.max(1, ...counts));

  function fillFor(value: number): string {
    if (value <= 0) return '#e6edf2';
    const t = Math.sqrt(Math.min(1, Math.max(0, value / domain)));
    return 'rgb(' + [224 - 125*t, 237 - 149*t, 245 - 126*t].map(Math.round).join(',') + ')';
  }

  function choose(name: string) { dispatch('select', name); }
  function handleKeydown(event: KeyboardEvent, name: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(name);
    }
  }
</script>

<div class:compact class="map-visual">
  <svg viewBox="0 0 760 520" role="group" aria-label={`Minneapolis neighborhood map, ${selectedDay ? 'Day ' + selectedDay : 'all days'}, observed tow counts`}>
    <title>Neighborhood choropleth — observed towing record count</title>
    {#each features as feature, index (feature.properties.name)}
      <path
        d={path(feature as any) ?? ''}
        fill={fillFor(counts[index])}
        stroke={selectedNeighborhood === feature.properties.name ? '#0b1d32' : '#fff'}
        stroke-width={selectedNeighborhood === feature.properties.name ? 4 : 1}
        role="button"
        tabindex="0"
        aria-label={`${feature.properties.name}: ${counts[index]} observed tows. Select neighborhood.`}
        on:click={() => choose(feature.properties.name)}
        on:keydown={(event) => handleKeydown(event, feature.properties.name)}
      >
        <title>{feature.properties.name}: {counts[index]} observed tows</title>
      </path>
    {/each}
  </svg>
</div>
{#if !compact}
  <div class="map-key"><span>0</span><div class="map-gradient" aria-hidden="true"></div><span>{domain} tows</span></div>
  <p class="mini-note">Darker neighborhoods contain more observed tow records within the selected scope. These are counts, not tow probabilities.</p>
{/if}
