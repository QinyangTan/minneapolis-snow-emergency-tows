/**
 * Event-comparison measures used by the visualization.
 *
 * JS divergence in bits has a fixed [0,1] range, is symmetric, and does not
 * require a model, temporal alignment, or invented denominators. It compares
 * distributions of observed tow counts; it is NOT a causal or risk estimate.
 */
export function probabilityVector(counts) {
  if (!Array.isArray(counts) || counts.length === 0 ||
      counts.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error('Expected a non-empty vector of finite nonnegative counts');
  }
  const sum = counts.reduce((s, n) => s + n, 0);
  return sum === 0 ? null : counts.map((n) => n / sum);
}
function klTerm(p, q) {
  return p > 0 ? p * Math.log2(p / q) : 0;
}
export function jsDivergence(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    throw new Error('Both inputs must have the same number of categories');
  }
  const p = probabilityVector(left), q = probabilityVector(right);
  if (!p || !q) return null; // no comparable distribution for empty data
  const m = p.map((v, i) => (v + q[i]) / 2);
  const result = (p.reduce((sum, v, i) => sum + klTerm(v, m[i]), 0) +
                  q.reduce((sum, v, i) => sum + klTerm(v, m[i]), 0)) / 2;
  return Math.min(1, Math.max(0, result));
}
export function dayVector(event) {
  return [1,2,3].map((day) => {
    const match = event.days?.find((row) => row.day === day);
    if (!match) throw new Error('Missing day '+day+' for '+event.id);
    return match.count;
  });
}
export function neighborhoodVector(geo, id) {
  return geo.features.map((feature) => feature.properties.byEvent[id]?.total ?? 0);
}
export function compareEvents(events, geo, mode = 'days') {
  if (!['days', 'neighborhoods'].includes(mode)) throw new Error('Unknown event comparison mode');
  const vector = (event) => mode === 'days' ? dayVector(event) : neighborhoodVector(geo, event.id);
  return events.flatMap((a, i) => events.slice(i+1).map((b) => ({
    a:a.id, b:b.id, divergence:jsDivergence(vector(a), vector(b))
  }))).filter((pair) => pair.divergence !== null);
}
export function topEventPairs(events, geo, mode = 'days') {
  const pairs = compareEvents(events, geo, mode);
  return {
    closest: [...pairs].sort((a,b) => a.divergence-b.divergence).slice(0,3),
    farthest: [...pairs].sort((a,b) => b.divergence-a.divergence).slice(0,3)
  };
}

/**
 * A separate, explicitly defined prominence metric, as opposed to presence:
 * top K city neighborhoods within each event/day scope AND >= minCount.
 * Equal counts at the cutoff are all included (ties preserved).
 */
export function prominentNeighborhoods(geo, eventId, day=0, topK=10, minCount=5) {
  if (!Number.isInteger(topK) || topK < 1 || minCount < 1) throw new Error('Bad prominence threshold');
  const values = geo.features.map((feature) => {
    const scope = feature.properties.byEvent[eventId];
    return {name:feature.properties.name, count:day === 0 ? scope?.total ?? 0 : scope?.days?.[String(day)] ?? 0};
  });
  const positive = values.map((v) => v.count).filter((count) => count >= minCount).sort((a,b) => b-a);
  if (!positive.length) return new Set();
  const threshold = positive[Math.min(topK, positive.length)-1];
  return new Set(values.filter((v) => v.count >= threshold).map((v) => v.name));
}
export function prominentRecurrence(geo, eventIds, day=0, topK=10, minCount=5) {
  const output = new Map(geo.features.map((feature) => [feature.properties.name, 0]));
  for (const eventId of eventIds) {
    for (const name of prominentNeighborhoods(geo, eventId, day, topK, minCount)) {
      output.set(name, output.get(name) + 1);
    }
  }
  return output;
}
