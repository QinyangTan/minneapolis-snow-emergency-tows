export function normalizedCount(count, population, mode) {
  if (mode === 'count') return count;
  return Number.isFinite(population) && population > 0 ? count * 1000 / population : null;
}
export function rank(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = Array(values.length);
  for (let i = 0; i < sorted.length;) {
    let end = i + 1;
    while (end < sorted.length && sorted[end].value === sorted[i].value) end++;
    for (let j = i; j < end; j++) ranks[sorted[j].index] = (i + end - 1) / 2 + 1;
    i = end;
  }
  return ranks;
}
export function spearman(points) {
  const pairs = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pairs.length < 3) return null;
  const xs = rank(pairs.map(p => p.x)), ys = rank(pairs.map(p => p.y));
  const mean = (pairs.length + 1) / 2;
  const numerator = xs.reduce((sum, x, i) => sum + (x - mean) * (ys[i] - mean), 0);
  const denominator = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) * ys.reduce((s, y) => s + (y - mean) ** 2, 0));
  return denominator === 0 ? null : numerator / denominator;
}
