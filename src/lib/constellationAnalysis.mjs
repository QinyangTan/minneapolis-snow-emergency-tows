/** Descriptive, denominator-explicit multivariate coordinates for nine recorded events. */
export function eventConstellation(events, geography) {
  if (!Array.isArray(events) || !Array.isArray(geography?.features)) {
    throw new Error('Expected event rows and a neighborhood FeatureCollection');
  }
  return events.map((event) => {
    if (!Number.isFinite(event.total) || event.total <= 0) {
      throw new Error('Each event needs a positive citywide record count');
    }
    const days = [1, 2, 3].map((day) => {
      const value = event.days?.find((row) => row.day === day)?.count;
      if (!Number.isFinite(value) || value < 0) throw new Error('Invalid day count: ' + event.id);
      return value;
    });
    if (days.reduce((a, b) => a + b, 0) !== event.total) {
      throw new Error('Event-day totals mismatch: ' + event.id);
    }
    const neighborhoodCounts = geography.features.map((feature) => {
      const value = feature.properties?.byEvent?.[event.id]?.total ?? 0;
      if (!Number.isFinite(value) || value < 0) throw new Error('Invalid mapped neighborhood count');
      return value;
    });
    const mappedCount = neighborhoodCounts.reduce((a, b) => a + b, 0);
    if (mappedCount > event.total) throw new Error('Mapped records exceed citywide records');
    const leadingFive = [...neighborhoodCounts].sort((a, b) => b - a)
      .slice(0, 5).reduce((a, b) => a + b, 0);
    return {
      id: event.id, season: event.season, total: event.total,
      mappedCount, unassignedCount: event.total - mappedCount,
      dayTwoShare: days[1] / event.total,
      topFiveShare: mappedCount === 0 ? null : leadingFive / mappedCount,
      peakDay: days.indexOf(Math.max(...days)) + 1
    };
  });
}
