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
  export let metricValues: Record<string, number | null> | null = null;
  export let metricLabel = 'observed tows';

  const dispatch = createEventDispatcher<{ select: string }>();
  const W = 760;
  const H = 520;

  $: features = geography?.features ?? [];
  $: projection = geoMercator().fitSize([W - 30, H - 30], geography as any);
  $: path = geoPath(projection);
  $: counts = features.map((feature) => metricValues === null
    ? countInScope(feature.properties, selectedEvent, selectedDay)
    : metricValues[feature.properties.name] ?? null);
  $: domain = Math.max(1, maxDomain ?? Math.max(1, ...counts.filter((value): value is number => value !== null)));
  $: hasMissing = counts.some(value => value === null);
  const format = (value: number | null) => value === null ? 'Not available' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);

  function fillFor(value: number | null): string {
    if (value === null) return 'url(#missing-neighborhood-context)';
    if (value <= 0) return '#e6edf2';
    const t = Math.sqrt(Math.min(1, Math.max(0, value / domain)));
    return 'rgb(' + [224 - 200*t, 237 - 157*t, 245 - 133*t].map(Math.round).join(',') + ')';
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
  <svg viewBox="0 0 760 520" role="group" aria-label={`Minneapolis neighborhood map, ${selectedDay ? 'Day ' + selectedDay : 'all days'}, ${metricLabel}`}>
    <title>Neighborhood choropleth — {metricLabel}</title>
    {#if hasMissing}<defs><pattern id="missing-neighborhood-context" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#f5f8fa"/><path d="M0 7L7 0" stroke="#7e98a9" stroke-width="1.5"/></pattern></defs>{/if}
    {#each features as feature, index (feature.properties.name)}
      <path
        d={path(feature as any) ?? ''}
        fill={fillFor(counts[index])}
        stroke={selectedNeighborhood === feature.properties.name ? '#0b1d32' : '#fff'}
        stroke-width={selectedNeighborhood === feature.properties.name ? 4 : 1}
        role="button"
        tabindex="0"
        aria-label={`${feature.properties.name}: ${format(counts[index])} ${metricLabel}. Select neighborhood.`}
        data-value={counts[index] ?? 'missing'}
        on:click={() => choose(feature.properties.name)}
        on:keydown={(event) => handleKeydown(event, feature.properties.name)}
      >
        <title>{feature.properties.name}: {format(counts[index])} {metricLabel}</title>
      </path>
    {/each}
  </svg>
</div>
{#if !compact}
  <div class="map-key"><span>0</span><div class="map-gradient" aria-hidden="true"></div><span>{format(domain)} {metricLabel}</span>{#if hasMissing}<span class="missing-context-key">Hatched: denominator unavailable</span>{/if}</div>
  <p class="mini-note">Darker neighborhoods have higher {metricLabel} in the selected scope. These describe recorded tows, not individual risk.</p>
{/if}

<style>.map-key{flex-wrap:wrap}.map-gradient{background:linear-gradient(90deg,#e0edf5,#185070)}.missing-context-key{font-size:12px;color:#38566d}</style>
