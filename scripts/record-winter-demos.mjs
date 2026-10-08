/**
 * Real-Chromium GIF documentation for the 3D winter data story.
 * Only records actual browser frames and interactions with compiled City data.
 * Does not synthesize or fabricate screenshots, records, or UI states.
 */
import { chromium } from '@playwright/test';
import ffmpeg from 'ffmpeg-static';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, rm, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const URL = 'http://127.0.0.1:4174/';
const DEST = path.resolve('docs/demos');
const WORK = path.resolve('artifacts/winter-gif-recordings');
if (!ffmpeg) throw new Error('Bundled ffmpeg is unavailable');

async function waitForPreview() {
  for (let i = 0; i < 100; i++) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch {}
    await sleep(350);
  }
  throw Error('Winter preview did not become available');
}

async function record(browser, name, interact) {
  const temp=path.join(WORK,name);
  await mkdir(temp,{recursive:true});
  const context=await browser.newContext({
    viewport:{width:1250,height:820},
    deviceScaleFactor:1,
    reducedMotion:'reduce',
    recordVideo:{dir:temp,size:{width:920,height:604}}
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  try {
    await page.goto(URL,{waitUntil:'networkidle',timeout:45000});
    await page.getByRole('combobox',{name:'Neighborhood'}).waitFor({timeout:20000});
    await page.waitForTimeout(600);
    await interact(page);
    await page.waitForTimeout(450);
  } finally {
    await context.close();
  }
  if(pageErrors.length)throw Error(name+': browser errors '+pageErrors.join(' | '));
  const videos=(await readdir(temp)).filter(n=>n.endsWith('.webm'));
  if(videos.length!==1)throw Error(name+': expected one browser video, found '+videos.length);
  const file=path.join(DEST,name+'.gif');
  execFileSync(ffmpeg,[
    '-hide_banner','-loglevel','error','-y','-i',path.join(temp,videos[0]),
    '-filter_complex','fps=6,scale=810:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=90:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
    '-loop','0',file
  ],{timeout:120000});
  const {size}=await stat(file);
  if(size<40_000||size>15_000_000)throw Error(name+': GIF size unreasonable '+size);
  console.log('VERIFIED REAL BROWSER GIF: '+name+' '+size+' bytes');
}

async function run() {
  await mkdir(DEST,{recursive:true});
  await rm(WORK,{recursive:true,force:true});
  const server=spawn('npm',['run','preview','--prefix','demo','--','--host','127.0.0.1','--port','4174','--strictPort'],{stdio:'ignore'});
  let browser;
  try {
    await waitForPreview();
    browser=await chromium.launch({headless:true});
    await record(browser,'winter-3d-orbit',async page=>{
      const canvas=page.locator('.city-stage canvas');
      await canvas.scrollIntoViewIfNeeded();
      const bounds=await canvas.boundingBox();
      if(!bounds)throw Error('No 3D canvas bounds');
      const x=bounds.x+bounds.width*.45,y=bounds.y+bounds.height*.49;
      await page.waitForTimeout(650);
      await page.mouse.move(x,y);
      await page.mouse.down();
      for(let i=1;i<=12;i++){await page.mouse.move(x+i*10,y+i*2,{steps:2});await sleep(40);}
      await page.mouse.up();
      await page.waitForTimeout(850);
      await page.getByRole('button',{name:'Show top view'}).click();
      await page.waitForTimeout(850);
      await page.getByRole('button',{name:'Show angled view'}).click();
      await page.waitForTimeout(900);
    });
    await record(browser,'winter-3d-three-days',async page=>{
      const unfold=page.getByRole('button',{name:'Unfold three days'});
      await unfold.waitFor({timeout:18000});
      await unfold.click();
      await page.waitForTimeout(1200);
      await page.getByTestId('day-1').click();
      await page.waitForTimeout(850);
      await page.getByTestId('day-3').click();
      await page.waitForTimeout(850);
      await page.getByRole('button',{name:'Show one day'}).click();
      await page.waitForTimeout(750);
    });
    await record(browser,'winter-3d-event-comparison',async page=>{
      await page.locator('.event-comparison summary').click();
      await page.getByRole('combobox',{name:'Comparison event'}).selectOption('howard-2024');
      await page.waitForTimeout(1150);
      await page.getByRole('button',{name:'Share',exact:true}).click();
      await page.waitForTimeout(900);
      await page.getByTestId('day-3').click();
      await page.waitForTimeout(900);
      await page.getByRole('button',{name:'Count',exact:true}).click();
      await page.waitForTimeout(800);
    });
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
  }
  console.log('Three authentic 3D winter GIF demos saved under docs/demos/');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
