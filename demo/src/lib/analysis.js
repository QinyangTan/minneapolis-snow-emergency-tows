import { dominantDays } from './model.js';

const totalCounts = counts => counts.reduce((sum,count)=>sum+count,0);
const shares = counts => {
  const total = totalCounts(counts);
  return counts.map(count=>total ? 100*count/total : null);
};

export function eventById(collection, id) {
  return collection.events.find(dataset=>dataset.event.id===id) ?? null;
}

export function globalCountMaximum(collection) {
  return collection.events.reduce((maximum,dataset)=>dataset.neighborhoods.reduce(
    (largest,n)=>Math.max(largest,...n.counts),maximum),0);
}

export function metricValue(neighborhood, day, metric) {
  return metric==='share' ? shares(neighborhood.counts)[day-1] : neighborhood.counts[day-1];
}

export function concentration(dataset, k=5) {
  const leaders = dataset.neighborhoods.map(n=>({...n,total:totalCounts(n.counts)}))
    .sort((a,b)=>b.total-a.total || a.name.localeCompare(b.name,'en') || a.id.localeCompare(b.id,'en'))
    .slice(0,k);
  const records = leaders.reduce((sum,n)=>sum+n.total,0);
  const denominator = dataset.event.total;
  return {leaders,records,share:denominator ? 100*records/denominator : null,denominator};
}

export function neighborhoodHistory(collection, id) {
  return collection.events.flatMap(dataset=>{
    const n = dataset.neighborhoods.find(neighborhood=>neighborhood.id===id);
    return n ? [{eventId:dataset.event.id,eventName:dataset.event.name,start:dataset.event.start,
      counts:[...n.counts],total:totalCounts(n.counts),shares:shares(n.counts),peakDays:dominantDays(n.counts)}] : [];
  }).sort((a,b)=>a.start.localeCompare(b.start) || a.eventId.localeCompare(b.eventId));
}

export function profileSummary(collection, id) {
  const history = neighborhoodHistory(collection,id);
  const recorded = history.filter(row=>row.total>0);
  const dominantDayCounts = [0,0,0];
  for (const row of recorded) {
    if (row.peakDays.length===1) dominantDayCounts[row.peakDays[0]-1]++;
  }
  const pooledCounts = [0,1,2].map(day=>recorded.reduce((sum,row)=>sum+row.counts[day],0));
  const equalEventShares = [0,1,2].map(day=>recorded.length
    ? recorded.reduce((sum,row)=>sum+row.shares[day],0)/recorded.length : null);
  return {recordedEvents:recorded.length,dominantDayCounts,
    tieEvents:recorded.filter(row=>row.peakDays.length>1).length,
    emptyEvents:history.length-recorded.length,pooledShares:shares(pooledCounts),equalEventShares};
}
