import { test, expect } from '@playwright/test';

// Works from / locally and from /minneapolis-snow-emergency-tows/ in a
// deployed project-path preview. Does not assume root-mounted /data URLs.
test('static project-path preview loads the official City data and maps',async ({page})=>{
  const requests=[];
  page.on('response',response=>{
    if(/\/(summary\.json|neighborhoods\.geojson)$/.test(new URL(response.url()).pathname)) {
      requests.push({url:response.url(),status:response.status()});
    }
  });
  await page.goto('./');
  await expect(page.locator('.status-strip')).toContainText('Regenerated City ArcGIS');
  await page.getByRole('button',{name:'Explore all charts ↗'}).click();
  await expect(page.locator('.fingerprint-card')).toHaveCount(9);
  await expect(page.locator('.small-map-panel')).toHaveCount(3);
  const base=process.env.PAGES_BASE_PATH||'';
  for(const name of ['summary.json','neighborhoods.geojson']){
    const data=requests.find(r=>r.url.endsWith(base+'/data/'+name));
    expect(data,'Expected fetched processed dataset under declared app base: '+name).toBeTruthy();
    expect(data.status).toBe(200);
  }
  await expect(page.locator('.pair-evidence .pair-row')).toHaveCount(3);
});