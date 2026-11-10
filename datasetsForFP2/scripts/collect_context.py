import requests,json,concurrent.futures,hashlib,re,datetime,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def job(t):
 name,url,params,kind=t; path=ROOT/'raw'/name;path.parent.mkdir(parents=True,exist_ok=True)
 try:
  r=requests.get(url,params=params,timeout=100);r.raise_for_status()
  if kind=='json':
   data=r.json()
   if isinstance(data,dict) and 'error' in data:raise ValueError(str(data['error']))
  if kind=='zip' and not r.content.startswith(b'PK'):raise ValueError('Not a ZIP')
  path.write_bytes(r.content)
  return {'id':name,'url':r.url,'path':str(path.relative_to(ROOT)).replace('\\','/'),'status':'downloaded','bytes':len(r.content),'sha256':hashlib.sha256(r.content).hexdigest(),'retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'last_modified':r.headers.get('Last-Modified'),'kind':kind}
 except Exception as e:return {'id':name,'url':url,'params':params,'status':'failed','error':str(e)}
tasks=[]
groups=['B01003','B19301','B19013','B17001','B25077','B25064','B25003','B08201','B08301','B25024','B25070','B25002']
for year in [2022,2023,2024]:
 for group in groups:
  for geo in ['tract','block group']:
   tasks.append((f'acs/{year}/{geo.replace(" ","_")}_{group}.json',f'https://api.census.gov/data/{year}/acs/acs5',{'get':f'NAME,group({group})','for':geo+':*','in':'state:27 county:053'},'json'))
for group in groups:tasks.append((f'acs/metadata/{group}.json',f'https://api.census.gov/data/2024/acs/acs5/groups/{group}.json',None,'json'))
tasks += [
 ('weather/USW00014922.dly','https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/USW00014922.dly',None,'text'),
 ('weather/ghcn_daily_readme.txt','https://www.ncei.noaa.gov/pub/data/ghcn/daily/readme.txt',None,'text'),
 ('weather/ghcn_stations.txt','https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt',None,'text'),
 ('transit/gtfs_current.zip','https://svc.metrotransit.org/mtgtfs/gtfs.zip',None,'zip'),
 ('transit/feed_documentation.html','https://svc.metrotransit.org/',None,'text'),
 ('transit/archive_index.html','https://svc.metrotransit.org/mtgtfs/archive/',None,'text'),
 ('transit/tripupdates.pb','https://svc.metrotransit.org/mtgtfs/tripupdates.pb',None,'binary'),
 ('transit/vehiclepositions.pb','https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb',None,'binary'),
 ('transit/alerts.pb','https://svc.metrotransit.org/mtgtfs/alerts.pb',None,'binary'),
 ('geography/tl_2024_27_tract.zip','https://www2.census.gov/geo/tiger/TIGER2024/TRACT/tl_2024_27_tract.zip',None,'zip'),
 ('geography/tl_2024_27_bg.zip','https://www2.census.gov/geo/tiger/TIGER2024/BG/tl_2024_27_bg.zip',None,'zip'),
 ('references/2024_Accomplishments_TPS.pdf','https://www.minneapolismn.gov/media/-www-content-assets/documents/2024-Accomplishments-TPS.pdf',None,'binary'),
 ('references/Public_Works_Retention_Schedule.pdf','https://www.minneapolismn.gov/media/-www-content-assets/documents/Public-Works-Retention-Schedule.pdf',None,'binary'),
 ('references/public_data_request.html','https://www.minneapolismn.gov/government/government-data/request-public-data/',None,'text'),
 ('references/traffic_data_products.html','https://www.dot.state.mn.us/traffic/data/data-products.html',None,'text')]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 results=[]
 for r in pool.map(job,tasks):
  results.append(r);print(r['id'],r['status'],r.get('bytes',r.get('error','')) ,flush=True)
  (ROOT/'catalog/context_downloads.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
