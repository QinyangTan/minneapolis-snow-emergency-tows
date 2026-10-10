/**
 * Inclusive query-range selection for coordinated scatterplot/roster brushing.
 * The input dimension is a proportion of an event's citywide observations.
 * All other chart dimensions remain unchanged by the brush.
 */
export function brushByDayTwo(rows, minPct, maxPct) {
  if (!Array.isArray(rows) || !Number.isFinite(minPct) || !Number.isFinite(maxPct) ||
      minPct < 0 || maxPct > 100 || minPct > maxPct) {
    throw new Error('Brush boundaries must satisfy 0 <= min <= max <= 100');
  }
  return rows.filter((row) => Number.isFinite(row.day2Share) &&
    row.day2Share * 100 >= minPct - 1e-8 && row.day2Share * 100 <= maxPct + 1e-8);
}
