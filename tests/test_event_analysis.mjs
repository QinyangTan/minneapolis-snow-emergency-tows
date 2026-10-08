import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  probabilityVector, jsDivergence, dayVector, neighborhoodVector,
  compareEvents, topEventPairs, prominentNeighborhoods, prominentRecurrence
} from '../src/lib/eventAnalysis.mjs';

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const summary = load('../static/data/summary.json');
const geo = load('../static/data/neighborhoods.geojson');

test('Jensen–Shannon: identity, symmetry, disjoint and scale invariance', () => {
  assert.equal(jsDivergence([5,1,3], [10,2,6]), 0);
  assert.equal(jsDivergence([1,0], [0,1]), 1);
  assert.equal(jsDivergence([0,0,0], [1,2,3]), null);
  assert.deepEqual(probabilityVector([2,2]), [0.5, 0.5]);
  for (let i=1; i<20; i++) {
    const a=[i,i+1,0], b=[0,i+1,i];
    const x=jsDivergence(a,b), y=jsDivergence(b,a);
    assert.ok(x>=0 && x<=1);
    assert.ok(Math.abs(x-y) < 1e-12);
  }
});

test('JSD validation rejects incomparable and malformed counts', () => {
  assert.throws(() => jsDivergence([1,2],[1]), /same number/);
  assert.throws(() => jsDivergence([-1,2],[2,3]), /nonnegative/);
  assert.throws(() => probabilityVector([NaN]), /finite/);
});

test('every event comparison is unique and based on the verified data', () => {
  assert.equal(summary.events.length, 9);
  assert.equal(geo.features.length, 87);
  assert.equal(summary.total, 5423);
  const dayPairs=compareEvents(summary.events,geo,'days');
  const neighborhoodPairs=compareEvents(summary.events,geo,'neighborhoods');
  assert.equal(dayPairs.length,36);
  assert.equal(neighborhoodPairs.length,36);
  assert.equal(new Set(dayPairs.map((x)=>[x.a,x.b].sort().join('/'))).size,36);
  for (const pair of [...dayPairs,...neighborhoodPairs]) {
    assert.ok(pair.divergence >=0 && pair.divergence<=1);
  }
  const result=topEventPairs(summary.events,geo,'neighborhoods');
  assert.equal(result.closest.length,3);
  assert.equal(result.farthest.length,3);
  assert.ok(result.closest[0].divergence <= result.farthest[0].divergence);
  const bridge=summary.events.find((e)=>e.id==='Bridge');
  assert.equal(dayVector(bridge).reduce((a,b)=>a+b,0),bridge.total);
  const spatial=neighborhoodVector(geo,'Bridge');
  assert.ok(spatial.reduce((a,b)=>a+b,0) <= bridge.total);
});

test('prominence respects positive minimum and inclusive ties at cutoff', () => {
  const mock = { features:[
    {properties:{name:'A',byEvent:{X:{total:8,days:{1:8}}}}},
    {properties:{name:'B',byEvent:{X:{total:6,days:{1:6}}}}},
    {properties:{name:'C',byEvent:{X:{total:6,days:{1:6}}}}},
    {properties:{name:'D',byEvent:{X:{total:2,days:{1:2}}}}}
  ]};
  assert.deepEqual([...prominentNeighborhoods(mock,'X',0,2,5)].sort(),['A','B','C']);
  assert.deepEqual([...prominentNeighborhoods(mock,'X',1,1,8)],['A']);
  assert.throws(()=>prominentNeighborhoods(mock,'X',0,0,5),/Bad prominence/);
  assert.equal(prominentRecurrence(mock,['X'],0,2,5).get('D'),0);
});

test('rank sensitivity is monotone for top-5 / top-10 / top-15 recurrence', () => {
  const ids=summary.events.map((e)=>e.id);
  const five=prominentRecurrence(geo,ids,0,5,5);
  const ten=prominentRecurrence(geo,ids,0,10,5);
  const fifteen=prominentRecurrence(geo,ids,0,15,5);
  for (const key of five.keys()) {
    assert.ok(five.get(key) <= ten.get(key));
    assert.ok(ten.get(key) <= fifteen.get(key));
    assert.ok(fifteen.get(key) <= ids.length);
  }
});
