/** Descriptive denominators for the selected snow-event sample, never individual risk. */
export function contextValue(count, context, measure) {
  if (measure === 'count') return count;
  const denominator = measure === 'residents' ? context?.population?.estimate
    : measure === 'street' ? context?.streetKm : context?.areaKm2;
  return Number.isFinite(denominator) && denominator > 0
    ? count / denominator * (measure === 'residents' ? 1000 : 1) : null;
}

export function contextRows(geography, context, event = 'all', day = 0, measure = 'count', attribute = 'renters') {
  const index = new Map((context?.neighborhoods ?? []).map(row => [row.name, row]));
  return geography.features.map(({ properties: area }) => {
    const scope = event === 'all' ? area : area.byEvent?.[event];
    const count = (day === 0 ? scope?.total : scope?.days?.[String(day)]) ?? 0;
    const row = index.get(area.name) ?? null;
    return { name: area.name, count, value: contextValue(count, row, measure),
      context: row, attribute: row?.attributes?.[attribute] ?? null };
  });
}

export function contextDomain(geography, context, measure) {
  return Math.max(1, ...contextRows(geography, context, 'all', 0, measure)
    .flatMap(row => row.value === null ? [] : [row.value]));
}
