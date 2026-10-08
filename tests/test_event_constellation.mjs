import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { constellationRows, constellationScale, bubbleDiameter } from '../src/lib/eventConstellation.mjs';

const load=file=>JSON.parse(readFileSync(new URL(file,import.meta.url),'utf8'));
const summary=load('../static/data/summary.json');
const geography=load('../static/data/neighborhoods.geojson');

test('event constellation uses all nine validated emergencies without dropping a tow',()=>{
  const rows=constellationRows(summary.events,geography);
  assert.equal(rows.length,9);
  assert.equal(rows.reduce((n,row)=>n+row.total,0),5423);
  assert.equal(rows.reduce((n,row)=>n+row.mapped,0),5355);
  assert.equal(rows.reduce((n,row)=>n+row.unmapped,0),68);
  const dayTwo=rows.reduce((n,row)=>n+row.day2Share*row.total,0);
  assert.ok(Math.abs(dayTwo-2222)<1e-8);
  for(const row of rows){
    assert.ok(row.day2Share>=0&&row.day2Share<=1);
    assert.ok(row.concentration===null||(row.concentration>=0&&row.concentration<=1));
    assert.ok(row.topFive<=row.mapped);
    assert.equal(row.total,row.mapped+row.unmapped);
  }
});

test('mapped-only top-five share never accidentally divides by all City records',()=>{
  const rows=constellationRows(summary.events,geography);
  for(const event of summary.events){
    const row=rows.find(x=>x.id===event.id);
    const top=geography.features.map(f=>f.properties.byEvent[event.id]?.total??0)
      .sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0);
    const mapped=geography.features.reduce((n,f)=>n+(f.properties.byEvent[event.id]?.total??0),0);
    assert.equal(row.mapped,mapped);
    assert.equal(row.topFive,top);
    assert.ok(Math.abs(row.concentration-top/mapped)<1e-12);
    const dayTwo=event.days.find(d=>d.day===2).count;
    assert.ok(Math.abs(row.day2Share-dayTwo/event.total)<1e-12);
  }
});

test('bubble area corresponds to event volume; equal-size mode removes volume encoding',()=>{
  const diamSmall=bubbleDiameter(400,900);
  const diamLarge=bubbleDiameter(900,900);
  assert.ok(diamLarge>diamSmall);
  assert.ok(Math.abs((diamSmall/diamLarge)**2-400/900)<.03);
  assert.equal(bubbleDiameter(400,900,true),30);
  assert.equal(bubbleDiameter(900,900,true),30);
  assert.throws(()=>bubbleDiameter(-1,900),/Invalid bubble/);
  const {xMax,yMax,maxCount}=constellationScale(constellationRows(summary.events,geography));
  assert.ok(xMax<=1&&yMax<=1&&xMax>.1&&yMax>.1);
  assert.equal(maxCount,852);
});

test('invalid days, duplicate events and mapping inconsistencies are rejected',()=>{
  const event={id:'X',total:3,days:[{day:1,count:1},{day:2,count:1},{day:3,count:1}]};
  const area={features:[{properties:{name:'N',byEvent:{X:{total:2}}}}]};
  assert.equal(constellationRows([event],area)[0].unmapped,1);
  assert.throws(()=>constellationRows([event,event],area),/unique/);
  assert.throws(()=>constellationRows([{...event,total:4}],area),/match/);
  assert.throws(()=>constellationRows([event],{features:[{properties:{name:'N',byEvent:{X:{total:4}}}}]}),/exceed/);
  assert.equal(constellationRows([event],{features:[]})[0].concentration,null);
});
