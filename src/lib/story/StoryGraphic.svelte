<script lang="ts">
  import { geoMercator, geoPath } from 'd3-geo';
  import {
    W, H, DAY_COLORS, PHILLIPS, stormLayout, mean, snowColor, gapCategory, ramp, diverging,
    scatterLayout, topMovers, linear, fmt, fmt0, X_ATTRIBUTES
  } from './storyModel.mjs';

  type Props = {
    story: any;
    geography: any;
    view: string;
    xKey?: string;
    selected?: string | null;
    onselect?: (name: string) => void;
  };
  let { story, geography, view, xKey = 'noVehicle', selected = null, onselect = () => {} }: Props = $props();

  let hover = $state('');
  const dayColor = DAY_COLORS as Record<number, string>;
  const xAttr = X_ATTRIBUTES as Record<string, string>;
  const signed = (v: number, digits = 1) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(digits);
  const rho = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);

  const GAP_COLORS = { gain: '#2f7db8', loss: '#c4703f', flat: '#c9d3dd' };
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

  const isYear = $derived(view === 'year' || view === 'year-slice');
  const isStorms = $derived(view.startsWith('storms'));
  const isMap = $derived(['map-snow', 'map-ordinary', 'map-gap', 'map-street', 'phillips', 'explore'].includes(view));
  const isDumbbell = $derived(view === 'dumbbell');
  const isScatter = $derived(view.startsWith('scatter'));
  const isGroups = $derived(view === 'groups');

  const byName = $derived(new Map(story.neighborhoods.map((h: any) => [h.name, h])));

  // ---------- year bars
  const yearX = linear(0, 100, 130, 700);

  // ---------- storms
  const stormGeo = $derived(stormLayout(story.storms));
  const early = $derived(stormGeo.columns.filter((c: any) => !c.late));
  const late = $derived(stormGeo.columns.filter((c: any) => c.late));
  const earlyMean = $derived(mean(early.map((c: any) => c.tows)));
  const lateMean = $derived(mean(late.map((c: any) => c.tows)));
  const seasonTicks = $derived.by(() => {
    const seen = new Map();
    for (const c of stormGeo.columns) if (!seen.has(c.winter)) seen.set(c.winter, c.center);
    return [...seen.entries()].filter(([w]) => ['2015/16', '2017/18', '2018/19', '2019/20', '2022/23', '2024/25', '2025/26'].includes(w));
  });

  // ---------- map
  const projection = $derived(geoMercator().fitExtent([[10, 30], [470, 530]], geography));
  const path = $derived(geoPath(projection));
  const areas = $derived(geography.features.map((f: any) => {
    const name = f.properties.name;
    const [cx, cy] = path.centroid(f);
    return { name, d: path(f) ?? '', cx, cy, row: byName.get(name) };
  }));
  const maxSnow = $derived(Math.max(...story.neighborhoods.map((h: any) => h.snowShare)));
  const maxOrd = $derived(Math.max(...story.neighborhoods.map((h: any) => h.ordinaryShare)));
  const metric = $derived(view === 'map-snow' ? 'snow' : view === 'map-ordinary' ? 'ordinary' : view === 'map-gap' ? 'gap' : 'street');
  const metricInfo = $derived({
    snow: { title: 'Share of snow tows', unit: '%', key: 'snowShare', legend: ['0%', fmt.format(maxSnow) + '%'] },
    ordinary: { title: 'Share of ordinary tows', unit: '%', key: 'ordinaryShare', legend: ['0%', fmt.format(maxOrd) + '%'] },
    gap: { title: 'Storm share gap', unit: ' pp', key: 'gap', legend: ['−10 pp', '+10 pp'] },
    street: { title: 'Snow tows per street-km', unit: '', key: 'perStreetKm', legend: ['0', '30'] }
  }[metric]);
  function fillFor(row: any): string {
    if (!row) return '#eef2f6';
    if (metric === 'snow') return ramp(Math.sqrt(row.snowShare / maxSnow));
    if (metric === 'ordinary') return ramp(Math.sqrt(row.ordinaryShare / maxOrd), [58, 70, 86]);
    if (metric === 'gap') return diverging(row.gap, 10);
    return ramp(Math.sqrt(Math.min(1, (row.perStreetKm ?? 0) / 30)));
  }
  const mapList = $derived.by(() => {
    if (view === 'phillips') return [...PHILLIPS, 'South Uptown'].map((n) => byName.get(n)).filter(Boolean);
    const key = metricInfo.key;
    const sorted = [...story.neighborhoods].filter((h: any) => h[key] != null).sort((a: any, b: any) => b[key] - a[key]);
    return metric === 'gap' ? [...sorted.slice(0, 3), ...sorted.slice(-3)] : sorted.slice(0, 6);
  });
  const legendGradient = $derived(metric === 'gap'
    ? `linear-gradient(90deg, ${diverging(-10, 10)}, #e8f0f6, ${diverging(10, 10)})`
    : metric === 'ordinary' ? `linear-gradient(90deg, ${ramp(0)}, ${ramp(1, [58, 70, 86])})` : `linear-gradient(90deg, ${ramp(0)}, ${ramp(1)})`);

  // ---------- dumbbell
  const movers = $derived(topMovers(story.neighborhoods));
  const dx = linear(0, 12, 300, 700);

  // ---------- scatter
  const scatter = $derived(scatterLayout(story.neighborhoods, xKey));
  const scatterByName = $derived(new Map<string, any>(scatter.points.map((p: any) => [p.name, p])));
  const yTicks = [0, 1, 5, 10, 20, 30];
  const noteNames = ["Steven's Square - Loring Heights", 'East Bde Maka Ska', 'South Uptown', 'Marcy Holmes', 'Camden Industrial', 'Jordan'];

  // ---------- poverty groups
  const gy = linear(0, 45, 450, 100);
  const groupNames = ['Richest fifth', 'Second', 'Middle', 'Fourth', 'Poorest fifth'];

  function readoutFor(name: string) {
    const h: any = byName.get(name);
    if (!h) return name;
    return `${name} · snow share ${fmt.format(h.snowShare)}% · ordinary share ${fmt.format(h.ordinaryShare)}% · gap ${signed(h.gap)} pp · ${fmt.format(h.perStreetKm ?? 0)} snow tows per street-km`;
  }
  function stormReadout(c: any) {
    return `${c.name} · ${monthFmt.format(new Date(c.start))} · ${fmt0.format(c.tows)} tows (Day 1 ${c.day1}, Day 2 ${c.day2}, Day 3 ${c.day3}) · ${fmt.format(c.snowMm / 10)} cm of snow`;
  }
  function pick(name: string) { onselect(name); hover = readoutFor(name); }
  function keyPick(event: KeyboardEvent, name: string) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pick(name); }
  }
</script>

<figure class="story-graphic">
  <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Scroll story chart: ${view}`}>
    <!-- YEAR BARS -->
    <g class="layer" class:on={isYear} aria-hidden={!isYear}>
      <text x="130" y="70" class="chart-title">Public-street tows per year · snow-emergency slice</text>
      {#each story.annual as a, i (a.year)}
        {@const share = a.snowTows / a.publicStreetTows * 100}
        <g>
          <text x="112" y={150 + i * 110 + 34} class="axis-label big" text-anchor="end">{a.year}</text>
          <rect x="130" y={150 + i * 110} width={yearX(100) - 130} height="56" fill="#dbe6ee" />
          <rect class="grow-x" class:shown={view === 'year-slice'} x={yearX(100 - share)} y={150 + i * 110}
            width={yearX(share) - 130} height="56" fill={a.year === 2025 ? '#cc5a61' : '#2f7db8'} />
          <text x="140" y={150 + i * 110 + 34} class="bar-text">{fmt0.format(a.publicStreetTows)} tows</text>
          <text class="fade" class:shown={view === 'year-slice'} x={yearX(100 - share) - 8} y={150 + i * 110 + 34} text-anchor="end"
            font-weight="700" fill={a.year === 2025 ? '#a8343e' : '#1f5a8a'}>{fmt.format(share)}% snow</text>
        </g>
      {/each}
      <text x="130" y="500" class="note">Source: City Traffic &amp; Parking Services reports. 2025: {fmt0.format(story.annual[2].snowTows)} snow tows in {story.annual[2].snowEvents} storms.</text>
    </g>

    <!-- STORM TIMELINE -->
    <g class="layer" class:on={isStorms} aria-hidden={!isStorms}>
      <text x="70" y="70" class="chart-title">Tows per storm by rule day · 29 clean storms in date order</text>
      {#each [0, 500, 1000, 1500, 2000] as t}
        <line x1="70" x2="740" y1={stormGeo.y(t)} y2={stormGeo.y(t)} class="grid" />
        <text x="62" y={stormGeo.y(t) + 4} text-anchor="end" class="axis-label">{fmt0.format(t)}</text>
      {/each}
      {#each stormGeo.columns as c, i (c.id)}
        <g class="column" class:grown={isStorms} style={`transition-delay:${isStorms ? i * 18 : 0}ms`}
          role="button" tabindex={isStorms ? 0 : -1} aria-label={stormReadout(c)}
          onmouseenter={() => hover = stormReadout(c)} onfocus={() => hover = stormReadout(c)}>
          {#each c.segments as s}<rect x={c.x} y={s.y} width={c.width} height={s.h} fill={dayColor[s.day]} />{/each}
          <rect class="hit" x={c.x - 2} y="100" width={c.width + 4} height="330" fill="transparent" />
        </g>
        <rect class="fade" class:shown={view === 'storms-snow'} x={c.x} y="440" width={c.width} height="12" fill={snowColor(c.snowMm)} />
      {/each}
      {#if stormGeo.gapX}
        <line x1={stormGeo.gapX} x2={stormGeo.gapX} y1="300" y2="470" class="dash" />
        <text x={stormGeo.gapX} y="488" text-anchor="middle" class="note">3 storms quarantined</text>
      {/if}
      {#each seasonTicks as [w, x], i}<text x={x} y={(view === 'storms-snow' ? 470 : 452) + (w === '2025/26' ? 14 : 0)} text-anchor="middle" class="axis-label">{w}</text>{/each}
      <g class="fade" class:shown={view === 'storms-avg' || view === 'storms-snow'}>
        <line x1={early[0]?.x} x2={early.at(-1)?.x + early.at(-1)?.width} y1={stormGeo.y(earlyMean)} y2={stormGeo.y(earlyMean)} class="mean" />
        <line x1={late[0]?.x} x2={late.at(-1)?.x + late.at(-1)?.width} y1={stormGeo.y(lateMean)} y2={stormGeo.y(lateMean)} class="mean" />
        <text x={early[6]?.x} y={stormGeo.y(earlyMean) - 72} class="annot">avg {fmt0.format(earlyMean)} per storm · 2015–20</text>
        <text x={late[0]?.x} y={stormGeo.y(lateMean) - 70} class="annot">avg {fmt0.format(lateMean)} · 2022–25</text>
        <text x={late[0]?.x} y={stormGeo.y(lateMean) - 48} class="annot accent">−{fmt0.format((1 - lateMean / earlyMean) * 100)}%</text>
      </g>
      <g class="fade" class:shown={view === 'storms-snow'}>
        <text x="62" y="450" text-anchor="end" class="axis-label">snow</text>
        <text x="70" y="512" class="note">Snowfall bins (cm, Day 1 + two days before): &lt;13 · 13–20 · 20–27 · &gt;27. Darker = more snow. ρ(snowfall, tows) = {rho(story.totals.snowfallSpearman)}.</text>
      </g>
      <g class="legend-days">
        {#each [1, 2, 3] as d}<rect x={70 + (d - 1) * 150} y="84" width="12" height="12" fill={dayColor[d]} /><text x={88 + (d - 1) * 150} y="95" class="axis-label">{['Day 1 · routes', 'Day 2 · even side', 'Day 3 · odd side'][d - 1]}</text>{/each}
      </g>
    </g>

    <!-- MAP -->
    <g class="layer" class:on={isMap} aria-hidden={!isMap}>
      {#each areas as a (a.name)}
        <path class="area" d={a.d} fill={fillFor(a.row)}
          stroke={selected === a.name || (view === 'phillips' && (PHILLIPS.includes(a.name) || a.name === 'South Uptown')) ? '#cc5a61' : '#ffffff'}
          stroke-width={selected === a.name || (view === 'phillips' && (PHILLIPS.includes(a.name) || a.name === 'South Uptown')) ? 3 : 0.8}
          role="button" tabindex={isMap ? 0 : -1} aria-label={readoutFor(a.name)}
          onmouseenter={() => hover = readoutFor(a.name)} onfocus={() => hover = readoutFor(a.name)}
          onclick={() => pick(a.name)} onkeydown={(e) => keyPick(e, a.name)} />
      {/each}
      <text x="500" y="70" class="chart-title">{view === 'phillips' ? 'Snow tows per street-km' : metricInfo.title}</text>
      <foreignObject x="500" y="80" width="240" height="40">
        <div class="legend-bar" style={`background:${legendGradient}`}></div>
      </foreignObject>
      <text x="500" y="128" class="axis-label">{metricInfo.legend[0]}</text>
      <text x="740" y="128" class="axis-label" text-anchor="end">{metricInfo.legend[1]}</text>
      <text x="500" y="166" class="axis-label strong">{view === 'phillips' ? 'Phillips vs South Uptown' : metric === 'gap' ? 'Largest gains and losses' : 'Highest values'}</text>
      {#each mapList as h, i (h.name)}
        <text x="500" y={192 + i * 24} class="list-name" class:sel={selected === h.name}>{h.name.length > 24 ? h.name.slice(0, 23) + '…' : h.name}</text>
        <text x="740" y={192 + i * 24} text-anchor="end" class="list-val">
          {#if view === 'phillips'}{fmt0.format(h.snowTows)} tows{:else if metric === 'gap'}{signed(h.gap)} pp{:else}{fmt.format(h[metricInfo.key])}{metricInfo.unit}{/if}
        </text>
      {/each}
      <text x="500" y="370" class="note wrap">
        {#if view === 'phillips'}Similar density and renter share,<tspan x="500" dy="16">very different snow-tow counts.</tspan>{:else if metric === 'gap'}Snow share minus ordinary share.<tspan x="500" dy="16">Compare where, not how many.</tspan>{:else}Click a neighborhood to follow it<tspan x="500" dy="16">through the story and dashboard.</tspan>{/if}
      </text>
    </g>

    <!-- DUMBBELL -->
    <g class="layer" class:on={isDumbbell} aria-hidden={!isDumbbell}>
      <text x="40" y="70" class="chart-title">Share of snow tows vs share of ordinary tows · largest swings</text>
      <circle cx="300" cy="96" r="6" fill="#2f7db8" /><text x="312" y="101" class="axis-label">snow share</text>
      <circle cx="420" cy="96" r="6" fill="#8a9bad" /><text x="432" y="101" class="axis-label">ordinary share</text>
      {#each [0, 5, 10] as t}<line x1={dx(t)} x2={dx(t)} y1="114" y2="500" class="grid" /><text x={dx(t)} y="518" text-anchor="middle" class="axis-label">{t}%</text>{/each}
      {#each movers as h, i (h.name)}
        {@const yy = 136 + i * 36 + (i >= 6 ? 18 : 0)}
        <g class="row" class:sel={selected === h.name} role="button" tabindex={isDumbbell ? 0 : -1} aria-label={readoutFor(h.name)}
          onmouseenter={() => hover = readoutFor(h.name)} onfocus={() => hover = readoutFor(h.name)}
          onclick={() => pick(h.name)} onkeydown={(e) => keyPick(e, h.name)}>
          <rect x="40" y={yy - 16} width="700" height="32" fill="transparent" />
          <text x="284" y={yy + 5} text-anchor="end" class="row-name">{h.name.replace("Steven's Square - Loring Heights", 'Steven’s Square–Loring Hts')}</text>
          <line x1={dx(Math.min(h.snowShare, h.ordinaryShare))} x2={dx(Math.max(h.snowShare, h.ordinaryShare))} y1={yy} y2={yy} stroke="#b9d3e6" stroke-width="4" />
          <circle cx={dx(h.ordinaryShare)} cy={yy} r="7" fill="#8a9bad" />
          <circle cx={dx(h.snowShare)} cy={yy} r="7" fill="#2f7db8" />
          <text x="740" y={yy + 5} text-anchor="end" class="row-val" fill={h.gap >= 0 ? '#1f5a8a' : '#a35a2f'}>{signed(h.gap)}</text>
        </g>
      {/each}
      <line x1="40" x2="740" y1="352" y2="352" class="dash" />
    </g>

    <!-- SCATTER (dots travel from map centroids) -->
    <g class="layer on dots" aria-hidden={!isScatter}>
      <g class="fade" class:shown={isScatter}>
        <text x="80" y="70" class="chart-title">Snow tows per street-km vs {xAttr[xKey].replace(' (%)', '')}</text>
        {#each yTicks as t}<line x1="80" x2="560" y1={scatter.y(t)} y2={scatter.y(t)} class="grid" /><text x="72" y={scatter.y(t) + 4} text-anchor="end" class="axis-label">{t}</text>{/each}
        {#each scatter.xTicks as t}<text x={scatter.x(t)} y="490" text-anchor="middle" class="axis-label">{t}%</text>{/each}
        <text x="320" y="514" text-anchor="middle" class="axis-label strong">{xAttr[xKey]}</text>
        <text x="80" y="88" class="note">y: square-root scale · size = residents · color = storm share gap</text>
      </g>
      {#each areas as a (a.name)}
        {@const p = scatterByName.get(a.name)}
        {#if p}
          <circle class="dot" r={p.r} fill={GAP_COLORS[gapCategory(p.row.gap)]}
            stroke={selected === a.name ? '#cc5a61' : '#ffffff'} stroke-width={selected === a.name ? 3 : 1}
            style={`transform:translate(${isScatter ? p.x : a.cx}px, ${isScatter ? p.y : a.cy}px);opacity:${isScatter ? 0.88 : 0};pointer-events:${isScatter ? 'auto' : 'none'}`}
            role="button" tabindex={isScatter ? 0 : -1} aria-label={readoutFor(a.name)}
            onmouseenter={() => hover = readoutFor(a.name)} onfocus={() => hover = readoutFor(a.name)}
            onclick={() => pick(a.name)} onkeydown={(e) => keyPick(e, a.name)} />
        {/if}
      {/each}
      <g class="fade" class:shown={view === 'scatter-notes' || (isScatter && selected)}>
        {#each scatter.points.filter((p: any) => (view === 'scatter-notes' && noteNames.includes(p.name)) || p.name === selected) as p (p.name)}
          <text x={p.x > 470 ? p.x - p.r - 4 : p.x + p.r + 4} y={p.y + 4} text-anchor={p.x > 470 ? 'end' : 'start'} class="dot-label">{p.name.replace("Steven's Square - Loring Heights", 'Steven’s Square')}</text>
        {/each}
      </g>
      <g class="fade" class:shown={isScatter}>
        <text x="590" y="110" class="axis-label strong">ρ with tows per street-km</text>
        <text x="590" y="128" class="note">dot = ρ, bar = 95% interval</text>
        {#each story.associations as a, i (a.key)}
          {@const ax = linear(-0.4, 0.8, 590, 740)}
          <text x="590" y={160 + i * 44} class="note">{a.label.replace('Households without a vehicle', 'No vehicle').replace('People below poverty', 'Poverty').replace('Renter households', 'Renters').replace('Residents aged ', 'Age ').replace('Population density', 'Density')}</text>
          <line x1={ax(a.low)} x2={ax(a.high)} y1={172 + i * 44} y2={172 + i * 44} stroke={a.key === 'street_km' ? '#c9d3dd' : '#2f7db8'} stroke-width="5" stroke-linecap="round" />
          <circle cx={ax(a.rho)} cy={172 + i * 44} r="5" fill={a.key === 'street_km' ? '#8a9bad' : '#0b1d32'} />
          <text x="740" y={164 + i * 44} text-anchor="end" class="list-val">{rho(a.rho)}</text>
        {/each}
        <line x1={linear(-0.4, 0.8, 590, 740)(0)} x2={linear(-0.4, 0.8, 590, 740)(0)} y1="140" y2="420" class="dash" />
        <g>
          <circle cx="596" cy="452" r="6" fill={GAP_COLORS.gain} /><text x="608" y="456" class="note">gains ≥ 2 pp in storms</text>
          <circle cx="596" cy="474" r="6" fill={GAP_COLORS.loss} /><text x="608" y="478" class="note">loses ≥ 2 pp</text>
          <circle cx="596" cy="496" r="6" fill={GAP_COLORS.flat} /><text x="608" y="500" class="note">within 2 pp</text>
        </g>
      </g>
    </g>

    <!-- POVERTY GROUPS -->
    <g class="layer" class:on={isGroups} aria-hidden={!isGroups}>
      <text x="70" y="70" class="chart-title">Five poverty groups (about 17 neighborhoods each)</text>
      {#each [0, 10, 20, 30, 40] as t}<line x1="70" x2="560" y1={gy(t)} y2={gy(t)} class="grid" /><text x="62" y={gy(t) + 4} text-anchor="end" class="axis-label">{t}%</text>{/each}
      {#each story.povertyGroups as g, i (g.group)}
        {@const gx = 84 + i * 96}
        {#each [['streetShare', '#c9d3dd'], ['snowShare', '#2f7db8'], ['ordinaryShare', '#8a9bad']] as [key, color], j}
          <rect class="grow-y" class:shown={isGroups} style={`transition-delay:${isGroups ? (i * 3 + j) * 40 : 0}ms`}
            x={gx + j * 24} y={gy(g[key])} width="22" height={450 - gy(g[key])} fill={color} />
        {/each}
        <text x={gx + 35} y={gy(g.snowShare) - 6} text-anchor="middle" class="list-val">{fmt0.format(g.snowShare)}%</text>
        <text x={gx + 35} y="470" text-anchor="middle" class="axis-label strong">{groupNames[i]}</text>
        <text x={gx + 35} y="487" text-anchor="middle" class="note">{fmt0.format(g.povertyMin)}–{fmt0.format(g.povertyMax)}% poor</text>
      {/each}
      <g>
        <rect x="590" y="100" width="12" height="12" fill="#c9d3dd" /><text x="608" y="111" class="note">share of streets</text>
        <rect x="590" y="122" width="12" height="12" fill="#2f7db8" /><text x="608" y="133" class="note">share of snow tows</text>
        <rect x="590" y="144" width="12" height="12" fill="#8a9bad" /><text x="608" y="155" class="note">share of ordinary tows</text>
        <text x="590" y="196" class="axis-label strong">Snow tows per street-km</text>
        {#each story.povertyGroups as g, i (g.group)}
          <text x="590" y={222 + i * 24} class="list-name">{groupNames[i]}</text>
          <text x="740" y={222 + i * 24} text-anchor="end" class="list-val">{fmt.format(g.perStreetKm)}</text>
        {/each}
        <text x="590" y="370" class="note">Peak: the fourth group</text>
        <text x="590" y="386" class="note">(14–23% poverty), dense</text>
        <text x="590" y="402" class="note">renter corridors.</text>
      </g>
    </g>
  </svg>
  <figcaption class="readout" aria-live="polite">{hover || 'Hover, tap or tab to any mark for its exact values.'}</figcaption>
</figure>

<style>
  .story-graphic { margin: 0; background: #ffffff; border: 1px solid #d5e2ec; border-radius: 10px; padding: 10px 12px 12px; }
  svg { width: 100%; height: auto; display: block; overflow: visible; }
  .layer { opacity: 0; transition: opacity 500ms ease; pointer-events: none; }
  .layer.on { opacity: 1; pointer-events: auto; }
  .dots { pointer-events: auto; }
  .fade { opacity: 0; transition: opacity 500ms ease 150ms; }
  .fade.shown { opacity: 1; }
  .fade:not(.shown) { pointer-events: none; }
  .grow-x { transform-box: fill-box; transform-origin: right center; transform: scaleX(0); transition: transform 700ms ease; }
  .grow-x.shown { transform: scaleX(1); }
  .grow-y { transform-box: fill-box; transform-origin: center bottom; transform: scaleY(0); transition: transform 650ms ease; }
  .grow-y.shown { transform: scaleY(1); }
  .column { transform-box: view-box; transform-origin: 0 430px; transform: scaleY(0); transition: transform 650ms cubic-bezier(.2,.7,.2,1); cursor: pointer; outline: none; }
  .column.grown { transform: scaleY(1); }
  .column:hover rect:not(.hit), .column:focus-visible rect:not(.hit) { filter: brightness(1.15); }
  .area { transition: fill 600ms ease; cursor: pointer; outline: none; }
  .area:hover, .area:focus-visible { stroke: #0b1d32; stroke-width: 2; }
  .dot { transition: transform 900ms cubic-bezier(.3,.7,.2,1), opacity 500ms ease; cursor: pointer; outline: none; }
  .dot:hover, .dot:focus-visible { stroke: #0b1d32; stroke-width: 2.5; }
  .row { cursor: pointer; outline: none; }
  .row:hover rect, .row:focus-visible rect, .row.sel rect { fill: #eef5fb; }
  .grid { stroke: #e3ebf1; stroke-width: 1; }
  .dash { stroke: #8a9bad; stroke-width: 1; stroke-dasharray: 4 4; }
  .mean { stroke: #0b1d32; stroke-width: 2; stroke-dasharray: 8 4; }
  text { font-family: 'DM Sans', sans-serif; fill: #2b3f55; font-variant-numeric: tabular-nums; }
  .chart-title { font: 700 15px 'Space Grotesk', sans-serif; fill: #0b1d32; }
  .axis-label { font-size: 12px; fill: #4a6178; }
  .axis-label.big { font: 700 18px 'Space Grotesk', sans-serif; fill: #0b1d32; }
  .axis-label.strong { font-weight: 700; fill: #0b1d32; }
  .bar-text { font-size: 13px; fill: #2b3f55; }
  .note { font-size: 11.5px; fill: #5a6f86; }
  .annot { font-size: 13px; font-weight: 700; fill: #0b1d32; }
  .annot.accent { font: 700 22px 'Space Grotesk', sans-serif; fill: #cc5a61; }
  .list-name { font-size: 13px; fill: #0b1d32; }
  .list-name.sel { font-weight: 700; fill: #a8343e; }
  .list-val { font-size: 13px; font-weight: 700; fill: #0b1d32; }
  .row-name { font-size: 13px; fill: #0b1d32; }
  .row-val { font-size: 13px; font-weight: 700; }
  .dot-label { font-size: 12px; font-weight: 700; fill: #0b1d32; paint-order: stroke; stroke: #ffffff; stroke-width: 3px; }
  .legend-bar { height: 14px; border-radius: 3px; border: 1px solid #d5e2ec; margin-top: 8px; }
  .readout { min-height: 22px; margin-top: 6px; font-size: 13px; color: #2b3f55; }
  @media (prefers-reduced-motion: reduce) {
    .layer, .fade, .grow-x, .grow-y, .column, .area, .dot { transition: none !important; }
  }
</style>
