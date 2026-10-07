<script lang="ts">
  import { onMount } from 'svelte';
  import NeighborhoodMap from '$lib/NeighborhoodMap.svelte';
  import DaySmallMultiples from '$lib/DaySmallMultiples.svelte';
  import NeighborhoodMatrix from '$lib/NeighborhoodMatrix.svelte';
  import DaySignatures from '$lib/DaySignatures.svelte';
  import EventComparison from '$lib/EventComparison.svelte';
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
          fetch('/data/summary.json'),
          fetch('/data/neighborhoods.geojson')
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
  $: cityDays = summary?.days ?? preliminaryDays;

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
  }
</script>

<svelte:head>
  <title>Three Days, Three Rules — Minneapolis Snow Emergency Tows</title>
  <meta name="description" content="Exploring historic tow records and neighborhood patterns across three days of Minneapolis Snow Emergencies." />
</svelte:head>

<div class="shell">
  <header class="topbar">
    <a href="#home" class="brand">❄ MINNEAPOLIS <span>/ DATA STORIES</span></a>
    <nav aria-label="Main navigation">
      <a href="#findings">Findings</a>
      <a href="#geography">Map story</a>
      <a href="#recurrence">Recurrence</a>
      <a href="#comparison">Compare events</a>
      <a href="#explore">Explore</a>
      <a href="#methods">Methods</a>
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
      <a class="scroll-link" href="#rules">EXPLORE THE STORY ↓</a>
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
      <div class="section-heading"><p class="eyebrow">02 / CITYWIDE VIEW</p><h2>Most tows happen<br /><em>after Day 1.</em></h2><p>Observed records by emergency day, {titleScope}. Select an event when regenerated data is available.</p></div>
      <div class="panel stats-panel">
        <div class="panel-header">
          <h3>Day-by-day composition</h3><span>{fmt.format(chartTotal)} observed records</span>
        </div>
        <div class="bar-list">
          {#each chartDays as row}
            <button class:chosen={selectedDay === row.day} class="bar-row" onclick={() => selectedDay = selectedDay === row.day ? 0 : row.day} aria-label={'Highlight day ' + row.day}>
              <strong>DAY 0{row.day}</strong>
              <div class="bar-rail"><div class={'bar-fill day-' + row.day} style:width={(row.count / maxDayCount * 100) + '%'}></div></div>
              <div class="bar-data"><b>{fmt.format(row.count)}</b><span>{(row.count / Math.max(1, chartTotal) * 100).toFixed(1)}%</span></div>
            </button>
          {/each}
        </div>
        <p class="mini-note">{summary ? 'Regenerated official City records.' : 'FP1 preliminary snapshot.'} Share of selected event records: {chartDays.map((row) => 'Day ' + row.day + ' ' + (row.count / Math.max(1, chartTotal) * 100).toFixed(1) + '%').join(' · ')}. These are observed tow records, not the risk of being towed.</p>
      </div>
    </section>

    <section class="section events-section">
      <div class="section-heading"><p class="eyebrow">03 / THE EVENTS</p><h2>Nine emergencies.<br /><em>Nine different stories.</em></h2><p>Different storms contribute different record totals. The stacked day profiles are recalculated directly from each of the nine official event layers.</p></div>
      <div class="event-grid">
        {#each events as event}
          {@const proportions = shares(event.days ?? [])}
          <button class:event-selected={selectedEvent === event.id} class="event-row" disabled={!summary} onclick={() => selectedEvent = selectedEvent === event.id ? 'all' : event.id}>
            <span class="event-name">{event.id}</span><span class="event-season">{event.season}</span>
            <span class="event-track event-stack">
              {#if summary}
                {#each proportions as portion, i}
                  <span class={'day-' + (i+1)} style:width={(portion * 100) + '%'} title={'Day ' + (i+1) + ': ' + (portion * 100).toFixed(1) + '%'}></span>
                {/each}
              {:else}
                <span class="event-volume" style:width={(event.total / Math.max(...events.map((e) => e.total)) * 100) + '%'}></span>
              {/if}
            </span>
            <strong>{fmt.format(event.total)}</strong>
          </button>
        {/each}
      </div>
      <p class="mini-note">{summary ? 'Each stacked row shows Day 1 / Day 2 / Day 3 proportions within that event, with total records at right. Click to filter all the linked views.' : 'FP1 snapshot shows event totals only, pending layer-level day data.'}</p>
    </section>


    <div id="geography" class="story-anchor" aria-hidden="true"></div>
    <div id="recurrence" class="story-anchor" aria-hidden="true"></div>
    <div id="signatures" class="story-anchor" aria-hidden="true"></div>
    <div id="comparison" class="story-anchor" aria-hidden="true"></div>
    {#if geography && summary}
      <section class="section geography-section">
        <div class="section-heading">
          <p class="eyebrow">04 / SPATIAL SHIFTS · GUIDED NARRATIVE</p>
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
            {#each cityDays as row, i}
              <article class:step-active={selectedDay === row.day} class="story-step"
                use:observeDayStep={row.day}>
                <span class="eyebrow">DAY 0{row.day} · {['EMERGENCY ROUTES', 'EVEN SIDES', 'ODD SIDES'][i]}</span>
                <h3>{fmt.format(row.count)} recorded tows</h3>
                <p>{(row.count / Math.max(1, summary.total) * 100).toFixed(1)}% of the nine-event citywide sample occurred on Day {row.day}. Explore how those records are distributed across neighborhoods, not just the overall size of the day.</p>
                <button class="story-step-action" onclick={() => selectedDay = row.day}>Focus Day {row.day} ↗</button>
              </article>
            {/each}
          </div>
        </div>
      </section>

      <section class="section recurrence-section">
        <div class="section-heading">
          <p class="eyebrow">05 / REPEATED FOOTPRINTS</p>
          <h2>Which neighborhoods<br /><em>show up again?</em></h2>
          <p>Compare observed counts across emergencies. Separate measures distinguish a neighborhood simply appearing in an event from ranking among that event’s leading tow-count neighborhoods. Method thresholds are explicit and adjustable.</p>
        </div>
        <div class="panel">
          <NeighborhoodMatrix {geography} {events} {selectedDay} {selectedEvent} {selectedNeighborhood}
            on:select={(event) => selectMatrixCell(event.detail)} />
        </div>
      </section>

      <section class="section signatures-section">
        <div class="section-heading">
          <p class="eyebrow">06 / NEIGHBORHOOD SIGNATURES</p>
          <h2>Not just <em>how many</em>.<br />But <em>which day</em>.</h2>
          <p>Normalized bars compare the Day 1 / Day 2 / Day 3 composition inside each neighborhood. Compare the neighborhoods featured in the FP1 proposal, or sort by total volume and day share.</p>
        </div>
        <div class="panel">
          <DaySignatures {geography} {selectedEvent} {selectedNeighborhood}
            on:select={(event) => selectedNeighborhood = event.detail} />
        </div>
      </section>

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
