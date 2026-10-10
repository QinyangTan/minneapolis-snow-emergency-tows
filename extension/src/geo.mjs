/**
 * Pure Google Maps camera / Web Mercator helpers. No Google internal APIs or DOM scraping.
 * URL camera is only an approximation of viewport geometry, never a GIS registration proof.
 */
export const MINNEAPOLIS = Object.freeze({ lat: 44.9778, lng: -93.2650, zoom: 12 });

export function parseCamera(urlString) {
  if (typeof urlString !== 'string') return null;
  let url;
  try { url = new URL(urlString); } catch { return null; }
  if (!/(^|\.)google\.com$/.test(url.hostname) || !url.pathname.startsWith('/maps')) return null;
  const match = url.href.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)z(?=[,!/?#]|$)/);
  if (!match) return null;
  const lat = Number(match[1]), lng = Number(match[2]), zoom = Number(match[3]);
  if (![lat,lng,zoom].every(Number.isFinite) || Math.abs(lat)>85 || Math.abs(lng)>180 ||
      zoom<1 || zoom>22) return null;
  const trailer=url.href.slice(url.href.indexOf(match[0])+match[0].length).split(/[/?#]/)[0];
  // Google Maps often appends "h" for heading and "t" for tilt to camera URLs.
  // Fail closed even when zero; do not claim alignment through undocumented rotation.
  const rotated = /(?:^|,)[0-9.]+h(?:,|$)/.test(trailer);
  const tilted = /(?:^|,)[0-9.]+t(?:,|$)/.test(trailer);
  return {lat,lng,zoom,northUp2D: !(rotated||tilted)};
}

export function normalizedWorld(lat,lng) {
  if (!Number.isFinite(lat)||!Number.isFinite(lng)) throw new Error('Invalid map coordinate');
  const radians=Math.max(-85.05112878,Math.min(85.05112878,lat))*Math.PI/180;
  return [(lng+180)/360, (1-Math.log(Math.tan(Math.PI/4+radians/2))/Math.PI)/2];
}

export function projectPoint(lng,lat,camera,viewport) {
  if (!camera || !viewport || viewport.width<=0 || viewport.height<=0) {
    throw new Error('Valid camera and viewport required');
  }
  const scale=256*Math.pow(2,camera.zoom);
  const [cx,cy]=normalizedWorld(camera.lat,camera.lng);
  const [wx,wy]=normalizedWorld(lat,lng);
  let dx=wx-cx;
  if(dx>0.5)dx-=1; else if(dx<-.5)dx+=1;
  return [viewport.width/2+dx*scale,viewport.height/2+(wy-cy)*scale];
}

export function coordinatesToPath(geometry,camera,viewport) {
  if (!geometry || !['Polygon','MultiPolygon'].includes(geometry.type)) return '';
  const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
  const parts=[];
  for(const rings of polygons||[]) {
    for(const ring of rings||[]) {
      if(!Array.isArray(ring)||ring.length<4)continue;
      let d='';
      for(const coordinate of ring){
        if(!Array.isArray(coordinate)||coordinate.length<2)continue;
        const [x,y]=projectPoint(Number(coordinate[0]),Number(coordinate[1]),camera,viewport);
        if(!Number.isFinite(x)||!Number.isFinite(y))continue;
        d+=(d?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);
      }
      if(d)parts.push(d+'Z');
    }
  }
  return parts.join(' ');
}

export function countInScope(properties,event='all',day=0) {
  const scope=event==='all'?properties:properties?.byEvent?.[event];
  if(!scope)return 0;
  const count=day===0?scope.total:scope.days?.[String(day)];
  return Number.isFinite(count)&&count>=0?count:0;
}

export function gradientFor(count,max) {
  if(!Number.isFinite(count)||count<=0)return '#e6edf2';
  const t=Math.sqrt(Math.min(1,Math.max(0,count/Math.max(1,max))));
  return 'rgb('+[224-125*t,237-149*t,245-126*t].map(v=>Math.round(v)).join(',')+')';
}

/** Data-only count aggregation. The input is already bounded to historic observed records. */
export function summarize(data,event='all',day=0) {
  const features=Array.isArray(data?.features)?data.features:[];
  const rows=features.map(feature=>({
    name:String(feature.properties?.name??'Unknown'),
    count:countInScope(feature.properties,event,day)
  }));
  return {
    rows,
    max:Math.max(1,...rows.map(row=>row.count)),
    mapped:rows.reduce((acc,row)=>acc+row.count,0),
    top:[...rows].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)).slice(0,6)
  };
}
