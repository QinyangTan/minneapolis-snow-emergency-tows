/** Signed difference layer: Day 2 minus Day 1 of observed neighborhood towing records.
 * Counts are historical observations. The difference is NOT a per-vehicle risk change,
 * and cannot establish a causal effect of particular snow emergency regulations.
 */
import { countInScope } from './geo.mjs';

export const DELTA_BANDS=Object.freeze([
  {min:-Infinity,max:-40,label:'≤ −40'},
  {min:-39,max:-15,label:'−39 to −15'},
  {min:-14,max:-5,label:'−14 to −5'},
  {min:-4,max:-1,label:'−4 to −1'},
  {min:0,max:0,label:'0'},
  {min:1,max:4,label:'+1 to +4'},
  {min:5,max:14,label:'+5 to +14'},
  {min:15,max:39,label:'+15 to +39'},
  {min:40,max:Infinity,label:'≥ +40'}
]);
export const DELTA_COLORS=Object.freeze([
  '#224678','#5385b6','#92bedc','#cbddec','#edf0f2',
  '#f9ddad','#f1a267','#d76647','#9f2946'
]);
export function deltaClass(value){
  if(!Number.isInteger(value)) throw new Error('The neighborhood delta must be an integer');
  const found=DELTA_BANDS.findIndex(b=>value>=b.min&&value<=b.max);
  if(found<0)throw new Error('Delta fell outside the legend ranges');
  return found;
}
export function deltaColor(value){return DELTA_COLORS[deltaClass(value)];}
export function signed(value){
  if(!Number.isInteger(value))throw new Error('Expected an integer difference');
  return value>0?'+'+value.toLocaleString('en-US'):value.toLocaleString('en-US').replace('-', '−');
}
export function compareDayTwoToOne(geo,summary,event='all'){
  if(!Array.isArray(geo?.features)||!Array.isArray(summary?.events)) throw new Error('Invalid official City dataset');
  const item=event==='all'?summary:summary.events.find(e=>e.id===event);
  if(!item)throw new Error('Unknown emergency');
  const day1=item.days.find(d=>d.day===1)?.count,day2=item.days.find(d=>d.day===2)?.count;
  if(!Number.isInteger(day1)||!Number.isInteger(day2))throw new Error('Missing citywide day values');
  const rows=geo.features.map(f=>{
    const first=countInScope(f.properties,event,1);
    const second=countInScope(f.properties,event,2);
    return {name:f.properties.name,count:second-first,first,second};
  });
  const totalDelta=day2-day1;
  const mappedDelta=rows.reduce((total,row)=>total+row.count,0);
  const top=[...rows].sort((a,b)=>Math.abs(b.count)-Math.abs(a.count)||
    b.count-a.count||a.name.localeCompare(b.name)).slice(0,6);
  return {
    mode:'delta',event,day:0,rows,top,
    max:Math.max(1,...rows.map(row=>Math.abs(row.count))),mapped:mappedDelta,
    headline:{
      primary:totalDelta,secondary:mappedDelta,
      primaryLabel:'citywide Day 2 − Day 1',
      secondaryLabel:'mapped Day 2 − Day 1'
    },
    day1,day2,
    measure:'difference in tow records (Day 2 minus Day 1)'
  };
}
export function explainDelta(result,neighborhood='all'){
  const row=neighborhood==='all'?result.top[0]:result.rows.find(r=>r.name===neighborhood);
  if(!row)return 'No comparable neighborhood data is available.';
  const movement=row.count>0?'more':row.count<0?'fewer':'the same number of';
  return row.name+' recorded '+row.first+' Day 1 tows and '+row.second+
    ' Day 2 tows ('+signed(row.count)+'). This means '+movement+
    ' observed tows on Day 2. The citywide total changed by '+signed(result.headline.primary)+
    '. Counts are not normalized to parked cars, and the difference is not evidence that a rule caused the change.';
}
