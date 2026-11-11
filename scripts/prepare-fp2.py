"""Build a small, auditable FP2 neighborhood input from versioned source snapshots."""
import json, re, statistics, collections, datetime, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'datasetsForFP2'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def norm(s):return re.sub('[^a-z0-9]','',str(s).lower())
def numeric(v):
 try:return float(str(v).replace(',',''))
 except (ValueError,TypeError):return None
observations=read(DATA/'prepared/city_acs2024_observations.json')['rows']
context=read(DATA/'prepared/neighborhood_context_starter.json')
names={norm(r['neighborhood']):r['neighborhood'] for r in context}
sales=read(DATA/'raw/city/Property_Sales_2021_to_2025__0.json')['features']
groups=collections.defaultdict(list); seen=set();audit=collections.Counter()
allowed={'RESIDENTIAL 1 UNIT','RESIDENTIAL 1 UNIT - CONDOMINIUM','RESIDENTIAL 1 UNIT - TOWNHOUSE'}
for f in sales:
 a=f['attributes']; audit['source_rows']+=1
 if a.get('PROPTYPE_DESC') not in allowed or a.get('LAND_SALE')!='NO' or a.get('EXCLUDED_FROM_RATIO_STUDY')!='NO' or a.get('NUM_PARCELS_IN_SALE')!=1:
  audit['excluded_by_transaction_filter']+=1;continue
 if not a.get('SALE_DATE') or datetime.datetime.fromtimestamp(a['SALE_DATE']/1000,datetime.timezone.utc).year!=2024:
  audit['outside_2024']+=1;continue
 price=numeric(a.get('ADJ_SALE_PRICE'));name=names.get(norm(a.get('NBHD_DESC')))
 if price is None or price<=0 or name is None:
  audit['missing_price_or_neighborhood']+=1;continue
 key=(a.get('ECRV'),a.get('PIN'))
 if key in seen:audit['duplicate_transaction_parcel']+=1;continue
 seen.add(key);groups[name].append(price);audit['included_sales']+=1
rows=[]
for c in context:
 name=c['neighborhood']; obs=[r for r in observations if r['map_neighborhood']==name]
 def subset(table,desc=None):return [r for r in obs if r['ACS5 Table ID']==table and not r['Desc2'] and (desc is None or r['Desc1']==desc)]
 def share(table,desc):
  allrows=subset(table); selected=subset(table,desc)
  denominator=sum(r['estimate_numeric'] or 0 for r in allrows)
  if len(selected)!=1 or denominator<=0:return None
  r=selected[0];percent_moe=numeric(r.get('Percent Universe MOE'))
  return {'value':100*r['estimate_numeric']/denominator,'numerator':r['estimate_numeric'],'denominator':denominator,'countMoe':r['moe_numeric'],'percentMoe':None if percent_moe is None else 100*percent_moe,'period':r['ACS5 Release'],'reliability':r['Reliability Level'],'table':table}
 metrics={'poverty':share('B17021','below poverty'),'renters':share('B25003','renter-occupied'),'noVehicle':share('B25044','no vehicle')}
 income=subset('B19001');den=sum(r['estimate_numeric'] or 0 for r in income);low=[r for r in income if r['Desc1'] in ['< $15,000','$15,000 - 34,999']]
 metrics['lowIncome']={'value':100*sum(r['estimate_numeric'] for r in low)/den,'numerator':sum(r['estimate_numeric'] for r in low),'denominator':den,'period':'2019-2023','percentMoe':None,'reliability':'Combined brackets; MOE not calculated','table':'B19001'} if len(low)==2 and den>0 else None
 values=groups[name];metrics['salePrice']={'value':statistics.median(values),'n':len(values),'period':'2024','reliability':'Descriptive transaction median; minimum 10 sales','percentMoe':None,'table':'City property sales'} if len(values)>=10 else None
 rows.append({'name':name,'population':c['population'],'metrics':metrics,'eligibleSales':len(values)})
result={'schemaVersion':1,'builtFrom':'versioned snapshots collected 2026-11-10','rows':rows,'saleAudit':dict(audit),'sources':{'acsPopulationHousing':'https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodHousingDownload.csv','acsEconomics':'https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodEconomicWellbeingDownload.csv','repository':'https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2'},'notes':['Economics: ACS 2019-2023. Population/housing: ACS 2020-2024. Use metric-specific periods.','Percentages recomputed from mutually exclusive source categories, not rounded published percentages.','Sale price: 2024 adjusted price, one-unit residential/condo/townhouse, single parcel, not land, not excluded from ratio study; distinct ECRV+PIN; n >= 10. Nominal dollars.','86 of 87 neighborhood names match ACS. Name matching does not prove historical boundary equivalence.','Population scaling describes recorded tows per 1,000 residents, not probability, unique vehicles, or causal effects.']}
out=ROOT/'static/data/fp2-context.json';out.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(json.dumps({'neighborhoods':len(rows),'populationMatches':sum(r['population'] is not None for r in rows),'metricCoverage':{k:sum(r['metrics'][k] is not None for r in rows) for k in metrics},'sales':dict(audit),'bytes':out.stat().st_size},indent=2))
