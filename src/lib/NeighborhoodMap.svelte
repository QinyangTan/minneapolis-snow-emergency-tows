<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { geoMercator, geoPath } from 'd3-geo';

  export let geography: any;
  export let selectedDay = 0;
  export let selectedEvent = 'all';
  export let selectedNeighborhood = 'all';

  const dispatch = createEventDispatcher<{ select: string }>();
  const W = 760;
  const H = 520;

  $: features = (geography?.features ?? []) as any[];
  $: projection = geoMercator().fitSize([W - 30, H - 30], geography);
  $: path = geoPath(projection);
  $: counts = features.map((feature: any) => {
    const p = feature.properties;
    const scope = selectedEvent === 'all' ? p : p.byEvent?.[selectedEvent];
    if (!scope) return 0;
    return Number(selectedDay === 0 ? scope.total : scope.days?.[String(selectedDay)] ?? 0);
  });
  $: maxCount = Math.max(1, ...counts);

  function fillFor(value: number): string {
    if (value <= 0) return '#e5edf3';
    const t = Math.min(1, Math.max(0, value / maxCount));
    return 'rgb(' + [226 - 69*t, 238 - 162*t, 248 - 145*t].map(Math.round).join(',') + ')';
  }
  function choose(name: string) { dispatch('select', name); }
  function handleKeydown(event: KeyboardEvent, name: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(name);
    }
  }
</script>

<div class="map-visual">
  <svg viewBox="0 0 760 520" role="group" aria-label="Interactive Minneapolis neighborhood towing counts">
    <title>Neighborhood choropleth — observed towing record count</title>
    {#each features as feature, index (feature.properties.name)}
      <path
        d={path(feature) ?? ''}
        fill={fillFor(counts[index])}
        stroke={selectedNeighborhood === feature.properties.name ? '#0b1d32' : '#fff'}
        stroke-width={selectedNeighborhood === feature.properties.name ? 2.5 : 1}
        role="button"
        tabindex="0"
        aria-label={feature.properties.name + ': ' + counts[index] + ' observed tows. Select neighborhood'}
        on:click={() => choose(feature.properties.name)}
        on:keydown={(event) => handleKeydown(event, feature.properties.name)}
      >
        <title>{feature.properties.name}: {counts[index]} observed tows</title>
      </path>
    {/each}
  </svg>
</div>
<div class="map-key"><span>0</span><div class="map-gradient" aria-hidden="true"></div><span>{maxCount} tows</span></div>
<p class="mini-note">Darker neighborhoods contain more observed tow records within the selected scope. These are counts, not tow probabilities.</p>
