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
  const state=await panel.locator('button[data-day="2"]').getAttribute('aria-pressed');
  if(state!=='true')fail('Selected day is not accessible');
  await panel.locator('input[data-layer]').uncheck();
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')fail('Layer OFF did not hide geometry');
  await panel.locator('input[data-layer]').check();
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
