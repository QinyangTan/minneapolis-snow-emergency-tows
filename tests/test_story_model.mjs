import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { steps, stormLayout, scatterLayout, topMovers, gapCategory, diverging } from '../src/lib/story/storyModel.mjs';

const story = JSON.parse(readFileSync(new URL('../static/data/story.json', import.meta.url)));

test('story data reconciles with the FP2 analysis', () => {
  assert.equal(story.storms.length, 29);
  assert.equal(story.storms.reduce((n, s) => n + s.tows, 0), 27839);
  assert.equal(story.neighborhoods.reduce((n, h) => n + h.snowTows, 0), 5355);
  assert.equal(story.neighborhoods.reduce((n, h) => n + h.ordinaryTows, 0), 1332);
  assert.ok(Math.abs(story.neighborhoods.reduce((n, h) => n + h.gap, 0)) < 1e-6);
  assert.ok(Math.abs(story.povertyGroups.reduce((n, g) => n + g.snowShare, 0) - 100) < 1e-6);
});

test('storm columns stack to their totals and leave one gap slot for quarantined storms', () => {
  const { columns, gapX, y } = stormLayout(story.storms);
  for (const c of columns) {
    const h = c.segments.reduce((n, s) => n + s.h, 0);
    assert.ok(Math.abs((430 - h) - y(c.tows)) < 1e-6);
  }
  assert.ok(gapX > columns.find(c => !c.late && c.name === 'Spruce').x);
  assert.ok(gapX < columns.find(c => c.late).x);
});

test('scatter keeps neighborhoods with data and uses a square-root y scale', () => {
  const { points, y, xTicks } = scatterLayout(story.neighborhoods, 'noVehicle');
  assert.equal(points.length, 86);
  assert.equal(y(0), 470);
  assert.equal(y(30), 90);
  assert.ok(Math.abs(y(7.5) - (470 - 0.5 * 380)) < 1e-9);
  assert.deepEqual(xTicks, [0, 20, 40, 60]);
});

test('movers, categories and colors follow the share gap', () => {
  const movers = topMovers(story.neighborhoods);
  assert.equal(movers[0].name, 'Marcy Holmes');
  assert.equal(movers.at(-1).name, 'Jordan');
  assert.equal(gapCategory(2), 'gain');
  assert.equal(gapCategory(-2.5), 'loss');
  assert.equal(gapCategory(0.4), 'flat');
  assert.notEqual(diverging(5, 10), diverging(-5, 10));
});

test('every step names a known view and each scene starts with a title', () => {
  const views = new Set(['year', 'year-slice', 'storms', 'storms-avg', 'storms-snow', 'map-snow', 'map-ordinary', 'map-gap', 'dumbbell', 'scatter', 'scatter-notes', 'groups', 'phillips', 'explore']);
  assert.ok(steps.every(s => views.has(s.view)));
  for (const scene of [1, 2, 3, 4, 5]) assert.ok(steps.find(s => s.scene === scene).sceneTitle);
});
