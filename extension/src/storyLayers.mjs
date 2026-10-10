/** Course-aligned, discrete map encodings and recurrence analysis.
 * All metrics are descriptive observed tow counts, never risk rates.
 */
import { countInScope } from './geo.mjs';

// Fixed, common boundaries permit honest comparisons across event/day selections.
// A separate gray encodes observed zero, never "missing neighborhood data".
export const COUNT_BANDS = Object.freeze([
  {min:0,max:0,label:'0'},
  {min:1,max:4,label:'1–4'},
  {min:5,max:14,label:'5–14'},
  {min:15,max:39,label:'15–39'},
  {min:40,max:99,label:'40–99'},
  {min:100,max:Infinity,label:'100+'}
]);
export const REPEAT_BANDS = Object.freeze([
  {min:0,max:0,label:'0'},
  {min:1,max:2,label:'1–2'},
  {min:3,max:4,label:'3–4'},
  {min:5,max:6,label:'5–6'},
  {min:7,max:8,label:'7–8'},
  {min:9,max:9,label:'9'}
]);
// Strong categorical separation is intentionally preferred to imperceptible gradients.
// Lighter warm marks = fewer records/events; purple = highest ordinal bin.
export const HIGH_CONTRAST_COLORS = Object.freeze([
  '#e1e7ed','#fff0b3','#f6b44b','#e87045','#ac365a','#4e2677'
]);

export function legendBands(mode='counts') {
  return mode==='counts'?COUNT_BANDS:REPEAT_BANDS;
}
export function colorClass(count,mode='counts') {
  if(!Number.isInteger(count)||count<0)throw new Error('Observed tally must be a nonnegative integer');
  const bands=legendBands(mode);
  return Math.max(0,bands.findIndex(({min,max})=>count>=min&&count<=max));
}
export function colorForObservation(count,mode='counts'){
  return HIGH_CONTRAST_COLORS[colorClass(count,mode)];
}
function rankedNeighborhoods(geo,events,day) {
  const map=new Map();
  const rankedByEvent=new Map();
  for(const event of events){
    const rows=geo.features.map(feature=>({
      name:feature.properties.name,count:countInScope(feature.properties,event.id,day)
    })).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
    rankedByEvent.set(event.id,rows);
  }
  return rankedByEvent;
}

/** Top-K prominence: >=5 observed records and tied ranks are included. */
export function recurrenceRows(geo,events,day=0,metric='any',topK=5){
  if(!Array.isArray(geo?.features)||!Array.isArray(events)||events.length===0)
    throw new Error('Expected neighborhoods and at least one event');
  if(![0,1,2,3].includes(day))throw new Error('Unknown snow emergency day');
  if(!['any','prominent'].includes(metric)||![5,10,15].includes(topK))
    throw new Error('Invalid recurrence rule');
  const rankings=rankedNeighborhoods(geo,events,day);
  const qualified=new Map(events.map(event=>{
    const sorted=rankings.get(event.id);
    if(metric==='any')return [event.id,new Set(sorted.filter(r=>r.count>0).map(r=>r.name))];
    // Rank ties count as prominent even if more than K neighborhoods qualify.
    const kth=sorted[Math.min(topK,sorted.length)-1]?.count??0;
    const cutoff=Math.max(5,kth);
    return [event.id,new Set(sorted.filter(r=>r.count>=cutoff).map(r=>r.name))];
  }));
  return geo.features.map(feature=>{
    const name=feature.properties.name;
    const eventIds=events.filter(event=>qualified.get(event.id).has(name)).map(event=>event.id);
    return {name,count:eventIds.length,eventIds};
  });
}

export function layerAnalysis(geo,summary,options={}){
  const mode=options.mode==='recurrence'?'recurrence':'counts';
  const day=Number(options.day??0);
  const event=options.event||'all';
  if(![0,1,2,3].includes(day))throw new Error('Invalid day');
  let rows,headline,measure;
  if(mode==='counts'){
    rows=geo.features.map(feature=>({
      name:feature.properties.name,count:countInScope(feature.properties,event,day)
    }));
    const row=event==='all'?summary:summary.events.find(e=>e.id===event);
    if(!row)throw new Error('Unknown event');
    const overall=day===0?row.total:row.days.find(r=>r.day===day)?.count;
    if(!Number.isFinite(overall))throw new Error('Unknown event/day');
    headline={primary:overall,secondary:rows.reduce((a,r)=>a+r.count,0),
      primaryLabel:'citywide tow records',secondaryLabel:'neighborhood-mapped records'};
    measure='observed tow records';
  }else{
    rows=recurrenceRows(geo,summary.events,day,options.recurrenceMetric||'any',Number(options.topK??5));
    headline={primary:summary.events.length,secondary:rows.filter(r=>r.count>0).length,
      primaryLabel:'historical events compared',secondaryLabel:'neighborhoods meeting rule'};
    measure='emergencies meeting rule (of '+summary.events.length+')';
  }
  const mapped=rows.reduce((sum,r)=>sum+r.count,0);
  const top=[...rows].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)).slice(0,6);
  return {mode,day,event,rows,top,max:Math.max(1,...rows.map(r=>r.count)),
    mapped,headline,measure,selectedValue:top[0]?.count??0};
}

export function explainSelection(result,summary,neighborhood='all',metric='any',topK=5){
  const top=result.top[0];
  if(result.mode==='recurrence'){
    const desc=metric==='any'?'at least one tow record':
      'a Top '+topK+' neighborhood by tow count (minimum five records; ties included)';
    if(neighborhood!=='all'){
      const row=result.rows.find(r=>r.name===neighborhood);
      return row?neighborhood+' met this rule in '+row.count+' of '+summary.events.length+
        ' selected snow emergencies. Rule: '+desc+'.':'Select a recorded neighborhood.';
    }
    return top?top.name+' met the recurrence rule in '+top.count+' of '+summary.events.length+
      ' emergencies. Rule: '+desc+'. This is a count of events, not a risk score.':
      'No neighborhoods meet the selected recurrence rule.';
  }
  const row=result.rows.find(r=>r.name===neighborhood)??top;
  const city=result.headline.primary;
  const mapped=result.headline.secondary;
  if(!row)return 'No neighborhood count is available for this selection.';
  const proportion=mapped>0?(100*row.count/mapped).toFixed(1):'0.0';
  const qualifier=neighborhood==='all'?'Highest mapped count: ':'Selected neighborhood: ';
  return qualifier+row.name+' has '+row.count+' observed records ('+proportion+
    '% of '+mapped+' mapped records in this selection). '+(city-mapped)+
    ' citywide records lack a mapped neighborhood. Percentages describe recorded observations, not parking risk.';
}
