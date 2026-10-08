import * as THREE from 'three';
import { geoMercator, ticks } from 'd3';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { countHeight, labelCount } from './model.js';
import { fitCamera } from './framing.js';
import { metricValue } from './analysis.js';
import { moveGesture, isSelectionGesture, rotateCamera, zoomLevel } from './navigation.js';

const COLORS = {land:0xf3f7fa, side:0xc6d8e1, edge:0x9cb6c5, water:0x315d76,
  needle:0x315d76, selected:0x168aad, highlight:0xbbdbe7};
const MAX_HEIGHT = 7.2;
const RULER_X = 8.8;

function polygons(geometry) {
  if (geometry.type==='Polygon') return [geometry.coordinates];
  if (geometry.type==='MultiPolygon') return geometry.coordinates;
  if (geometry.type==='GeometryCollection') return geometry.geometries.flatMap(polygons);
  return [];
}

function makeShapes(geometry, project) {
  return polygons(geometry).map(rings=>{
    const [outer,...holes]=rings.map(ring=>ring.map(coord=>{
      const p=project(coord);return new THREE.Vector2(p[0],-p[1]);
    }));
    const shape=new THREE.Shape(outer);
    shape.holes=holes.map(points=>new THREE.Path(points));
    return shape;
  });
}

/** One renderer, three geometrically identical plates, one shared count scale. */
export function createCity(canvas, data, geography, water, {onSelect,onLabels,onFailure,onLayout,maximum:initialMaximum}) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-20,20,20,-20,.1,220);
  const ambient=new THREE.HemisphereLight(0xffffff,0x8598a8,2.5);
  scene.add(ambient);
  const light=new THREE.DirectionalLight(0xf4faff,3.2);
  light.position.set(-24,42,10);light.castShadow=true;
  light.shadow.mapSize.set(2048,2048);
  Object.assign(light.shadow.camera,{left:-45,right:45,top:35,bottom:-35,near:1,far:110});
  light.shadow.bias=-.001;light.shadow.normalBias=.035;
  scene.add(light);
  const fill=new THREE.DirectionalLight(0xa8d8fa,1.2);fill.position.set(20,12,-25);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.ShadowMaterial({opacity:.13}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.38;floor.receiveShadow=true;scene.add(floor);
  const project=geoMercator().center([-93.27,44.98]).scale(5800).translate([0,0]);
  const maximum=initialMaximum??Math.max(...data.neighborhoods.flatMap(n=>n.counts));
  const indexed=new Map(data.neighborhoods.map(n=>[n.id,n]));
  const root=new THREE.Group();scene.add(root);
  const sharedGeometries=[];
  const outlineMaterial=new THREE.LineBasicMaterial({color:COLORS.edge,transparent:true,opacity:.65});
  const sideMaterial=new THREE.MeshStandardMaterial({color:COLORS.side,roughness:.88});
  const waterMaterial=new THREE.MeshStandardMaterial({color:COLORS.water,roughness:.78,metalness:.08});
  const needleGeometry=new THREE.CylinderGeometry(.072,.072,1,8);
  sharedGeometries.push(needleGeometry);
  const geoMeshes=geography.features.map(f=>{
    const shapes=makeShapes(f.geometry,project);
    const geometry=new THREE.ExtrudeGeometry(shapes,{depth:.36,bevelEnabled:false,steps:1});
    geometry.rotateX(-Math.PI/2);
    sharedGeometries.push(geometry);
    const edgeGeometry=new THREE.BufferGeometry();
    const points=[];
    for (const poly of polygons(f.geometry)) for(const ring of poly){
      for(let i=1;i<ring.length;i++){
        for(const c of [ring[i-1],ring[i]]){const p=project(c);points.push(p[0],.373,p[1]);}
      }
    }
    edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    sharedGeometries.push(edgeGeometry);
    return {id:f.properties.id,geometry,edgeGeometry};
  });
  const waterGeometries=water.features.flatMap(f=>makeShapes(f.geometry,project)).map(s=>{
    const g=new THREE.ShapeGeometry(s);g.rotateX(-Math.PI/2);sharedGeometries.push(g);return g;
  });
  // Fit to common geography and the full shared height range. Event and Day
  // selections never change the ruler or the geographic framing bounds.
  const framingPoints=[];
  for(const geometry of [...geoMeshes.map(m=>m.geometry),...waterGeometries]){
    geometry.computeBoundingBox();
    const {min,max}=geometry.boundingBox;
    for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z])
      framingPoints.push(new THREE.Vector3(x,y,z));
  }
  for(const n of data.neighborhoods){
    const p=project(n.anchor);
    framingPoints.push(new THREE.Vector3(p[0],.6+MAX_HEIGHT,p[1]));
  }
  framingPoints.push(new THREE.Vector3(RULER_X,.36,7),new THREE.Vector3(RULER_X,.36+MAX_HEIGHT,7));
  // Reserve geographic space below the southern edge for plate captions.
  framingPoints.push(new THREE.Vector3(0,0,15));
  const plates=[0,1,2].map(plateIndex=>{
    const group=new THREE.Group();root.add(group);
    const meshes=[];const needles=[];const materials=[];
    for(const item of geoMeshes){
      const top=new THREE.MeshStandardMaterial({color:COLORS.land,roughness:.82});materials.push(top);
      const mesh=new THREE.Mesh(item.geometry,[top,sideMaterial]);
      mesh.userData.id=item.id;mesh.userData.plate=plateIndex;mesh.receiveShadow=true;mesh.castShadow=true;
      group.add(mesh,new THREE.LineSegments(item.edgeGeometry,outlineMaterial));meshes.push(mesh);
      const n=indexed.get(item.id);const p=project(n.anchor);
      const material=new THREE.MeshStandardMaterial({color:COLORS.needle,roughness:.35,metalness:.22});materials.push(material);
      const needle=new THREE.Mesh(needleGeometry,material);
      needle.position.set(p[0],.36,p[1]);needle.scale.y=0;needle.castShadow=true;
      needle.userData.id=n.id;group.add(needle);needles.push(needle);
    }
    for(const geometry of waterGeometries){const mesh=new THREE.Mesh(geometry,waterMaterial);mesh.position.y=.381;group.add(mesh);}
    return {group,meshes,needles,materials};
  });
  const rulerMaterial=new THREE.LineBasicMaterial({color:0x526c80,transparent:true,opacity:.65});
  const rulerGeometry=new THREE.BufferGeometry();
  let rulerMaximum=null,rulerTicks=[];
  function updateRuler(scale){
    if(scale===rulerMaximum)return;
    rulerMaximum=scale;rulerTicks=ticks(0,scale,3);
    const points=[new THREE.Vector3(RULER_X,.36,7),new THREE.Vector3(RULER_X,.36+MAX_HEIGHT,7)];
    for(const value of rulerTicks){const y=.36+countHeight(value,scale,MAX_HEIGHT);points.push(new THREE.Vector3(RULER_X,y,7),new THREE.Vector3(RULER_X+.5,y,7));}
    rulerGeometry.setFromPoints(points);
  }
  const ruler=new THREE.LineSegments(rulerGeometry,rulerMaterial);root.add(ruler);sharedGeometries.push(rulerGeometry);
  let state={data,day:2,unfolded:false,selected:null,topView:false,metric:'count',maximum,comparison:null,highlightIds:[],resetKey:0};
  let width=1,height=1,frame=0,active=true,lastTime=0;
  let spread=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const comparisonLayout=matchMedia('(min-width: 801px)');
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  let gesture=null;
  const onDown=e=>{gesture={x:e.clientX,y:e.clientY,distance:0};canvas.style.cursor='grabbing';};
  const onMove=e=>moveGesture(gesture,e.clientX,e.clientY);
  const onUp=()=>{canvas.style.cursor='grab';};
  const onClick=e=>{
    moveGesture(gesture,e.clientX,e.clientY);
    if(!isSelectionGesture(gesture))return;
    const rect=canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(plates.filter(p=>p.group.visible).flatMap(p=>p.meshes));
    if(hits.length)onSelect(hits[0].object.userData.id);
  };
  const contextLost=e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);onFailure();};
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointermove',onMove);
  window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',onUp);
  canvas.addEventListener('click',onClick);
  canvas.addEventListener('webglcontextlost',contextLost);
  camera.position.set(14,36,39);camera.lookAt(0,1.1,0);
  const controls=new OrbitControls(camera,canvas);
  controls.target.set(0,1.1,0);controls.enablePan=false;controls.enableDamping=false;
  controls.minPolarAngle=.04;controls.maxPolarAngle=Math.PI*.47;
  controls.minZoom=.65;controls.maxZoom=2.5;controls.rotateSpeed=.7;
  controls.update();
  const controlChange=()=>requestRender();
  controls.addEventListener('change',controlChange);
  const onKey=e=>{
    const steps={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};
    if(steps[e.key]){e.preventDefault();rotateCamera(camera,controls.target,...steps[e.key]);controls.update();requestRender();}
    if(['+','=','-','Home'].includes(e.key)){
      e.preventDefault();if(e.key==='Home')resetView();else camera.zoom=zoomLevel(camera.zoom*(e.key==='-'?.9:1.1));
      camera.updateProjectionMatrix();controls.update();requestRender();
    }
  };
  canvas.addEventListener('keydown',onKey);
  function resetView(){camera.zoom=1;camera.position.set(state.topView?0:14,state.topView?56:36,state.topView?.001:39);camera.lookAt(controls.target);controls.update();}
  function layout(){
    const wide=comparisonLayout.matches;
    if(state.comparison&&wide)return [{plate:0,dataset:state.data,day:state.day-1,x:-13},{plate:1,dataset:state.comparison,day:state.day-1,x:13}];
    if(state.unfolded&&wide)return [0,1,2].map(i=>({plate:i,dataset:state.data,day:i,x:(i-1)*22}));
    return [{plate:1,dataset:state.data,day:state.day-1,x:0}];
  }
  function scaleMaximum(){return state.metric==='share'?100:state.maximum??maximum;}

  function labels(moving) {
    const screen=(point,group)=>{
      const world=point.clone();if(group)world.applyMatrix4(group.matrixWorld);
      const p=world.project(camera);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};
    };
    const list=[];
    const placements=layout();const compare=placements.length>1;
    for(const placement of placements){
      const p=plates[placement.plate];if(!p.group.visible)continue;
      if(compare){list.push({kind:'day',text:state.comparison?`${placement.dataset.event.name} · Day ${state.day}`:`Day ${placement.day+1}`,...screen(new THREE.Vector3(0,0,15),p.group)});}
      if(state.selected){
        const n=placement.dataset.neighborhoods.find(n=>n.id===state.selected);const xy=project(n.anchor);
        const count=metricValue(n,placement.day+1,state.metric);
        const needle=p.needles.find(needle=>needle.userData.id===state.selected);
        const target=countHeight(count,scaleMaximum(),MAX_HEIGHT)??0;
        list.push({kind:'selected',text:n.name,count:labelCount(count,needle.scale.y,target,moving),undefined:count===null,unit:state.metric,
          ...screen(new THREE.Vector3(xy[0],.5+needle.scale.y,xy[1]),p.group)});
      }
    }
    if(!compare){
      if(camera.position.y>controls.target.y&&new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).phi>.15)
        for(const count of rulerTicks)list.push({kind:'ruler',text:state.metric==='share'?`${count}%`:String(count),...screen(new THREE.Vector3(RULER_X,.36+countHeight(count,scaleMaximum(),MAX_HEIGHT),7))});
      for(const [text,coord] of [['Mississippi River',[-93.239,44.957]],['Bde Maka Ska',[-93.309,44.947]]]){
        const p=project(coord);list.push({kind:'water',text,...screen(new THREE.Vector3(p[0],.6,p[1]))});
      }
    }
    onLabels(list);
  }
  function resize(){
    const rect=canvas.parentElement.getBoundingClientRect();width=rect.width;height=rect.height;
    renderer.setSize(width,height,false);onLayout(comparisonLayout.matches);requestRender();
  }
  function requestRender(){if(active&&!frame)frame=requestAnimationFrame(render);}
  function render(time){
    frame=0;if(!active||document.hidden)return;
    const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
    const ease=reduced.matches?1:1-Math.exp(-8*dt);
    const placements=layout();const compare=placements.length>1;
    const targetSpread=compare?1:0;spread+=(targetSpread-spread)*ease;
    if(Math.abs(targetSpread-spread)<.001)spread=targetSpread;
    let changing=Math.abs(targetSpread-spread)>.001;
    const scale=scaleMaximum();updateRuler(scale);
    for(let i=0;i<3;i++){
      const p=plates[i];const placement=placements.find(item=>item.plate===i);
      p.group.visible=Boolean(placement);
      if(!placement)continue;
      const targetX=placement.x;
      p.group.position.x+=(targetX-p.group.position.x)*ease;
      if(Math.abs(targetX-p.group.position.x)<.001)p.group.position.x=targetX;
      changing=changing||Math.abs(targetX-p.group.position.x)>.001;
      p.group.scale.setScalar(1);
      const current=new Map(placement.dataset.neighborhoods.map(n=>[n.id,n]));
      const day=placement.day;
      for(let k=0;k<p.needles.length;k++){
        const n=current.get(p.needles[k].userData.id);
        const needle=p.needles[k];const value=metricValue(n,day+1,state.metric);
        const target=countHeight(value,scale,MAX_HEIGHT)??0;
        let next=needle.scale.y+(target-needle.scale.y)*ease;
        if(Math.abs(next-target)<.001)next=target;
        changing=changing||Math.abs(next-target)>.001;
        needle.visible=target>0;needle.scale.y=next;needle.position.y=.36+next/2;
        needle.material.color.setHex(n.id===state.selected?COLORS.selected:COLORS.needle);
        p.meshes[k].material[0].color.setHex(n.id===state.selected?COLORS.highlight:COLORS.land);
        if(state.highlightIds.includes(n.id))p.meshes[k].material[0].color.setHex(COLORS.highlight);
        p.meshes[k].material[0].opacity=state.metric==='share'&&value===null?.45:1;
        p.meshes[k].material[0].transparent=state.metric==='share'&&value===null;
      }
    }
    ruler.visible=!compare&&new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).phi>.15;
    root.updateMatrixWorld(true);
    const framePoints=plates.filter(p=>p.group.visible).flatMap(p=>framingPoints.map(point=>point.clone().applyMatrix4(p.group.matrixWorld)));
    fitCamera(camera,framePoints,width/height,compare?Math.min(85/height,.3):0);
    renderer.render(scene,camera);labels(changing);
    if(changing)requestRender();
  }
  function update(next){
    const reset=next.resetKey!==undefined&&next.resetKey!==state.resetKey;
    const preset=next.topView!==undefined&&next.topView!==state.topView;
    state={...state,...next};if(reset||preset)resetView();requestRender();
  }
  const visibility=()=>{lastTime=performance.now();requestRender();};
  const motion=()=>requestRender();
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motion);
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  return {
    update,maximum,resetView:()=>{resetView();requestRender();},
    dispose(){
      active=false;cancelAnimationFrame(frame);observer.disconnect();
      document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motion);
      canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('click',onClick);canvas.removeEventListener('webglcontextlost',contextLost);
      canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('keydown',onKey);
      window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onUp);
      controls.removeEventListener('change',controlChange);controls.dispose();
      for(const geometry of sharedGeometries)geometry.dispose();
      floor.geometry.dispose();floor.material.dispose();
      for(const material of [outlineMaterial,sideMaterial,waterMaterial,rulerMaterial,...plates.flatMap(p=>p.materials)])material.dispose();
      renderer.dispose();
    }
  };
}
