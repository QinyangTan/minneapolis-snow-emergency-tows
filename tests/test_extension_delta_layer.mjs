import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DELTA_BANDS,DELTA_COLORS,deltaClass,deltaColor,signed,
  compareDayTwoToOne,explainDelta} from '../extension/src/deltaLayer.mjs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const city=load('../static/data/summary.json'),geo=load('../static/data/neighborhoods.geojson');

test('diverging legend has exactly nine fixed, mutually exclusive classes',()=>{
  assert.equal(DELTA_BANDS.length,9);
  assert.equal(new Set(DELTA_COLORS).size,9);
  for(const [v,k] of [[-999,0],[-40,0],[-39,1],[-15,1],[-14,2],[-5,2],[-4,3],[-1,3],
    [0,4],[1,5],[4,5],[5,6],[14,6],[15,7],[39,7],[40,8],[999,8]]){
    assert.equal(deltaClass(v),k);
    assert.equal(deltaColor(v),DELTA_COLORS[k]);
  }
  assert.throws(()=>deltaClass(.25),/integer/);
  assert.equal(signed(36),'+36');
  assert.equal(signed(-4),'−4');
  assert.equal(signed(0),'0');
  assert.equal(signed(1234),'+1,234');
});

test('Bridge Day 2 minus Day 1 uses actual official map records',()=>{
  const result=compareDayTwoToOne(geo,city,'Bridge');
  assert.equal(result.mode,'delta');assert.equal(result.rows.length,87);
  assert.equal(result.day1,86);assert.equal(result.day2,418);
  assert.equal(result.headline.primary,332);
  const marcy=result.rows.find(r=>r.name==='Marcy Holmes');
  assert.deepEqual(marcy,{name:'Marcy Holmes',first:26,second:62,count:36});
  assert.equal(result.top[0].name,'Loring Park');
  assert.equal(result.top[0].count,39);
  assert.match(explainDelta(result,'Marcy Holmes'),/26 Day 1 tows and 62 Day 2 tows \(\+36\)/);
  assert.match(explainDelta(result,'Marcy Holmes'),/not evidence that a rule caused/);
});

test('citywide and mapped deltas conserve their own denominators',()=>{
  for(const event of ['all',...city.events.map(e=>e.id)]){
    const result=compareDayTwoToOne(geo,city,event);
    const scope=event==='all'?city:city.events.find(e=>e.id===event);
    assert.equal(result.headline.primary,scope.days[1].count-scope.days[0].count);
    const mapped1=geo.features.reduce((s,f)=>s+(event==='all'?
      f.properties.days['1']:f.properties.byEvent[event].days['1']),0);
    const mapped2=geo.features.reduce((s,f)=>s+(event==='all'?
      f.properties.days['2']:f.properties.byEvent[event].days['2']),0);
    assert.equal(result.headline.secondary,mapped2-mapped1);
    assert.equal(result.rows.reduce((s,r)=>s+r.count,0),result.headline.secondary);
    assert.ok(result.top.every((r,i,arr)=>!i||Math.abs(arr[i-1].count)>=Math.abs(r.count)));
  }
  const all=compareDayTwoToOne(geo,city);
  assert.equal(all.day1,1255);assert.equal(all.day2,2222);
  assert.equal(all.headline.primary,967);assert.equal(all.headline.secondary,961);
  assert.notEqual(all.headline.primary,all.headline.secondary,
    'geographically unmatched City records must not be silently dropped');
  assert.throws(()=>compareDayTwoToOne(geo,city,'Not an event'),/Unknown emergency/);
});
