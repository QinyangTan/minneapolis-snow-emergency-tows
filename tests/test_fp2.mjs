import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizedCount,rank,spearman} from '../src/lib/fp2.mjs';
const data=JSON.parse(readFileSync('static/data/fp2-context.json','utf8'));
const geo=JSON.parse(readFileSync('static/data/neighborhoods.geojson','utf8'));
test('FP2 joins preserve geographic coverage and valid denominators',()=>{
 assert.equal(data.rows.length,87);assert.equal(new Set(data.rows.map(r=>r.name)).size,87);
 assert.deepEqual(data.rows.map(r=>r.name).sort(),geo.features.map(f=>f.properties.name).sort());
 assert.equal(data.rows.filter(r=>r.population!==null).length,86);
 assert.equal(data.rows.find(r=>r.name==='Humboldt Industrial Area').metrics.poverty,null);
 assert.equal(geo.features.reduce((n,f)=>n+f.properties.total,0),5355);
 for(const r of data.rows){for(const key of ['poverty','lowIncome','renters','noVehicle']){const m=r.metrics[key];if(m){assert.ok(m.value>=0&&m.value<=100);assert.ok(m.denominator>0);assert.ok(Math.abs(m.value-m.numerator/m.denominator*100)<1e-9);}}}
 assert.equal(data.rows.find(r=>r.name==='Armatage').metrics.poverty.period,'2019-2023');
 assert.equal(data.rows.find(r=>r.name==='Armatage').population.period,'2020-2024');
 assert.equal(data.saleAudit.included_sales,1472);assert.equal(data.rows.filter(r=>r.metrics.salePrice!==null).length,54);
 for(const r of data.rows)if(r.metrics.salePrice)assert.ok(r.metrics.salePrice.n>=10);
});
test('Scaling and tied rank correlation handle zero and missing values',()=>{
 assert.equal(normalizedCount(0,2000,'rate'),0);assert.equal(normalizedCount(20,2000,'rate'),10);
 assert.equal(normalizedCount(5,0,'rate'),null);assert.equal(normalizedCount(5,null,'rate'),null);
 assert.deepEqual(rank([2,2,5]),[1.5,1.5,3]);
 assert.equal(spearman([{x:1,y:3},{x:2,y:2},{x:3,y:1}]),-1);
 assert.equal(spearman([{x:1,y:0},{x:2,y:0},{x:3,y:0}]),null);
 assert.equal(spearman([{x:null,y:1},{x:2,y:2},{x:3,y:3}]),null);
});
test('Source geography retains real income and traffic coverage',()=>{
 const g=JSON.parse(readFileSync('static/data/fp2-geography.json','utf8'));
 assert.equal(g.tracts.features.length,121);
 assert.equal(new Set(g.tracts.features.map(f=>f.properties.geoid)).size,121);
 for(const f of g.tracts.features)assert.ok(f.properties.income===null||f.properties.income>=0);
 assert.equal(g.sites.length,1228);assert.equal(new Set(g.sites.map(s=>s.id)).size,1228);
 const c=JSON.parse(readFileSync('static/data/fp2-context.json','utf8'));
 assert.equal(c.rows.filter(r=>r.metrics.traffic).length,83);
 for(const r of c.rows)if(r.metrics.traffic)assert.ok(r.metrics.traffic.n>=3);
});
