/**
 * Real Chromium MV3 smoke test against a controlled Google Maps-shaped page.
 * This validates injection, local packaged data, native browser storage and drawing.
 * It intentionally does NOT claim pixel-perfect alignment to Google's private renderer.
 */
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const extensionPath=resolve(root,'build/google-maps-extension');
const userDataDir=mkdtempSync(join(tmpdir(),'5609-gmaps-extension-'));
let context;
const fail=(message)=>{throw new Error(message)};
async function waitFor(page,selector,expected){
  await page.locator(selector).waitFor({state:expected?'visible':'hidden',timeout:15000});
}
try{
  context=await chromium.launchPersistentContext(userDataDir,{
    headless:true,channel:'chromium',
    args:[`--disable-extensions-except=${extensionPath}`,`--load-extension=${extensionPath}`],
    viewport:{width:1280,height:860}
  });
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker',{timeout:20000});
  if(!worker)fail('MV3 background service worker did not initialize');
  const page=await context.newPage();
  await page.route(/^https:\/\/www\.google\.com\/maps(?:\/|$)/,route=>
    route.fulfill({status:200,contentType:'text/html',
      body:'<!doctype html><html lang="en"><head><title>Google Maps fixture</title></head><body style="margin:0"><div id="scene" style="position:fixed;inset:0;background:#eaf0f4"></div></body></html>'}));
  await page.goto('https://www.google.com/maps/@44.9778,-93.2650,12z',{waitUntil:'domcontentloaded'});
  await worker.evaluate(()=>chrome.storage.local.set({enabled:true}));
  const host=page.locator('#csci5609-snow-maps-extension');
  await host.waitFor({state:'attached',timeout:16000});
  const panel=host.locator('.snow-panel');
  await panel.waitFor({state:'visible',timeout:18000});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root?.querySelectorAll('svg.snow-geo-overlay path').length===87;
  },null,{timeout:20000});
  const count=await host.locator('svg.snow-geo-overlay path').count();
  if(count!==87)fail('Expected all 87 projected neighborhoods; received '+count);
  // A real page-control at the map corner must still receive clicks through
  // the full-screen extension host; only the small HUD is interactive.
  await page.evaluate(()=>{
    const native=document.createElement('button');
    native.setAttribute('aria-label','Zoom in');
    native.textContent='+';
    native.style.cssText='position:fixed;right:15px;bottom:15px;width:42px;height:42px;z-index:2';
    native.addEventListener('click',()=>{window.__nativeMapZoomClicks=(window.__nativeMapZoomClicks||0)+1});
    document.body.append(native);
  });
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  if((await page.evaluate(()=>window.__nativeMapZoomClicks))!==1)
    fail('Full-screen extension host blocked a native map Zoom in click');
  if((await panel.locator('[data-total]').textContent())!=='5,423')fail('Wrong nine-event citywide count');
  // A collapsible HUD must free map space without hiding the currently selected layer.
  const collapse=panel.getByRole('button',{name:'Collapse visualization controls'});
  await collapse.click();
  if(!(await panel.evaluate(node=>node.classList.contains('snow-collapsed'))))
    fail('Panel did not collapse');
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)==='none')
    fail('Minimizing controls must not disable the map overlay');
  await panel.getByRole('button',{name:'Expand visualization controls'}).click();
  if(await panel.evaluate(node=>node.classList.contains('snow-collapsed')))
    fail('Panel failed to expand');
  await panel.locator('select[data-event]').selectOption('Bridge');
  await panel.locator('button[data-day="2"]').click();
  if((await panel.locator('[data-total]').textContent())!=='418')fail('Bridge Day 2 count mismatch');
  const areas=panel.locator('select[data-neighborhood]');
  if((await areas.locator('option').count())!==88)fail('Expected 87 neighborhoods plus all areas');
  await areas.selectOption('Marcy Holmes');
  const detail=(await panel.locator('[data-neighborhood-count]').textContent())||'';
  if(!/Marcy Holmes:\s*62\b/.test(detail))fail('Neighborhood inspector did not show Bridge/Day 2 = 62: '+detail);
  const focused=host.locator('svg.snow-geo-overlay path[stroke="#0a1325"]');
  if(await focused.count()!==1)fail('Exactly one selected neighborhood border should be emphasized');
  await areas.selectOption('all');
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root?.querySelectorAll('svg.snow-geo-overlay path[stroke="#0a1325"]').length===0;
  },null,{timeout:5000});
  if(await focused.count()!==0)fail('Clearing neighborhood highlight left selected geometry');
  // Lecture-inspired: legend decoding, reproducible fixed thresholds, recurrence
  // comparison, linked numerical annotations, and same-denominator day bars.
  const keyItems=panel.locator('.snow-legend-item');
  if(await keyItems.count()!==6)fail('Six explicit observed-count legend bands are required');
  const legendBox=await panel.locator('.snow-legend').boundingBox();
  const kpiBox=await panel.locator('.snow-kpis').boundingBox();
  if(!legendBox||!kpiBox||legendBox.y>=kpiBox.y)
    fail('Map color key must be visible before the KPI/dashboard controls');
  const opacity=Number(await panel.locator('[data-opacity]').inputValue());
  if(opacity<0.70||opacity>0.80)
    fail('Default overlay must balance strong color contrast with legible Google road labels');
  const countLabels=await keyItems.allTextContents();
  if(countLabels.map(x=>x.trim()).join('|')!=='0|1–4|5–14|15–39|40–99|100+')
    fail('Count legend labels are inconsistent: '+countLabels.join('|'));
  const swatches=await keyItems.locator('.snow-color-swatch').evaluateAll(xs=>
    xs.map(x=>getComputedStyle(x).backgroundColor));
  if(new Set(swatches).size!==6)fail('The map legend did not provide distinct color bins');
  const filled=await host.locator('svg.snow-geo-overlay path').evaluateAll(xs=>
    [...new Set(xs.map(x=>x.getAttribute('data-band')))]);
  if(filled.length<3)fail('Only '+filled.length+' count categories rendered; contrast is insufficient');
  if(!/62 observed records/.test(await panel.locator('[data-story-text]').textContent()||''))
    fail('Evidence annotation did not link to the selected neighborhood');
  if(await panel.locator('.snow-day-row').count()!==3)
    fail('Three comparable Days 1–3 should be visible');
  await panel.locator('button[data-mode="recurrence"]').click();
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root?.querySelector('[data-total]')?.textContent==='9' &&
      root?.querySelector('[data-recurrence-rules]')?.hidden===false;
  });
  if(!await panel.locator('select[data-event]').isDisabled())
    fail('Single event selector must disable in across-all-event recurrence view');
  if((await keyItems.allTextContents()).map(x=>x.trim()).join('|')!=='0|1–2|3–4|5–6|7–8|9')
    fail('Recurrence color key must refer to nine events, not raw towing counts');
  await panel.locator('[data-recurrence-metric]').selectOption('prominent');
  await panel.locator('[data-topk]').selectOption('10');
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return /Top 10/.test(root?.querySelector('[data-story-text]')?.textContent||'');
  });
  if((await panel.locator('[data-topk-row]').isHidden()))
    fail('Top K threshold must remain discoverable when prominence is active');
  const recurrenceHeader=await panel.locator('[data-top-heading]').textContent();
  if(!/RECURRING/.test(recurrenceHeader||''))
    fail('Recurrence view did not explain its metric');
  await panel.locator('button[data-mode="counts"]').click();
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root?.querySelector('[data-total]')?.textContent==='418' &&
      root?.querySelector('[data-recurrence-rules]')?.hidden===true;
  });
  const state=await panel.locator('button[data-day="2"]').getAttribute('aria-pressed');
  if(state!=='true')fail('Selected day is not accessible');
  await panel.locator('input[data-layer]').uncheck();
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')fail('Layer OFF did not hide geometry');
  await panel.locator('input[data-layer]').check();
  // A browser/sidebar resize must restore the coordinate layer even when the
  // URL center stays the same. Drag/wheel gestures are still fail-closed.
  await page.setViewportSize({width:1100,height:780});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    const svg=root?.querySelector('svg.snow-geo-overlay');
    return svg && getComputedStyle(svg).display!=='none'&&svg.querySelectorAll('path').length===87;
  },null,{timeout:12000});
  // Real pointer/wheel input must reach the map, while stale geographic marks disappear.
  const wheelSeen=await page.evaluate(()=>{
    window.__snowWheelSeen=false;
    document.getElementById('scene').addEventListener('wheel',()=>{
      window.__snowWheelSeen=true;
    },{once:true});
    return true;
  });
  if(!wheelSeen)fail('Map fixture did not initialize wheel listener');
  await page.mouse.move(520,390);
  await page.mouse.wheel(0,350);
  await page.waitForTimeout(650);
  if(!await page.evaluate(()=>window.__snowWheelSeen))
    fail('Extension should not intercept Google Maps wheel gestures');
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')
    fail('A zoom gesture must immediately hide stale map geometry');
  // The original URL camera has not moved yet. Resuming the old geometry is unsafe.
  await page.waitForTimeout(900);
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')
    fail('Overlay resumed despite unchanged URL camera after a zoom gesture');
  if(!/overlay paused/i.test(await panel.locator('[data-camera-status]').textContent()||''))
    fail('Failed to explain why the stale overlay was suspended');
  await page.evaluate(()=>history.replaceState({},'', '/maps/@44.9790,-93.2650,12.2z'));
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root && getComputedStyle(root.querySelector('.snow-geo-overlay')).display!=='none';
  },null,{timeout:10000});
  // A newly reported camera should recover the overlay after a settle interval.
  if(await host.locator('svg.snow-geo-overlay path').count()!==87)
    fail('Did not recover 87 map polygons when settled URL camera became available');
  await page.goto('https://www.google.com/maps/@44.9778,-93.2650,12z,45t',{waitUntil:'domcontentloaded'});
  await panel.waitFor({state:'visible',timeout:15000});
  await page.waitForTimeout(1300);
  if(!/Tilted\/rotated/.test(await panel.locator('[data-camera-status]').textContent()||''))fail('Tilt guard did not warn');
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')fail('Tilt guard should hide overlay');
  // The live Google Maps DOM observed in October 2026 uses overlapping WebGL
  // canvases rather than the older widget-scene selector.
  await page.route(/^https:\/\/www\.google\.com\/maps(?:\/|$)/,route=>
    route.fulfill({status:200,contentType:'text/html',
      body:'<!doctype html><html><head><title>Modern WebGL Google Maps fixture</title></head><body style="margin:0"><canvas class="H1VXrf Kh1Hec" style="position:fixed;inset:0;width:100vw;height:100vh"></canvas><canvas class="H1VXrf JRr1M DnOnV" style="position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none"></canvas></body></html>'}),{times:1});
  await page.goto('https://www.google.com/maps/@44.9778,-93.265,12z?modernCanvas=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root?.querySelectorAll('svg.snow-geo-overlay path').length===87 &&
      getComputedStyle(root.querySelector('.snow-geo-overlay')).display!=='none';
  },null,{timeout:20000});
  if((await page.locator('#csci5609-snow-maps-extension').locator('svg.snow-geo-overlay path').count())!==87)
    fail('Modern Google Maps dual-canvas layout was not detected');

  // Verify the REAL Google raster fallback found in Linux-headed Chromium:
  // one oversized canvas is acceptable only when native Maps controls confirm
  // it is a Map, not an arbitrary third-party WebGL element.
  await page.route(/^https:\/\/www\.google\.com\/maps(?:\/|$)/,route=>
    route.fulfill({status:200,contentType:'text/html',
      body:'<!doctype html><html><body style="margin:0"><canvas class="mAWRAc" style="position:fixed;left:-100px;top:-190px;width:1536px;height:1280px"></canvas><button aria-label="Zoom in"></button><button aria-label="Zoom out"></button><button aria-label="Search"></button></body></html>'}),{times:1});
  await page.goto('https://www.google.com/maps/@44.9778,-93.265,12z?rasterCanvas=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return root?.querySelectorAll('svg.snow-geo-overlay path').length===87 &&
      getComputedStyle(root.querySelector('.snow-geo-overlay')).display!=='none';
  },null,{timeout:18000});

  // One unrelated WebGL canvas is insufficient evidence to register geography.
  await page.route(/^https:\/\/www\.google\.com\/maps(?:\/|$)/,route=>
    route.fulfill({status:200,contentType:'text/html',
      body:'<!doctype html><html><body style="margin:0"><canvas style="position:fixed;inset:0;width:100vw;height:100vh"></canvas></body></html>'}),{times:1});
  await page.goto('https://www.google.com/maps/@44.9778,-93.265,12z?untrustedCanvas=1',{waitUntil:'domcontentloaded'});
  const solitary=page.locator('#csci5609-snow-maps-extension');
  await solitary.locator('.snow-panel').waitFor({state:'visible',timeout:15000});
  await page.waitForFunction(()=>{
    const root=document.querySelector('#csci5609-snow-maps-extension')?.shadowRoot;
    return /Map canvas not detected/.test(root?.querySelector('[data-camera-status]')?.textContent||'');
  },null,{timeout:20000});
  if(await solitary.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')
    fail('Untrusted single canvas must not carry a geographic overlay');

  console.log('PASS: real Chromium MV3, 87 polygons, counts, gestures, stale-camera suppression, tilt guard, modern dual WebGL canvas and single-canvas refusal.');
}catch(error){console.error('FAIL: Chrome extension browser smoke test:',error);process.exitCode=1}
finally{
  if(context)await context.close();
  rmSync(userDataDir,{recursive:true,force:true});
}
