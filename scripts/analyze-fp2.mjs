import fs from 'node:fs';import {spearman,normalizedCount} from '../src/lib/fp2.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const c=read('static/data/fp2-context.json'),g=read('static/data/neighborhoods.geojson'),s=read('static/data/summary.json');
const rows=c.rows.map(r=>({...r,area:g.features.find(f=>f.properties.name===r.name).properties}));
const result={metrics:{},topCounts:[],topRates:[],events:[]};
for(const metric of ['poverty','lowIncome','renters','noVehicle','salePrice','traffic']){
 const p=rows.filter(r=>r.metrics[metric]&&r.population?.estimate>0).map(r=>({name:r.name,x:r.metrics[metric].value,y:r.area.total,rate:normalizedCount(r.area.total,r.population.estimate,'rate')}));
 result.metrics[metric]={n:p.length,countRho:spearman(p),rateRho:spearman(p.map(r=>({x:r.x,y:r.rate}))),points:p};
}
result.topCounts=rows.map(r=>({name:r.name,count:r.area.total,population:r.population?.estimate??null,rate:normalizedCount(r.area.total,r.population?.estimate,'rate')})).sort((a,b)=>b.count-a.count).slice(0,6);
result.topRates=rows.filter(r=>r.population?.estimate>0).map(r=>({name:r.name,count:r.area.total,population:r.population.estimate,rate:normalizedCount(r.area.total,r.population.estimate,'rate')})).sort((a,b)=>b.rate-a.rate).slice(0,6);
for(const event of s.events){const p=rows.filter(r=>r.metrics.poverty&&r.population?.estimate>0).map(r=>({x:r.metrics.poverty.value,y:normalizedCount(r.area.byEvent[event.id].total,r.population.estimate,'rate')}));result.events.push({id:event.id,season:event.season,total:event.total,rho:spearman(p)});}
fs.mkdirSync('deliverables/FP2',{recursive:true});fs.writeFileSync('deliverables/FP2/analysis-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,metrics:Object.fromEntries(Object.entries(result.metrics).map(([k,v])=>[k,{...v,points:undefined}]))},null,2));
