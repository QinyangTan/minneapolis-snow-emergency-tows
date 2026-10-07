<script>
  import { onMount } from 'svelte';
  import City from './lib/City.svelte';
  import { summarize } from './lib/model.js';
  import { eventById, globalCountMaximum, metricValue, concentration, neighborhoodHistory, profileSummary } from './lib/analysis.js';

  let collection=$state(null),geography=$state(null),water=$state(null),error=$state('');
  let eventId=$state('bridge-2025'),comparisonId=$state(''),comparisonOpen=$state(false),metric=$state('count');
  let day=$state(2),unfolded=$state(false),selected=$state(''),topView=$state(false);
  let canUnfold=$state(false),focusLeaders=$state(false),resetKey=$state(0),sort=$state('total');
  const rules=[
    {title:'The routes go first.',time:'Day 1 · Starts at 9 p.m.',text:'Snow Emergency routes are cleared first. Parking restrictions apply on both sides of those routes.'},
    {title:'Then the even side.',time:'Day 2 · Starts at 8 a.m.',text:'Restrictions move to the even-address side of non-emergency routes, and to parkways.'},
    {title:'Then the odd side.',time:'Day 3 · Starts at 8 a.m.',text:'Restrictions move to the odd-address side of non-emergency routes.'}
  ];
  let data=$derived(collection?eventById(collection,eventId):null);
  let comparison=$derived(collection&&comparisonId&&comparisonId!==eventId?eventById(collection,comparisonId):null);
  let current=$derived(data?summarize(data,selected,day):null);
  let comparisonCurrent=$derived(comparison?summarize(comparison,selected,day):null);
  let currentValue=$derived(current?metricValue(current,day,metric):null);
  let currentShare=$derived(current?metricValue(current,day,'share'):null);
  let cityShare=$derived(current&&data.event.dayTotals[day-1]?100*current.count/data.event.dayTotals[day-1]:null);
  let maxCount=$derived(collection?globalCountMaximum(collection):0);
  let sorted=$derived(data?[...data.neighborhoods].sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):total(b.counts)-total(a.counts)||a.name.localeCompare(b.name)):[]);
  let mappedToday=$derived(data?data.event.dayTotals[day-1]-data.quality.unmatchedByDay[day-1]:0);
  let peakText=$derived(current?current.peakDays.length?`Most records: ${daysText(current.peakDays)}${current.peakDays.length>1?' (tie)':''}.`:'No tow records in this event.':'');
  let topFive=$derived(data?concentration(data):null);
  let highlightIds=$derived(focusLeaders&&topFive?topFive.leaders.map(n=>n.id):[]);
  let history=$derived(collection&&selected?neighborhoodHistory(collection,selected):[]);
  let profile=$derived(collection&&selected?profileSummary(collection,selected):null);
  let recurringDay=$derived.by(()=>{
    if(!profile)return null;
    const maximum=Math.max(...profile.dominantDayCounts);
    const leaders=profile.dominantDayCounts.flatMap((count,i)=>count===maximum?[i+1]:[]);
    return maximum>0&&leaders.length===1?leaders[0]:null;
  });
  let exceptions=$derived(recurringDay?history.filter(row=>row.total>0&&!row.peakDays.includes(recurringDay)):[]);
  let cityPeakDays=$derived(data?data.event.dayTotals.flatMap((n,i)=>n===Math.max(...data.event.dayTotals)?[i+1]:[]):[]);
  let activeCsv=$derived(data?`data:text/csv;charset=utf-8,${encodeURIComponent(makeCsv(data))}`:'');

  function total(values){return values.reduce((a,b)=>a+b,0);}
  function percent(value){return value==null?'Undefined':`${value.toFixed(1)}%`;}
  function daysText(days){return days.map(d=>`Day ${d}`).join(' and ');}
  function date(value){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));}
  function weatherValue(value,unit){return value==null?'Not available':`${Number(value).toFixed(1)} ${unit}`;}
  function sourceName(name){return ({tows:'Official tow records',neighborhoods:'Official neighborhood boundaries',water:'Official water geometry'})[name]??name;}
  function makeCsv(dataset){
    const escape=value=>`"${String(value).replaceAll('"','""')}"`;
    const rows=[['Event','Start','End','Neighborhood','Day 1','Day 2','Day 3','Total'],...dataset.neighborhoods.map(n=>[dataset.event.name,dataset.event.start,dataset.event.end,n.name,...n.counts,total(n.counts)]),[dataset.event.name,dataset.event.start,dataset.event.end,'Unmatched records',...dataset.quality.unmatchedByDay,dataset.quality.unmatched],[dataset.event.name,dataset.event.start,dataset.event.end,'All published records',...dataset.event.dayTotals,dataset.event.total]];
    return rows.map(row=>row.map(escape).join(',')).join('\r\n');
  }
  onMount(()=>{
    const abort=new AbortController();
    Promise.all(['snow-emergencies.json','neighborhoods.geojson','water.geojson'].map(async file=>{
      const response=await fetch(`/data/${file}`,{signal:abort.signal});
      if(!response.ok)throw new Error('Data files could not be loaded.');return response.json();
    })).then(([datasets,regions,lakes])=>{
      collection=datasets;geography=regions;water=lakes;
      const initial=datasets.events.find(dataset=>dataset.event.name==='Bridge')??datasets.events.at(-1);
      eventId=initial.event.id;
      selected=initial.neighborhoods.find(n=>n.name==='Marcy Holmes')?.id??initial.neighborhoods[0].id;
    }).catch(e=>{if(e.name!=='AbortError')error='The data could not be loaded. Reload the page to try again.';});
    return ()=>abort.abort();
  });
  function select(id){selected=id;}
  function changeEvent(){if(comparisonId===eventId)comparisonId='';}
  function reset(){day=2;unfolded=false;topView=false;comparisonId='';comparisonOpen=false;metric='count';focusLeaders=false;resetKey+=1;selected=data.neighborhoods.find(n=>n.name==='Marcy Holmes')?.id??data.neighborhoods[0].id;}
  function inspect(id){selected=id;document.getElementById('controls')?.scrollIntoView({block:'center',behavior:'auto'});}
</script>

<svelte:head><title>Snow in Minneapolis | Tow records</title></svelte:head>
<a class="skip-link" href="#controls">Skip to map controls</a>
<header class="site-header">
  <a href="#story" class="wordmark" aria-label="Snow in Minneapolis, home"><svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3v24M4.6 9l20.8 12M4.6 21L25.4 9M11 5l4 4 4-4M11 25l4-4 4 4M5 13l5-1-1-5M25 17l-5 1 1 5M9 23l1-5-5-1M21 7l-1 5 5 1" /></svg><span>Minneapolis<br /><b>in winter</b></span></a>
  <nav aria-label="Page sections"><a href="#story">Map</a><a href="#history">Patterns</a><a href="#data">Data</a><a href="#sources">Sources</a></nav>
</header>

<main>
  <section id="story" class="story" class:unfolded={canUnfold&&(unfolded||!!comparison)} aria-labelledby="story-title">
    {#if data}
      <div class="event-controls" role="group" aria-label="Event and map metric">
        <label>Snow Emergency<select bind:value={eventId} onchange={changeEvent} aria-label="Snow Emergency event">{#each collection.events as dataset}<option value={dataset.event.id}>{dataset.event.name} · {date(dataset.event.start)}</option>{/each}</select></label>
        <div class="metric-picker" role="group" aria-label="Needle height metric"><span>Needle height</span><div><button class:active={metric==='count'} aria-pressed={metric==='count'} onclick={()=>metric='count'}>Count</button><button class:active={metric==='share'} aria-pressed={metric==='share'} onclick={()=>metric='share'}>Share</button></div></div>
        <details class="event-comparison" bind:open={comparisonOpen}><summary>{comparison?`Compare: ${comparison.event.name}`:'Compare events'}</summary><label>Second event<select bind:value={comparisonId} aria-label="Comparison event" onchange={()=>comparisonOpen=false}><option value="">None</option>{#each collection.events.filter(dataset=>dataset.event.id!==eventId) as dataset}<option value={dataset.event.id}>{dataset.event.name} · {date(dataset.event.start)}</option>{/each}</select></label></details>
      </div>
    {/if}
    <div class="surface">
      <div class="intro">
        <h1 id="story-title">Snow in <br />Minneapolis.</h1>
        <p class="thesis">Three days of parking rules.<br />{collection?.events.length??'Ten'} events of tow records.</p>
        {#if data}<p class="event-note"><time datetime={data.event.start}>{date(data.event.start)}</time> – <time datetime={data.event.end}>{date(data.event.end)}</time>{#if comparison}<br />Compared with {comparison.event.name} · {date(comparison.event.start)}{/if}</p>{/if}
        <div class="opening-caption"><span class="needle-key" aria-hidden="true"></span><p>One needle per neighborhood.<br /><strong>{metric==='count'?`Height = tow records · 0–${maxCount}`:'Height = share of its three-day total · 0–100%'}</strong></p></div>
        {#if canUnfold&&!comparison}<button class="open-comparison" onclick={()=>unfolded=!unfolded} aria-pressed={unfolded}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5l6 2 6-2 6 2v13l-6-2-6 2-6-2V5ZM9 7v13M15 5v13" /></svg>{unfolded?'Show one day':'Unfold three days'}</button>{/if}
      </div>
      <div class="visual">
        {#if data&&geography&&water}
          <City {data} {geography} {water} {day} unfolded={unfolded&&!comparison} {selected} {topView} {metric} maximum={maxCount} {comparison} {highlightIds} {resetKey} onselect={select} onlayout={wide=>{canUnfold=wide;if(!wide)unfolded=false;}} />
          <div class="view-controls"><button onclick={()=>topView=!topView} aria-pressed={topView} aria-label={topView?'Show angled view':'Show top view'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-5 9 5-9 5-9-5ZM3 14l9 5 9-5" /></svg>{topView?'Angled view':'Top view'}</button><button onclick={reset} aria-label="Reset map, day, metric and neighborhood"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" /></svg>Reset</button></div>
          <div class="scale-note"><span class="wide-note">Drag to rotate · Scroll to zoom</span><span class="narrow-note">Drag to rotate · Pinch to zoom</span><span class="mobile-legend">{metric==='count'?`Height = tow records · 0–${maxCount}`:'Height = three-day share · 0–100%'}</span></div>
        {:else}<div class="load-state" role="status">{error||'Loading the city and its records…'}</div>{/if}
      </div>
    </div>
    {#if data}
      <div id="controls" class="controls">
        <div class="days" role="group" aria-label="Snow Emergency day">{#each [1,2,3] as d}<button class:active={day===d} onclick={()=>day=d} aria-pressed={day===d} data-testid={`day-${d}`}><span>Day {d}</span><small>{data.event.dayTotals[d-1]} records</small></button>{/each}</div>
        <label class="neighborhood-picker">Neighborhood<select bind:value={selected} aria-label="Neighborhood">{#each data.neighborhoods as n}<option value={n.id}>{n.name}</option>{/each}</select></label>
        <p class="coverage"><strong>{mappedToday}</strong> mapped on Day {day}<br /><span>{data.quality.unmatchedByDay[day-1]} unmatched records</span></p>
      </div>
      {#if metric==='share'||(comparison&&!canUnfold)}<p class="metric-explanation">{#if metric==='share'}Share = day count ÷ neighborhood three-day total. Zero-total shares are undefined.{/if}{#if comparison&&!canUnfold} Map: {data.event.name}. Both events appear below.{/if}</p>{/if}
      <div class="inspection" aria-live="polite" aria-atomic="true" data-testid="inspection">
        {#if current}
          <div class="selected-title"><h2>{current.name}</h2><p>{peakText}</p></div>
          <div class="selected-count" class:share={metric==='share'}><b>{metric==='count'?current.count:percent(currentValue)}</b><span>{metric==='count'?`tow records on Day ${day}`:`of its three-day total on Day ${day}`}</span></div>
          <div class="day-profile" aria-label="Neighborhood three-day records">{#each current.counts as count,i}<div class:chosen={i+1===day}><small>Day {i+1}</small><strong>{count}</strong></div>{/each}</div>
          <div class="selected-share"><strong>{percent(currentShare)}</strong><span>of this neighborhood’s {current.total} three-day records</span><small>{percent(cityShare)} of the city’s {data.event.dayTotals[day-1]} Day {day} records</small></div>
        {/if}
      </div>
      {#if comparisonCurrent}<div class="comparison-detail" aria-live="polite"><h3>{comparison.event.name} · {date(comparison.event.start)}</h3><p><strong>{comparisonCurrent.count}</strong> records on Day {day} · <strong>{percent(metricValue(comparisonCurrent,day,'share'))}</strong> of this neighborhood’s {comparisonCurrent.total} three-day records.</p><p class="comparison-days">Day 1: {comparisonCurrent.counts[0]} · Day 2: {comparisonCurrent.counts[1]} · Day 3: {comparisonCurrent.counts[2]}{#if comparisonCurrent.peakDays.length} · Peak: {daysText(comparisonCurrent.peakDays)}{comparisonCurrent.peakDays.length>1?' (tie)':''}{:else} · No records{/if}</p></div>{/if}
      <div class="rule-context"><div><span>{rules[day-1].time}</span><h2>{rules[day-1].title}</h2></div><p>{rules[day-1].text} The City also allows parking once a street is fully plowed. This is a historical data view; <a href="https://www.minneapolismn.gov/getting-around/snow/snow-emergencies/snow-parking-rules/" target="_blank" rel="noreferrer">check the current official rules</a> before parking.</p></div>
    {/if}
  </section>

  {#if data&&topFive}
    <section class="reading" aria-labelledby="reading-title">
      <div><h2 id="reading-title">Where tows<br />gather.</h2><button class="focus-action" onclick={()=>{focusLeaders=!focusLeaders;document.getElementById('story')?.scrollIntoView({block:'start',behavior:'auto'});}} aria-pressed={focusLeaders}>{focusLeaders?'Clear highlights':'Show top five on map'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5l5 5-5 5" /></svg></button></div>
      <div class="reading-copy"><p>In {data.event.name}, <strong>{daysText(cityPeakDays)}</strong> {cityPeakDays.length>1?'tie for the largest citywide total':'has the largest citywide total'}. The five neighborhoods with the most three-day records account for <strong>{percent(topFive.share)}</strong> of all {topFive.denominator} published records.</p><ol class="leader-list">{#each topFive.leaders as n}<li><button onclick={()=>inspect(n.id)}>{n.name}</button><strong>{n.total}</strong><span>records</span></li>{/each}</ol><p class="interpretation">Top five: {topFive.records} records. City total includes {data.quality.unmatched} unmatched records. Counts do not measure individual tow risk.</p></div>
    </section>

    <section id="history" class="history-section" aria-labelledby="history-title">
      <div class="history-heading"><h2 id="history-title">Across<br />winters.</h2><div class="history-narrative"><h3>{current?.name}</h3>{#if profile}<p>{#if recurringDay}<strong>Day {recurringDay}</strong> is the sole peak in <strong>{profile.dominantDayCounts[recurringDay-1]} of {profile.recordedEvents}</strong> events with records.{:else}There is no single most frequent peak day across the {profile.recordedEvents} events with records.{/if} {profile.tieEvents} {profile.tieEvents===1?'event has':'events have'} tied peaks; {profile.emptyEvents} {profile.emptyEvents===1?'event has':'events have'} no records.</p>{#if exceptions.length}<p class="history-exceptions">Exceptions: {exceptions.map(row=>`${row.eventName} (${daysText(row.peakDays)}${row.peakDays.length>1?', tie':''})`).join('; ')}.</p>{:else if recurringDay}<p class="history-exceptions">Every recorded event includes Day {recurringDay} among its peak days.</p>{/if}<p class="history-note">{collection.events.length} selected events, not every Snow Emergency.</p>{/if}</div></div>
      <div class="table-scroll"><table class="history-table"><caption>Day count · share of neighborhood three-day total. Bars: 0–100%. Select an event to inspect. Scroll horizontally on small screens.</caption><thead><tr><th scope="col">Event</th><th scope="col">Day 1</th><th scope="col">Day 2</th><th scope="col">Day 3</th><th scope="col">Total</th><th scope="col">Peak day</th></tr></thead><tbody>{#each history as row}<tr class:selected-row={row.eventId===eventId}><th scope="row"><button onclick={()=>{eventId=row.eventId;changeEvent();document.getElementById('controls')?.scrollIntoView({block:'center',behavior:'auto'});}}>{row.eventName}</button><small>{date(row.start)}</small></th>{#each row.counts as count,i}<td class:peak-cell={row.peakDays.includes(i+1)}><span class="history-value">{count} <small>· {percent(row.shares?.[i])}</small></span><span class="share-track" aria-hidden="true"><span style={`width:${row.shares?.[i]??0}%`}></span></span></td>{/each}<td>{row.total}</td><td>{row.peakDays.length?`${row.peakDays.join(' / ')}${row.peakDays.length>1?' (tie)':''}`:'No records'}</td></tr>{/each}</tbody></table></div>
      {#if profile}<div class="profile-averages"><p><strong>Pooled share</strong><span>{(profile.pooledShares??[null,null,null]).map((value,i)=>`Day ${i+1}: ${percent(value)}`).join(' · ')}</span><small>All neighborhood records combined. Events with more records have more weight.</small></p><p><strong>Equal-event share</strong><span>{(profile.equalEventShares??[null,null,null]).map((value,i)=>`Day ${i+1}: ${percent(value)}`).join(' · ')}</span><small>Average of {profile.recordedEvents} nonempty event profiles. Each event has equal weight.</small></p></div>{/if}
    </section>

    <section class="weather-section" aria-labelledby="weather-title"><div><h2 id="weather-title">Snow &amp;<br />temperature.</h2><p>MSP station context, not neighborhood snowfall.</p></div><div class="weather-copy">{#if data.weather}<p>{data.event.name} · <strong>{date(data.weather.windowStart)} – {date(data.weather.windowEnd)}</strong> · start date and two days before.</p><dl class="weather-values"><div><dt>Three-day snowfall</dt><dd>{weatherValue(data.weather.snowfallMm,'mm')}{data.weather.traceDays?.length?' + trace':''}</dd></div><div><dt>Snow depth on {date(data.event.start)}</dt><dd>{weatherValue(data.weather.snowDepthMm,'mm')}</dd></div><div><dt>Start-date temperature</dt><dd>{weatherValue(data.weather.tminC,'°C')} to {weatherValue(data.weather.tmaxC,'°C')}</dd></div></dl><p class="weather-note">NOAA {data.weather.stationId} · {data.weather.status}. {#if data.weather.traceDays?.length} Trace snowfall was reported on {data.weather.traceDays.map(date).join(' and ')}; the sum includes measurable amounts only.{/if} Missing ≠ zero. Fixed window, not storm total. Weather does not establish cause.</p><a href={data.weather.sourceUrl} target="_blank" rel="noreferrer">NOAA daily observations</a>{:else}<p>Weather observations are not available for {data.event.name}. Missing observations are not zero.</p>{/if}{#if comparison}<p class="comparison-weather">{comparison.event.name} comparison: {comparison.weather?`${weatherValue(comparison.weather.snowfallMm,'mm')}${comparison.weather.traceDays?.length?' + trace':''} snowfall from ${date(comparison.weather.windowStart)} to ${date(comparison.weather.windowEnd)}. Station ${comparison.weather.stationId}.`:'weather observations not available.'}</p>{/if}</div></section>

    <section id="data" class="record-section" aria-labelledby="records-title"><div class="section-heading"><div><h2 id="records-title">The records.</h2><p>{data.neighborhoods.length} neighborhoods. {data.event.name}. The exact counts behind the map.</p></div><div class="download-links"><a class="download" href={activeCsv} download={`${data.event.id}-neighborhood-day-counts.csv`}>Download {data.event.name} counts<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5l5 5 5-5M4 17v4h16v-4" /></svg></a><a href="/data/all-neighborhood-day-counts.csv" download>Download all {collection.events.length} events</a></div></div><details><summary>View all neighborhood records</summary><label class="sort-label">Sort records<select bind:value={sort}><option value="total">Most records</option><option value="name">Neighborhood name</option></select></label><div class="table-scroll"><table><caption>{data.event.name}, {date(data.event.start)} – {date(data.event.end)}. Select a name to inspect it on the map.</caption><thead><tr><th scope="col">Neighborhood</th><th scope="col">Day 1</th><th scope="col">Day 2</th><th scope="col">Day 3</th><th scope="col">Total</th></tr></thead><tbody>{#each sorted as n}<tr class:selected-row={selected===n.id}><th scope="row"><button onclick={()=>inspect(n.id)}>{n.name}</button></th>{#each n.counts as count}<td>{count}</td>{/each}<td>{total(n.counts)}</td></tr>{/each}<tr class="unmatched-row"><th scope="row">Unmatched records</th>{#each data.quality.unmatchedByDay as count}<td>{count}</td>{/each}<td>{data.quality.unmatched}</td></tr></tbody><tfoot><tr><th scope="row">All published records</th>{#each data.event.dayTotals as count}<td>{count}</td>{/each}<td>{data.event.total}</td></tr></tfoot></table></div></details></section>

    <section id="sources" class="sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources &amp;<br />limits.</h2><div class="source-copy"><p>{data.event.name}: {data.quality.matched} of {data.event.total} published records matched current City neighborhood boundaries. The {data.quality.unmatched} unmatched records remain in city totals and do not appear as needles.</p><p>The publisher estimates 8–14% address error; we have not measured this sample’s error rate. Counts are neighborhood aggregates. Parking exposure and enforcement can affect them.</p><p>{collection.selectionNote} These historical records do not show current Snow Emergency conditions.</p><div class="source-links">{#each data.sources as source}<a href={source.url} target="_blank" rel="noreferrer">{sourceName(source.name)}</a>{/each}<a href="/data/snow-emergencies-provenance.json" target="_blank">Data preparation notes</a><a href="/data/snow-emergencies.json" target="_blank">All event data and provenance</a></div></div></section>
  {/if}
</main>
<footer><span>Snow in Minneapolis</span><span>A Minneapolis data story · CSCI 5609</span></footer>
