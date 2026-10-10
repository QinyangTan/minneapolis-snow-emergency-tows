import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { constellationRows } from '../src/lib/eventConstellation.mjs';
import { brushByDayTwo } from '../src/lib/constellationBrush.mjs';

const summary = JSON.parse(readFileSync(new URL('../static/data/summary.json', import.meta.url)));
const geo = JSON.parse(readFileSync(new URL('../static/data/neighborhoods.geojson', import.meta.url)));
const points = constellationRows(summary.events, geo);

test('inclusive brush preserves all original event records and distinguishes subsets', () => {
  assert.equal(brushByDayTwo(points, 0, 100).length, 9);
  const selection = brushByDayTwo(points, 40, 55).map(row => row.id).sort();
  assert.deepEqual(selection, ['Bridge', 'Howard', 'Lourdes']);
  assert.deepEqual(brushByDayTwo(points, 60, 70).map(row => row.id), ['Glenwood']);
  assert.equal(brushByDayTwo(points, 80, 100).length, 0);
  assert.equal(points.reduce((n, p) => n + p.total, 0), 5423);
});

test('brush rejects invalid or reversed percentages', () => {
  for (const [min, max] of [[-1, 100], [20, 101], [60, 40], [NaN, 50]]) {
    assert.throws(() => brushByDayTwo(points, min, max), /Brush boundaries/);
  }
  assert.deepEqual(brushByDayTwo([], 0, 100), []);
});
