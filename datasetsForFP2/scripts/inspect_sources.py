import json,re,concurrent.futures
from pathlib import Path
import requests
ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/'catalog'; META=CAT/'metadata'; META.mkdir(exist_ok=True)
def fetch(url,params=None):
 r=requests.get(url,params=params or {'f':'json'},timeout=45);r.raise_for_status();x=r.json()
 if isinstance(x,dict) and 'error' in x:raise ValueError(str(x['error']))
 return x
services=json.loads((CAT/'minneapolis_services.json').read_text(encoding='utf8'))['services']
names=['Minneapolis_Neighborhoods','Mpls_Census_Tracts_2020','PW_Street_Centerline','Snow_Emergency_Routes','Snow_Emergency_Parkways_in_Minneapolis','Parking_Meter_Inventory','Parking_Meter_Pay_Stations','TylerParkingProd','MinneapolisCurbMap_WFL1','DowntownParking','Existing_Land_Use','Neighborhood_Commercial_Nodes','Downtown_Core_Area_Map','High_Frequency_Transit_And_Walksheds','All_Transit_Routes','TransitStops','Transportation_Action_Plan_Street_Types','Serious_Injury_and_Fatal_Crashes_2020_2024','Neighborhood_Dem_Tenure_WFL1','PCT_HH_Income_Transportation','Poverty']
selected=[s for s in services if s['type']=='FeatureServer' and (s['name'] in names or re.match(r'(Snow_Emergency_.*_(Tows|Tags)|SnowEmergency.*(Tows|Tags)|Assessing_Department_Parcel_Data_202[2345]|Assessors_Parcel_Data_2022|Public_311_202[2345]|Sales202)',s['name']))]
def inspect(s):
 try:
  obj=fetch(s['url']);(META/(s['name']+'.service.json')).write_text(json.dumps(obj,ensure_ascii=False),encoding='utf8')
  layers=[]
  for layer in obj.get('layers',[])+obj.get('tables',[]):
   u=s['url']+'/'+str(layer['id']); m=fetch(u)
   (META/(s['name']+'.'+str(layer['id'])+'.json')).write_text(json.dumps(m,ensure_ascii=False),encoding='utf8')
   layers.append({'id':layer['id'],'name':layer['name'],'url':u,'geometryType':m.get('geometryType'),'fields':[f['name'] for f in m.get('fields',[])]})
  return {**s,'itemId':obj.get('serviceItemId'),'layers':layers}
 except Exception as e:return {**s,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(inspect,selected))
(CAT/'inspected_city_sources.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
for s in results:
 if not re.search('Snow.*(Tags|Tows)',s['name']):print(json.dumps(s))
print('INSPECTED',len(results))
