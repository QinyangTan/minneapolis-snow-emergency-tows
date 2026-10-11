<script>
  let { collection, eventId, onselect } = $props();

  const rows = $derived((collection?.events ?? []).flatMap((dataset) => {
    const { event, weather } = dataset;
    if (!weather || weather.snowfallMm == null || !event.total) return [];
    return [{
      id: event.id,
      name: event.name,
      start: event.start,
      season: event.season,
      snowfallCm: weather.snowfallMm / 10,
      depthCm: weather.snowDepthMm == null ? null : weather.snowDepthMm / 10,
      tminC: weather.tminC,
      day2Share: 100 * event.dayTotals[1] / event.total,
      total: event.total
    }];
  }));

  const snowTicks = [0, 10, 20, 30, 40];
  const shareTicks = [20, 30, 40, 50, 60, 70];
  const x = (cm) => 76 + (cm / 40) * 660;
  const y = (share) => 306 - ((share - 20) / 50) * 250;
  const radius = (total) => 7 + ((total - 400) / 500) * 8;
  const color = (season) => season?.startsWith('2022') ? '#176a8a'
    : season?.startsWith('2024') ? '#b67525' : '#b34f38';
  const current = $derived(rows.find((row) => row.id === eventId));
  const date = (value) => new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${value}T12:00:00Z`));
</script>

{#if rows.length}
  <section class="weather-comparison" aria-labelledby="weather-comparison-title">
    <div class="comparison-heading">
      <div>
        <p class="eyebrow">Across {rows.length} selected events · 2022–2025</p>
        <h2 id="weather-comparison-title">Snowfall &amp;<br />tow-day mix.</h2>
      </div>
      <div class="comparison-intro">
        <p>Does a snowier event put a larger share of recorded tows on Day 2? Each dot is one Snow Emergency. Compare snowfall with Day 2’s share; bubble size shows the event’s total tow records.</p>
        <p class="current-event">Selected in the 3D map: <strong>{current?.name ?? 'None'}</strong></p>
      </div>
    </div>

    <div class="plot-frame">
      <div class="y-title">Day 2 share of event tows</div>
      <div class="plot-area">
        <svg class="scatter" viewBox="0 0 800 350" role="img" aria-labelledby="scatter-title scatter-desc">
          <title id="scatter-title">Snowfall compared with Day 2 share of recorded tows</title>
          <desc id="scatter-desc">Ten event points. Horizontal position shows three-day snowfall in centimeters, vertical position shows the percent of each event's tow records on Day 2, bubble size shows total event records, and color identifies winter season.</desc>
          {#each shareTicks as tick}
            <line x1="76" x2="736" y1={y(tick)} y2={y(tick)} class="gridline" />
            <text x="64" y={y(tick) + 4} text-anchor="end" class="tick-label">{tick}%</text>
          {/each}
          <line x1="76" y1="56" x2="76" y2="306" class="axisline" />
          <line x1="76" y1="306" x2="736" y2="306" class="axisline" />
          {#each snowTicks as tick}
            <line x1={x(tick)} x2={x(tick)} y1="306" y2="312" class="axisline" />
            <text x={x(tick)} y="330" text-anchor="middle" class="tick-label">{tick}</text>
          {/each}
          {#each rows as row (row.id)}
            <circle
              cx={x(row.snowfallCm)} cy={y(row.day2Share)} r={radius(row.total)}
              fill={color(row.season)} class:active={row.id === eventId}
              stroke={row.id === eventId ? '#173449' : '#f5f8fa'}
              stroke-width={row.id === eventId ? 4 : 2}
            >
              <title>{row.name}: {row.snowfallCm.toFixed(1)} cm snow, {row.day2Share.toFixed(1)}% on Day 2, {row.total} tow records</title>
            </circle>
          {/each}
        </svg>
        <div class="x-title">NOAA snowfall, event start date and previous two days (cm)</div>
      </div>
    </div>

    <div class="chart-legend" aria-label="Chart legend">
      <span><i class="season-dot s22"></i>2022–23</span>
      <span><i class="season-dot s24"></i>2024–25</span>
      <span><i class="season-dot s25"></i>2025–26</span>
      <span class="size-key"><i></i>Bubble size = event tow count</span>
    </div>

    <div class="comparison-finding">
      <p><strong>The snowiest event was not the event with the largest Day 2 share.</strong> Northrop had 37.9 cm of snowfall and 33.3% of its 465 tow records on Day 2; Glenwood had 13.6 cm, with 62.3% of its 719 records on Day 2.</p>
      <p>Choose a row to inspect that event in the map above.</p>
    </div>

    <div class="event-buttons" aria-label="Select an event to inspect in the 3D map">
      {#each rows as row (row.id)}
        <button class:selected={row.id === eventId} aria-pressed={row.id === eventId} onclick={() => onselect?.(row.id)}>
          <span class="event-name"><i style={`background:${color(row.season)}`}></i>{row.name}</span>
          <span>{row.snowfallCm.toFixed(1)} cm snow</span>
          <span>{row.day2Share.toFixed(1)}% Day 2</span>
          <span>{row.total} tows</span>
          <small>{date(row.start)}</small>
        </button>
      {/each}
    </div>

    <p class="comparison-caveat">NOAA GHCN-Daily station USW00014922 (Minneapolis–St. Paul Airport); snowfall is the measurable sum from start date minus two days through start date, not a storm total or neighborhood measurement. Each dot represents one of ten selected Minneapolis events. These descriptive comparisons do not establish that snowfall caused towing patterns.</p>
  </section>
{/if}

<style>
  .weather-comparison{padding:68px 4.3vw 72px;background:#f5f8fa;color:#173449;border-top:1px solid #d5e0e6}
  .comparison-heading{display:grid;grid-template-columns:42% 58%;align-items:end;margin-bottom:28px}
  .eyebrow{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#4f697b;margin:0 0 13px}
  h2{font:700 clamp(43px,4.4vw,62px)/.98 'Barlow Condensed',sans-serif;letter-spacing:-.02em;margin:0}
  .comparison-intro{max-width:670px}
  .comparison-intro p{font-size:16px;line-height:1.55;margin:0}
  .comparison-intro .current-event{font-size:13px;color:#4f697b;margin-top:12px}
  .plot-frame{display:grid;grid-template-columns:32px minmax(0,1fr);gap:8px;max-width:1100px;margin:0 auto}
  .y-title{writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;color:#4f697b;text-align:center}
  .plot-area{min-width:0}
  .scatter{display:block;width:100%;height:auto;overflow:visible}
  .gridline{stroke:#d5e0e6;stroke-width:1}
  .axisline{stroke:#4f697b;stroke-width:1.2}
  .tick-label{font:12px Barlow,sans-serif;fill:#4f697b}
  .x-title{text-align:center;font-size:12px;color:#4f697b;margin-top:0}
  .chart-legend{display:flex;gap:18px;flex-wrap:wrap;align-items:center;justify-content:center;margin:20px 0;color:#4f697b;font-size:12px}
  .chart-legend>span{display:inline-flex;gap:7px;align-items:center}
  .season-dot,.event-name i{width:10px;height:10px;border-radius:50%;display:inline-block;flex:none}
  .s22{background:#176a8a}.s24{background:#b67525}.s25{background:#b34f38}
  .size-key i{width:21px;height:21px;border:1px solid #4f697b;border-radius:50%;display:inline-block}
  .comparison-finding{max-width:960px;margin:28px auto 18px;padding:18px 22px;border-left:3px solid #b67525;background:#eaf1f5}
  .comparison-finding p{font-size:14px;line-height:1.55;margin:0}.comparison-finding p+p{font-size:12px;color:#4f697b;margin-top:7px}
  .event-buttons{max-width:1100px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0 auto}
  .event-buttons button{text-align:left;background:#fff;border:1px solid #d5e0e6;padding:10px 12px;display:grid;gap:4px;font-size:12px;border-radius:2px}
  .event-buttons button:hover,.event-buttons button.selected{border-color:#176a8a;background:#edf4f7}
  .event-name{font-weight:600;display:flex;align-items:center;gap:7px;font-size:14px}
  .event-buttons small{font-size:10px;color:#4f697b}
  .comparison-caveat{max-width:1100px;margin:18px auto 0;color:#4f697b;font-size:12px;line-height:1.5}
  @media(max-width:760px){.weather-comparison{padding:48px 5vw}.comparison-heading{grid-template-columns:1fr;gap:20px}.plot-frame{grid-template-columns:23px minmax(0,1fr);gap:4px}.event-buttons{grid-template-columns:repeat(2,minmax(0,1fr))}.event-buttons button{padding:9px}.chart-legend{justify-content:flex-start;gap:11px}.comparison-finding{padding:14px 16px}}
</style>
