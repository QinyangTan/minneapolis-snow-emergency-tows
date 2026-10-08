import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { moveGesture, isSelectionGesture, zoomLevel, rotateCamera } from '../src/lib/navigation.js';
import { fitCamera } from '../src/lib/framing.js';

test('a drag returning to its start is still a drag, never a region selection',()=>{
  const gesture={x:10,y:10,distance:0};
  moveGesture(gesture,30,10);moveGesture(gesture,10,10);
  assert.equal(isSelectionGesture(gesture),false);
  assert.equal(isSelectionGesture({x:10,y:10,distance:2}),true);
});
test('user zoom is bounded and fitting never resets it',()=>{
  assert.equal(zoomLevel(100),2.5);assert.equal(zoomLevel(.01),.65);
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,220);
  camera.position.set(14,36,39);camera.lookAt(0,1,0);camera.zoom=1.7;
  fitCamera(camera,[new THREE.Vector3(-2,0,-2),new THREE.Vector3(2,5,2)],1.5);
  assert.equal(camera.zoom,1.7);
});
test('keyboard orbit changes bearing without crossing beneath the map',()=>{
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,220);
  const target=new THREE.Vector3(0,1.1,0);
  camera.position.set(14,36,39);
  const before=camera.position.clone();
  rotateCamera(camera,target,.3,0);
  assert.ok(camera.position.distanceTo(before)>1);
  rotateCamera(camera,target,0,10);
  assert.ok(camera.position.y>target.y);
});
