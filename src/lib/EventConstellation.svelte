<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type {EventRow} from './preliminary';
  import type {NeighborhoodGeoJSON} from './analytics';
  import {constellationRows,constellationScale,bubbleDiameter} from './eventConstellation.mjs';
  import {brushByDayTwo} from './constellationBrush.mjs';

  export let events:EventRow[]=[];
  export let geography:NeighborhoodGeoJSON;
  export let selectedEvent='all';
  const dispatch=createEventDispatcher<{select:string}>();
  let equalSize=false;
  export let brushMin=0;
  export let brushMax=100;
  $: rows=constellationRows(events,geography);
  $: brushed=brushByDayTwo(rows,brushMin,brushMax);
  $: brushedIds=new Set(brushed.map(row=>row.id));
  $: brushActive=brushMin>0||brushMax<100;
  $: scale=constellationScale(rows);
  $: ordered=[...rows].sort((a,b)=>b.day2Share-a.day2Share||a.id.localeCompare(b.id));
  const format=(n:number)=>(100*n).toFixed(1)+'%';
  const palette=(day:number|null)=>day===1?'#365f8a':day===2?'#a7522d':day===3?'#176e66':'#526376';
  const left=105,top=55,width=630,height=285,canvasWidth=780,canvasHeight=440;
  const px=(x:number,xMax:number)=>left+width*x/xMax;
  const py=(y:number,yMax:number)=>top+height*(1-y/yMax);
  function pick(id:string){dispatch('select',selectedEvent===id?'all':id);}
</script>

<div class="constellation-layout">
  <div class="constellation-main">
    <div class="constellation-controls">
      <div class="constellation-legend" aria-label="Color legend for dominant day">
        <span><i style:background={palette(1)}></i>Day 1 peak</span>
        <span><i style:background={palette(2)}></i>Day 2 peak</span>
        <span><i style:background={palette(3)}></i>Day 3 peak</span>
        <span><i style:background={palette(null)}></i>Tie</span>
      </div>
      <button class="constellation-encoding" aria-pressed={equalSize}
        onclick={()=>equalSize=!equalSize}>
        {equalSize?'Use volume-sized marks':'Use equal-sized marks'} ↔
      </button>
    </div>
    <div class="constellation-brush-controls" role="group" aria-label="Brush by Day 2 share percentage">
      <div class="constellation-brush-title">
        <strong>BRUSH &amp; LINK / DAY 2 SHARE</strong>
        <span aria-live="polite">{brushed.length} of {rows.length} emergencies in range · {brushMin}%–{brushMax}%</span>
      </div>
      <div class="constellation-brush-sliders">
        <label>FROM {brushMin}%
          <input type="range" min="0" max={brushMax} step="5" bind:value={brushMin} aria-label="Minimum Day 2 share percentage" />
        </label>
        <label>TO {brushMax}%
          <input type="range" min={brushMin} max="100" step="5" bind:value={brushMax} aria-label="Maximum Day 2 share percentage" />
        </label>
        <button type="button" onclick={()=>{brushMin=0;brushMax=100;}} disabled={!brushActive}>Clear range ↺</button>
      </div>
      <p class="constellation-brush-hint">The same range highlights matching dots and rows below. Choose one highlighted event to filter the other charts.</p>
    </div>
    <div class="constellation-scroll" role="region" aria-label="Scrollable multivariate event constellation plot">
      <div class="constellation-figure">
        <svg viewBox="0 0 780 440" role="img" aria-label="Scatterplot comparing Day 2 share of all City records on the horizontal axis and concentration in the five most-recorded neighborhoods among mapped records on the vertical axis. Event size represents observed total when volume encoding is on.">
          <rect x={left} y={top} width={width} height={height} fill="#fafcfd"/>
          {#if brushActive}
            <rect x={px(Math.min(scale.xMax,brushMin/100),scale.xMax)}
              y={top} width={Math.max(0,px(Math.min(scale.xMax,brushMax/100),scale.xMax)-px(Math.min(scale.xMax,brushMin/100),scale.xMax))}
              height={height} fill="#c9e8ea" fill-opacity=".65" stroke="#5094a9"
              stroke-dasharray="5 4" stroke-width="2" pointer-events="none"/>
          {/if}
          {#each [0,.25,.5,.75,1] as t}
            <line x1={left} x2={left+width} y1={top+height*(1-t)} y2={top+height*(1-t)} stroke="#dce6eb" stroke-width="1"/>
            <line x1={left+width*t} x2={left+width*t} y1={top} y2={top+height} stroke="#dce6eb" stroke-width="1"/>
          {/each}
          <path d={`M ${left} ${top} V ${top+height} H ${left+width}`} fill="none" stroke="#607a8b" stroke-width="1.2"/>
          {#each [0,.25,.5,.75,1] as t}
            <text x={left+width*t} y={top+height+23} font-size="13" text-anchor="middle" fill="#3a5369">{format(scale.xMax*t)}</text>
            <text x={left-15} y={top+height*(1-t)+5} font-size="13" text-anchor="end" fill="#3a5369">{format(scale.yMax*t)}</text>
          {/each}
          <text x={left+width/2} y="417" text-anchor="middle" font-size="16" font-weight="700" fill="#1c3f56">Day 2 share · all City records →</text>
          <text x="21" y={top+height/2} transform={`rotate(-90 21 ${top+height/2})`} text-anchor="middle" font-size="15" font-weight="700" fill="#1c3f56">Top-five concentration · mapped only →</text>
        </svg>
        {#each rows as event,i (event.id)}
          {#if event.concentration!==null}
          <button
            class:constellation-active={selectedEvent===event.id}
            class:constellation-brush-out={brushActive&&!brushedIds.has(event.id)}
            class="constellation-point"
            style:left={(px(event.day2Share,scale.xMax)/canvasWidth*100)+'%'}
            style:top={(py(event.concentration,scale.yMax)/canvasHeight*100)+'%'}
            style:width={bubbleDiameter(event.total,scale.maxCount,equalSize)+'px'}
            style:height={bubbleDiameter(event.total,scale.maxCount,equalSize)+'px'}
            style:background={palette(event.peakDay)}
            aria-pressed={selectedEvent===event.id}
            aria-label={`${event.id}: Day 2 ${format(event.day2Share)} of citywide records; top five mapped areas ${format(event.concentration)} of mapped records; ${event.total} total observations. Select this emergency.`}
            title={`${event.id} — Day 2: ${format(event.day2Share)} · top-five: ${format(event.concentration)} · ${event.total} records`}
            onclick={()=>pick(event.id)}
            ><span>{String(i+1).padStart(2,'0')}</span></button>
          {/if}
        {/each}
      </div>
    </div>
    <p class="mini-note">Each colored dot is one historical Snow Emergency, identified by number and the linked event roster. Horizontal: share of that event's <b>all valid City records</b> assigned to Day 2. Vertical: share of that event's <b>mapped records only</b> in its five highest-count neighborhoods. Different denominators are deliberate and labeled. Color shows the largest day count; marker area shows event volume, or choose equal-sized marks to isolate the two proportions.</p>
  </div>
  <div class="constellation-aside">
    <span class="eyebrow">TASK: COMPARE · IDENTIFY · INSPECT</span>
    <h3>Same day. Different footprint?</h3>
    <p>Select a numbered mark or event below. The rest of the story will filter to that emergency. Two proportional attributes reveal different dimensions of its observed record distribution.</p>
    <div class="constellation-roster">
      {#each ordered as row (row.id)}
        <button class:roster-selected={selectedEvent===row.id}
          class:constellation-roster-muted={brushActive&&!brushedIds.has(row.id)}
          onclick={()=>pick(row.id)} aria-pressed={selectedEvent===row.id}>
          <span class="constellation-roster-name">{row.id}</span>
          <span class="constellation-roster-values">{format(row.day2Share)} <small>Day 2</small></span>
          <span class="constellation-roster-values">{row.concentration===null?'N/A':format(row.concentration)} <small>top 5</small></span>
        </button>
      {/each}
    </div>
    <p class="mini-note"><b>Interpretation guide:</b> the upper-right represents events with both high Day 2 share and concentrated mapped records. No weather, street exposure, enforcement or individual parking risk is controlled. This is not a correlation or significance claim based on nine events.</p>
  </div>
</div>