export type EventConstellationRow={
  id:string;season:string;total:number;day2Share:number;
  mapped:number;unmapped:number;topFive:number;concentration:number|null;
  peakDay:number|null;topNeighborhood:string|null
};
import type {EventRow} from './preliminary';
import type {NeighborhoodGeoJSON} from './analytics';
export function constellationRows(events:EventRow[], geography:NeighborhoodGeoJSON):EventConstellationRow[];
export function constellationScale(rows:EventConstellationRow[]):{xMax:number;yMax:number;maxCount:number};
export function bubbleDiameter(total:number,maximum:number,equalSize?:boolean):number;
