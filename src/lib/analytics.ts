/** Pure data selectors for all linked views. Source counts are observed tow records. */
import type { DayRow, EventRow, Summary } from './preliminary';

export type TowScope = { total: number; days: Record<string, number> };
export type AreaProperties = TowScope & {
  name: string;
  byEvent: Record<string, TowScope>;
};
export type AreaFeature = { type: 'Feature'; properties: AreaProperties; geometry: unknown };
export type NeighborhoodGeoJSON = {
  type: 'FeatureCollection';
  features: AreaFeature[];
};

export function countInScope(area: AreaProperties, event: string, day: number): number {
  const scope = event === 'all' ? area : area.byEvent?.[event];
  if (!scope) return 0;
  const count = day === 0 ? scope.total : scope.days?.[String(day)];
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

export function mappedCount(geography: NeighborhoodGeoJSON, event: string, day: number): number {
  return geography.features.reduce((sum, feature) => sum + countInScope(feature.properties, event, day), 0);
}

export function commonDayDomain(geography: NeighborhoodGeoJSON, event: string): number {
  return Math.max(1, ...geography.features.flatMap((feature) =>
    [1, 2, 3].map((day) => countInScope(feature.properties, event, day))
  ));
}

export function eventDays(summary: Summary | null, event: string, fallback: DayRow[]): DayRow[] {
  if (!summary || event === 'all') return summary?.days ?? fallback;
  return summary.events.find((row) => row.id === event)?.days ?? fallback;
}

export function eventRecurrence(area: AreaProperties, events: EventRow[], day: number): number {
  return events.reduce((count, event) => count +
    (countInScope(area, event.id, day) > 0 ? 1 : 0), 0);
}

export function shares(days: DayRow[]): number[] {
  const total = days.reduce((sum, row) => sum + row.count, 0);
  return days.map((row) => total > 0 ? row.count / total : 0);
}
