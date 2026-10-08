import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareCategoryShares } from '../src/lib/comparisonEvidence.mjs';
import { dayVector, neighborhoodVector } from '../src/lib/eventAnalysis.mjs';

const summary=JSON.parse(readFileSync(new URL('../static/data/summary.json',import.meta.url),'utf8'));
const geography=JSON.parse(readFileSync(new URL('../static/data/neighborhoods.geojson',import.meta.url),'utf8'));
const event=id=>summary.events.find(e=>e.id===id);

test('three-day shares preserve meaningful citywide event denominators',()=>{
  const result=compareCategoryShares(dayVector(event('Bridge')),dayVector(event('Howard')),['Day 1','Day 2','Day 3']);
  assert.equal(result.rows.length,3);
  assert.equal(result.totalCategories,3);
  assert.equal(result.empty,false);
  assert.ok(Math.abs(result.rows.reduce((n,row)=>n+row.shareA,0)-1)<1e-12);
  assert.ok(Math.abs(result.rows.reduce((n,row)=>n+row.shareB,0)-1)<1e-12);
  for(const row of result.rows)assert.ok(Math.abs(row.deltaPp-100*(row.shareB-row.shareA))<1e-10);
  assert.equal(result.rows[0].countA,86);
  assert.equal(result.rows[0].name,'Day 1');
});

test('spatial differences are sorted by absolute percentage-point separation, not raw counts',()=>{
  const a=neighborhoodVector(geography,'Bridge'),b=neighborhoodVector(geography,'Glenwood');
  const labels=geography.features.map(f=>f.properties.name);
  const result=compareCategoryShares(a,b,labels,{sortByGap:true,limit:8});
  assert.equal(result.rows.length,8);
  assert.equal(result.totalCategories,87);
  for(let i=1;i<8;i++)assert.ok(result.rows[i-1].absGap>=result.rows[i].absGap-1e-12);
  assert.ok(result.rows.every(r=>r.countA>=0 && r.countB>=0 && r.absGap>=0));
  assert.ok(result.maxShare<=1);
});

test('identical events give zero gaps, nonzero sample denominator',()=>{
  const vector=dayVector(event('Jefferson'));
  const data=compareCategoryShares(vector,vector,['Day 1','Day 2','Day 3']);
  assert.ok(data.rows.every(r=>r.deltaPp===0));
});

test('invalid and empty distributions never imply comparable evidence',()=>{
  assert.throws(()=>compareCategoryShares([1,2],[1],['A','B']),/aligned/);
  assert.throws(()=>compareCategoryShares([1,2],[1,2],['A','A']),/unique/);
  assert.throws(()=>compareCategoryShares([1,-2],[1,2],['A','B']),/nonnegative/);
  assert.throws(()=>compareCategoryShares([1],[1],['A'],{limit:0}),/positive/);
  const empty=compareCategoryShares([0,0],[1,2],['A','B']);
  assert.equal(empty.empty,true);
  assert.deepEqual(empty.rows,[]);
});
