<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { base } from '$app/paths';
  import type { NeighborhoodGeoJSON } from './analytics';
  import { contextRows, contextDomain, type NeighborhoodContextData, type ContextMeasure, type ContextAttribute } from './neighborhoodContext.mjs';

  export let geography: NeighborhoodGeoJSON;
  export let context: NeighborhoodContextData;
  export let selectedEvent = 'all';
  export let selectedDay = 0;
  export let selectedNeighborhood = 'all';
  export let measure: ContextMeasure = 'count';
  export let measureLabel = 'Observed tow records';

  const dispatch = createEventDispatcher<{ select: string }>();
  export let attribute: ContextAttribute = 'renters';
  let width = 650;
  const attributes = { renters: 'Renter households', noVehicle: 'Households without a vehicle', poverty: 'People below poverty' };
  const fmt = (value: number | null | undefined, digits = 1) => value == null ? 'Not available' : new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
  $: rows = contextRows(geography, context, selectedEvent, selectedDay, measure, attribute);
  $: points = rows.filter(row => row.value !== null && row.attribute?.percent != null);
  $: current = rows.find(row => row.name === selectedNeighborhood);
  $: population = current?.context?.population;
  $: maximum = contextDomain(geography, context, measure);
  $: step = 10 ** Math.floor(Math.log10(maximum));
  $: upper = Math.ceil(maximum / step) * step;
  $: plotWidth = Math.max(300, width);
  $: plotRight = plotWidth - 22;
  const top = 30, bottom = 284, left = 54;
  $: ticks = [0, 1, 2, 3, 4].map(i => i * upper / 4);
  $: scope = `${selectedEvent === 'all' ? 'All nine events' : selectedEvent} · ${selectedDay ? `Day ${selectedDay}` : 'All days'}`;
  $: selectedX = current?.attribute?.percent ?? null;
  $: selectedMoe = current?.attribute?.moe ?? null;
  $: selectedY = current?.value ?? null;
  $: period = points[0]?.attribute?.period;
  $: x = (value: number) => left + value / 100 * (plotRight - left);
  $: y = (value: number) => bottom - value / upper * (bottom - top);

  function choose(name: string) { dispatch('select', name); }
  function key(event: KeyboardEvent, name: string) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(name); }
  }
</script>

<section class="neighborhood-context" aria-labelledby="context-title" data-testid="neighborhood-context">
  <div class="context-heading">
    <div><h3 id="context-title">Put the neighborhood in context.</h3><p>{scope} · {points.length} of {rows.length} neighborhoods plotted</p></div>
    <label>Compare with<select bind:value={attribute} aria-label="Neighborhood background"><option value="renters">Renter households</option><option value="noVehicle">Households without a vehicle</option><option value="poverty">People below poverty</option></select></label>
  </div>
  <div class="context-layout">
    <div class="context-chart" bind:clientWidth={width}>
      <p class="axis-measure">{measureLabel}</p>
      <svg viewBox={`0 0 ${plotWidth} 338`} role="group" aria-label={`${measureLabel} and ${attributes[attribute]}, ${scope}`}>
        <title>Neighborhood context. Select a point or use the neighborhood selector and data table.</title>
        {#each ticks as tick}<line x1={left} x2={plotRight} y1={y(tick)} y2={y(tick)} class="grid"/><text x={left - 9} y={y(tick) + 4} text-anchor="end">{fmt(tick)}</text>{/each}
        {#each [0,25,50,75,100] as tick}<text x={x(tick)} y={bottom + 22} text-anchor="middle">{tick}%</text>{/each}
        <text x={(left + plotRight) / 2} y="330" text-anchor="middle">{attributes[attribute]} · {period}</text>
        {#each points as point (point.name)}
          <g role="button" tabindex="0" aria-pressed={selectedNeighborhood === point.name}
            aria-label={`${point.name}: ${fmt(point.value)} ${measureLabel}; ${fmt(point.attribute?.percent)}% ${attributes[attribute]}. Select neighborhood.`}
            class:chosen={selectedNeighborhood === point.name} class:low={point.attribute?.reliability === 'Low'}
            on:click={() => choose(point.name)} on:keydown={(event) => key(event, point.name)}>
            <title>{point.name} · {point.count} records · {fmt(point.attribute?.percent)}% {attributes[attribute]}{point.attribute?.reliability === 'Low' ? ' · Low ACS reliability' : ''}</title>
            <circle cx={x(point.attribute!.percent!)} cy={y(point.value!)} r="12" fill="transparent" class="hit"/>
            <circle cx={x(point.attribute!.percent!)} cy={y(point.value!)} r={selectedNeighborhood === point.name ? 7 : 4.5} class="point"/>
          </g>
        {/each}
        {#if selectedX !== null && selectedY !== null && selectedMoe !== null}
          <g class="uncertainty" aria-hidden="true"><line x1={x(Math.max(0,selectedX-selectedMoe))} x2={x(Math.min(100,selectedX+selectedMoe))} y1={y(selectedY)} y2={y(selectedY)}/><line x1={x(Math.max(0,selectedX-selectedMoe))} x2={x(Math.max(0,selectedX-selectedMoe))} y1={y(selectedY)-5} y2={y(selectedY)+5}/><line x1={x(Math.min(100,selectedX+selectedMoe))} x2={x(Math.min(100,selectedX+selectedMoe))} y1={y(selectedY)-5} y2={y(selectedY)+5}/></g>
        {/if}
      </svg>
      <p class="chart-note">Select a point to inspect. Hollow points: low ACS reliability. Selected line: 90% ACS MOE, clipped to 0–100%.</p>
    </div>
    <aside class="context-detail" aria-live="polite" aria-atomic="true">
      <label>Neighborhood<select value={selectedNeighborhood} on:change={(event) => choose(event.currentTarget.value)} aria-label="Context neighborhood"><option value="all">Choose a neighborhood</option>{#each rows as row}<option value={row.name}>{row.name}</option>{/each}</select></label>
      {#if current}
        <h4>{current.name}</h4>
        <p class="context-value">{fmt(current.value)}<span>{measureLabel}</span></p>
        <dl><div><dt>Recorded tows</dt><dd>{fmt(current.count,0)}</dd></div><div><dt>Estimated residents</dt><dd>{fmt(population?.estimate,0)}{population?.moe != null ? ` ± ${fmt(population.moe,0)}` : ''}</dd></div><div><dt>Gross polygon area</dt><dd>{fmt(current.context?.areaKm2,2)} km²</dd></div><div><dt>{attributes[attribute]}</dt><dd>{current.attribute?.percent == null ? 'Not available' : `${fmt(current.attribute.percent)}%`}{current.attribute?.moe != null ? ` ± ${fmt(current.attribute.moe)} pp` : ''}</dd></div></dl>
        <p class="context-source">Population: {population?.period ?? 'unavailable'}. {attributes[attribute]}: {current.attribute?.period ?? 'unavailable'}{current.attribute ? ` · ${current.attribute.reliability} reliability` : ''}. ± values are 90% ACS MOE.</p>
        {#if current.value === null}<p class="context-alert">This denominator is unavailable. The recorded count remains {current.count}.</p>{/if}
      {:else}
        <h4>What changes with scale?</h4><p>Select a neighborhood on the map or plot. Compare its count with its population, area and ACS estimates.</p>
      {/if}
      <p class="context-limit">{measure === 'street' ? 'Street-km counts all public street centerline, not parkable curb length.' : measure === 'area' ? 'Polygon area includes water where present; it is not parkable curb area.' : measure === 'residents' ? 'Residents are a descriptive denominator. Visitors and parked vehicles are not measured.' : 'Counts show recorded volume in the selected events.'} These measures do not estimate individual tow risk.</p>
    </aside>
  </div>
  <details class="context-records"><summary>Neighborhood values and sources</summary><p>Counts follow the selected event and day. ACS periods differ by indicator. Missing values stay unavailable.</p><a href={`${base}/data/neighborhood-snow-context.csv`} download>Download all-nine-event context CSV</a> · <a href="https://data.minneapolismn.gov/pages/minneapolis-neighborhood-explorer-dashboard" target="_blank" rel="noreferrer">City ACS source</a><div class="context-table-scroll" role="region" aria-label="Neighborhood context table, scroll horizontally"><table><caption>{scope} · {measureLabel}. Population and ACS MOE come from the City neighborhood export.</caption><thead><tr><th scope="col">Neighborhood</th><th scope="col">Records</th><th scope="col">Population ± MOE</th><th scope="col">Area km²</th><th scope="col">{measureLabel}</th><th scope="col">{attributes[attribute]} ± MOE</th></tr></thead><tbody>{#each rows as row}<tr class:selected={row.name===selectedNeighborhood}><th scope="row"><button on:click={() => choose(row.name)}>{row.name}</button></th><td>{row.count}</td><td>{fmt(row.context?.population?.estimate,0)}{row.context?.population?.moe != null ? ` ± ${fmt(row.context.population.moe,0)}` : ''}</td><td>{fmt(row.context?.areaKm2,2)}</td><td>{fmt(row.value)}</td><td>{row.attribute?.percent == null ? 'Not available' : `${fmt(row.attribute.percent)}%`}{row.attribute?.moe != null ? ` ± ${fmt(row.attribute.moe)} pp` : ''}</td></tr>{/each}</tbody></table></div></details>
</section>

<style>
  .neighborhood-context{margin-top:18px;padding:25px 0 8px;border-top:1px solid #afc5d4;color:#173449}
  .context-heading{display:flex;align-items:end;justify-content:space-between;gap:22px;margin-bottom:18px}.context-heading h3{font:700 24px/1.15 'Space Grotesk',sans-serif;letter-spacing:-.025em;margin:0 0 7px}.context-heading p{font-size:12px;color:#38566d;margin:0}
  label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#38566d}select{width:100%;max-width:320px;padding:9px 24px 9px 9px;border:1px solid #9eb7c7;border-radius:4px;background:#f5f8fa;color:#173449;font:400 14px 'DM Sans',sans-serif}
  .context-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,.9fr);gap:30px;background:#f5f8fa;padding:24px}.context-chart{min-width:0}.axis-measure{font-size:12px;font-weight:700;margin:0 0 2px}svg{width:100%;display:block;overflow:visible}svg text{fill:#38566d;font:12px 'DM Sans',sans-serif;font-variant-numeric:tabular-nums}.grid{stroke:#d4e0e8;stroke-width:1}.point{fill:#54849d;stroke:#f5f8fa;stroke-width:1.5}.low .point{fill:#f5f8fa;stroke:#54849d;stroke-width:1.8}.chosen .point{fill:#173449;stroke:#173449;stroke-width:2}g[role=button]{cursor:pointer;outline:none}g[role=button]:hover .point,g[role=button]:focus-visible .point{stroke:#173449;stroke-width:3}.uncertainty{stroke:#173449;stroke-width:1.5;pointer-events:none}.chart-note{font-size:11px;line-height:1.55;color:#4f697b;max-width:65ch;margin:12px 0 0}
  .context-detail{min-width:0}.context-detail h4{font:700 24px/1.15 'Space Grotesk',sans-serif;letter-spacing:-.02em;margin:20px 0 14px}.context-detail>p{font-size:13px;line-height:1.55}.context-value{font-size:32px!important;font-weight:700;margin:0 0 16px;font-variant-numeric:tabular-nums}.context-value span{display:block;font-size:12px;font-weight:400;color:#4f697b;margin-top:3px}dl{margin:0;font-size:12px}dl>div{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #d4e0e8;padding:9px 0}dt{color:#38566d}dd{margin:0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}.context-source,.context-limit{font-size:11px!important;color:#4f697b}.context-alert{font-size:12px!important;font-weight:700}.context-records{margin-top:18px;font-size:12px}.context-records summary{font-weight:700;cursor:pointer;width:fit-content;padding:8px 0}.context-records>p{max-width:75ch;line-height:1.6}.context-table-scroll{overflow-x:auto;scrollbar-color:#54849d #e8eff5;margin-top:16px}table{width:100%;min-width:760px;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}caption{text-align:left;line-height:1.5;padding:0 0 12px;color:#4f697b}th,td{text-align:right;border-bottom:1px solid #c8d8e3;padding:10px}th:first-child{text-align:left}thead th{font-weight:700}table button{border:0;background:none;color:#173449;text-align:left;text-decoration:underline;text-underline-offset:3px;font:inherit;padding:4px 0}.selected{background:#dbeaf2}button:focus-visible,select:focus-visible,summary:focus-visible,.context-table-scroll:focus-visible,a:focus-visible{outline:3px solid #176a8a;outline-offset:3px}
  @media(max-width:850px){.context-layout{grid-template-columns:1fr;padding:16px;gap:22px}.context-heading{align-items:start;flex-direction:column;gap:14px}.context-heading label{width:100%}.context-heading select{max-width:100%}.context-detail{border-top:1px solid #c5d5de;padding-top:18px}.context-detail select{max-width:100%}.context-heading h3{font-size:22px}.neighborhood-context{padding-top:22px}.context-value{font-size:28px!important}}
</style>
