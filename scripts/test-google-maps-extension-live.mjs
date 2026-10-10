/**
 * ACTUAL Google Maps smoke test. Unlike the offline fixture suite, no requests to
 * Google Maps are intercepted or replaced. Do not claim pixel-registration from
 * this test; it validates the critical native map experience and overlay lifecycle.
 */
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const ext=resolve(root,'build/google-maps-extension');
const profile=mkdtempSync(join(tmpdir(),'5609-real-gmaps-'));
const maps='https://www.google.com/maps/@44.9778,-93.265,12z';
let browser;
const assert=(ok,message)=>{if(!ok)throw new Error(message)};
const contextDescription=()=>({source:'REAL Google Maps: no mocks, no route interception',timestamp:new Date().toISOString()});
try{
  browser=await chromium.launchPersistentContext(profile,{
    channel:'chromium',headless:process.env.GMAPS_HEADED!=='1',viewport:{width:1200,height:850},
    args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`, '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader']
  });
  const worker=browser.serviceWorkers()[0]||await browser.waitForEvent('serviceworker',{timeout:20000});
  await worker.evaluate(()=>chrome.storage.local.set({enabled:true}));
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e).slice(0,250)));
  await page.goto(maps,{waitUntil:'domcontentloaded',timeout:60000});
  try {
    await page.waitForFunction(()=>{
      const mapReady=Boolean(document.querySelector('button[aria-label="Zoom in"]') &&
        document.querySelector('button[aria-label="Zoom out"]') &&
        document.querySelector('[aria-label="Search"]'));
      const viewportCanvas=[...document.querySelectorAll('canvas')].some(c=>{
        const r=c.getBoundingClientRect();
        return r.width>=innerWidth*.8&&r.height>=innerHeight*.8;
      });
      return mapReady&&viewportCanvas &&
        document.querySelector('#csci5609-snow-maps-extension');
    },null,{timeout:70000});
  } catch (e) {
    const diagnostics=await page.evaluate(()=>({
      url:location.href,title:document.title,bodyText:document.body?.innerText?.slice(0,1400),
      viewport:{width:innerWidth,height:innerHeight},canvases:[...document.querySelectorAll('canvas')].map(x=>{
        const r=x.getBoundingClientRect();
        return {left:r.left,top:r.top,width:r.width,height:r.height,className:x.className};
      }),
      appPresent:Boolean(document.getElementById('csci5609-snow-maps-extension')),
      mapControls:[...document.querySelectorAll('button[aria-label]')].map(x=>x.getAttribute('aria-label')).filter(x=>/zoom|search|directions/i.test(x)).slice(0,12)
    }));
    console.error('Live map load diagnostics:',JSON.stringify(diagnostics));
    mkdirSync('artifacts',{recursive:true});
    try{await page.screenshot({path:'artifacts/real-maps-diagnostic.png',fullPage:false,timeout:15000})}catch{}
    throw e;
  }
  const host=page.locator('#csci5609-snow-maps-extension');
  await host.waitFor({state:'attached',timeout:15000});
  const panel=host.locator('.snow-panel');
  await panel.waitFor({state:'visible',timeout:18000});
  const state=()=>page.evaluate(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    const overlay=root?.querySelector('.snow-geo-overlay');
    return {url:location.href,overlayVisible:overlay&&getComputedStyle(overlay).display!=='none',
      polygons:overlay?.querySelectorAll('path').length,
      camera:root?.querySelector('[data-camera-status]')?.textContent,
      citywide:root?.querySelector('[data-total]')?.textContent,
      canvases:[...document.querySelectorAll('canvas')].map(c=>c.getBoundingClientRect())
        .filter(r=>r.width>600&&r.height>400).length};
  });
  try {
    await page.waitForFunction(()=>{
      const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
      const overlay=root?.querySelector('svg.snow-geo-overlay');
      return overlay?.querySelectorAll('path').length===87 &&
        getComputedStyle(overlay).display!=='none';
    },null,{timeout:25000});
  } catch(error){
    console.error('Live overlay settle diagnostic:',JSON.stringify(await state()));
    mkdirSync('artifacts',{recursive:true});
    try{await page.screenshot({path:'artifacts/real-maps-diagnostic.png'})}catch{}
    throw error;
  }
  const initial=await state();
  const geometry=()=>page.locator('#csci5609-snow-maps-extension').locator('svg.snow-geo-overlay path').first().getAttribute('d');
  const initialGeometry=await geometry();
  mkdirSync('artifacts',{recursive:true});
  await page.screenshot({path:'artifacts/live-map-overlay-initial.png',animations:'disabled'});
  assert(initial.overlayVisible,'REAL Google Maps: overlay not visible in supported north-up view');
  assert(initial.citywide==='5,423','REAL Google Maps: wrong source total');
  assert(initial.canvases>=1,'REAL Google Maps: no active raster or WebGL canvas');
  const collapse=panel.getByRole('button',{name:'Collapse visualization controls'});
  await collapse.click();
  assert(await panel.evaluate(e=>e.classList.contains('snow-collapsed')),'HUD did not collapse on real Maps');
  await panel.getByRole('button',{name:'Expand visualization controls'}).click();
  await panel.locator('[data-event]').selectOption('Bridge');
  await panel.locator('button[data-day="2"]').click();
  assert((await state()).citywide==='418','Event/day filtering failed on the live site');
  // Google Maps retains its native zoom button and search UI.
  const zoom=page.getByRole('button',{name:'Zoom in',exact:true}).first();
  await zoom.waitFor({state:'visible',timeout:20000});
  const prev=page.url();
  await zoom.click();
  await page.waitForFunction(old=>location.href!==old,prev,{timeout:25000});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    const overlay=root?.querySelector('.snow-geo-overlay');
    return overlay && getComputedStyle(overlay).display!=='none';
  },null,{timeout:15000});
  const afterZoom=await state();
  const zoomGeometry=await geometry();
  assert(zoomGeometry && zoomGeometry!==initialGeometry,'Real Google zoom did not change projected neighborhood coordinates');
  await page.screenshot({path:'artifacts/live-map-overlay-after-zoom.png',animations:'disabled'});
  assert(afterZoom.polygons===87,'Map polygons lost after native Google zoom');
  // Native drag must remain functional. Google Maps reports a new URL camera
  // asynchronously; never show stale geography while it is lagging.
  const rect=await page.locator('canvas').first().boundingBox();
  assert(rect&&rect.width>600,'Cannot locate real map canvas for drag');
  const x=rect.x+rect.width*.6,y=rect.y+rect.height*.5;
  const beforeDrag=page.url();
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x+125,y+88,{steps:12});
  await page.mouse.up();
  await page.waitForFunction(old=>location.href!==old,beforeDrag,{timeout:25000});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return getComputedStyle(root.querySelector('.snow-geo-overlay')).display!=='none';
  },null,{timeout:18000});
  const final=await state();
  const dragGeometry=await geometry();
  assert(dragGeometry && dragGeometry!==zoomGeometry,'Real Google drag did not reproject neighborhood boundaries');
  await page.screenshot({path:'artifacts/live-map-overlay-after-drag.png',animations:'disabled'});
  assert(final.polygons===87&&final.citywide==='418','Lost state after real map drag');
  assert(!errors.some(x=>/Snow Emergency overlay/.test(x)),'Extension caused a page error');
  console.log(JSON.stringify({result:'PASS',...contextDescription(),initial,afterZoom,final,pageErrors:errors.slice(0,3)},null,2));
}catch(e){
  console.error(JSON.stringify({result:'FAIL',...contextDescription(),reason:String(e),stack:e?.stack?.slice(0,1600)},null,2));
  process.exitCode=1;
}finally{
  if(browser)await browser.close();
  rmSync(profile,{recursive:true,force:true});
}
