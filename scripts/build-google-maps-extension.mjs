#!/usr/bin/env node
/**
 * Offline Chrome MV3 packager. Run npm run build:extension from the repo root.
 * The only generated folder is build/google-maps-extension (gitignored).
 * All City data and UI are bundled locally; no Google API key or CDN required.
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const source=join(root,'extension');
const out=join(root,'build','google-maps-extension');
const geography=JSON.parse(readFileSync(join(root,'static/data/neighborhoods.geojson'),'utf8'));
const summary=JSON.parse(readFileSync(join(root,'static/data/summary.json'),'utf8'));
if(geography.type!=='FeatureCollection'||geography.features?.length!==87||
   summary.status!=='recomputed-official-arcgis'||summary.total!==5423||
   summary.events?.length!==9||summary.unassigned_neighborhood_count!==68){
  throw new Error('City data has changed: validate and update extension contract before packaging');
}
const mapped=geography.features.reduce((acc,feature)=>acc+(feature.properties?.total||0),0);
if(mapped!==summary.total-summary.unassigned_neighborhood_count)throw new Error('Unreconciled official mapping totals');
const manifest=JSON.parse(readFileSync(join(source,'manifest.json'),'utf8'));
if(manifest.manifest_version!==3||manifest.permissions.some(p=>!['storage','activeTab'].includes(p))||
   !manifest.content_scripts?.length)throw new Error('Unexpected extension permissions or manifest');

let geoSource=readFileSync(join(source,'src/geo.mjs'),'utf8');
if((geoSource.match(/export (?:const|function) /g)||[]).length!==8){
  throw new Error('Projection exports changed: inspect bundler before packaging');
}
geoSource=geoSource.replace(/\bexport (const|function)\b/g,'$1');
let storySource=readFileSync(join(source,'src/storyLayers.mjs'),'utf8');
if((storySource.match(/export (?:const|function) /g)||[]).length!==9) {
  throw new Error('Story-layer exports changed; audit packager before publishing');
}
storySource=storySource.replace(/^import\s*\{\s*countInScope\s*\}\s*from\s*['"]\.\/geo\.mjs['"];\s*/,'');
storySource=storySource.replace(/\bexport (const|function)\b/g,'$1');
const content=readFileSync(join(source,'src/content.js'),'utf8');
const importPattern=/^import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/geo\.mjs['"];\s*import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/storyLayers\.mjs['"];\s*/;
if(!importPattern.test(content))throw new Error('Content script module imports changed');
const bundled='(()=>{\n"use strict";\n'+geoSource+'\n'+storySource+'\n'+content.replace(importPattern,'')+'\n})();\n';
if(/\b(?:import|export)\s*(?:\{|\*|from|const|function)/.test(bundled))throw new Error('Unexpected unbundled module reference');
rmSync(out,{recursive:true,force:true});
mkdirSync(join(out,'data'),{recursive:true});
writeFileSync(join(out,'content.js'),bundled);
for(const filename of ['manifest.json','background.js','content.css'])cpSync(join(source,filename),join(out,filename));
writeFileSync(join(out,'data/neighborhoods.geojson'),JSON.stringify(geography));
writeFileSync(join(out,'data/summary.json'),JSON.stringify(summary));
console.log(JSON.stringify({
  built:out,neighborhoods:geography.features.length,events:summary.events.length,
  citywide:summary.total,mapped,unassigned:summary.unassigned_neighborhood_count,
  bytes:Buffer.byteLength(bundled),allDataBundled:true,
  hosts:manifest.content_scripts[0].matches
},null,2));
