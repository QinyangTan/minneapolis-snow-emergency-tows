import { test, expect } from '@playwright/test';

test('side-by-side shares explicitly explain pair divergence with denominators', async ({page})=>{
  await page.goto('./');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  const card=page.locator('.pair-evidence');
  await expect(card.locator('.pair-row')).toHaveCount(3);
  await expect(card).toContainText('Bridge n=852');
  await expect(card).toContainText('Howard n=665');
  await expect(card.locator('.pair-row').first()).toContainText('Day 1');
  await page.locator('select[aria-label="Second Snow Emergency"]').selectOption('Bridge');
  await expect(card.locator('.pair-delta').first()).toContainText('0.0 pp');
  await page.locator('select[aria-label="Second Snow Emergency"]').selectOption('Glenwood');
  await page.locator('select[aria-label="Compare events by distribution"]').selectOption('neighborhoods');
  await expect(card.locator('.pair-row')).toHaveCount(8);
  await expect(card).toContainText('8 of 87');
  await expect(card).toContainText('mapped records');
  await expect(card).toContainText('percentage points');
  const differences=await card.locator('.pair-row').evaluateAll(rows=>
    rows.map(row=>Math.abs(Number(row.querySelector('.pair-delta').textContent.replace(/[^.\-\d]/g,'')))));
  for(let i=1;i<differences.length;i++)expect(differences[i-1]+.11).toBeGreaterThanOrEqual(differences[i]);
});

test('comparison evidence is usable at 390px without root overflow',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  await page.locator('select[aria-label="Compare events by distribution"]').selectOption('neighborhoods');
  await expect(page.locator('.pair-evidence .pair-row')).toHaveCount(8);
  const widths=await page.evaluate(()=>({root:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(widths.root).toBeLessThanOrEqual(widths.viewport+2);
});
