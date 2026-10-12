import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const fmt = (n) => n.toLocaleString('en-US');
const all = { total: 5423, unmapped: 68 };
const city = { 1: 1255, 2: 2222, 3: 1946 };

async function ready(page) {
  await page.goto('/');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  await expect(page.locator('.focus-dashboard')).toBeVisible();
  await page.locator('.focus-mode-switch').click();
  await expect(page.locator('.small-map-panel')).toHaveCount(3);
  await expect(page.locator('.explorer-layout')).toBeVisible();
}

test('desktop: live City data, shared-scale maps and geometry totals', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await ready(page);

  const summary = await page.evaluate(async () => (await (await fetch('/data/summary.json')).json()));
  const shapes = await page.evaluate(async () => (await (await fetch('/data/neighborhoods.geojson')).json()));
  expect(summary.total).toBe(all.total);
  expect(summary.unassigned_neighborhood_count).toBe(all.unmapped);
  expect(shapes.features).toHaveLength(87);
  for (const day of [1,2,3]) {
    const mapped = shapes.features.reduce((sum, feature) => sum + feature.properties.days[String(day)], 0);
    await expect(page.locator('.small-map-panel').nth(day-1).locator('.small-map-heading strong')).toHaveText(fmt(mapped) + ' mapped tows');
    expect(mapped).toBeLessThan(city[day]);
  }
  expect(shapes.features.reduce((s, f) => s + f.properties.total, 0)).toBe(5355);
  await expect(page.locator('.small-multiple-shell .scale-common')).toContainText('tows / neighborhood');
  for (const map of await page.locator('.small-map-panel').all()) {
    await expect(map.locator('svg path')).toHaveCount(87);
  }
  await page.locator('.small-multiple-shell').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('desktop-three-day-maps.png') });
  expect(browserErrors).toEqual([]);
});

test('linked event/day/neighborhood filters, matrix click, and reset', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1365, height: 850 });
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await ready(page);

  await page.locator('.fingerprint-gallery .fingerprint-card').filter({ hasText: 'Bridge' }).click();
  await expect(page.locator('.filterbar select')).toHaveValue('Bridge');
  await expect(page.locator('.stats-panel .panel-header')).toContainText('852 observed records');
  await page.locator('.filterbar .day-picker button').filter({hasText: /^2$/}).click();
  await expect(page.locator('.filterbar .day-picker button.active')).toHaveText('2');

  const marcy = page.locator('.explorer-layout svg path[aria-label^="Marcy Holmes:"]');
  await marcy.click();
  await expect(page.locator('.area-detail h3')).toHaveText('Marcy Holmes');

  const expected = await page.evaluate(async () => {
    const geo = await (await fetch('/data/neighborhoods.geojson')).json();
    return geo.features.find((f) => f.properties.name === 'Marcy Holmes').properties.byEvent.Bridge.days['2'];
  });
  await expect(page.locator('.area-detail .detail-count')).toHaveText(fmt(expected));
  await page.locator('.explorer-panel').scrollIntoViewIfNeeded();
  await page.screenshot({path: testInfo.outputPath('desktop-linked-explorer.png')});

  // Crossing views: choose a cell to filter by both neighborhood and emergency.
  await page.locator('.recurrence-matrix button[aria-label^="Marcy Holmes, Dover:"]').click();
  await expect(page.locator('.filterbar select')).toHaveValue('Dover');
  await expect(page.locator('.area-detail h3')).toHaveText('Marcy Holmes');

  await page.locator('.reset').click();
  await expect(page.locator('.filterbar select')).toHaveValue('all');
  await expect(page.locator('.filterbar .day-picker button.active')).toHaveText('All');
  expect(browserErrors).toEqual([]);
});

test('day composition remains normalized for selected event; sorted matrix and keyboard', async ({ page }) => {
  await page.setViewportSize({width:1280,height:900});
  await ready(page);
  await page.locator('.signature-tools select').first().selectOption('day3');
  const rows = page.locator('.signature-row');
  expect(await rows.count()).toBeGreaterThan(3);
  const sums = await rows.evaluateAll((nodes) => nodes.map((node) =>
    [...node.querySelectorAll('.signature-track span')].reduce(
      (sum, span) => sum + Number.parseFloat(span.style.width), 0)));
  for (const sum of sums) expect(sum).toBeCloseTo(100, 1);

  await page.locator('.matrix-tools select').first().selectOption('presence');
  await expect(page.locator('.recurrence-matrix tbody tr')).toHaveCount(15);
  await page.locator('.matrix-tools').getByLabel('SHOW').selectOption('87');
  const count = await page.locator('.recurrence-matrix tbody tr').count();
  expect(count).toBeGreaterThanOrEqual(65);

  const path = page.locator('.explorer-layout svg path[aria-label^="Central:"]');
  await path.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.area-detail h3')).toHaveText('Central');

  // Event/Day controls and geometry remain accessible by keyboard.
  await page.locator('.filterbar .day-picker button').filter({hasText:/^3$/}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.filterbar .day-picker button.active')).toHaveText('3');
});

test('mobile: 390px layout without page-level horizontal overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({width:390,height:844});
  await ready(page);
  await expect(page.locator('.small-map-panel')).toHaveCount(3);
  expect(await page.locator('.small-map-panel').first().boundingBox()).not.toBeNull();
  const dims = await page.evaluate(() => ({
    inner: window.innerWidth, body: document.body.scrollWidth,
    root: document.documentElement.scrollWidth
  }));
  expect(dims.body).toBeLessThanOrEqual(dims.inner + 2);
  expect(dims.root).toBeLessThanOrEqual(dims.inner + 2);
  await page.locator('.matrix-tools select').first().selectOption('presence');
  await page.locator('.recurrence-matrix').scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath('mobile-recurrence.png')});
});

test('automated accessibility: axe serious/critical violations on desktop and mobile', async ({ page }) => {
  for (const width of [1365, 390]) {
    await page.setViewportSize({width,height:900});
    await ready(page);
    const report = await new AxeBuilder({page})
      .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])
      .analyze();
    const violations = report.violations.filter((v) => ['critical','serious'].includes(v.impact));
    expect(violations.map((v) => ({
      id:v.id, impact:v.impact,
      nodes:v.nodes.slice(0,5).map((n) => ({target:n.target, summary:n.failureSummary}))
    }))).toEqual([]);
  }
});
