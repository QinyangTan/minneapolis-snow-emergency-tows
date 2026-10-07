import { test, expect } from '@playwright/test';

async function openWithData(page) {
  await page.goto('/');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
}

test('Research comparison explains both day profiles and mapped spatial composition', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 900 });
  await openWithData(page);
  const section = page.locator('.comparison-section');
  await expect(section.getByText('JENSEN–SHANNON DIVERGENCE')).toBeVisible();
  await section.locator('select[aria-label="First Snow Emergency"]').selectOption('Bridge');
  await section.locator('select[aria-label="Second Snow Emergency"]').selectOption('Bridge');
  await expect(section.locator('.comparison-value')).toContainText('0');
  await section.locator('select[aria-label="Second Snow Emergency"]').selectOption('Howard');
  await expect(section.locator('.comparison-value')).not.toContainText('N/A');
  await section.locator('select[aria-label="Compare events by distribution"]').selectOption('neighborhoods');
  await expect(section).toContainText('Out-of-boundary records excluded');
  await section.getByRole('button', {name:'Explore Howard in other charts'}).click();
  await expect(page.locator('.filterbar select')).toHaveValue('Howard');
});

test('Prominence rankings have adjustable, explicitly labeled thresholds', async ({ page }) => {
  await openWithData(page);
  const section=page.locator('.recurrence-section');
  const filters=section.locator('.matrix-tools select');
  await filters.first().selectOption('prominence');
  await filters.nth(1).selectOption('5');
  await expect(section.locator('.mini-note')).toContainText('top 5');
  await filters.nth(1).selectOption('15');
  await expect(section.locator('.mini-note')).toContainText('top 15');
  await expect(section.locator('.recurrence-matrix thead')).toContainText('PROMINENT');
  await expect(section.locator('.recurrence-matrix tbody tr')).toHaveCount(15);
});
