export function countHeight(count, maximum, worldHeight) {
  return count == null ? null : maximum > 0 ? count / maximum * worldHeight : 0;
}

export function dominantDays(counts) {
  const maximum = Math.max(...counts);
  return maximum === 0 ? [] : counts.flatMap((count,i)=>count===maximum ? [i+1] : []);
}

export function labelCount(count, renderedHeight, targetHeight, moving) {
  return moving || Math.abs(renderedHeight-targetHeight)>.001 ? null : count;
}

export function summarize(data, id, day) {
  const neighborhood = data.neighborhoods.find(n=>n.id===id);
  if (!neighborhood) return null;
  const count = neighborhood.counts[day-1];
  return {...neighborhood, count, total:neighborhood.counts.reduce((a,b)=>a+b,0),
    share:data.event.dayTotals[day-1] ? 100*count/data.event.dayTotals[day-1] : 0,
    peakDays:dominantDays(neighborhood.counts)};
}
