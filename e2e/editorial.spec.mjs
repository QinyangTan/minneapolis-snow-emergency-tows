import { test, expect } from '@playwright/test';

async function ready(page) {
  await page.goto('/');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  await expect(page.locator('.fingerprint-card')).toHaveCount(9);
}

test('nine event fingerprints expose four dimensions and filter all views', async ({page}) => {
  await page.setViewportSize({width:1400,height:900});
  await ready(page);
  const bridge=page.locator('.fingerprint-card').filter({hasText:'Bridge'});
  await expect(bridge.locator('.fingerprint-total')).toContainText('852');
  await expect(bridge.locator('.fingerprint-stack span')).toHaveCount(3);
  const shares=await bridge.locator('.fingerprint-stack span').evaluateAll(nodes=>
    nodes.map(node=>parseFloat(node.style.width)));
  expect(shares.reduce((a,b)=>a+b,0)).toBeCloseTo(100,2);
  await bridge.click();
  await expect(bridge).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.filterbar select')).toHaveValue('Bridge');
  await bridge.click();
  await expect(page.locator('.filterbar select')).toHaveValue('all');
});

test('pairwise 9x9 matrix is symmetric and updates pair comparison', async ({page}) => {
  await page.setViewportSize({width:1365,height:900});
  await ready(page);
  const matrix=page.locator('.similarity-matrix');
  await expect(matrix.locator('tbody tr')).toHaveCount(9);
  await expect(matrix.locator('tbody td button')).toHaveCount(81);
  const cells=await matrix.locator('tbody tr').evaluateAll(rows=>
    rows.map(row=>[...row.querySelectorAll('td button')].map(cell=>Number(cell.textContent.trim()))));
  for(let i=0;i<9;i++){
    expect(cells[i][i]).toBe(0);
    for(let j=0;j<9;j++)expect(cells[i][j]).toBe(cells[j][i]);
  }
  await matrix.getByRole('button',{name:/Compare Bridge to Glenwood:/}).click();
  await expect(page.locator('select[aria-label="First Snow Emergency"]')).toHaveValue('Bridge');
  await expect(page.locator('select[aria-label="Second Snow Emergency"]')).toHaveValue('Glenwood');
  const pair=matrix.getByRole('button',{name:/Compare Bridge to Glenwood:/});
  const days=await pair.textContent();
  await page.locator('select[aria-label="Compare events by distribution"]').selectOption('neighborhoods');
  await expect.poll(async()=>await pair.textContent()).not.toBe(days);
  await page.locator('select[aria-label="Compare events by distribution"]').selectOption('days');
  await expect(pair).toHaveText(days.trim());
});

test('rank sensitivity plot has nondecreasing top-K recurrence and links to city explorer', async ({page}) => {
  await ready(page);
  const slopes=page.locator('.sensitivity-row');
  await expect(slopes).toHaveCount(10);
  const values=await slopes.evaluateAll(rows=>rows.map(row=>{
    const svg=row.querySelector('svg');
    const label=svg?.getAttribute('aria-label')??'';
    return [...label.matchAll(/top (?:5|10|15) (\d+)/gi)].map(x=>Number(x[1]));
  }));
  for(const v of values){
    expect(v).toHaveLength(3);
    expect(v[0]).toBeLessThanOrEqual(v[1]);
    expect(v[1]).toBeLessThanOrEqual(v[2]);
  }
  const area=await slopes.first().locator('.sensitivity-name').textContent();
  await slopes.first().click();
  await expect(page.locator('.area-detail h3')).toHaveText(area.trim());
  await page.locator('.filterbar .day-picker button').filter({hasText:/^2$/}).click();
  await expect(slopes).toHaveCount(10);
});

test('responsive editorial views keep 390px viewport without root overflow', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await ready(page);
  await expect(page.locator('.fingerprint-gallery .fingerprint-card')).toHaveCount(9);
  const dims=await page.evaluate(()=>({
    viewport:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth
  }));
  expect(dims.body).toBeLessThanOrEqual(dims.viewport+2);
  expect(dims.root).toBeLessThanOrEqual(dims.viewport+2);
});
