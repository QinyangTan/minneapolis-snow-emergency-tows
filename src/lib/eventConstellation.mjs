/**
 * Purpose: compare three independent descriptive questions in one linked view.
 * The x-axis uses citywide Day 2 / event total; the y-axis uses the top five
 * neighborhood counts / mapped event records. Do not silently mix denominators.
 * Bubble *area* (not radius) encodes total observed event records.
 */
export function constellationRows(events, geography) {
  if (!Array.isArray(events) || !Array.isArray(geography?.features)) {
    throw new Error('Events and neighborhood features are required');
  }
  const ids = new Set();
  const rows = events.map((event) => {
    if (!event || typeof event.id !== 'string' || ids.has(event.id)) {
      throw new Error('Event identifiers must be unique strings');
    }
    ids.add(event.id);
    const counts = [1,2,3].map(day => {
      const value=event.days?.find(row=>row.day===day)?.count;
      if(!Number.isSafeInteger(value)||value<0) throw new Error('Invalid event day count');
      return value;
    });
    const citywide=counts.reduce((a,b)=>a+b,0);
    if(!Number.isSafeInteger(event.total)||event.total<=0||citywide!==event.total){
      throw new Error('Event totals must match all three day counts');
    }
    const byArea=geography.features.map(feature=>{
      const value=feature.properties?.byEvent?.[event.id]?.total ?? 0;
      if(!Number.isSafeInteger(value)||value<0) throw new Error('Invalid mapped neighborhood count');
      return {name:feature.properties?.name, count:value};
    });
    const mapped=byArea.reduce((n,v)=>n+v.count,0);
    if(mapped>citywide)throw new Error('Mapped records cannot exceed citywide records');
    const leading=[...byArea].sort((a,b)=>b.count-a.count||String(a.name).localeCompare(String(b.name))).slice(0,5);
    const topFive=leading.reduce((n,v)=>n+v.count,0);
    const max=Math.max(...counts);
    const peaks=counts.flatMap((count,i)=>count===max?[i+1]:[]);
    return {
      id:event.id, season:event.season, total:citywide,
      day2Share:counts[1]/citywide,
      mapped, unmapped:citywide-mapped,
      topFive, concentration:mapped>0?topFive/mapped:null,
      peakDay:peaks.length===1?peaks[0]:null,
      topNeighborhood:leading[0]?.name ?? null
    };
  });
  return rows;
}

export function constellationScale(rows) {
  const values=rows.filter(row=>row.concentration!==null);
  const xMax=Math.max(.1,Math.ceil(Math.max(0,...rows.map(row=>row.day2Share))*10)/10);
  const yMax=Math.max(.1,Math.ceil(Math.max(0,...values.map(row=>row.concentration))*10)/10);
  return {xMax,yMax,maxCount:Math.max(1,...rows.map(row=>row.total))};
}

export function bubbleDiameter(total, maximum, equalSize=false) {
  if(equalSize)return 30;
  if(!Number.isFinite(total)||!Number.isFinite(maximum)||total<0||maximum<=0)throw new Error('Invalid bubble size domain');
  // Graphic area is proportional to count; radius is proportional to sqrt.
  return Math.round(20+35*Math.sqrt(total/maximum));
}
