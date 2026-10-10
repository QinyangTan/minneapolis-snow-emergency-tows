import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { constellationRows } from '../src/lib/eventConstellation.mjs';
import { brushByDayTwo } from '../src/lib/constellationBrush.mjs';

// Instructor-guided study answer-key regression: actual frozen City of Minneapolis aggregates.
// These assertions guard against publishing an outdated facilitator answer key after regeneration.
const load = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const summary = load('../static/data/summary.json');
const geo = load('../static/data/neighborhoods.geojson');
const byName = id => summary.events.find(row => row.id === id);
const dayCount = (id,day) => byName(id).days.find(row => row.day === day).count;

test('facilitator task key T1/T2 remains grounded in checked-in City totals', () => {
  assert.equal(summary.total,5423);
  assert.equal(byName('Bridge').total,852);
  assert.equal(dayCount('Bridge',2),418);
  assert.equal(byName('Howard').total,665);
  assert.equal(dayCount('Howard',2),329);
  assert.equal(byName('Glenwood').total,719);
  assert.equal(dayCount('Glenwood',2),448);
  const rows = constellationRows(summary.events,geo);
  const max = [...rows].sort((a,b)=>b.day2Share-a.day2Share)[0];
  assert.equal(max.id,'Glenwood');
  assert.ok(Math.abs(max.day2Share-0.623)<0.002);
});

test('facilitator task key T3 includes exactly 3 events',()=>{
  const rows=constellationRows(summary.events,geo);
  assert.deepEqual(brushByDayTwo(rows,40,55).map(x=>x.id).sort(),
    ['Bridge','Howard','Lourdes']);
});

test('facilitator task key T4 keeps mapped count distinct from probability',()=>{
  const area=geo.features.find(feature=>feature.properties.name==='Marcy Holmes');
  assert.ok(area,'official neighborhood data must include Marcy Holmes');
  assert.equal(area.properties.byEvent.Bridge.days['2'],62);
  assert.equal(area.properties.byEvent.Bridge.total,89);
  assert.equal(geo.features.length,87);
  assert.equal(summary.unassigned_neighborhood_count,68);
});
