/**
 * Release preflight for the independent Three.js winter data story.
 * Validates the actual distributable directory rather than relying on tests
 * against unbuilt source files. Does not deploy anything.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dist = path.resolve('dist');
const readJSON = (p) => JSON.parse(readFileSync(path.join(dist, p), 'utf8'));
assert.ok(existsSync(path.join(dist, 'index.html')), 'missing Vite HTML entry');
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
assert.match(html, /assets\//, 'HTML does not reference built assets');

const allowed = /^(index\.html|assets\/|data\/|fonts\/)/;
const files = [];
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (entry.isFile()) files.push(path.relative(dist, full).split(path.sep).join('/'));
  }
}
visit(dist);
assert.ok(files.length > 5, 'build output unexpectedly small');
for (const file of files) {
  assert.ok(allowed.test(file), 'unapproved public artifact path: ' + file);
  assert.ok(!/(?:^|\/)(?:\.env|\.git|raw|tests|scripts|AGENTS\.md)(?:\/|\.|$)/i.test(file), 'forbidden development file: ' + file);
}
const essential = ['data/snow-emergencies.json', 'data/snow-emergencies-provenance.json',
  'data/neighborhoods.geojson', 'data/all-neighborhood-day-counts.csv'];
for (const file of essential) assert.ok(files.includes(file), 'missing public dataset: ' + file);

const collection = readJSON('data/snow-emergencies.json');
assert.equal(collection.events?.length, 10, 'review event selection before publishing');
assert.equal(collection.events.reduce((n, e) => n + e.event.total, 0), 6118);
for (const event of collection.events) {
  assert.equal(event.neighborhoods?.length, 87, 'neighborhood universe changed: ' + event.event.id);
  assert.equal(event.quality.matched + event.quality.unmatched, event.event.total);
  for (let day = 0; day < 3; day++) {
    assert.equal(event.neighborhoods.reduce((n, area) => n + area.counts[day], 0) +
      event.quality.unmatchedByDay[day], event.event.dayTotals[day],
      'day reconciliation failed in ' + event.event.id);
  }
}
const provenance = readJSON('data/snow-emergencies-provenance.json');
assert.equal(provenance.recordsContainAddresses, false);
assert.equal(new Set(collection.events.map(e => e.event.id)).size, 10);
const suspicious = files.filter(file => /(?:\.pem|\.key|\.env|\.map)$/i.test(file));
assert.deepEqual(suspicious, [], 'sensitive or source-map artifact candidates');
const bytes = files.reduce((n, file) => n + statSync(path.join(dist,file)).size, 0);
console.log('PASS winter static artifact: ' + files.length + ' allowed files; ' +
  bytes + ' bytes; 10 events, 6,118 records, 87 neighborhoods, all day totals reconciled');
console.log('Preflight is not a privacy certification or a live deployment verification.');
