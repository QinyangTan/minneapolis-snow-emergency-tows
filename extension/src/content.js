import {
  MINNEAPOLIS, parseCamera, coordinatesToPath, gradientFor, summarize
} from './geo.mjs';
import {layerAnalysis,legendBands,colorClass,colorForObservation,
  HIGH_CONTRAST_COLORS,explainSelection} from './storyLayers.mjs';

const DEFAULTS={enabled:false,layerVisible:true,event:'all',day:0,neighborhood:'all',
  mode:'counts',recurrenceMetric:'any',topK:5,opacity:0.74};
const rootId='csci5609-snow-maps-extension';
const DATA_URL='data/neighborhoods.geojson';
const SUMMARY_URL='data/summary.json';

if (window.top===window.self && !document.getElementById(rootId)) {
  boot().catch(error=>console.warn('[Snow Emergency overlay] initialization:',error));
}

async function boot(){
  const host=document.createElement('div');
  host.id=rootId;
  // A zero-area host cannot cover Google Maps. Only the fixed HUD receives input.
  host.style.cssText='position:fixed;left:0;top:0;width:0;height:0;z-index:2147483646;pointer-events:none;';
  const shadow=host.attachShadow({mode:'open'});
  const style=document.createElement('style');
  style.textContent=`:host{all:initial;pointer-events:none!important} .snow-panel{display:none}`;
  shadow.append(style);
  const overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');
  overlay.setAttribute('class','snow-geo-overlay');
  overlay.setAttribute('aria-hidden','true');
  overlay.setAttribute('role','presentation');
  overlay.style.pointerEvents='none';
  shadow.append(overlay);

  const dock=document.createElement('section');
  dock.className='snow-panel';
  dock.setAttribute('aria-label','Minneapolis snow emergency visualization');
  dock.innerHTML=`
    <header class="snow-header">
      <div class="snow-mark" aria-hidden="true">✳</div>
      <div><div class="snow-eyebrow">MINNEAPOLIS / DATA STORIES</div>
        <h2>Snow Emergency Tows</h2></div>
      <button class="snow-minimize" type="button" aria-label="Collapse visualization controls" aria-expanded="true" title="Collapse controls">−</button>
      <button class="snow-close" type="button" aria-label="Close visualization" title="Hide extension">×</button>
    </header>
    <div class="snow-body">
      <div class="snow-question">EXPLORE A QUESTION</div>
      <div class="snow-view-tabs" role="group" aria-label="Visualization analysis mode">
        <button type="button" data-mode="counts" aria-pressed="true">Where are tows?</button>
        <button type="button" data-mode="recurrence" aria-pressed="false">Which areas repeat?</button>
      </div>
      <p class="snow-mode-hint" data-mode-hint aria-live="polite">Compare historical tow counts across neighborhoods and Days 1–3.</p>
      <section class="snow-legend" aria-label="Map data legend">
        <h3>MAP COLOR KEY <span data-legend-units>OBSERVED TOW RECORDS</span></h3>
        <div class="snow-legend-grid" data-legend></div>
        <p>Distinct ordered bands; fixed across comparable views. Gray means zero records, not missing data.</p>
      </section>
      <div class="snow-kpis"><div><strong data-total>—</strong><span data-total-label>citywide records</span></div>
        <div><strong data-mapped>—</strong><span data-mapped-label>mapped to neighborhoods</span></div></div>
      <label class="snow-field">SNOW EMERGENCY
        <select data-event aria-label="Snow emergency event"></select>
      </label>
      <fieldset class="snow-days"><legend>DAY / PARKING RULE</legend>
        <button type="button" data-day="0" aria-pressed="true">All</button>
        <button type="button" data-day="1" aria-pressed="false">01</button>
        <button type="button" data-day="2" aria-pressed="false">02</button>
        <button type="button" data-day="3" aria-pressed="false">03</button>
      </fieldset>
      <div class="snow-recurrence-rules" data-recurrence-rules hidden>
        <label class="snow-field">WHAT COUNTS AS RECURRING?
          <select data-recurrence-metric aria-label="Recurrence definition">
            <option value="any">Any record in the event (≥1)</option>
            <option value="prominent">Prominent neighborhood (Top K)</option>
          </select>
        </label>
        <label class="snow-field" data-topk-row hidden>TOP-K RANK THRESHOLD
          <select data-topk aria-label="Prominence Top K ranking">
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
          </select>
        </label>
        <p class="snow-rule-caption">Compares all 9 emergencies. Top K includes rank ties and requires at least 5 tow records in that event.</p>
      </div>
      <div class="snow-switchrow">
        <label><input data-layer type="checkbox" checked> Show neighborhood layer</label>
        <output data-camera-status aria-live="polite">Initializing…</output>
      </div>
      <label class="snow-field snow-opacity">MAP LAYER OPACITY
        <input data-opacity type="range" min="0.60" max="1" step="0.05" value="0.74" aria-label="Neighborhood layer opacity"/>
      </label>
      <label class="snow-field">INSPECT A NEIGHBORHOOD
        <select data-neighborhood aria-label="Select neighborhood for count inspection">
          <option value="all">All Minneapolis neighborhoods</option>
        </select>
      </label>
      <output class="snow-selected-count" data-neighborhood-count aria-live="polite"></output>
      <div class="snow-insights">
        <div class="snow-section-head"><span data-top-heading>HIGHEST RECORDED NEIGHBORHOOD COUNTS</span><span data-scope>ALL EVENTS</span></div>
        <div class="snow-leaders" data-leaders></div>
      </div>
      <section class="snow-story" aria-label="Evidence-backed interpretation">
        <h3 data-story-title>What the map reveals</h3>
        <p data-story-text aria-live="polite">Select an event or neighborhood to explore its records.</p>
        <div class="snow-day-compare" data-day-compare aria-label="Same-denominator three day comparison"></div>
      </section>
      <details class="snow-fingerprints">
        <summary>COMPARE ALL 9 EMERGENCIES <span>Day-share fingerprints</span></summary>
        <p>Each row is 100% of one event. The three colored segments compare timing; the number at right is the separate citywide event total. Select a row to explore its map.</p>
        <div class="snow-fingerprint-legend" aria-label="Fingerprint day color legend">
          <span><i style="background:#23638b"></i>Day 1</span>
          <span><i style="background:#dc663c"></i>Day 2</span>
          <span><i style="background:#8155a7"></i>Day 3</span>
        </div>
        <div data-fingerprints class="snow-fingerprint-list"></div>
      </details>
      <div class="snow-actions">
        <a data-recenter href="https://www.google.com/maps/@44.9778,-93.2650,12z" title="Center Google Maps on Minneapolis">Center Minneapolis ↗</a>
        <a href="https://qinyangtan.github.io/minneapolis-snow-emergency-tows-demo/" target="_blank" rel="noopener noreferrer">Full analysis ↗</a>
      </div>
      <p class="snow-warning">Research preview. Geography is projected from Google Maps' visible URL camera, not its private map engine. Confirm alignment before interpreting locations. Counts are historical recorded tows, <b>not parking or towing risk</b>.</p>
      <div class="snow-footer">Offline city aggregates · 9 events · 87 neighborhoods<br><span data-load-state></span></div>
    </div>`;
  shadow.append(dock);
  (document.body||document.documentElement).append(host);

  try{const css=await fetch(chrome.runtime.getURL('content.css')).then(r=>{if(!r.ok)throw Error('Missing CSS');return r.text()});style.textContent=css}
  catch(error){style.textContent+=`.snow-panel{font:14px system-ui;position:fixed;top:90px;right:15px;background:white;pointer-events:auto;padding:15px}`;console.warn(error)}

  const ui={
    host,shadow,dock,overlay,
    total:dock.querySelector('[data-total]'),
    mapped:dock.querySelector('[data-mapped]'),
    event:dock.querySelector('[data-event]'),
    neighborhood:dock.querySelector('[data-neighborhood]'),
    neighborhoodCount:dock.querySelector('[data-neighborhood-count]'),
    layer:dock.querySelector('[data-layer]'),
    opacity:dock.querySelector('[data-opacity]'),
    camera:dock.querySelector('[data-camera-status]'),
    legend:dock.querySelector('[data-legend]'),
    legendUnits:dock.querySelector('[data-legend-units]'),
    totalLabel:dock.querySelector('[data-total-label]'),
    mappedLabel:dock.querySelector('[data-mapped-label]'),
    modeHint:dock.querySelector('[data-mode-hint]'),
    recurrenceRules:dock.querySelector('[data-recurrence-rules]'),
    recurrenceMetric:dock.querySelector('[data-recurrence-metric]'),
    topK:dock.querySelector('[data-topk]'),
    topKRow:dock.querySelector('[data-topk-row]'),
    storyTitle:dock.querySelector('[data-story-title]'),
    storyText:dock.querySelector('[data-story-text]'),
    dayCompare:dock.querySelector('[data-day-compare]'),
    fingerprints:dock.querySelector('[data-fingerprints]'),
    topHeading:dock.querySelector('[data-top-heading]'),
    leaders:dock.querySelector('[data-leaders]'),
    scope:dock.querySelector('[data-scope]'),
    loadState:dock.querySelector('[data-load-state]')
  };

  let prefs={...DEFAULTS}, data=null, summary=null, dataPromise=null, previousKey='';
  let statsCacheKey='', statsCacheValue=null, previousPanelKey='';
  // A third-party website exposes no documented live camera projection to this extension.
  // Prevent stale screen-space geometry during gestures and Maps SPA transitions.
  let motionPending=false, motionStartedAtUrl='', lastInteractionAt=0, motionReason='gesture';
  let lastUrl=location.href, lastUrlChangedAt=0;
  let pointerStart=null, lastViewportSignature='';
  const SETTLE_MS=750;

  function viewportSignature(viewport) {
    return viewport ? [viewport.left,viewport.top,viewport.width,viewport.height].join(':') : '';
  }
  function hitMapSurface(event) {
    if(event.composedPath?.().includes(host))return false; // panel is interactive; never treat it as map.
    const r=findMapViewport();
    return Boolean(r && Number.isFinite(event.clientX) && Number.isFinite(event.clientY) &&
      event.clientX>=r.left && event.clientX<=r.left+r.width &&
      event.clientY>=r.top && event.clientY<=r.top+r.height);
  }
  function invalidateCamera(reason='gesture') {
    if(!prefs.enabled||!prefs.layerVisible)return;
    if(!motionPending)motionStartedAtUrl=location.href;
    // A resize/layout event must never override a more uncertain drag or zoom.
    if(!motionPending || reason==='gesture') motionReason=reason;
    motionPending=true;
    lastInteractionAt=performance.now();
    previousKey='';
    ui.overlay.style.display='none';
    ui.camera.textContent=reason==='layout'?'Map layout settling…':
      'Map moving · awaiting updated coordinates';
  }
  document.addEventListener('pointerdown',event=>{
    if(hitMapSurface(event))pointerStart={id:event.pointerId,x:event.clientX,y:event.clientY};
  },{capture:true,passive:true});
  document.addEventListener('pointermove',event=>{
    if(!pointerStart||pointerStart.id!==event.pointerId)return;
    if(Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>6){
      invalidateCamera();
    }
  },{capture:true,passive:true});
  for(const eventName of ['pointerup','pointercancel']){
    document.addEventListener(eventName,()=>{pointerStart=null;},{capture:true,passive:true});
  }
  document.addEventListener('wheel',event=>{
    if(hitMapSurface(event))invalidateCamera();
  },{capture:true,passive:true});
  document.addEventListener('touchmove',event=>{
    if(event.touches.length>=2 && event.touches[0] &&
       hitMapSurface({clientX:event.touches[0].clientX,clientY:event.touches[0].clientY,
         composedPath:()=>event.composedPath?.()||[]})) invalidateCamera();
  },{capture:true,passive:true});
  document.addEventListener('keydown',event=>{
    if(!['+','-','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
    const target=event.target;
    if(target instanceof Element &&
      target.closest('canvas.widget-scene-canvas, #scene, .widget-scene, [aria-label="Map"]'))invalidateCamera();
  },{capture:true,passive:true});
  const store=(changes)=>chrome.storage.local.set(changes);
  const minimizeButton=dock.querySelector('.snow-minimize');
  minimizeButton.addEventListener('click',()=>{
    const collapsed=dock.classList.toggle('snow-collapsed');
    minimizeButton.setAttribute('aria-label',collapsed?'Expand visualization controls':'Collapse visualization controls');
    minimizeButton.setAttribute('aria-expanded',String(!collapsed));
    minimizeButton.textContent=collapsed?'+':'−';
    minimizeButton.title=collapsed?'Expand controls':'Collapse controls';
  });
  dock.querySelector('.snow-close').addEventListener('click',()=>store({enabled:false}));
  for(const button of dock.querySelectorAll('[data-mode]')){
    button.addEventListener('click',()=>store({mode:button.dataset.mode}));
  }
  ui.recurrenceMetric.addEventListener('change',()=>store({recurrenceMetric:ui.recurrenceMetric.value}));
  ui.topK.addEventListener('change',()=>store({topK:Number(ui.topK.value)}));
  ui.event.addEventListener('change',()=>store({event:ui.event.value}));
  ui.neighborhood.addEventListener('change',()=>store({neighborhood:ui.neighborhood.value}));
  ui.layer.addEventListener('change',()=>store({layerVisible:ui.layer.checked}));
  ui.opacity.addEventListener('input',()=>store({opacity:Math.min(1,Math.max(.60,Number(ui.opacity.value)))}));
  for(const button of dock.querySelectorAll('button[data-day]')){
    button.addEventListener('click',()=>store({day:Number(button.dataset.day)}));
  }

  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local')return;
    for(const key of Object.keys(DEFAULTS))if(changes[key])prefs[key]=changes[key].newValue;
    redraw(true);
  });

  const stored=await chrome.storage.local.get(DEFAULTS);
  prefs={...DEFAULTS,...stored};
  // Upgrade path: v0.1 saved very low opacity values (e.g. 0.42), which
  // undermine the v0.2 high-contrast legend. Preserve valid user choices.
  if(!Number.isFinite(Number(prefs.opacity))||Number(prefs.opacity)<0.60 ||
      Number(prefs.opacity)>1){
    prefs.opacity=DEFAULTS.opacity;
    await chrome.storage.local.set({opacity:prefs.opacity});
  }
  redraw(true);
  window.addEventListener('resize',()=>{
    invalidateCamera('layout'); // Reproject against the resized viewport after settling.
    redraw(true);
  },{passive:true});
  window.addEventListener('popstate',()=>redraw(true));
  // Google Maps is an SPA: the URL may not update in step with an animated map movement.
  setInterval(()=>{
    if(!prefs.enabled)return;
    if(location.href!==lastUrl){
      lastUrl=location.href;
      lastUrlChangedAt=performance.now();
      redraw(true);
    } else redraw(false);
  },400);

  async function loadData(){
    if(dataPromise)return dataPromise;
    dataPromise=(async()=>{
      const [geoResponse,sumResponse]=await Promise.all([
        fetch(chrome.runtime.getURL(DATA_URL)),
        fetch(chrome.runtime.getURL(SUMMARY_URL))
      ]);
      if(!geoResponse.ok||!sumResponse.ok)throw Error('Packaged official City data is unavailable');
      const [geography,overview]=await Promise.all([geoResponse.json(),sumResponse.json()]);
      if(geography.type!=='FeatureCollection'||geography.features?.length!==87||
         overview.status!=='recomputed-official-arcgis'||overview.events?.length!==9){
        throw Error('Unexpected City dataset; refused to draw unvalidated geography');
      }
      data=geography;summary=overview;
      while(ui.event.firstChild)ui.event.firstChild.remove();
      for(const entry of [{id:'all',season:'',label:'All nine emergencies'},...summary.events]){
        const option=document.createElement('option');
        option.value=entry.id;
        option.textContent=entry.label||entry.id+' · '+entry.season;
        ui.event.append(option);
      }
      for(const feature of [...geography.features].sort((a,b)=>
        a.properties.name.localeCompare(b.properties.name))){
        const option=document.createElement('option');
        option.value=feature.properties.name;
        option.textContent=feature.properties.name;
        ui.neighborhood.append(option);
      }
      const fingerprintList=document.createDocumentFragment();
      for(const event of overview.events){
        const button=document.createElement('button');
        button.type='button';button.className='snow-fingerprint';
        button.dataset.fingerprintEvent=event.id;
        button.setAttribute('aria-pressed','false');
        const head=document.createElement('div');head.className='snow-fingerprint-head';
        const title=document.createElement('span');title.textContent=event.id+' · '+event.season;
        const count=document.createElement('strong');count.textContent=event.total.toLocaleString('en-US')+' records';
        head.append(title,count);
        const bar=document.createElement('div');bar.className='snow-fingerprint-track';
        const shares=[];
        for(const entry of event.days){
          const share=event.total>0?100*entry.count/event.total:0;
          shares.push('Day '+entry.day+' '+share.toFixed(1)+'%');
          const segment=document.createElement('span');
          segment.className='snow-fingerprint-segment';
          segment.style.width=share.toFixed(4)+'%';
          segment.style.backgroundColor=['','#23638b','#dc663c','#8155a7'][entry.day];
          bar.append(segment);
        }
        button.setAttribute('aria-label',event.id+', '+event.season+', '+
          event.total+' citywide records: '+shares.join('; ')+'. Select event map.');
        button.append(head,bar);button.addEventListener('click',()=>
          store({mode:'counts',event:event.id,day:0}));
        fingerprintList.append(button);
      }
      ui.fingerprints.replaceChildren(fingerprintList);
    })();
    try{await dataPromise;}catch(error){dataPromise=null;throw error}
  }

  function findMapViewport(){
    const plausible=r=>r.width>=280&&r.height>=260&&r.width<=innerWidth+25&&
      r.height<=innerHeight+25&&r.bottom>0&&r.right>0;
    const convert=r=>({left:Math.max(0,r.left),top:Math.max(0,r.top),
      width:Math.min(innerWidth-Math.max(0,r.left),r.width),
      height:Math.min(innerHeight-Math.max(0,r.top),r.height)});
    const knownSelectors='canvas.widget-scene-canvas, #scene, .widget-scene, [aria-label="Map"]';
    const scene=Array.from(document.querySelectorAll(knownSelectors))
      .filter(node=>!host.contains(node)).map(node=>node.getBoundingClientRect()).filter(plausible);
    if(scene.length)return convert(scene[0]);

    // October 2026 live Google Maps uses two identical viewport-sized WebGL canvases
    // rather than legacy #scene/widget-scene nodes. A single large canvas is NOT
    // sufficient: require two distinct, almost-identically placed canvas rectangles.
    const candidates=Array.from(document.querySelectorAll('canvas'))
      .filter(node=>!host.contains(node))
      .map(node=>node.getBoundingClientRect())
      .filter(r=>plausible(r)&&r.width>=innerWidth*.6&&r.height>=innerHeight*.6);
    for(let i=0;i<candidates.length;i++){
      const a=candidates[i];
      if(candidates.some((b,j)=>i!==j&&Math.abs(a.left-b.left)<=3&&
           Math.abs(a.top-b.top)<=3&&Math.abs(a.width-b.width)<=3&&
           Math.abs(a.height-b.height)<=3)){
        return convert(a);
      }
    }
    // Google Maps' raster/2D fallback on Linux can expose ONE oversized
    // mAWRAc canvas, not the paired WebGL canvases seen on macOS. It is only
    // trusted when native Maps search AND zoom controls are simultaneously
    // present, the current URL contains a valid camera, and the rendered
    // canvas intersects most of the visible viewport. Generic single-canvas
    // pages remain unsupported.
    const hasNativeControls=Boolean(
      document.querySelector('button[aria-label="Zoom in"]') &&
      document.querySelector('button[aria-label="Zoom out"]') &&
      document.querySelector('[aria-label="Search"]')
    );
    if(hasNativeControls && parseCamera(location.href)){
      const canvases=Array.from(document.querySelectorAll('canvas'))
        .filter(node=>!host.contains(node))
        .map(node=>node.getBoundingClientRect());
      for(const r of canvases){
        const visibleWidth=Math.max(0,Math.min(innerWidth,r.right)-Math.max(0,r.left));
        const visibleHeight=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));
        if(visibleWidth>=innerWidth*.8 && visibleHeight>=innerHeight*.8 &&
            r.width>=innerWidth*.8 && r.height>=innerHeight*.8){
          // Oversized canvas includes raster buffer padding; URL camera is
          // assumed to reference visible viewport, not the offscreen buffer.
          return {left:0,top:0,width:innerWidth,height:innerHeight};
        }
      }
    }
    return null; // Fail closed instead of attaching a layer to unverified DOM.
  }

  function drawPaths(camera,viewport,selected){
    const {rows,max}=selected;
    const geometry=document.createDocumentFragment();
    data.features.forEach((feature,index)=>{
      const pathText=coordinatesToPath(feature.geometry,camera,viewport);
      if(!pathText)return;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',pathText);
      path.setAttribute('fill',colorForObservation(rows[index]?.count||0,prefs.mode));
      path.setAttribute('data-band',String(colorClass(rows[index]?.count||0,prefs.mode)));
      const focused=feature.properties.name===prefs.neighborhood;
      path.setAttribute('stroke',focused?'#0a1325':'#ffffff');
      path.setAttribute('stroke-width',focused?'3.2':'1.2');
      path.setAttribute('fill-rule','evenodd');
      path.setAttribute('vector-effect','non-scaling-stroke');
      geometry.append(path);
    });
    ui.overlay.replaceChildren(geometry);
    ui.overlay.setAttribute('viewBox',`0 0 ${viewport.width} ${viewport.height}`);
    Object.assign(ui.overlay.style,{
      display:'block',position:'fixed',left:viewport.left+'px',top:viewport.top+'px',
      width:viewport.width+'px',height:viewport.height+'px',
      opacity:String(prefs.opacity),overflow:'hidden',pointerEvents:'none'
    });
  }

  function redraw(force){
    ui.dock.style.display=prefs.enabled?'block':'none';
    if(!prefs.enabled){ui.overlay.style.display='none';previousKey='';return}
    if(!data){
      ui.camera.textContent='Loading City data…';
      ui.overlay.style.display='none';
      loadData().then(()=>redraw(true)).catch(error=>{
        ui.camera.textContent='Data unavailable';
        ui.loadState.textContent=error.message;
      });
      return;
    }
    // Never interpolate unfamiliar event ids against an unrelated dataset.
    if(prefs.event!=='all'&&!summary.events.some(e=>e.id===prefs.event)){
      prefs.event='all';store({event:'all'});return;
    }
    const day=Number(prefs.day);
    if(![0,1,2,3].includes(day)){prefs.day=0;store({day:0});return}
    if(!['counts','recurrence'].includes(prefs.mode)){
      prefs.mode='counts';store({mode:'counts'});return;
    }
    if(!['any','prominent'].includes(prefs.recurrenceMetric)){
      prefs.recurrenceMetric='any';store({recurrenceMetric:'any'});return;
    }
    if(![5,10,15].includes(Number(prefs.topK))){
      prefs.topK=5;store({topK:5});return;
    }
    const dataScopeKey=[prefs.mode,prefs.event,day,prefs.recurrenceMetric,prefs.topK].join('|');
    const selected=statsCacheKey===dataScopeKey ? statsCacheValue :
      layerAnalysis(data,summary,prefs);
    if(statsCacheKey!==dataScopeKey){statsCacheKey=dataScopeKey;statsCacheValue=selected;}
    const panelKey=dataScopeKey+'|'+prefs.neighborhood+'|'+prefs.opacity+'|'+prefs.layerVisible;
    if(force || previousPanelKey!==panelKey){
      if(prefs.neighborhood!=='all'&&!selected.rows.some(r=>r.name===prefs.neighborhood)){
        prefs.neighborhood='all';store({neighborhood:'all'});return;
      }
      for(const button of dock.querySelectorAll('button[data-mode]')){
        button.setAttribute('aria-pressed',String(button.dataset.mode===prefs.mode));
      }
      const leading=selected.top[0];
      ui.modeHint.textContent=leading ?
        (prefs.mode==='counts'
          ?'DATA INSIGHT · '+leading.name+' has the highest mapped count here ('+
            leading.count.toLocaleString('en-US')+'). Compare the three days below.'
          :'DATA INSIGHT · '+leading.name+' meets this recurrence rule in '+
            leading.count+' of 9 emergencies. Try Any Record vs Top K to compare.')
        :'No recorded data for the selected view.';
      ui.recurrenceRules.hidden=prefs.mode!=='recurrence';
      ui.event.disabled=prefs.mode==='recurrence';
      ui.event.title=prefs.mode==='recurrence'?'Recurrence compares all nine events': '';
      ui.recurrenceMetric.value=prefs.recurrenceMetric;
      ui.topK.value=String(prefs.topK);
      ui.topKRow.hidden=prefs.recurrenceMetric!=='prominent';
      ui.event.value=prefs.event;
      for(const button of ui.fingerprints.querySelectorAll('button[data-fingerprint-event]')){
        button.setAttribute('aria-pressed',String(prefs.mode==='counts' &&
          button.dataset.fingerprintEvent===prefs.event));
      }
      ui.neighborhood.value=prefs.neighborhood;
      ui.layer.checked=Boolean(prefs.layerVisible);
      ui.opacity.value=String(prefs.opacity);
      const focused=selected.rows.find(row=>row.name===prefs.neighborhood);
      ui.neighborhoodCount.textContent=focused
        ?focused.name+': '+focused.count.toLocaleString('en-US')+' '+
          (prefs.mode==='counts'?'observed tow records':'qualifying emergencies of 9')+
          '. This does not measure parking risk.'
        :'Choose a neighborhood to inspect its exact '+selected.measure+'.';
      ui.total.textContent=selected.headline.primary.toLocaleString('en-US');
      ui.mapped.textContent=selected.headline.secondary.toLocaleString('en-US');
      ui.totalLabel.textContent=selected.headline.primaryLabel;
      ui.mappedLabel.textContent=selected.headline.secondaryLabel;
      ui.legendUnits.textContent=prefs.mode==='counts'?'TOW RECORDS':'QUALIFYING EVENTS / 9';
      ui.scope.textContent=(prefs.mode==='recurrence'?'9 EVENTS':
        (prefs.event==='all'?'9 EVENTS':prefs.event.toUpperCase()))+
        ' · '+(day===0?'ALL DAYS':'DAY '+day);
      ui.topHeading.textContent=prefs.mode==='counts'?
        'MOST OBSERVED TOW RECORDS':'MOST RECURRING NEIGHBORHOODS';
      for(const button of dock.querySelectorAll('button[data-day]')){
        button.setAttribute('aria-pressed',String(Number(button.dataset.day)===day));
      }
      const legend=document.createDocumentFragment();
      legendBands(prefs.mode).forEach((band,index)=>{
        const item=document.createElement('div');item.className='snow-legend-item';
        const swatch=document.createElement('span');swatch.className='snow-color-swatch';
        swatch.style.backgroundColor=HIGH_CONTRAST_COLORS[index];
        swatch.setAttribute('aria-hidden','true');
        const name=document.createElement('span');name.textContent=band.label;
        item.append(swatch,name);legend.append(item);
      });
      ui.legend.replaceChildren(legend);
      const newRows=document.createDocumentFragment();
      for(const row of selected.top){
        const item=document.createElement('div');
        item.className='snow-leader'+(row.name===prefs.neighborhood?' snow-leader-selected':'');
        const header=document.createElement('div');header.className='snow-leader-line';
        const name=document.createElement('span');name.textContent=row.name;
        const value=document.createElement('strong');value.textContent=row.count.toLocaleString('en-US');
        header.append(name,value);
        const bar=document.createElement('div');bar.className='snow-rank-track';
        const fill=document.createElement('span');fill.className='snow-rank-fill';
        fill.style.width=(100*row.count/Math.max(1,selected.max)).toFixed(1)+'%';
        fill.style.backgroundColor=colorForObservation(row.count,prefs.mode);
        bar.append(fill);item.append(header,bar);newRows.append(item);
      }
      ui.leaders.replaceChildren(newRows);
      ui.storyTitle.textContent=prefs.mode==='counts'?'READ THE MAP / Where is the concentration?':
        'READ THE MAP / How often does an area recur?';
      ui.storyText.textContent=explainSelection(selected,summary,prefs.neighborhood,
        prefs.recurrenceMetric,Number(prefs.topK));
      ui.dayCompare.replaceChildren();
      ui.dayCompare.hidden=prefs.mode!=='counts';
      if(prefs.mode==='counts'){
        const eventRow=prefs.event==='all'?summary:summary.events.find(e=>e.id===prefs.event);
        const maxDay=Math.max(1,...eventRow.days.map(d=>d.count));
        const label=document.createElement('strong');label.className='snow-day-label';
        label.textContent='SAME EVENT · DAY 1–3 COMPARISON';
        ui.dayCompare.append(label);
        for(const d of eventRow.days){
          const row=document.createElement('div');row.className='snow-day-row';
          const dayLabel=document.createElement('span');dayLabel.textContent='Day '+d.day;
          const track=document.createElement('div');track.className='snow-day-track';
          const fill=document.createElement('span');fill.style.width=(100*d.count/maxDay).toFixed(1)+'%';
          fill.style.backgroundColor=['','#23638b','#dc663c','#8155a7'][d.day];
          track.append(fill);
          const count=document.createElement('strong');
          count.textContent=d.count.toLocaleString('en-US')+' · '+(100*d.count/eventRow.total).toFixed(1)+'%';
          row.append(dayLabel,track,count);ui.dayCompare.append(row);
        }
      }
      ui.loadState.textContent='Historic official City aggregates · 68 citywide records without a mapped neighborhood.';
      previousPanelKey=panelKey;
    }

    const camera=parseCamera(location.href);
    const viewport=findMapViewport();
    let reason='';
    const currentSignature=viewportSignature(viewport);
    // A map canvas relayout without a trustworthy new camera invalidates registration.
    if(currentSignature && lastViewportSignature && currentSignature!==lastViewportSignature) {
      invalidateCamera('layout');
    }
    if(currentSignature)lastViewportSignature=currentSignature;
    const time=performance.now();
    // On an unobserved programmatic navigation, wait for the map to settle too.
    if(location.href!==lastUrl){
      lastUrl=location.href;
      lastUrlChangedAt=time;
    }
    if(!prefs.layerVisible)reason='Overlay off';
    else if(!camera)reason='Center the map · coordinates not visible';
    else if(!camera.northUp2D)reason='Tilted/rotated map · use 2D north-up';
    else if(Math.abs(camera.lat-MINNEAPOLIS.lat)>1.2||Math.abs(camera.lng-MINNEAPOLIS.lng)>1.9)
      reason='Navigate to Minneapolis to see the layer';
    else if(!viewport)reason='Map canvas not detected · overlay paused';
    else if(motionPending && motionReason==='gesture' &&
      location.href===motionStartedAtUrl)
      reason='Map moved, URL coordinates unchanged · overlay paused';
    else if(motionPending &&
      (time-lastInteractionAt<SETTLE_MS || time-lastUrlChangedAt<SETTLE_MS))
      reason='Waiting for settled map coordinates…';
    else if(lastUrlChangedAt && time-lastUrlChangedAt<SETTLE_MS)
      reason='Waiting for map transition…';
    if(reason){ui.camera.textContent=reason;ui.overlay.style.display='none';previousKey='';return}
    motionPending=false;
    const key=[location.href,viewport.left,viewport.top,viewport.width,viewport.height,prefs.event,day,prefs.mode,prefs.recurrenceMetric,prefs.topK,prefs.neighborhood,prefs.opacity].join('|');
    if(force||key!==previousKey){
      drawPaths(camera,viewport,selected);
      previousKey=key;
    }
    ui.camera.textContent='2D overlay preview · verify alignment';
  }
}
