import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function ready(page) {
  await page.goto('/');
  await expect(page.getByRole('combobox', { name: 'Snow Emergency event' })).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Neighborhood' }).locator('option')).toHaveCount(87);
  await expect(page.getByTestId('inspection')).toContainText('Marcy Holmes');
}

test('live City collection, day changes and geographic counts are inspectable', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 1000});
  await ready(page);
  const event = page.getByRole('combobox', {name:'Snow Emergency event'});
  await expect(event.locator('option')).toHaveCount(10);
  await expect(page.getByTestId('day-1')).toContainText('86 records');
  await expect(page.getByTestId('day-2')).toContainText('418 records');
  await expect(page.getByTestId('day-3')).toContainText('348 records');
  await expect(page.locator('.selected-count b')).toHaveText('62');
  await page.getByTestId('day-3').click();
  await expect(page.locator('.selected-count b')).toHaveText('1');
  await expect(page.getByTestId('day-3')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Share',exact:true}).click();
  await expect(page.locator('.selected-count b')).toHaveText('1.1%');
  await expect(page.locator('.metric-explanation')).toContainText('Zero-total shares are undefined');
  await page.getByRole('button',{name:'Count',exact:true}).click();
  await expect(page.locator('.selected-count b')).toHaveText('1');
  await event.selectOption('omega-2025');
  await expect(event).toHaveValue('omega-2025');
  await expect(page.locator('.coverage')).toContainText('unmatched records');
});

test('two-event comparison shows proper denominators and can be dismissed', async ({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await ready(page);
  await page.locator('.event-comparison summary').click();
  await page.getByRole('combobox',{name:'Comparison event'}).selectOption('howard-2024');
  await expect(page.locator('.comparison-detail')).toContainText('Howard');
  await expect(page.locator('.comparison-detail')).toContainText('Day 2');
  await expect(page.locator('.event-comparison summary')).toContainText('Howard');
  await page.getByRole('button',{name:'Reset map, day, metric and neighborhood'}).click();
  await expect(page.locator('.comparison-detail')).toHaveCount(0);
  await expect(page.getByTestId('day-2')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.selected-count b')).toHaveText('62');
});

test('the graphic remains accessible by keyboard, with semantic alternatives',async ({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await ready(page);
  const canvas=page.locator('.city-stage canvas');
  await expect(canvas).toHaveAttribute('tabindex','0');
  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('+');
  await page.keyboard.press('Home');
  await expect(page.getByRole('button',{name:'Reset camera rotation and zoom'})).toBeVisible();
  const count=await page.locator('.selected-count').innerText();
  expect(count).toContain('62');
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  const serious=audit.violations.filter(v=>['critical','serious'].includes(v.impact));
  expect(serious,JSON.stringify(serious.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})))).toHaveLength(0);
});

test('responsive mobile preserves records, history and no document overflow',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await ready(page);
  await expect(page.getByTestId('day-2')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('combobox',{name:'Snow Emergency event'}).selectOption('omega-2025');
  await page.getByTestId('day-1').click();
  await page.getByRole('button',{name:'Share',exact:true}).click();
  await expect(page.locator('.selected-count b')).toContainText('%');
  await expect(page.locator('.history-table tbody tr')).toHaveCount(10);
  const dimensions=await page.evaluate(()=>({
    viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport+2);
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport+2);
});

test('3D failure degrades to labeled SVG and HTML values without losing controls',async ({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;
      return original.call(this,type,...args);
    };
  });
  await ready(page);
  await expect(page.locator('.map-fallback')).toBeVisible();
  await expect(page.locator('.map-fallback svg')).toHaveAttribute('aria-label',/Minneapolis neighborhood map/);
  await page.getByTestId('day-3').click();
  await expect(page.locator('.selected-count b')).toHaveText('1');
  await page.getByRole('combobox',{name:'Neighborhood'}).selectOption({label:'Central'});
  await expect(page.getByTestId('inspection')).toContainText('Central');
});
