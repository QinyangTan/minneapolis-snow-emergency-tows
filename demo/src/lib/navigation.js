import { Spherical } from 'three';

export function moveGesture(gesture,x,y) {
  if(gesture)gesture.distance=Math.max(gesture.distance,Math.hypot(x-gesture.x,y-gesture.y));
}
export function isSelectionGesture(gesture) { return Boolean(gesture&&gesture.distance<=6); }
export function zoomLevel(value) { return Math.min(2.5,Math.max(.65,value)); }
export function rotateCamera(camera,target,yaw,pitch) {
  const orbit=new Spherical().setFromVector3(camera.position.clone().sub(target));
  orbit.theta+=yaw;orbit.phi=Math.min(Math.PI*.47,Math.max(.04,orbit.phi+pitch));
  camera.position.setFromSpherical(orbit).add(target);camera.lookAt(target);
}
