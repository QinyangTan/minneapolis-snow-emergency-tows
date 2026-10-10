import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { parseCamera,normalizedWorld,projectPoint,coordinatesToPath,
         countInScope,gradientFor,summarize } from '../extension/src/geo.mjs';

const root=resolve(new URL('..',import.meta.url).pathname);
const city=JSON.parse(readFileSync(resolve(root,'static/data/summary.json'),'utf8'));
const neighborhoods=JSON.parse(readFileSync(resolve(root,'static/data/neighborhoods.geojson'),'utf8'));

test('recognize only valid north-up Google Maps URL cameras',()=>{
  const camera=parseCamera('https://www.google.com/maps/@44.9778,-93.265,12z');
  assert.deepEqual(camera,{lat:44.9778,lng:-93.265,zoom:12,northUp2D:true});
  assert.equal(parseCamera('https://www.google.com/maps/@44.98,-93.27,16z,35h').northUp2D,false);
  assert.equal(parseCamera('https://www.google.com/maps/@44.98,-93.27,16z,48t').northUp2D,false);
  assert.equal(parseCamera('https://www.google.com/maps/place/Marcy+Holmes/@44.98,-93.27,13.5z').zoom,13.5);
  for(const url of ['https://evil.com/maps/@44.98,-93.27,12z',
    'https://www.google.com/maps/@95,20,12z',
    'https://www.google.com/maps/@44.98,-93.27,99z',
    'https://www.google.com/search?q=maps',
    'https://www.google.com/maps'])assert.equal(parseCamera(url),null,url);
});

test('Web Mercator world and calibrated map-center geometry',()=>{
  assert.ok(Math.abs(normalizedWorld(0,0)[0]-.5)<1e-12);
  assert.ok(Math.abs(normalizedWorld(0,0)[1]-.5)<1e-12);
  const camera={lat:44.9778,lng:-93.265,zoom:12};
  const viewport={width:760,height:520};
  const [x,y]=projectPoint(-93.265,44.9778,camera,viewport);
  assert.ok(Math.abs(x-380)<1e-7);
  assert.ok(Math.abs(y-260)<1e-7);
  // Longitude increases toward screen right; latitude toward screen up.
  assert.ok(projectPoint(-93.255,44.9778,camera,viewport)[0]>x);
  assert.ok(projectPoint(-93.265,44.9878,camera,viewport)[1]<y);
  assert.throws(()=>projectPoint(-93.265,44.9778,null,viewport),/camera/);
});

test('all neighborhood boundaries produce paths without NaN and hold official record counts',()=>{
  assert.equal(city.total,5423);
  assert.equal(city.unassigned_neighborhood_count,68);
  assert.equal(neighborhoods.features.length,87);
  const all=summarize(neighborhoods,'all',0);
  assert.equal(all.mapped,5355);
  assert.equal(all.rows.length,87);
  assert.ok(all.top[0].count>=all.top[1].count);
  const camera={lat:44.9778,lng:-93.265,zoom:12};
  const viewport={width:1200,height:850};
  for(const feature of neighborhoods.features){
    const path=coordinatesToPath(feature.geometry,camera,viewport);
    assert.ok(path.startsWith('M'),feature.properties.name);
    assert.ok(path.endsWith('Z'),feature.properties.name);
    assert.equal(path.includes('NaN'),false);
  }
  assert.match(gradientFor(0,20),/^#[0-9a-f]+$/i);
  assert.match(gradientFor(10,20),/^rgb\(/);
});

test('citywide totals and mapped totals are distinct under event/day filter',()=>{
  const bridge=city.events.find(event=>event.id==='Bridge');
  const actualDayTwo=summarize(neighborhoods,'Bridge',2);
  assert.equal(bridge.days.find(row=>row.day===2).count,418);
  assert.ok(actualDayTwo.mapped<=418);
  assert.equal(countInScope(neighborhoods.features[0].properties,'nonexistent',2),0);
  assert.equal(city.days.find(d=>d.day===2).count,2222);
});

test('build creates installable, offline Chrome MV3 directory without broad permissions',()=>{
  execFileSync(process.execPath,['scripts/build-google-maps-extension.mjs'],{cwd:root,encoding:'utf8',timeout:30000});
  const dist=resolve(root,'build/google-maps-extension');
  const manifest=JSON.parse(readFileSync(resolve(dist,'manifest.json'),'utf8'));
  assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,['storage']);
  assert.equal(manifest.content_scripts[0].all_frames,false);
  assert.ok(manifest.content_scripts[0].matches.every(host=>host.includes('google.com/maps')||host==='https://maps.google.com/*'));
  for(const path of ['content.js','content.css','background.js','data/neighborhoods.geojson','data/summary.json']){
    assert.ok(existsSync(resolve(dist,path)),path);
  }
  const bundled=readFileSync(resolve(dist,'content.js'),'utf8');
  assert.ok(bundled.includes('function parseCamera'));
  assert.ok(!bundled.includes("from './geo.mjs'"));
  assert.equal(JSON.parse(readFileSync(resolve(dist,'data/neighborhoods.geojson'),'utf8')).features.length,87);
});
