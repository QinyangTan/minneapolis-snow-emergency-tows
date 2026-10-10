import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COUNT_BANDS,REPEAT_BANDS,HIGH_CONTRAST_COLORS,legendBands,colorClass,colorForObservation,recurrenceRows,layerAnalysis,explainSelection} from '../extension/src/storyLayers.mjs';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const city=load('../static/data/summary.json'),geo=load('../static/data/neighborhoods.geojson');

test('six distinct labeled ordinal classes; fixed bands across day filters',()=>{
  assert.equal(COUNT_BANDS.length,6);assert.equal(REPEAT_BANDS.length,6);
  assert.equal(new Set(HIGH_CONTRAST_COLORS).size,6);
  assert.deepEqual(legendBands().map(x=>x.label),['0','1–4','5–14','15–39','40–99','100+']);
  for(const [value,expected] of [[0,0],[1,1],[4,1],[5,2],[14,2],[15,3],[39,3],[40,4],[99,4],[100,5],[5423,5]]){
    assert.equal(colorClass(value),expected);
    assert.equal(colorForObservation(value),HIGH_CONTRAST_COLORS[expected]);
  }
  for(const [value,expected] of [[0,0],[1,1],[2,1],[3,2],[4,2],[5,3],[6,3],[7,4],[8,4],[9,5]])
    assert.equal(colorClass(value,'recurrence'),expected);
  assert.throws(()=>colorClass(-1),/nonnegative/);
});

test('historic count panels distinguish citywide from mapped records',()=>{
  const all=layerAnalysis(geo,city,{mode:'counts'});
  assert.equal(all.headline.primary,5423);assert.equal(all.headline.secondary,5355);
  assert.equal(all.rows.length,87);
  const bridge=layerAnalysis(geo,city,{mode:'counts',event:'Bridge',day:2});
  assert.equal(bridge.headline.primary,418);
  assert.equal(bridge.rows.find(r=>r.name==='Marcy Holmes').count,62);
  assert.match(explainSelection(bridge,city,'Marcy Holmes'),/62 observed records/);
  assert.match(explainSelection(bridge,city,'Marcy Holmes'),/not parking risk/);
});

test('recurrence counts distinct emergencies, not records',()=>{
  const rows=recurrenceRows(geo,city.events,0,'any',5);
  assert.equal(rows.length,87);
  for(const row of rows){
    const feature=geo.features.find(f=>f.properties.name===row.name);
    const truth=city.events.filter(e=>feature.properties.byEvent[e.id].total>0).length;
    assert.equal(row.count,truth);assert.equal(row.eventIds.length,truth);
    assert.equal(new Set(row.eventIds).size,truth);
  }
  const r=layerAnalysis(geo,city,{mode:'recurrence',day:0,recurrenceMetric:'any'});
  assert.equal(r.headline.primary,9);
  assert.equal(r.headline.secondary,rows.filter(x=>x.count>0).length);
  assert.match(explainSelection(r,city,'all','any'),/not a risk score/);
});

test('top K prominence includes ties with minimum five records',()=>{
  for(const day of [0,1,2,3]){
    const any=recurrenceRows(geo,city.events,day,'any',5);
    const p5=recurrenceRows(geo,city.events,day,'prominent',5);
    const p10=recurrenceRows(geo,city.events,day,'prominent',10);
    const p15=recurrenceRows(geo,city.events,day,'prominent',15);
    for(let i=0;i<87;i++){
      assert.ok(p5[i].count<=p10[i].count);
      assert.ok(p10[i].count<=p15[i].count);
      assert.ok(p15[i].count<=any[i].count);
    }
  }
  const fixture={features:[5,7,7,6,5,5,4].map((total,i)=>({
    properties:{name:'N'+i,total,days:{1:total},byEvent:{X:{total,days:{1:total}}}}
  }))};
  const ranked=recurrenceRows(fixture,[{id:'X'}],1,'prominent',5);
  assert.equal(ranked.filter(x=>x.count===1).length,6);
  assert.equal(ranked.find(x=>x.name==='N6').count,0);
});

test('recurrence is independent of single-event dropdown',()=>{
  const p={mode:'recurrence',day:2,recurrenceMetric:'prominent',topK:10};
  const a=layerAnalysis(geo,city,{...p,event:'Bridge'});
  const b=layerAnalysis(geo,city,{...p,event:'Glenwood'});
  assert.deepEqual(a.rows,b.rows);
  assert.match(explainSelection(a,city,'all','prominent',10),/Top 10/);
  assert.throws(()=>recurrenceRows(geo,city.events,5,'any',5),/Unknown/);
  assert.throws(()=>recurrenceRows(geo,city.events,0,'prominent',99),/Invalid/);
});
