import requests,json,datetime,hashlib,concurrent.futures
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CAT=ROOT/'catalog'
def get(url,**params):
 r=requests.get(url,params=params,timeout=90);r.raise_for_status();o=r.json()
 if 'error' in o:raise ValueError(str(o['error']))
 return o
def traffic():
 url='https://webgis.dot.state.mn.us/65agsf1/rest/services/sdw_incdt/AADT_HISTORY_SAMPLED/FeatureServer/0';fs=[]
 try:
  # County-level historical context retains discontinued sites absent from today's network.
  where="COUNTY = 'Hennepin' AND DATA_YEAR >= 2022 AND DATA_YEAR <= 2025"
  ids=get(url+'/query',f='json',where=where,returnIdsOnly='true').get('objectIds',[])
  if not ids:
   cats=get(url+'/query',f='json',where='DATA_YEAR >= 2022',outFields='COUNTY',returnDistinctValues='true',returnGeometry='false');(CAT/'traffic_county_values.json').write_text(json.dumps(cats),encoding='utf8')
   raise ValueError('No rows; review county spelling in traffic_county_values.json')
  for start in range(0,len(ids),150):fs+=get(url+'/query',f='json',objectIds=','.join(map(str,ids[start:start+150])),outFields='*',returnGeometry='false').get('features',[])
  if len(fs)!=len(ids) or len({f['attributes']['OBJECTID'] for f in fs})!=len(ids):raise ValueError('Incomplete IDs')
  p=ROOT/'raw/regional/traffic_history_hennepin_2022_2025.json';b=json.dumps({'features':fs},separators=(',',':')).encode();p.write_bytes(b)
  return {'id':'traffic_history_hennepin_2022_2025','url':url,'where':where,'count':len(fs),'path':str(p.relative_to(ROOT)).replace('\\','/'),'status':'downloaded','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 except Exception as e:return {'id':'traffic_history_hennepin_2022_2025','url':url,'status':'failed','error':str(e)}
collection=json.loads((ROOT.parent/'fp2-repo-review/demo/public/data/snow-emergencies.json').read_text(encoding='utf8'))
def gtfs(event):
 date=datetime.date.fromisoformat(event['start']);sat=date-datetime.timedelta(days=(date.weekday()-5)%7);stamp=sat.strftime('%Y%m%d');url=f'https://svc.metrotransit.org/mtgtfs/archive/gtfs{stamp}.zip'
 try:
  r=requests.get(url,timeout=120);r.raise_for_status()
  if not r.content.startswith(b'PK'):raise ValueError('Not ZIP')
  p=ROOT/'raw/transit'/f'gtfs_{stamp}.zip';p.write_bytes(r.content)
  return {'id':'gtfs_'+stamp,'event_id':event['id'],'event_start':event['start'],'schedule_archive_date':sat.isoformat(),'url':url,'path':str(p.relative_to(ROOT)).replace('\\','/'),'bytes':len(r.content),'sha256':hashlib.sha256(r.content).hexdigest(),'status':'downloaded','retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 except Exception as e:return {'id':'gtfs_'+stamp,'url':url,'event_id':event['id'],'status':'failed','error':str(e)}
results=[traffic()];print(results[0],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for r in pool.map(gtfs,[x['event'] for x in collection['events']]):
  results.append(r);print(r['id'],r['status'],flush=True);(CAT/'history_downloads.json').write_text(json.dumps(results,indent=2),encoding='utf8')
