import type { EventRow } from './preliminary';
import type { NeighborhoodGeoJSON } from './analytics';
export type ConstellationPoint = {
  id: string; season: string; total: number; mappedCount: number;
  unassignedCount: number; dayTwoShare: number; topFiveShare: number | null; peakDay: number;
};
export function eventConstellation(events: EventRow[], geography: NeighborhoodGeoJSON): ConstellationPoint[];
