<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { jsDivergence, dayVector, neighborhoodVector, topEventPairs } from './eventAnalysis.mjs';
  import type { EventRow } from './preliminary';
  import type { NeighborhoodGeoJSON } from './analytics';

  export let events: EventRow[];
  export let geography: NeighborhoodGeoJSON;

  let metric: 'days' | 'neighborhoods' = 'days';
  let first = 'Bridge';
  let second = 'Howard';
  const dispatch = createEventDispatcher<{ selectEvent: string }>();
  const f = new Intl.NumberFormat('en-US', {maximumFractionDigits:3});

  $: firstEvent = events.find((event) => event.id === first);
  $: secondEvent = events.find((event) => event.id === second);
  $: stats = topEventPairs(events, geography, metric);
  $: left = firstEvent ? metric === 'days' ? dayVector(firstEvent) : neighborhoodVector(geography, first) : [];
  $: right = secondEvent ? metric === 'days' ? dayVector(secondEvent) : neighborhoodVector(geography, second) : [];
  $: distance = left.length && right.length ? jsDivergence(left,right) : null;
  $: compared = metric === 'days' ? 3 : geography.features.length;
  $: leftN = left.reduce((sum: number, n: number) => sum + n,0);
  $: rightN = right.reduce((sum: number, n: number) => sum + n,0);

  function choose(pair: {a: string; b: string}) { first=pair.a; second=pair.b; }
</script>

<div class="comparison-tools">
  <label>COMPARE EVENTS BY
    <select bind:value={metric} aria-label="Compare events by distribution">
      <option value="days">Day 1 / Day 2 / Day 3 shares</option>
      <option value="neighborhoods">Distribution across neighborhoods</option>
    </select>
  </label>
  <label>EVENT A
    <select bind:value={first} aria-label="First Snow Emergency">
      {#each events as event}<option value={event.id}>{event.id}</option>{/each}
    </select>
  </label>
  <label>EVENT B
    <select bind:value={second} aria-label="Second Snow Emergency">
      {#each events as event}<option value={event.id}>{event.id}</option>{/each}
    </select>
  </label>
</div>
<div class="comparison-topline">
  <div>
    <p class="eyebrow">JENSEN–SHANNON DIVERGENCE</p>
    <div class="comparison-value">{distance === null ? 'N/A' : f.format(distance)} <span>/ 1</span></div>
    <p class="mini-note">{first === second ? 'You selected the same event twice: identical distributions have distance 0.' : '0 = identical observed-record distributions; larger values = more different composition.'}</p>
  </div>
  <div class="comparison-evidence">
    <p><strong>{first}</strong>: {leftN.toLocaleString()} {metric === 'days' ? 'citywide' : 'mapped'} records</p>
    <p><strong>{second}</strong>: {rightN.toLocaleString()} {metric === 'days' ? 'citywide' : 'mapped'} records</p>
    <p>{compared} comparable {metric === 'days' ? 'day categories' : 'neighborhoods'}.</p>
    {#if metric === 'neighborhoods'}
      <p>Out-of-boundary records excluded in this view; each event is normalized by its own mapped count.</p>
    {/if}
  </div>
</div>
<div class="comparison-pairs">
  <div>
    <h3>Most similar pairs</h3>
    {#each stats.closest as pair}
      <button onclick={() => choose(pair)} aria-label={`Compare ${pair.a} and ${pair.b}, divergence ${f.format(pair.divergence)}`}>
        <span>{pair.a} ↔ {pair.b}</span><strong>{f.format(pair.divergence)}</strong>
      </button>
    {/each}
  </div>
  <div>
    <h3>Most different pairs</h3>
    {#each stats.farthest as pair}
      <button onclick={() => choose(pair)} aria-label={`Compare ${pair.a} and ${pair.b}, divergence ${f.format(pair.divergence)}`}>
        <span>{pair.a} ↔ {pair.b}</span><strong>{f.format(pair.divergence)}</strong>
      </button>
    {/each}
  </div>
</div>
<div class="comparison-cta">
  <button onclick={() => dispatch('selectEvent', first)}>Explore {first} in other charts ↗</button>
  <button onclick={() => dispatch('selectEvent', second)}>Explore {second} in other charts ↗</button>
</div>
<p class="mini-note">Method: symmetric Jensen–Shannon divergence (log base 2; 0 to 1). Events are normalized to comparable compositions, not compared by raw magnitude. This is an exploratory descriptive measure, not a significance test, causal claim, or weather-adjusted similarity estimate.</p>
