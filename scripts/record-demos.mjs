/**
 * Record REAL Chromium interactions as WebM and convert the recordings to GIF.
 * This is not a slideshow of fabricated images. The UI uses the checked-in City
 * ArcGIS data, and each GIF contains actual browser frames from the app.
 */
import { chromium } from '@playwright/test';
import ffmpegPath from 'ffmpeg-static';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:4173';
const DEST = path.resolve('docs/demos');
const TEMP = path.resolve('artifacts/gif-recordings');

async function waitForServer() {
  for (let attempt=0; attempt<90; attempt++) {
    try {
      const response = await fetch(BASE + '/');
      if (response.ok) return;
    } catch {}
    await sleep(400);
  }
  throw new Error('Timed out waiting for local preview server');
}

async function recordedScenario(browser, name, interaction) {
  const tmp = path.join(TEMP, name);
  await mkdir(tmp, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1180, height: 820 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    recordVideo: { dir: tmp, size: { width: 960, height: 667 } }
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator('.small-map-panel').first().waitFor();
    await page.waitForTimeout(700);
    await interaction(page);
    await page.waitForTimeout(900);
  } finally {
    await context.close();
  }
  if (errors.length) throw new Error(`${name}: browser errors: ${errors.join(' | ')}`);
  const videos = (await readdir(tmp)).filter((file) => file.endsWith('.webm'));
  if (videos.length !== 1) throw new Error(`${name}: expected a single real browser video, found ${videos.length}`);
  const source = path.join(tmp, videos[0]);
  const output = path.join(DEST, name + '.gif');
  if (!ffmpegPath) throw new Error('Bundled ffmpeg binary not available');
  execFileSync(ffmpegPath, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', source,
    '-filter_complex',
    'fps=7,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3',
    '-loop', '0', output
  ], { timeout: 120000 });
  const { size } = await stat(output);
  if (size < 30000 || size > 14 * 1024 * 1024) {
    throw new Error(`Unexpected demo GIF size for ${name}: ${size}`);
  }
  console.log(`Recorded ${name}: ${size} bytes of actual browser video → GIF`);
}

async function main() {
  await mkdir(DEST, { recursive: true });
  await rm(TEMP, { recursive: true, force: true });
  const server = spawn('npm', [
    'run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'
  ], { stdio: 'ignore', detached: false });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    if (process.env.EDITORIAL_ONLY !== '1') {
    await recordedScenario(browser, 'three-day-map-comparison', async (page) => {
      await page.locator('.small-multiple-shell').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
      for (const day of [1,2,3]) {
        await page.locator('.small-map-heading').nth(day-1).click();
        await page.waitForTimeout(1150);
      }
    });
    await recordedScenario(browser, 'linked-event-neighborhood-explorer', async (page) => {
      await page.locator('.fingerprint-gallery .fingerprint-card').filter({hasText:'Bridge'}).click();
      await page.waitForTimeout(1100);
      await page.locator('.explorer-panel').scrollIntoViewIfNeeded();
      await page.locator('.filterbar .day-picker button').filter({hasText:/^2$/}).click();
      await page.waitForTimeout(1000);
      await page.locator('.explorer-layout svg path[aria-label^="Marcy Holmes:"]').click();
      await page.waitForTimeout(1500);
      await page.locator('.reset').click();
      await page.waitForTimeout(1000);
    });
    await recordedScenario(browser, 'recurrence-and-day-signatures', async (page) => {
      await page.locator('.recurrence-section .panel').scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await page.locator('.matrix-tools select').first().selectOption('presence');
      await page.waitForTimeout(1100);
      await page.locator('.recurrence-matrix button[aria-label^="Marcy Holmes, Bridge:"]').click();
      await page.waitForTimeout(850);
      await page.locator('.signatures-section .panel').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.locator('.signature-tools select').first().selectOption('day3');
      await page.waitForTimeout(1250);
    });
    }
    await recordedScenario(browser, 'event-fingerprint-gallery', async (page) => {
      await page.locator('.fingerprint-gallery').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1150);
      await page.locator('.fingerprint-card').filter({hasText:'Bridge'}).click();
      await page.waitForTimeout(1100);
      await page.locator('.fingerprint-card').filter({hasText:'Howard'}).click();
      await page.waitForTimeout(1100);
      await page.locator('.fingerprint-gallery').scrollIntoViewIfNeeded();
      await page.waitForTimeout(850);
    });
    await recordedScenario(browser, 'event-similarity-matrix', async (page) => {
      const matrix=page.locator('.similarity-scroll');
      await matrix.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
      await matrix.getByRole('button',{name:/Compare Bridge to Howard:/}).click();
      await page.waitForTimeout(1050);
      await page.locator('select[aria-label="Compare events by distribution"]').selectOption('neighborhoods');
      await page.waitForTimeout(1150);
      await matrix.getByRole('button',{name:/Compare Bridge to Glenwood:/}).click();
      await page.waitForTimeout(1050);
    });
    await recordedScenario(browser, 'hotspot-threshold-sensitivity', async (page) => {
      const panel=page.locator('.sensitivity-panel');
      await panel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
      await panel.locator('.sensitivity-row').nth(0).click();
      await page.waitForTimeout(1100);
      await panel.locator('.sensitivity-row').nth(3).click();
      await page.waitForTimeout(1100);
      await panel.locator('.sensitivity-row').nth(1).click();
      await page.waitForTimeout(1050);
    });
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
  console.log('Real-interaction GIF demos saved under docs/demos/');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
