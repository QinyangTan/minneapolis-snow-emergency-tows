import { test, expect } from '@playwright/test';

async function ready(page){
  await page.goto('/');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  await expect(page.locator('.constellation-point')).toHaveCount(9);
  await expect(page.locator('.constellation-roster button')).toHaveCount(9);
}

test('all nine records appear and event markers link to global filters',async ({page})=>{
  await ready(page);
  const marker=page.getByRole('button',{name:/Bridge: Day 2 .*top five mapped areas/i});
  await expect(marker).toHaveCount(1);
  await expect(marker).toHaveAttribute('aria-label',/852 total observations/);
  await marker.click();
  await expect(marker).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.filterbar select')).toHaveValue('Bridge');
  await expect(page.locator('.fingerprint-card').filter({hasText:'Bridge'})).toHaveAttribute('aria-pressed','true');
  await marker.click();
  await expect(page.locator('.filterbar select')).toHaveValue('all');
});

test('changing visual encoding preserves data and makes marker size uniform',async ({page})=>{
  await ready(page);
  const size=await page.locator('.constellation-point').evaluateAll(nodes=>
    nodes.map(n=>Number.parseFloat(n.style.width)));
  expect(new Set(size).size).toBeGreaterThan(1);
  const button=page.locator('.constellation-encoding');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.locator('.constellation-point').evaluateAll(nodes=>
    nodes.map(n=>Number.parseFloat(n.style.width)))).toEqual(Array(9).fill(30));
  await expect(page.locator('.constellation-roster button')).toHaveCount(9);
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed','false');
});

test('mobile comparison remains accessible with internal plot scroll',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await ready(page);
  await expect(page.locator('.constellation-figure')).toHaveCount(1);
  const widths=await page.evaluate(()=>({
    viewport:innerWidth,root:document.documentElement.scrollWidth,
    overflow:document.querySelector('.constellation-scroll').scrollWidth-
      document.querySelector('.constellation-scroll').clientWidth
  }));
  expect(widths.root).toBeLessThanOrEqual(widths.viewport+2);
  expect(widths.overflow).toBeGreaterThan(0);
  const roster=page.locator('.constellation-roster button').filter({hasText:'Howard'});
  await roster.click();
  await expect(page.locator('.filterbar select')).toHaveValue('Howard');
  await expect(roster).toHaveAttribute('aria-pressed','true');
});
