<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { jsDivergence, dayVector, neighborhoodVector } from './eventAnalysis.mjs';
  import type { EventRow } from './preliminary';
  import type { NeighborhoodGeoJSON } from './analytics';

  export let events: EventRow[];
  export let geography: NeighborhoodGeoJSON;
  export let metric: 'days'|'neighborhoods'='days';
  export let selectedA='Bridge';
  export let selectedB='Howard';
  const dispatch=createEventDispatcher<{ selectPair: {a:string;b:string} }>();
  const format=(n:number)=>n.toFixed(3);
  // Explicit reactive dependencies are essential: Svelte cannot infer that
  // a helper references metric or geography from its closure.
  $: vectors=events.map(e=>metric==='days'?dayVector(e):neighborhoodVector(geography,e.id));
  $: matrix=vectors.map(a=>vectors.map(b=>jsDivergence(a,b)??0));
  function fill(n:number):string {
    const t=Math.sqrt(Math.max(0,Math.min(1,n)));
    return `rgb(${Math.round(244-65*t)},${Math.round(248-62*t)},${Math.round(250-56*t)})`;
  }
</script>
<div class="similarity-intro">
  <div><span class="eyebrow">36 UNIQUE PAIRWISE COMPARISONS</span>
    <h3>Similarity is a matrix, not a verdict.</h3></div>
  <p>Every cell compares two emergencies by {metric==='days'?'Day 1–3 shares, including all valid records':'shares across 87 mapped neighborhoods'}. Select a cell to change the detailed pair above.</p>
</div>
<div class="similarity-scroll" role="region" aria-label="Nine by nine event comparison matrix, horizontally scrollable">
  <table class="similarity-matrix">
    <caption>Symmetric Jensen–Shannon divergence; 0 identical distribution, larger is more different.</caption>
    <thead><tr><th scope="col">EVENT</th>{#each events as event}<th scope="col" title={event.season}>{event.id}</th>{/each}</tr></thead>
    <tbody>{#each events as a, i}
      <tr><th scope="row">{a.id}</th>{#each events as b, j}
        <td>
          <button class:sim-selected={(selectedA===a.id&&selectedB===b.id)||(selectedA===b.id&&selectedB===a.id)}
            class:sim-diagonal={i===j} style:background={fill(matrix[i][j])}
            title={`${a.id} versus ${b.id}: ${format(matrix[i][j])}`}
            aria-label={`Compare ${a.id} to ${b.id}: JSD ${format(matrix[i][j])}`}
            onclick={()=>dispatch('selectPair',{a:a.id,b:b.id})}>{format(matrix[i][j])}</button>
        </td>
      {/each}</tr>
    {/each}</tbody>
  </table>
</div>
<div class="similarity-legend" aria-label="Jensen Shannon divergence scale">
  <span>0 · same composition</span><span class="similarity-ramp" aria-hidden="true"></span><span>1 · maximally different</span>
</div>
<p class="mini-note">The matrix has a zero diagonal and is symmetric. Color indicates a descriptive <b>divergence</b>, not a percentage or a weather-related similarity score. Mapped records only in neighborhood mode.</p>
