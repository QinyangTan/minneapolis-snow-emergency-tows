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
  await panel.locator('select[data-event]').selectOption('Bridge');
  await panel.locator('button[data-day="2"]').click();
  if((await panel.locator('[data-total]').textContent())!=='418')fail('Bridge Day 2 count mismatch');
  const state=await panel.locator('button[data-day="2"]').getAttribute('aria-pressed');
  if(state!=='true')fail('Selected day is not accessible');
  await panel.locator('input[data-layer]').uncheck();
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')fail('Layer OFF did not hide geometry');
  await panel.locator('input[data-layer]').check();
  await page.goto('https://www.google.com/maps/@44.9778,-93.2650,12z,45t',{waitUntil:'domcontentloaded'});
  await panel.waitFor({state:'visible',timeout:15000});
  await page.waitForTimeout(1300);
  if(!/Tilted\/rotated/.test(await panel.locator('[data-camera-status]').textContent()||''))fail('Tilt guard did not warn');
  if(await host.locator('svg.snow-geo-overlay').evaluate(n=>getComputedStyle(n).display)!=='none')fail('Tilt guard should hide overlay');
  console.log('PASS: MV3 injected; 87 polygon paths; 5,423 source records; Bridge Day 2=418; overlay toggle; unsafe tilt rejected.');
}catch(error){console.error('FAIL: Chrome extension browser smoke test:',error);process.exitCode=1}
finally{
  if(context)await context.close();
  rmSync(userDataDir,{recursive:true,force:true});
}
