import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { geoMercator } from 'd3';
import { fitCamera } from '../src/lib/framing.js';

const geography=JSON.parse(readFileSync(new URL('../public/data/neighborhoods.geojson',import.meta.url)));
const data=JSON.parse(readFileSync(new URL('../public/data/bridge.json',import.meta.url)));
const project=geoMercator().center([-93.27,44.98]).scale(5800).translate([0,0]);
const points=[];
for(const feature of geography.features){
  const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
  for(const rings of polygons)for(const ring of rings)for(const coord of ring){
    const [x,z]=project(coord);points.push(new THREE.Vector3(x,0,z));
  }
}
for(const n of data.neighborhoods){
  const [x,z]=project(n.anchor);
  points.push(new THREE.Vector3(x,.36+Math.max(...n.counts)/62*7.2,z));
}

test('every geographic edge and maximum needle stays inside every view',()=>{
  for(const [width,height] of [[950,640],[390,430],[1360,600]]){
    for(const top of [false,true])for(const unfolded of [false,true]){
      const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,220);
      camera.position.set(top?0:14,top?56:36,top?.001:39);
      camera.lookAt(0,1.1,0);
      const frame=unfolded?[-22,0,22].flatMap(offset=>points.map(p=>p.clone().add(new THREE.Vector3(offset,0,0)))):points;
      fitCamera(camera,frame,width/height);
      for(const point of frame){
        const p=point.clone().project(camera);
        assert.ok(Math.abs(p.x)<.96&&Math.abs(p.y)<.96,`${width}/${height}, top=${top}, unfold=${unfolded}: ${p.toArray()}`);
      }
    }
  }
});

test('framing is based on fixed dataset extents, never the selected day',()=>{
  const a=new THREE.OrthographicCamera(-1,1,1,-1,.1,220);
  a.position.set(14,36,39);a.lookAt(0,1.1,0);
  fitCamera(a,points,1.5);
  const first=[a.left,a.right,a.top,a.bottom];
  fitCamera(a,points,1.5);
  assert.deepEqual([a.left,a.right,a.top,a.bottom],first);
});

test('comparison captions have a reserved footer clear of the geometry',()=>{
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,220);
  camera.position.set(14,36,39);camera.lookAt(0,1.1,0);
  fitCamera(camera,points,1440/560,85/560);
  for(const point of points){
    const p=point.clone().project(camera);
    assert.ok((1-p.y)*560/2<560-85,`footer overlap ${p.y}`);
  }
});
