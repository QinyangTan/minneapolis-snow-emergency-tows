import {test,expect} from '@playwright/test';
async function ready(page){await page.goto('/');await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');}
test('default workbench links event, day and neighborhood',async({page})=>{
  await ready(page);
  await expect(page.locator('#focus-dashboard')).toBeVisible();
  await expect(page.locator('.rules-section')).toBeHidden();
  await expect(page.locator('.focus-event-list button')).toHaveCount(9);
  await page.locator('.focus-event-list button').filter({hasText:'Bridge'}).click();
  await expect(page.getByLabel('Dashboard Snow Emergency')).toHaveValue('Bridge');
  await expect(page.locator('.focus-stats')).toContainText('852');
  await page.locator('.focus-day-picker button').filter({hasText:'Day 2'}).click();
  await expect(page.locator('.focus-day-bars button.active')).toContainText('DAY 02');
  await page.locator('.focus-map svg path[aria-label^="Marcy Holmes:"]').click();
  await expect(page.locator('.focus-map-footer')).toContainText('Marcy Holmes');
  await page.locator('.focus-reset').click();
  await expect(page.getByLabel('Dashboard Snow Emergency')).toHaveValue('all');
});
test('brush is linked with detailed constellation',async({page})=>{
  await ready(page);
  const min=page.getByLabel('Dashboard minimum Day 2 share');
  await min.focus();await min.press('Home');
  for(let i=0;i<8;i++)await min.press('ArrowRight');
  const max=page.getByLabel('Dashboard maximum Day 2 share');
  await max.focus();await max.press('End');
  for(let i=0;i<9;i++)await max.press('ArrowLeft');
  await expect(page.locator('.focus-brush')).toContainText('40%–55%');
  const muted=await page.locator('.focus-event-list button.muted').count();
  expect(muted).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Explore all charts ↗'}).click();
  await expect(page.locator('.constellation-brush-title')).toContainText('40%–55%');
  await expect(page.locator('.constellation-roster-muted')).toHaveCount(muted);
});
test('compact mobile view has no horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await ready(page);
  const w=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth}));
  expect(w.body).toBeLessThanOrEqual(w.viewport+2);expect(w.root).toBeLessThanOrEqual(w.viewport+2);
});
