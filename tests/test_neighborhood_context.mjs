import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contextValue, contextRows, contextDomain } from '../src/lib/neighborhoodContext.mjs';

const geography = JSON.parse(readFileSync(new URL('../static/data/neighborhoods.geojson', import.meta.url)));
const context = { neighborhoods: [
  { name: 'Marcy Holmes', areaKm2: 2, population: { estimate: 15393, moe: 1000, period: '2020-2024', reliability: 'High' },
    attributes: { renters: { percent: 80, moe: 4, period: '2020-2024', reliability: 'High' }, poverty: { percent: 20, moe: 3, period: '2019-2023', reliability: 'Medium' } } },
  { name: 'Humboldt Industrial Area', areaKm2: 1, population: null, attributes: {} }
] };

test('resident and area measures use the selected count and the correct denominator', () => {
  const row = context.neighborhoods[0];
  assert.ok(Math.abs(contextValue(577, row, 'residents') - 37.48457090885467) < 1e-10);
  assert.equal(contextValue(62, row, 'area'), 31);
  assert.equal(contextValue(62, row, 'count'), 62);
});

test('zero records stay zero while unknown or zero denominators remain undefined', () => {
  assert.equal(contextValue(0, context.neighborhoods[0], 'residents'), 0);
  assert.equal(contextValue(0, context.neighborhoods[1], 'residents'), null);
  assert.equal(contextValue(3, { areaKm2: 0, population: { estimate: 0 } }, 'residents'), null);
  assert.equal(contextValue(3, { areaKm2: 0, population: null }, 'area'), null);
  assert.equal(contextValue(3, null, 'count'), 3);
  assert.equal(contextValue(3, null, 'residents'), null);
});

test('event and day selection recalculate values without replacing the ACS period', () => {
  const all = contextRows(geography, context, 'all', 0, 'count', 'renters').find(r => r.name === 'Marcy Holmes');
  const selected = contextRows(geography, context, 'Bridge', 2, 'residents', 'poverty').find(r => r.name === 'Marcy Holmes');
  assert.equal(all.count, 577);
  assert.equal(selected.count, 62);
  assert.ok(Math.abs(selected.value - 4.027804846358734) < 1e-10);
  assert.equal(selected.attribute.period, '2019-2023');
  assert.equal(selected.context.population.period, '2020-2024');
});

test('all geographic neighborhoods survive a partial context join', () => {
  const rows = contextRows(geography, context, 'all', 0, 'residents', 'renters');
  assert.equal(rows.length, 87);
  const missing = rows.find(r => r.name === 'Humboldt Industrial Area');
  assert.equal(missing.count, 0);
  assert.equal(missing.value, null);
  assert.equal(missing.attribute, null);
});

test('the shared domain comes from all-event totals rather than a selected day', () => {
  assert.equal(contextDomain(geography, context, 'count'), 577);
  assert.equal(contextDomain(geography, context, 'area'), 288.5);
  assert.ok(Math.abs(contextDomain(geography, context, 'residents') - 37.48457090885467) < 1e-10);
});

test('published context preserves missingness, indicator vintages and complete neighborhood coverage', () => {
  const payload = JSON.parse(readFileSync(new URL('../static/data/neighborhood-context.json', import.meta.url)));
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.neighborhoods.length, 87);
  assert.equal(payload.neighborhoods.filter(r => r.population?.estimate > 0).length, 86);
  const missing = payload.neighborhoods.find(r => r.name === 'Humboldt Industrial Area');
  assert.equal(missing.population, null);
  const marcy = payload.neighborhoods.find(r => r.name === 'Marcy Holmes');
  assert.equal(marcy.population.estimate, 15393);
  assert.equal(marcy.attributes.poverty.period, '2019-2023');
  assert.equal(marcy.attributes.renters.period, '2020-2024');
  assert.equal(payload.ordinaryDayBaseline, null);
});
