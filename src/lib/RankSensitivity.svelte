<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { prominentRecurrence } from './eventAnalysis.mjs';
  import type { EventRow } from './preliminary';
  import type { NeighborhoodGeoJSON } from './analytics';
  export let events: EventRow[];
  export let geography: NeighborhoodGeoJSON;
  export let selectedDay=0;
  export let selectedNeighborhood='all';
  const dispatch=createEventDispatcher<{select:string}>();
  const ks=[5,10,15], xs=[17,101,185];
  $: layers=ks.map(k=>prominentRecurrence(geography,events.map(e=>e.id),selectedDay,k,5));
  $: names=geography.features.map(f=>f.properties.name);
  $: ranked=[...names].sort((a,b)=>(layers[1].get(b)??0)-(layers[1].get(a)??0)
    ||(layers[0].get(b)??0)-(layers[0].get(a)??0)||a.localeCompare(b)).slice(0,10);
  function y(value:number) {return 71-56*value/events.length;}
  function points(vals:number[]) {return vals.map((v,i)=>xs[i]+','+y(v)).join(' ');}
</script>

<div class="sensitivity-intro"><div>
  <span class="eyebrow">THRESHOLD STABILITY / NINE EVENTS</span>
  <h3>What stays prominent as the definition loosens?</h3>
  </div><span class="sensitivity-denominator">0–9 events per point</span></div>
<div class="sensitivity-axis" aria-hidden="true"><span>TOP 5</span><span>TOP 10</span><span>TOP 15</span></div>
<div class="sensitivity-list">
  {#each ranked as name (name)}
    {@const vals=layers.map(l=>l.get(name)??0)}
    <button class:area-active={selectedNeighborhood===name} class="sensitivity-row"
      title={`${name} prominent in ${vals[0]} of 9 events at top 5; ${vals[1]} at top 10; ${vals[2]} at top 15. Select neighborhood.`}
      onclick={()=>dispatch('select',name)}>
      <span class="sensitivity-name">{name}</span>
      <svg viewBox="0 0 202 87" role="img" aria-label={`Top 5 ${vals[0]}, top 10 ${vals[1]}, top 15 ${vals[2]}`}>
        <path d="M17 15 V73 M101 15 V73 M185 15 V73" stroke="#d6e1e9" fill="none"/>
        <polyline points={points(vals)} stroke={selectedNeighborhood===name?'#ad3f57':'#287b90'} fill="none" stroke-width="3.5" stroke-linejoin="round"/>
        {#each vals as val,i}
          <circle cx={xs[i]} cy={y(val)} r="5.5" stroke="white" stroke-width="1.5" fill={selectedNeighborhood===name?'#ad3f57':'#287b90'}/>
          <text x={xs[i]} y={Math.max(11,y(val)-9)} text-anchor="middle" font-size="12" font-weight="700" fill="#183950">{val}</text>
        {/each}
      </svg>
      <span class="sensitivity-delta">+{vals[2]-vals[0]}<small>events</small></span>
    </button>
  {/each}
</div>
<p class="mini-note">Top ten neighborhoods at the K=10 definition, ranked by events with a top-ten tow count. Values mean the number of emergencies where the neighborhood is in the event’s top K by observed count (minimum five tows, ties included). More permissive cutoffs cannot reduce recurrence. <b>These are sensitivity curves, not time series.</b></p>
