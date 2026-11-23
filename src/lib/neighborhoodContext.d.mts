import type { NeighborhoodGeoJSON } from './analytics';

export type ContextMeasure = 'count' | 'residents' | 'area' | 'street';
export type ContextAttribute = 'renters' | 'noVehicle' | 'poverty';
export type ContextEstimate = { estimate: number | null; moe: number | null; period: string; reliability: string };
export type ContextPercent = { percent: number | null; moe: number | null; period: string; reliability: string };
export type NeighborhoodContextRow = {
  name: string;
  areaKm2: number;
  streetKm?: number | null;
  population: ContextEstimate | null;
  attributes: Partial<Record<ContextAttribute, ContextPercent | null>>;
};
export type NeighborhoodContextData = {
  schemaVersion: number;
  sourceCommit: string;
  areaMethod: string;
  ordinaryDayBaseline: null;
  neighborhoods: NeighborhoodContextRow[];
};
export type ContextPoint = {
  name: string;
  count: number;
  value: number | null;
  context: NeighborhoodContextRow | null;
  attribute: ContextPercent | null;
};
export function contextValue(count: number, context: NeighborhoodContextRow | null, measure: ContextMeasure): number | null;
export function contextRows(geography: NeighborhoodGeoJSON, context: NeighborhoodContextData | null, event?: string, day?: number, measure?: ContextMeasure, attribute?: ContextAttribute): ContextPoint[];
export function contextDomain(geography: NeighborhoodGeoJSON, context: NeighborhoodContextData | null, measure: ContextMeasure): number;
