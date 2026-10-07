export type Pair = { a: string; b: string; divergence: number };
export function probabilityVector(counts: number[]): number[] | null;
export function jsDivergence(left: number[], right: number[]): number | null;
export function dayVector(event: {id:string; days?: {day:number;count:number}[]}): number[];
export function neighborhoodVector(geo: {features: {properties:{byEvent:Record<string,{total:number}>}}[]}, id: string): number[];
export function compareEvents(events: {id:string;days?: {day:number;count:number}[]}[], geo: any, mode?: string): Pair[];
export function topEventPairs(events: {id:string;days?: {day:number;count:number}[]}[], geo: any, mode?: string): {closest:Pair[];farthest:Pair[]};
export function prominentNeighborhoods(geo: any, eventId:string, day?:number, topK?:number, minCount?:number): Set<string>;
export function prominentRecurrence(geo:any, eventIds:string[], day?:number, topK?:number, minCount?:number): Map<string,number>;
