import { test, expect } from '@playwright/test';

test('quantitative brushing coordinates scatterplot and event roster without changing counts', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  const section = page.locator('.constellation-section');
  await expect(section.locator('.constellation-point')).toHaveCount(9);
  const min = section.getByRole('slider', {name:'Minimum Day 2 share percentage'});
  const max = section.getByRole('slider', {name:'Maximum Day 2 share percentage'});
  await min.evaluate(element => {
    element.value='40';
    element.dispatchEvent(new Event('input', {bubbles:true}));
    element.dispatchEvent(new Event('change', {bubbles:true}));
  });
  await max.evaluate(element => {
    element.value='55';
    element.dispatchEvent(new Event('input', {bubbles:true}));
    element.dispatchEvent(new Event('change', {bubbles:true}));
  });
  await expect(section.locator('.constellation-brush-title')).toContainText('3 of 9 emergencies in range');
  await expect(section.locator('.constellation-point.constellation-brush-out')).toHaveCount(6);
  await expect(section.locator('.constellation-roster-muted')).toHaveCount(6);
  await section.locator('.constellation-roster button').filter({hasText:'Bridge'}).click();
  await expect(page.locator('.filterbar select')).toHaveValue('Bridge');
  await section.getByRole('button', {name:'Clear range'}).click();
  await expect(section.locator('.constellation-point.constellation-brush-out')).toHaveCount(0);
  await expect(section.locator('.constellation-brush-title')).toContainText('9 of 9 emergencies in range');
  await expect(page.locator('.filterbar select')).toHaveValue('Bridge');
});

test('keyboard-operable query brush shows an empty selection truthfully', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  const max = page.getByRole('slider',{name:'Maximum Day 2 share percentage'});
  await max.evaluate(element => {
    element.value='20';
    element.dispatchEvent(new Event('input',{bubbles:true}));
    element.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await expect(page.locator('.constellation-brush-title')).toContainText('0 of 9 emergencies in range');
  await expect(page.locator('.constellation-point.constellation-brush-out')).toHaveCount(9);
  await expect(page.locator('.constellation-roster button')).toHaveCount(9);
});
