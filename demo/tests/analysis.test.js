import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eventById, globalCountMaximum, metricValue, concentration,
  neighborhoodHistory, profileSummary
} from '../src/lib/analysis.js';

const neighborhood = (id, name, counts) => ({id, name, anchor:[-93.2,44.9], counts});
function dataset(id, start, neighborhoods, unmatched=0) {
  const dayTotals = [0,1,2].map(day=>neighborhoods.reduce((sum,n)=>sum+n.counts[day],0));
  return {event:{id,name:`Event ${id}`,start,end:start,total:dayTotals.reduce((a,b)=>a+b,0)+unmatched,dayTotals},
    neighborhoods,quality:{matched:dayTotals.reduce((a,b)=>a+b,0),unmatched}};
}
const collection = {events:[
  dataset('large','2024-02-01',[neighborhood('a','Alpha',[90,0,0])]),
  dataset('empty','2024-04-01',[neighborhood('a','Alpha',[0,0,0])]),
  dataset('small','2024-03-01',[neighborhood('a','Alpha',[0,10,0])]),
  dataset('tie','2024-01-01',[neighborhood('a','Alpha',[2,2,0])])
]};
const closeTo = (actual, expected) => assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);

test('event lookup returns its dataset and missing ids return null',()=>{
  assert.equal(eventById(collection,'small'),collection.events[2]);
  assert.equal(eventById(collection,'missing'),null);
});

test('global maximum uses every neighborhood-day count across events',()=>{
  const second = dataset('second','2025-01-01',[neighborhood('b','Beta',[7,120,3])]);
  assert.equal(globalCountMaximum({events:[...collection.events,second]}),120);
  assert.equal(globalCountMaximum({events:[]}),0);
});

test('Count returns the chosen day and Share uses its neighborhood three-day total',()=>{
  const n = neighborhood('a','Alpha',[2,6,0]);
  assert.equal(metricValue(n,2,'count'),6);
  assert.equal(metricValue(n,2,'share'),75);
  assert.equal(metricValue(n,3,'share'),0);
});

test('zero recorded counts have undefined Share instead of a zero percent claim',()=>{
  const n = neighborhood('a','Alpha',[0,0,0]);
  assert.equal(metricValue(n,1,'count'),0);
  assert.equal(metricValue(n,1,'share'),null);
});

test('concentration ranks totals and includes unmatched city records in its denominator',()=>{
  const data = dataset('rank','2024-01-01',[
    neighborhood('z','Zulu',[3,4,3]),
    neighborhood('b','Beta',[1,2,2]),
    neighborhood('a','Alpha',[5,0,5])
  ],15);
  const result = concentration(data,2);
  assert.deepEqual(result.leaders.map(n=>[n.id,n.total]),[['a',10],['z',10]]);
  assert.equal(result.records,20);
  assert.equal(result.denominator,40);
  assert.equal(result.share,50);
  assert.deepEqual(data.neighborhoods.map(n=>n.id),['z','b','a']);
});

test('concentration defaults to the five largest neighborhoods',()=>{
  const data = dataset('six','2024-01-01',[
    neighborhood('a','Alpha',[1,0,0]),neighborhood('b','Beta',[2,0,0]),
    neighborhood('c','Charlie',[3,0,0]),neighborhood('d','Delta',[4,0,0]),
    neighborhood('e','Echo',[5,0,0]),neighborhood('f','Foxtrot',[6,0,0])
  ]);
  const result = concentration(data);
  assert.deepEqual(result.leaders.map(n=>n.id),['f','e','d','c','b']);
  assert.equal(result.records,20);
  closeTo(result.share,95.23809523809524);
});

test('concentration reports no percentage when the entire city denominator is zero',()=>{
  const result = concentration(dataset('zero','2024-01-01',[neighborhood('a','Alpha',[0,0,0])]));
  assert.equal(result.records,0);
  assert.equal(result.denominator,0);
  assert.equal(result.share,null);
});

test('history sorts events chronologically without mutating the collection',()=>{
  const rows = neighborhoodHistory(collection,'a');
  assert.deepEqual(rows.map(row=>row.eventId),['tie','large','small','empty']);
  assert.deepEqual(rows[0],{eventId:'tie',eventName:'Event tie',start:'2024-01-01',
    counts:[2,2,0],total:4,shares:[50,50,0],peakDays:[1,2]});
  assert.deepEqual(rows[3].shares,[null,null,null]);
  assert.deepEqual(rows[3].peakDays,[]);
  assert.deepEqual(collection.events.map(data=>data.event.id),['large','empty','small','tie']);
});

test('a missing neighborhood produces no history',()=>{
  assert.deepEqual(neighborhoodHistory(collection,'missing'),[]);
});

test('profile counts sole dominant days separately from ties and empty events',()=>{
  const result = profileSummary(collection,'a');
  assert.equal(result.recordedEvents,3);
  assert.deepEqual(result.dominantDayCounts,[1,1,0]);
  assert.equal(result.tieEvents,1);
  assert.equal(result.emptyEvents,1);
});

test('pooled Share retains event volume while equal-event Share gives each recorded event one vote',()=>{
  const result = profileSummary(collection,'a');
  closeTo(result.pooledShares[0],88.46153846153847);
  closeTo(result.pooledShares[1],11.538461538461538);
  assert.equal(result.pooledShares[2],0);
  assert.deepEqual(result.equalEventShares,[50,50,0]);
});

test('empty and missing profiles preserve undefined averages',()=>{
  const expected = {recordedEvents:0,dominantDayCounts:[0,0,0],tieEvents:0,emptyEvents:0,
    pooledShares:[null,null,null],equalEventShares:[null,null,null]};
  assert.deepEqual(profileSummary(collection,'missing'),expected);
  const zero = {events:[dataset('zero','2024-01-01',[neighborhood('a','Alpha',[0,0,0])])]};
  assert.deepEqual(profileSummary(zero,'a'),{...expected,emptyEvents:1});
});
