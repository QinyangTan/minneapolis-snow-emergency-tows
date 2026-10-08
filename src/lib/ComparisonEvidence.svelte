<script lang="ts">
  import { compareCategoryShares } from './comparisonEvidence.mjs';
  import type { NeighborhoodGeoJSON } from './analytics';

  export let first='Bridge';
  export let second='Howard';
  export let left: number[]=[];
  export let right: number[]=[];
  export let metric: 'days'|'neighborhoods'='days';
  export let geography: NeighborhoodGeoJSON;

  const pc=(n:number)=>(100*n).toFixed(1)+'%';
  const signed=(n:number)=>(n>0?'+':'')+n.toFixed(1)+' pp';
  $: labels=metric==='days'?['Day 1','Day 2','Day 3']:geography.features.map(f=>f.properties.name);
  $: compared=compareCategoryShares(left,right,labels,{
    sortByGap:metric==='neighborhoods',limit:metric==='days'?3:8
  });
  // Round the *displayed* maximum upward to a labeled 5-point increment.
  $: axisMax=metric==='days'
    ? 1
    : Math.max(.05,Math.ceil(compared.maxShare*20)/20);
  $: totalA=left.reduce((a,b)=>a+b,0);
  $: totalB=right.reduce((a,b)=>a+b,0);
  const clamp=(n:number)=>Math.max(0,Math.min(100,n));
</script>

<div class="pair-evidence">
  <div class="pair-evidence-intro">
    <div>
      <span class="eyebrow">DISTRIBUTION EVIDENCE / EXPLAIN THE SCORE</span>
      <h3>{metric==='days'?'Which day makes the difference?':'Which mapped neighborhoods separate these events?'}</h3>
      <p>{metric==='days'?'The same 0–100% scale for both events on each day.':
        'Largest eight absolute share differences among 87 mapped neighborhoods. All rows share one labeled axis.'}</p>
    </div>
    <div class="pair-evidence-key" aria-label="Compared event legend">
      <span class="pair-key-a"><i></i>{first}</span>
      <span class="pair-key-b"><i></i>{second}</span>
    </div>
  </div>
  {#if compared.empty}
    <p class="mini-note">At least one event has no comparable records in this scope.</p>
  {:else}
    <div class="pair-axis" aria-hidden="true">
      <span>0%</span><span>{pc(axisMax/2)}</span><span>{pc(axisMax)}</span>
    </div>
    <div class="pair-rows" aria-label={`Category share comparisons between ${first} and ${second}`}>
      {#each compared.rows as row (row.name)}
        <div class="pair-row" aria-label={`${row.name}: ${first} ${pc(row.shareA)} (${row.countA} records), ${second} ${pc(row.shareB)} (${row.countB} records); B minus A ${signed(row.deltaPp)}.`}>
          <strong class="pair-category">{row.name}</strong>
          <div class="pair-plot" role="img" aria-label={`${row.name}: ${first} ${pc(row.shareA)}, ${second} ${pc(row.shareB)}`}>
            <span class="pair-zero"></span><span class="pair-mid"></span><span class="pair-end"></span>
            <span class="pair-span" style:left={clamp(Math.min(row.shareA,row.shareB)/axisMax*100)+'%'}
              style:width={clamp(Math.abs(row.shareA-row.shareB)/axisMax*100)+'%'}></span>
            <span class="pair-dot pair-a" style:left={clamp(row.shareA/axisMax*100)+'%'}></span>
            <span class="pair-dot pair-b" style:left={clamp(row.shareB/axisMax*100)+'%'}></span>
          </div>
          <span class="pair-shares">{pc(row.shareA)} <span>/</span> {pc(row.shareB)}</span>
          <span class:negative={row.deltaPp<0} class="pair-delta">{signed(row.deltaPp)}</span>
        </div>
      {/each}
    </div>
    <p class="mini-note">Each percentage uses its own event denominator: {first} n={totalA.toLocaleString()}, {second} n={totalB.toLocaleString()}. Difference is {second} minus {first} in <strong>percentage points</strong> (pp), not a tow probability or causal effect. {metric==='neighborhoods'?'Only mapped records count here; 8 of 87 neighborhoods are displayed, ranked by absolute difference.':'All three day categories are displayed, using citywide records.'}</p>
  {/if}
</div>
