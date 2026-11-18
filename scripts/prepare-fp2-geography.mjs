import fs from 'node:fs';
import {geoContains} from 'd3-geo';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const root='datasetsForFP2/';const context=read('static/data/fp2-context.json');
const geo=read('static/data/neighborhoods.geojson');
const locations=read(root+'raw/regional/traffic_current_locations__0.json').features;
const history=read(root+'raw/regional/traffic_history_hennepin_2022_2025.json').features;
const lookup=new Map(locations.map(f=>[f.attributes.LOCATION_ID,f.geometry]));
const sites=[];const seen=new Set();let unmatched=0,multiple=0;
for(const {attributes:a} of history){
 if(a.DATA_YEAR!==2024 || a.COMMUNITY!=='Minneapolis' || !(a.AADT>0) || seen.has(a.LOCATION_ID))continue;
 seen.add(a.LOCATION_ID);const point=lookup.get(a.LOCATION_ID);
 if(!point){unmatched++;continue;}
 const matches=geo.features.filter(f=>geoContains(f,[point.x,point.y]));
 if(matches.length!==1){multiple++;continue;}
 sites.push({id:a.LOCATION_ID,coordinates:[point.x,point.y],name:a.STREET_NAME,aadt:a.AADT,type:a.DATA_TYPE,neighborhood:matches[0].properties.name});
}
for(const row of context.rows){
 const values=sites.filter(s=>s.neighborhood===row.name).map(s=>s.aadt).sort((a,b)=>a-b);
 const n=values.length;row.trafficSites=n;
 row.metrics.traffic=n>=3?{value:n%2?values[(n-1)/2]:(values[n/2-1]+values[n/2])/2,n,period:'2024',percentMoe:null,reliability:'Median across matched sampled sites; not a road-length-weighted neighborhood volume',table:'MnDOT AADT history'}:null;
}
context.trafficAudit={matchedSites:sites.length,noCurrentLocation:unmatched,ambiguousOrOutsideCity:multiple,minimumSites:3};
fs.writeFileSync('static/data/fp2-context.json',JSON.stringify(context));
const acs=read(root+'prepared/acs_2024_hennepin_wide.json').rows.filter(r=>r.summary_level==='140');
const tractRows=read(root+'raw/city/Mpls_Census_Tracts_2020__0.json').features;
const features=tractRows.map(f=>{
 const a=f.attributes,r=acs.find(r=>r.geoid===a.GEOID);
 return {type:'Feature',properties:{geoid:a.GEOID,name:a.NAMELSAD,income:r?.B19301_E001??null,moe:r?.B19301_M001??null},geometry:{type:'Polygon',coordinates:f.geometry.rings}};
});
fs.writeFileSync('static/data/fp2-geography.json',JSON.stringify({tracts:{type:'FeatureCollection',features},sites,notes:['Income: ACS B19301 2020-2024 per-capita income in 2024 dollars. Native census tract geography; never averaged into neighborhoods.','Traffic: 2024 MnDOT AADT history joined by LOCATION_ID to current sites, filtered COMMUNITY=Minneapolis, unique point-in-neighborhood match. Includes measured and modeled records. AADT is annual average daily traffic, not snow-day traffic.','Historical locations without a current geometry and boundary ambiguities are omitted and reported.'],trafficAudit:context.trafficAudit}));
console.log(JSON.stringify({tracts:features.length,incomeAvailable:features.filter(f=>f.properties.income!==null).length,traffic:context.trafficAudit,trafficNeighborhoods:context.rows.filter(r=>r.metrics.traffic!==null).length}));
