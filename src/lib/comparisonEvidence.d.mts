export type ShareRow = {name:string;countA:number;countB:number;shareA:number;shareB:number;deltaPp:number;absGap:number};
export function compareCategoryShares(left:number[],right:number[],labels:string[],options?:{sortByGap?:boolean;limit?:number}): {rows:ShareRow[];maxShare:number;totalCategories:number;empty:boolean};
