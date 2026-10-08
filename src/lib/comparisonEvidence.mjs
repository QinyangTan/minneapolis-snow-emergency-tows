import { probabilityVector } from './eventAnalysis.mjs';

/**
 * Comparable descriptive distributions for an editorial paired-dot view.
 * Each event normalizes to its *own* nonnegative count denominator.
 * 'deltaPp' is B minus A in percentage points, never a risk difference.
 * The optional sort ranks by absolute share gap, not by a significance test.
 */
export function compareCategoryShares(left, right, labels, options={}) {
  if (!Array.isArray(labels) || !Array.isArray(left) || !Array.isArray(right) ||
      labels.length !== left.length || labels.length !== right.length) {
    throw new Error('Category labels and count vectors must be aligned');
  }
  if (new Set(labels).size !== labels.length || labels.some(s=>typeof s!=='string'||!s.trim())) {
    throw new Error('Categories must have unique nonempty names');
  }
  const pa=probabilityVector(left), pb=probabilityVector(right);
  if (!pa || !pb) return { rows: [], maxShare: 0, totalCategories: labels.length, empty: true };
  const rows=labels.map((name,i)=>({
    name, countA:left[i], countB:right[i],
    shareA:pa[i], shareB:pb[i], deltaPp:(pb[i]-pa[i])*100,
    absGap:Math.abs(pb[i]-pa[i])*100
  }));
  if (options.sortByGap) rows.sort((a,b)=>b.absGap-a.absGap||a.name.localeCompare(b.name));
  const limit=options.limit ?? rows.length;
  if (!Number.isInteger(limit)||limit<1) throw new Error('Limit must be a positive integer');
  const selected=rows.slice(0,limit);
  const rawMax=Math.max(0,...selected.map(x=>Math.max(x.shareA,x.shareB)));
  // Exact shown scale, no chart-by-chart rescaling without disclosure.
  return {rows:selected, maxShare:rawMax, totalCategories:labels.length, empty:false};
}
