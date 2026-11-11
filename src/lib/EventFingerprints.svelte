<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EventRow } from './preliminary';
  import type { NeighborhoodGeoJSON } from './analytics';
  export let events: EventRow[];
  export let geography: NeighborhoodGeoJSON;
  export let selectedEvent = 'all';
  const dispatch = createEventDispatcher<{ select: string }>();
  const fmt = new Intl.NumberFormat('en-US');
  function counts(e: EventRow): number[] { return [1,2,3].map(day=>e.days?.find(d=>d.day===day)?.count??0); }
  function mapped(id: string): number {return geography.features.reduce((n,f)=>n+(f.properties.byEvent[id]?.total??0),0);}
  function topArea(id: string) {
    return geography.features.map(f=>({name:f.properties.name,count:f.properties.byEvent[id]?.total??0}))
      .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))[0];
  }
</script>

<div class="fingerprint-key" aria-label="Legend for day segments">
  <span><i class="day-1"></i>Day 1</span><span><i class="day-2"></i>Day 2</span><span><i class="day-3"></i>Day 3</span>
  <small>Card bars show within-event shares — select any card to filter linked views</small>
</div>
<div class="fingerprint-gallery">
{#each events as event (event.id)}
  {@const days = counts(event)}
  {@const peak = days.indexOf(Math.max(...days))+1}
  {@const lead = topArea(event.id)}
  {@const mappedN = mapped(event.id)}
  <button class:fp-selected={selectedEvent===event.id} class="fingerprint-card"
    aria-pressed={selectedEvent===event.id}
    title={`${event.id}: ${event.total} observed tows, highest number on Day ${peak}. Select emergency.`}
    onclick={()=>dispatch('select',selectedEvent===event.id?'all':event.id)}>
    <span class="fingerprint-top"><strong>{event.id}</strong><span>{event.season}</span></span>
    <span class="fingerprint-total">{fmt.format(event.total)} <small>tows</small></span>
    <span class="fingerprint-stack" aria-hidden="true">
      {#each days as n, i}<span class={'day-'+(i+1)} style:width={(100*n/Math.max(1,event.total))+'%'}></span>{/each}
    </span>
    <span class="fingerprint-shares">
      {#each days as n}<span>{(n/Math.max(1,event.total)*100).toFixed(0)}%</span>{/each}
    </span>
    <span class="fingerprint-data">
      <span><small>PEAK DAY</small><b>0{peak}</b></span>
      <span><small>LARGEST MAPPED COUNT</small><b>{lead?.name??'—'} · {lead?.count??0}</b></span>
    </span>
    <span class="fingerprint-provenance">{fmt.format(mappedN)} mapped · {event.total-mappedN} unassigned</span>
  </button>
{/each}
</div>
<p class="mini-note">Fingerprints combine event, season, day composition and neighborhood count. The highest mapped count is not an exposure-adjusted risk estimate. Each event's unmapped records are retained in citywide totals.</p>
