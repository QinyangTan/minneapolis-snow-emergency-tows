import {test, expect} from '@playwright/test';

async function openDashboard(page) {
  await page.goto('./');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  await expect(page.locator('.focus-dashboard')).toBeVisible();
}

test('dashboard defaults to a compact linked view; deep dive remains available', async ({page}) => {
  await page.setViewportSize({width:1365,height:900});
  await openDashboard(page);
  await expect(page.locator('.rules-section')).toBeHidden();
  await expect(page.locator('.focus-map svg path')).toHaveCount(87);
  await expect(page.locator('.focus-event-list button')).toHaveCount(9);

  await page.locator('.focus-event-list button').filter({hasText:'Bridge'}).click();
  await expect(page.locator('.focus-toolbar select')).toHaveValue('Bridge');
  await expect(page.locator('.focus-stats').first()).toContainText('852');
  await page.locator('.focus-day-picker button').filter({hasText:'Day 3'}).click();
  await expect(page.locator('.focus-map .focus-panel-title')).toContainText('Day 3');
  await page.locator('.focus-map svg path[aria-label^="Marcy Holmes:"]').click();
  await expect(page.locator('.focus-map-footer')).toContainText('Marcy Holmes');
  await page.locator('.focus-reset').click();
  await expect(page.locator('.focus-toolbar select')).toHaveValue('all');
  await expect(page.locator('.focus-day-picker button.active')).toHaveText('All');

  await page.locator('.focus-mode-switch').click();
  await expect(page.locator('.rules-section')).toBeVisible();
  await expect(page.locator('.small-map-panel')).toHaveCount(3);
  await page.locator('.focus-mode-switch').click();
  await expect(page.locator('.rules-section')).toBeHidden();
});

test('Day 2 brush highlights same event subset in compact and deep-dive views', async ({page}) => {
  await openDashboard(page);
  const sliders=page.locator('.focus-brush-ranges input[type=range]');
  await sliders.nth(0).evaluate(el=>{el.value='40';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await sliders.nth(1).evaluate(el=>{el.value='60';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('.focus-brush .focus-panel-title')).toContainText('40%–60%');
  const inRange=await page.locator('.focus-event-list button:not(.muted)').count();
  expect(inRange).toBeGreaterThan(0);
  expect(inRange).toBeLessThan(9);
  await page.locator('.focus-mode-switch').click();
  await expect(page.locator('.constellation-brush-title')).toContainText('40%–60%');
  const deepInRange=9-await page.locator('.constellation-roster-muted').count();
  expect(deepInRange).toBe(inRange);
  await page.locator('.focus-clear-brush').click();
  await expect(page.locator('.constellation-brush-title')).toContainText('0%–100%');
});

test('compact dashboard stays inside mobile viewport without horizontal overflow',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openDashboard(page);
  await expect(page.locator('.focus-map svg path')).toHaveCount(87);
  const widths=await page.evaluate(()=>({body:document.body.scrollWidth,root:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport+2);
  expect(widths.root).toBeLessThanOrEqual(widths.viewport+2);
});
