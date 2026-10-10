import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { eventConstellation } from '../src/lib/constellationAnalysis.mjs';
const summary = JSON.parse(readFileSync(new URL('../static/data/summary.json', import.meta.url)));
const geo = JSON.parse(readFileSync(new URL('../static/data/neighborhoods.geojson', import.meta.url)));
test('event constellation uses citywide vs mapped denominators separately', () => {
  const points = eventConstellation(summary.events, geo);
  assert.equal(points.length, 9);
  assert.equal(points.reduce((sum, p) => sum + p.total, 0), summary.total);
  assert.equal(points.reduce((sum, p) => sum + p.unassignedCount, 0), summary.unassigned_neighborhood_count);
  for (const p of points) {
    assert.ok(p.dayTwoShare >= 0 && p.dayTwoShare <= 1);
    assert.ok(p.topFiveShare >= 0 && p.topFiveShare <= 1);
    assert.ok([1, 2, 3].includes(p.peakDay));
  }
  const glenwood = points.find((p) => p.id === 'Glenwood');
  assert.equal(glenwood.total, 719);
  assert.equal(glenwood.mappedCount, 715);
  assert.ok(Math.abs(glenwood.dayTwoShare - .623) < .002);
  assert.ok(Math.abs(glenwood.topFiveShare - .378) < .002);
  assert.equal(glenwood.peakDay, 2);
});
test('invalid day totals are rejected rather than drawn as misleading proportions', () => {
  assert.throws(() => eventConstellation([{ id: 'bad', total: 4, days: [{day:1,count:4},{day:2,count:4},{day:3,count:0}] }], geo), /mismatch/);
});
test('empty neighborhood denominator is explicit', () => {
  const e = [{id:'Empty',season:'test',total:3,days:[{day:1,count:1},{day:2,count:1},{day:3,count:1}]}];
  assert.equal(eventConstellation(e, {features:[]})[0].topFiveShare, null);
});
