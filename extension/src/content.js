import {
  MINNEAPOLIS, parseCamera, coordinatesToPath, gradientFor, summarize
} from './geo.mjs';

const DEFAULTS={enabled:false,layerVisible:true,event:'all',day:0,opacity:0.42};
const rootId='csci5609-snow-maps-extension';
const DATA_URL='data/neighborhoods.geojson';
const SUMMARY_URL='data/summary.json';

if (window.top===window.self && !document.getElementById(rootId)) {
  boot().catch(error=>console.warn('[Snow Emergency overlay] initialization:',error));
}

async function boot(){
  const host=document.createElement('div');
  host.id=rootId;
  host.style.cssText='position:fixed;inset:0;z-index:2147483646;pointer-events:none;';
  const shadow=host.attachShadow({mode:'open'});
  const style=document.createElement('style');
  style.textContent=`:host{all:initial} .snow-panel{display:none}`;
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
      <button class="snow-close" type="button" aria-label="Close visualization" title="Hide extension">×</button>
    </header>
    <div class="snow-body">
      <div class="snow-kpis"><div><strong data-total>—</strong><span>citywide records</span></div>
        <div><strong data-mapped>—</strong><span>mapped to neighborhoods</span></div></div>
      <label class="snow-field">SNOW EMERGENCY
        <select data-event aria-label="Snow emergency event"></select>
      </label>
      <fieldset class="snow-days"><legend>DAY / PARKING RULE</legend>
        <button type="button" data-day="0" aria-pressed="true">All</button>
        <button type="button" data-day="1" aria-pressed="false">01</button>
        <button type="button" data-day="2" aria-pressed="false">02</button>
        <button type="button" data-day="3" aria-pressed="false">03</button>
      </fieldset>
      <div class="snow-switchrow">
        <label><input data-layer type="checkbox" checked> Show neighborhood layer</label>
        <output data-camera-status aria-live="polite">Initializing…</output>
      </div>
      <label class="snow-field snow-opacity">MAP LAYER OPACITY
        <input data-opacity type="range" min="0.15" max="0.85" step="0.05" value="0.42" aria-label="Neighborhood layer opacity"/>
      </label>
      <div class="snow-gradient">
        <span>0</span><div class="snow-gradient-bar" aria-hidden="true"></div><span data-maximum>—</span>
      </div>
      <div class="snow-insights">
        <div class="snow-section-head">HIGHEST RECORDED NEIGHBORHOOD COUNTS <span data-scope>ALL EVENTS</span></div>
        <div class="snow-leaders" data-leaders></div>
      </div>
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
    layer:dock.querySelector('[data-layer]'),
    opacity:dock.querySelector('[data-opacity]'),
    camera:dock.querySelector('[data-camera-status]'),
    maximum:dock.querySelector('[data-maximum]'),
    leaders:dock.querySelector('[data-leaders]'),
    scope:dock.querySelector('[data-scope]'),
    loadState:dock.querySelector('[data-load-state]')
  };

  let prefs={...DEFAULTS}, data=null, summary=null, dataPromise=null, previousKey='';
  // A third-party website exposes no documented live camera projection to this extension.
  // Prevent stale screen-space geometry during gestures and Maps SPA transitions.
  let motionPending=false, motionStartedAtUrl='', lastInteractionAt=0;
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
  function invalidateCamera() {
    if(!prefs.enabled||!prefs.layerVisible)return;
    if(!motionPending)motionStartedAtUrl=location.href;
    motionPending=true;
    lastInteractionAt=performance.now();
    previousKey='';
    ui.overlay.style.display='none';
    ui.camera.textContent='Map moving · awaiting updated coordinates';
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
  dock.querySelector('.snow-close').addEventListener('click',()=>store({enabled:false}));
  ui.event.addEventListener('change',()=>store({event:ui.event.value}));
  ui.layer.addEventListener('change',()=>store({layerVisible:ui.layer.checked}));
  ui.opacity.addEventListener('input',()=>store({opacity:Math.min(.85,Math.max(.15,Number(ui.opacity.value)))}));
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
  redraw(true);
  window.addEventListener('resize',()=>{
    invalidateCamera(); // A sidebar or canvas reflow can move the camera independently.
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
    return null; // Fail closed instead of attaching a geospatial layer to arbitrary DOM.
  }

  function drawPaths(camera,viewport,selected){
    const {rows,max}=selected;
    const geometry=document.createDocumentFragment();
    data.features.forEach((feature,index)=>{
      const pathText=coordinatesToPath(feature.geometry,camera,viewport);
      if(!pathText)return;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',pathText);
      path.setAttribute('fill',gradientFor(rows[index]?.count||0,max));
      path.setAttribute('stroke','#24455e');
      path.setAttribute('stroke-width','0.8');
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
    const selected=summarize(data,prefs.event,day);
    ui.event.value=prefs.event;
    ui.layer.checked=Boolean(prefs.layerVisible);
    ui.opacity.value=String(prefs.opacity);
    ui.total.textContent=Number(prefs.event==='all'
      ?(day===0?summary.total:summary.days.find(r=>r.day===day)?.count)
      :(day===0?summary.events.find(e=>e.id===prefs.event)?.total:summary.events.find(e=>e.id===prefs.event)?.days.find(r=>r.day===day)?.count)
      ||0).toLocaleString('en-US');
    ui.mapped.textContent=selected.mapped.toLocaleString('en-US');
    ui.maximum.textContent=selected.max.toLocaleString('en-US')+' records';
    ui.scope.textContent=(prefs.event==='all'?'9 EVENTS':prefs.event.toUpperCase())+' · '+(day===0?'ALL DAYS':'DAY '+day);
    for(const btn of dock.querySelectorAll('button[data-day]')){
      btn.setAttribute('aria-pressed',String(Number(btn.dataset.day)===day));
    }
    const newRows=document.createDocumentFragment();
    for(const row of selected.top){
      const item=document.createElement('div');item.className='snow-leader';
      const title=document.createElement('span');title.textContent=row.name;
      const count=document.createElement('strong');count.textContent=row.count.toLocaleString('en-US');
      item.append(title,count);newRows.append(item);
    }
    ui.leaders.replaceChildren(newRows);
    ui.loadState.textContent='5,423 selected source records · 68 unmapped citywide records';

    const camera=parseCamera(location.href);
    const viewport=findMapViewport();
    let reason='';
    const currentSignature=viewportSignature(viewport);
    // A map canvas relayout without a trustworthy new camera invalidates registration.
    if(currentSignature && lastViewportSignature && currentSignature!==lastViewportSignature) {
      invalidateCamera();
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
    else if(motionPending && location.href===motionStartedAtUrl)
      reason='Map moved, URL coordinates unchanged · overlay paused';
    else if(motionPending &&
      (time-lastInteractionAt<SETTLE_MS || time-lastUrlChangedAt<SETTLE_MS))
      reason='Waiting for settled map coordinates…';
    else if(lastUrlChangedAt && time-lastUrlChangedAt<SETTLE_MS)
      reason='Waiting for map transition…';
    if(reason){ui.camera.textContent=reason;ui.overlay.style.display='none';previousKey='';return}
    motionPending=false;
    const key=[location.href,viewport.left,viewport.top,viewport.width,viewport.height,prefs.event,day,prefs.opacity].join('|');
    if(force||key!==previousKey){
      drawPaths(camera,viewport,selected);
      previousKey=key;
    }
    ui.camera.textContent='2D overlay preview · verify alignment';
  }
}
