<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import NeighborhoodMap from '$lib/NeighborhoodMap.svelte';
  import DaySmallMultiples from '$lib/DaySmallMultiples.svelte';
  import NeighborhoodMatrix from '$lib/NeighborhoodMatrix.svelte';
  import DaySignatures from '$lib/DaySignatures.svelte';
  import EventComparison from '$lib/EventComparison.svelte';
  import EventFingerprints from '$lib/EventFingerprints.svelte';
  import EventConstellation from '$lib/EventConstellation.svelte';
  import { constellationRows } from '$lib/eventConstellation.mjs';
  import RankSensitivity from '$lib/RankSensitivity.svelte';
  import { countInScope, eventDays, shares, type NeighborhoodGeoJSON } from '$lib/analytics';
  import {
    preliminaryDays, preliminaryEvents,
    type DayRow, type EventRow, type Summary
  } from '$lib/preliminary';

  let summary: Summary | null = null;
  let geography: NeighborhoodGeoJSON | null = null;
  let selectedDay = 0;
  let selectedEvent = 'all';
  let selectedNeighborhood = 'all';
  let storyMode = false;
  let brushMin = 0;
  let brushMax = 100;
  let loadError = '';

  const rules = [
    { day: 1, hours: '9 PM', title: 'Snow Emergency Routes', detail: 'No parking on either side of Snow Emergency routes (until fully plowed).' },
    { day: 2, hours: '8 AM', title: 'Even sides + parkways', detail: 'No parking on even sides of non-emergency-route streets or either side of parkways (until fully plowed).' },
    { day: 3, hours: '8 AM', title: 'Odd sides', detail: 'No parking on odd sides of non-emergency-route streets (until fully plowed).' }
  ];
  const fmt = new Intl.NumberFormat('en-US');

  onMount(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          fetch(`${base}/data/summary.json`),
          fetch(`${base}/data/neighborhoods.geojson`)
        ]);
        if (a.status === 404 || b.status === 404) return; // deliberately show preliminary-only state
        if (!a.ok || !b.ok) throw new Error('Generated data could not be loaded');
        const nextSummary = await a.json();
        const nextGeography = await b.json();
        if (nextSummary.status !== 'recomputed-official-arcgis' ||
            nextGeography.type !== 'FeatureCollection') throw new Error('Invalid processed data');
        summary = nextSummary;
        geography = nextGeography;
      } catch (error) {
        loadError = error instanceof Error ? error.message : String(error);
      }
    })();
  });

  $: events = (summary?.events ?? preliminaryEvents) as EventRow[];
  $: overallDays = (summary?.days ?? preliminaryDays) as DayRow[];
  $: chartDays = eventDays(summary, selectedEvent, overallDays);
  $: chartTotal = chartDays.reduce((total, row) => total + row.count, 0);
  $: maxDayCount = Math.max(1, ...chartDays.map((row) => row.count));
  $: selectedArea = geography?.features.find((feature) => feature.properties.name === selectedNeighborhood)?.properties;
  $: selectedAreaCount = selectedArea ? countInScope(selectedArea, selectedEvent, selectedDay) : 0;
  $: titleScope = selectedEvent === 'all' ? 'all nine events' : selectedEvent;
  $: peakRow = chartDays.reduce((best,row)=>row.count>best.count?row:best,chartDays[0]);
  $: peakShare = (peakRow?.count??0)/Math.max(1,chartTotal)*100;
  $: cityDays = summary?.days ?? preliminaryDays;
  $: overviewEvents = geography ? constellationRows(events, geography) : [];
  $: brushedEvents = overviewEvents.filter(event => event.day2Share*100 >= brushMin-1e-8 && event.day2Share*100 <= brushMax+1e-8);
  $: brushedEventIds = new Set(brushedEvents.map(event => event.id));
  $: brushActive = brushMin>0 || brushMax<100;

  function observeDayStep(node: HTMLElement, day: number) {
    if (typeof IntersectionObserver === 'undefined') return {};
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55)) {
        selectedDay = day;
      }
    }, { threshold: [0.55] });
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }

  function selectMatrixCell(detail: { neighborhood: string; event: string }) {
    selectedNeighborhood = detail.neighborhood;
    selectedEvent = detail.event;
  }


  function resetFilters() {
    selectedDay = 0;
    selectedEvent = 'all';
    selectedNeighborhood = 'all';
    brushMin = 0; brushMax = 100;
  }
  function showFullStory() { storyMode = true; }
</script>

<svelte:head>
  <title>Three Days, Three Rules — Minneapolis Snow Emergency Tows</title>
  <meta name="description" content="Exploring historic tow records and neighborhood patterns across three days of Minneapolis Snow Emergencies." />
</svelte:head>

<div class="shell" class:focus-view={!storyMode}>
  <header class="topbar">
    <a href="#home" class="brand">❄ MINNEAPOLIS <span>/ DATA STORIES</span></a>
    <nav aria-label="Main navigation">
      <a href={`${base}/fp2/`}>FP2 · Neighborhoods</a>
      <a href="#focus-dashboard">Dashboard</a>
      <a href="#constellation" onclick={showFullStory}>Brush &amp; link</a>
      <a href="#geography" onclick={showFullStory}>Day maps</a>
      <a href="#comparison" onclick={showFullStory}>Compare</a>
      <a href="#methods" onclick={showFullStory}>Methods</a>
    </nav>
    <span class="tag">CSCI 5609 · 2026</span>
  </header>

  <main id="home">
    <section class="hero">
      <p class="eyebrow">AN INTERACTIVE CIVIC DATA STORY <span class="dot">●</span> MINNEAPOLIS, MN</p>
      <h1>THREE DAYS.<br />THREE RULES.<br /><em>ONE CITY.</em></h1>
      <p class="lead">Every Snow Emergency changes where you can park. We explore how observed towing patterns shift across those three days — and why some neighborhoods keep appearing in the records.</p>
      <div class="hero-meta">
        <div><strong>{fmt.format(summary?.total ?? 5423)}</strong><span>observed tow records</span></div>
        <div><strong>9</strong><span>complete emergencies</span></div>
        <div><strong>3</strong><span>different rule days</span></div>
      </div>
      <a class="scroll-link" href="#focus-dashboard">EXPLORE THE DATA ↓</a>
    </section>

    <div class:verified={summary !== null} class="status-strip">
      <span class="status-dot"></span>
      {#if summary}
        Regenerated City ArcGIS data · {new Date(summary.generated_at_utc).toLocaleDateString('en-US')} · {fmt.format(summary.unassigned_neighborhood_count ?? 0)} unassigned map points
      {:else}
        FP1 preliminary data · October 5, 2026 · Awaiting automated source regeneration
      {/if}
      {#if loadError}<span class="error-text"> · {loadError}</span>{/if}
    </div>


    <section class="focus-dashboard" id="focus-dashboard" aria-labelledby="focus-title">
      <div class="focus-heading">
        <div><p class="eyebrow">EXPLORE / BRUSH · LINK · INSPECT</p>
        <h2 id="focus-title">Find the pattern. <em>See it move.</em></h2>
        <p>Choose a day, brush Day 2 shares, or select a neighborhood. The linked views respond together.</p></div>
        <button class="focus-mode-switch" onclick={() => storyMode = !storyMode} aria-expanded={storyMode}>
          {storyMode ? 'Hide deep dive ↑' : 'Explore all charts ↗'}
        </button>
      </div>
      <div class="focus-toolbar" aria-label="Linked visualization controls">
        <label>SNOW EMERGENCY <select bind:value={selectedEvent} disabled={!summary} aria-label="Dashboard Snow Emergency">
          <option value="all">All 9 events</option>
          {#each events as event}<option value={event.id}>{event.id}</option>{/each}
        </select></label>
        <fieldset class="focus-day-picker"><legend>RULE DAY</legend>
          {#each [0,1,2,3] as day}<button type="button" class:active={selectedDay===day}
            aria-pressed={selectedDay===day} onclick={()=>selectedDay=day}>{day===0?'All':'Day '+day}</button>{/each}
        </fieldset>
        <button class="focus-reset" onclick={resetFilters} type="button">Reset all ↺</button>
      </div>
      <div class="focus-stats" aria-live="polite">
        <div><span>OBSERVED RECORDS</span><strong>{fmt.format(chartTotal)}</strong><small>{titleScope}</small></div>
        <div><span>BUSIEST RULE DAY</span><strong>Day {peakRow?.day??'—'}</strong><small>{peakShare.toFixed(1)}% of citywide event records</small></div>
        <div><span>DAY 2 BRUSH</span><strong>{brushedEvents.length}<small> / {overviewEvents.length} events</small></strong><small>matching share interval</small></div>
        <div><span>NEIGHBORHOOD FOCUS</span><strong>{selectedArea?fmt.format(selectedAreaCount):'—'}</strong><small>{selectedArea?.name??'Choose an area'}</small></div>
      </div>
      <div class="focus-content">
        <div class="focus-analysis">
          <div class="focus-panel-title"><h3>When are tows recorded?</h3><span>Citywide composition, not risk</span></div>
          <div class="focus-day-bars">
            {#each chartDays as row}<button type="button" class:active={selectedDay===row.day} aria-pressed={selectedDay===row.day}
                aria-label={'DAY 0'+row.day+' '+(row.count/Math.max(1,chartTotal)*100).toFixed(1)+'% — Focus Day '+row.day}
                onclick={()=>selectedDay=selectedDay===row.day?0:row.day}>
                <span class="focus-bar-name">DAY 0{row.day}</span>
                <span class="focus-bar-track"><i class={'day-'+row.day} style:width={(row.count/maxDayCount*100)+'%'}></i></span>
                <strong>{(row.count/Math.max(1,chartTotal)*100).toFixed(1)}%</strong></button>
            {/each}
          </div>
          <div class="focus-brush">
            <div class="focus-panel-title"><h3>Brush events by Day 2 share</h3><span aria-live="polite">{brushMin}%–{brushMax}% · {brushedEvents.length} selected</span></div>
            <div class="focus-brush-ranges">
              <label>FROM {brushMin}%<input type="range" min="0" max={brushMax} step="5" bind:value={brushMin} aria-label="Dashboard minimum Day 2 share" disabled={!summary}/></label>
              <label>TO {brushMax}%<input type="range" min={brushMin} max="100" step="5" bind:value={brushMax} aria-label="Dashboard maximum Day 2 share" disabled={!summary}/></label>
            </div>
            <div class="focus-event-list" aria-label="Linked events">
              {#each overviewEvents as event}
                <button type="button" class:muted={brushActive&&!brushedEventIds.has(event.id)}
                  class:selected={selectedEvent===event.id} aria-pressed={selectedEvent===event.id}
                  title={event.id+' · '+(event.day2Share*100).toFixed(1)+'% Day 2 of citywide records'}
                  onclick={()=>selectedEvent=selectedEvent===event.id?'all':event.id}>
                  <span>{event.id}</span><strong>{(event.day2Share*100).toFixed(1)}%</strong>
                  <i style:width={(event.day2Share*100)+'%'}></i></button>
              {/each}
            </div>
            {#if !geography}<p class="mini-note">Waiting for validated City map data.</p>{/if}
            {#if brushActive}<button class="focus-clear-brush" onclick={()=>{brushMin=0;brushMax=100;}}>Clear brush ↺</button>{/if}
          </div>
        </div>
        <div class="focus-map">
          <div class="focus-panel-title"><h3>Where does it happen?</h3><span>{selectedDay?'Day '+selectedDay:'All days'} · {titleScope}</span></div>
          {#if geography && summary}
            <NeighborhoodMap {geography} {selectedDay} {selectedEvent} {selectedNeighborhood}
              on:select={event=>selectedNeighborhood=event.detail}/>
            <div class="focus-map-footer" aria-live="polite"><strong>{selectedArea?.name??'Choose a neighborhood'}</strong>
              <span>{selectedArea?fmt.format(selectedAreaCount)+' mapped tows in scope':'Color indicates observed counts, not per-car risk.'}</span>
              {#if selectedArea}<button onclick={()=>selectedNeighborhood='all'}>Clear area ×</button>{/if}
            </div>
          {:else}<p class="focus-data-loading" role="status">Map awaits verified neighborhood data. No synthetic geography.</p>{/if}
        </div>
      </div>
      <p class="focus-evidence-note">9 selected historic emergencies · City of Minneapolis tow records · unmatched locations excluded from mapped counts. Brushing highlights events; click one event to inspect its linked geography. No towing-risk or causal claims.</p>
    </section>

    <section class="section rules-section" id="rules">
      <div class="section-heading"><p class="eyebrow">01 / THE RULES</p><h2>Same storm.<br />Different streets.</h2><p>Each emergency day has a distinct restriction. Those differences are central to this analysis.</p></div>
      <div class="rule-cards">
        {#each rules as rule}
          <article class="rule-card">
            <span class="rule-number">0{rule.day}</span>
            <span class="rule-time">DAY {rule.day} · FROM {rule.hours}</span>
            <h3>{rule.title}</h3>
            <p>{rule.detail}</p>
            <button class:active={selectedDay === rule.day} onclick={() => selectedDay = selectedDay === rule.day ? 0 : rule.day}>
              {selectedDay === rule.day ? 'Selected ✓' : 'Highlight Day ' + rule.day + ' ↗'}
            </button>
          </article>
        {/each}
      </div>
      <p class="mini-note">Simplified rule summaries. Streets may reopen after they are fully plowed. <a href="https://www.minneapolismn.gov/getting-around/snow/snow-emergencies/snow-parking-rules/" target="_blank" rel="noreferrer">Read the current official City parking rules ↗</a></p>
    </section>

    <section class="section findings-section" id="findings">
      <div class="section-heading"><p class="eyebrow">02 / CITYWIDE VIEW</p><h2>Day 2 leads.<br /><em>But not everywhere.</em></h2><p>Observed records by emergency day, {titleScope}. Select an event when regenerated data is available.</p></div>
      <div class="panel stats-panel">
        <div class="panel-header">
          <h3>Day-by-day composition</h3><span>{fmt.format(chartTotal)} observed records</span>
        </div>
        <div class="bar-list">
          {#each chartDays as row}
            <button class:chosen={selectedDay === row.day} class="bar-row" onclick={() => selectedDay = selectedDay === row.day ? 0 : row.day}>
              <strong>DAY 0{row.day}</strong>
              <div class="bar-rail"><div class={'bar-fill day-' + row.day} style:width={(row.count / maxDayCount * 100) + '%'}></div></div>
              <div class="bar-data"><b>{fmt.format(row.count)}</b><span>{(row.count / Math.max(1, chartTotal) * 100).toFixed(1)}%</span></div>
            </button>
          {/each}
        </div>
        <div class="analysis-annotation"><b>READ THIS CHART</b><p>{titleScope === 'all nine events' ? 'Across the selected nine emergencies' : 'Within '+titleScope}, Day {peakRow?.day ?? '—'} has the largest observed count, representing {peakShare.toFixed(1)}% of this selection. This is a <strong>composition of recorded tows</strong>, not a measure of parking or towing risk.</p></div>
        <p class="mini-note">{summary ? 'Regenerated official City records.' : 'FP1 preliminary snapshot.'} Share of selected event records: {chartDays.map((row) => 'Day ' + row.day + ' ' + (row.count / Math.max(1, chartTotal) * 100).toFixed(1) + '%').join(' · ')}. These are observed tow records, not the risk of being towed.</p>
      </div>
    </section>

    <section class="section events-section">
      <div class="section-heading"><p class="eyebrow">03 / NINE EVENT FINGERPRINTS</p><h2>Every storm has<br /><em>its own signature.</em></h2><p>Compare event size, within-event day composition, the largest observed neighborhood count and geocoding coverage — all in one coordinated view.</p></div>
      {#if geography && summary}
        <EventFingerprints {events} {geography} {selectedEvent}
          on:select={(event) => selectedEvent=event.detail} />
      {:else}
        <div class="event-grid">
          {#each events as event}
            <div class="event-row">
              <span class="event-name">{event.id}</span><span class="event-season">{event.season}</span>
              <div class="event-track"><div style:width={(event.total / Math.max(...events.map(e=>e.total))*100)+'%'}></div></div>
              <strong>{fmt.format(event.total)}</strong>
            </div>
          {/each}
        </div>
        <p class="mini-note">Event totals from the preliminary FP1 snapshot; full fingerprints need the validated ArcGIS data.</p>
      {/if}
    </section>


    <div id="constellation" class="story-anchor" aria-hidden="true"></div>
    {#if geography && summary}
      <section class="section constellation-section" aria-labelledby="constellation-title">
        <div class="section-heading">
          <p class="eyebrow">04 / MULTIVARIATE ANALYSIS · TASK FIRST</p>
          <h2 id="constellation-title">How many.<br /><em>When. Where.</em></h2>
          <p>Each dot is one complete Snow Emergency. Position compares two distinct proportions, mark area expresses total observed records, and hue identifies the peak day. Explore whether a Day 2-heavy event is also geographically concentrated: the two patterns need not align.</p>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>Event constellation · nine records of history</h3><span>One mark = one emergency</span></div>
          <EventConstellation {events} {geography} {selectedEvent} bind:brushMin bind:brushMax
            on:select={(event)=>selectedEvent=event.detail}/>
        </div>
      </section>
    {/if}

    <div id="geography" class="story-anchor" aria-hidden="true"></div>
    {#if geography && summary}
      <section class="section geography-section">
        <div class="section-heading">
          <p class="eyebrow">05 / SPATIAL SHIFTS · GUIDED NARRATIVE</p>
          <h2>Same city.<br /><em>Three different maps.</em></h2>
          <p>The three neighborhood maps below share the exact same color scale. Scroll through the day-specific observations, or choose a map to highlight its day.</p>
        </div>
        <div class="story-layout">
          <div class="story-sticky">
            <div class="panel small-multiple-shell">
              <div class="panel-header"><h3>Neighborhood tow patterns</h3><span>{titleScope}</span></div>
              <DaySmallMultiples {geography} {selectedDay} {selectedEvent} {selectedNeighborhood}
                on:selectDay={(event) => selectedDay = event.detail}
                on:selectNeighborhood={(event) => selectedNeighborhood = event.detail}
              />
            </div>
          </div>
          <div class="story-steps">
            {#each chartDays as row, i}
              <article class:step-active={selectedDay === row.day} class="story-step"
                use:observeDayStep={row.day}>
                <span class="eyebrow">DAY 0{row.day} · {['EMERGENCY ROUTES', 'EVEN SIDES', 'ODD SIDES'][i]}</span>
                <h3>{fmt.format(row.count)} recorded tows</h3>
                <p>{(row.count / Math.max(1, chartTotal) * 100).toFixed(1)}% of the observed records for {titleScope} occurred on Day {row.day}. The three maps use mapped counts, so their denominators may be slightly smaller than these citywide day totals.</p>
                <button class="story-step-action" onclick={() => selectedDay = row.day}>Focus Day {row.day} ↗</button>
              </article>
            {/each}
          </div>
        </div>
      </section>

    {/if}
    <div id="recurrence" class="story-anchor" aria-hidden="true"></div>
    {#if geography && summary}
      <section class="section recurrence-section">
        <div class="section-heading">
          <p class="eyebrow">06 / REPEATED FOOTPRINTS</p>
          <h2>A recurring footprint.<br /><em>But how stable?</em></h2>
          <p>Compare observed counts across emergencies. Separate measures distinguish a neighborhood simply appearing in an event from ranking among that event’s leading tow-count neighborhoods. Method thresholds are explicit and adjustable.</p>
        </div>
        <div class="panel">
          <NeighborhoodMatrix {geography} {events} {selectedDay} {selectedEvent} {selectedNeighborhood}
            on:select={(event) => selectMatrixCell(event.detail)} />
        </div>
        <div class="panel sensitivity-panel">
          <RankSensitivity {events} {geography} {selectedDay} {selectedNeighborhood}
            on:select={(event)=>selectedNeighborhood=event.detail} />
        </div>
      </section>

    {/if}
    <div id="signatures" class="story-anchor" aria-hidden="true"></div>
    {#if geography && summary}
      <section class="section signatures-section">
        <div class="section-heading">
          <p class="eyebrow">07 / NEIGHBORHOOD SIGNATURES</p>
          <h2>Not just <em>how many</em>.<br />But <em>which day</em>.</h2>
          <p>Normalized bars compare the Day 1 / Day 2 / Day 3 composition inside each neighborhood. Compare the neighborhoods featured in the FP1 proposal, or sort by total volume and day share.</p>
        </div>
        <div class="panel">
          <DaySignatures {geography} {selectedEvent} {selectedNeighborhood}
            on:select={(event) => selectedNeighborhood = event.detail} />
        </div>
      </section>

    {/if}
    <div id="comparison" class="story-anchor" aria-hidden="true"></div>
    {#if geography && summary}
      <section class="section comparison-section">
        <div class="section-heading">
          <p class="eyebrow">07 / EVENT COMPARISON</p>
          <h2>Do storms leave<br /><em>similar footprints?</em></h2>
          <p>Compare the three-day signature or the neighborhood distribution of two Snow Emergencies. Differences in total records do not automatically imply differences in composition.</p>
        </div>
        <div class="panel"><EventComparison {events} {geography} on:selectEvent={(event) => selectedEvent = event.detail}/></div>
      </section>
    {/if}

    <section class="section explore-section" id="explore">
      <div class="section-heading"><p class="eyebrow">08 / SPATIAL EXPLORER</p><h2>Where does the<br /><em>pattern move?</em></h2><p>Neighborhood-level counts connect three-day changes with geography. Every area uses the same City boundary dataset.</p></div>
      <div class="panel explorer-panel">
        <div class="filterbar">
          <label>EMERGENCY
            <select bind:value={selectedEvent} disabled={!summary}>
              <option value="all">All nine events</option>
              {#each events as event}<option value={event.id}>{event.id}</option>{/each}
            </select>
          </label>
          <div class="day-picker"><span>DAY</span>
            {#each [0,1,2,3] as day}
              <button class:active={selectedDay === day} onclick={() => selectedDay = day}>{day === 0 ? 'All' : day}</button>
            {/each}
          </div>
          <button class="reset" onclick={resetFilters}>Reset ↺</button>
        </div>
        {#if geography && summary}
          <div class="explorer-layout">
            <NeighborhoodMap {geography} {selectedDay} {selectedEvent} {selectedNeighborhood} on:select={(event) => selectedNeighborhood = event.detail}/>
            <aside class="area-detail">
              <span class="eyebrow">SELECTED AREA</span>
              <h3>{selectedArea?.name ?? 'Choose a neighborhood'}</h3>
              {#if selectedArea}
                <strong class="detail-count">{fmt.format(selectedAreaCount)}</strong>
                <p>observed tows in {titleScope}, {selectedDay ? 'Day ' + selectedDay : 'all days'}.</p>
                <p>{fmt.format(selectedArea.total)} across all nine events; {summary.neighborhoods.find((area) => area.name === selectedArea.name)?.event_count ?? '—'} of 9 events contain records.</p>
              {:else}
                <p>Select a neighborhood on the map to inspect its overall counts and recurrence.</p>
              {/if}
            </aside>
          </div>
        {:else}
          <div class="map-placeholder">
            <div class="map-placeholder-art" aria-hidden="true">◇ ◇ ◇<br /> ◇ ◇ ◇ ◇<br />◇ ◇ ◇</div>
            <h3>Neighborhood data is being prepared</h3>
            <p>The map will appear after the ArcGIS preprocessing script produces verified neighborhood aggregates. No invented geographic data is shown.</p>
            <code>python scripts/build_data.py</code>
          </div>
        {/if}
      </div>
    </section>

    <section class="section methods-section" id="methods">
      <div class="section-heading"><p class="eyebrow">09 / METHODS & CAVEATS</p><h2>What the data<br /><em>can — and can't — say.</em></h2></div>
      <div class="methods-grid">
        <div><b>Source</b><p>City of Minneapolis official ArcGIS Snow Emergency tow FeatureServer layers and neighborhood boundaries.</p></div>
        <div><b>Interpretation</b><p>Counts represent observed enforcement actions; they do not measure illegal parking prevalence or individual towing probability.</p></div>
        <div><b>Location uncertainty</b><p>Some City tow-layer metadata cites an expected address geocoding error rate of approximately 8–14%. We prioritize neighborhood-level aggregation.</p></div>
        <div><b>Complete emergencies</b><p>The selected nine events include all three days. The available Victory 2 dataset is excluded because it only contains Day 1 records.</p></div>
      </div>
    </section>
  </main>

  <footer><span>THREE DAYS, THREE RULES</span><span>CSCI 5609 · University of Minnesota</span><a href="https://github.com/QinyangTan/minneapolis-snow-emergency-tows">Project repository ↗</a></footer>
</div>