/** Fit real geometry in camera space; preserve aspect and add label clearance. */
export function fitCamera(camera, points, aspect, bottomInset=0) {
  camera.updateMatrixWorld();
  let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
  for(const point of points){
    const p=point.clone().applyMatrix4(camera.matrixWorldInverse);
    xmin=Math.min(xmin,p.x);xmax=Math.max(xmax,p.x);
    ymin=Math.min(ymin,p.y);ymax=Math.max(ymax,p.y);
  }
  const cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;
  const drawingAspect=aspect/(1-bottomInset);
  const half=Math.max((ymax-ymin)/2,(xmax-xmin)/2/drawingAspect)*1.16;
  camera.left=cx-half*drawingAspect;camera.right=cx+half*drawingAspect;
  camera.top=cy+half;camera.bottom=cy-half;
  camera.bottom-=2*half*bottomInset/(1-bottomInset);
  camera.updateProjectionMatrix();
}
