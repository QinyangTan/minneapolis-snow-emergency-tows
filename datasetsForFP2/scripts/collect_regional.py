import requests,json,concurrent.futures,datetime,hashlib,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CAT=ROOT/'catalog'
def get(url,**p):
 r=requests.get(url,params=p or {'f':'json'},timeout=60);r.raise_for_status();o=r.json()
 if 'error' in o:raise ValueError(str(o['error']))
 return o
items=[('traffic_current_segments','42923bcddafe4909b4eed0a03dea893a'),('traffic_current_locations','4ec4be193c8c481b9057b4be4dedbe80'),('traffic_historical','f3e04d902eeb45ee90a7c6da04a4d718'),('traffic_active_counts','3396cfb808f24451ba1c7939978121cc'),('acs_income_distribution_esri','0f43160beaaa4026a8a2f2db01ba1972'),('acs_income_median_esri','c9faa265b82848498bc0a8390c0afa65'),('acs_housing_cost_esri','731b71707092404693facc08c9594d00'),('acs_population_esri','e6a8c068ebf248b185b221ebb350b1b4'),('vehicle_availability_city','f798fa5690e64522a5fc011495c3b518'),('commute_time_city','df244bfbe838409893c37be326594b0b')]
def task(t):
 name,id=t; results=[]
 try:
  item=get('https://www.arcgis.com/sharing/rest/content/items/'+id); url=item['url'];service=get(url)
  (CAT/'metadata'/(name+'.item.json')).write_text(json.dumps(item,ensure_ascii=False),encoding='utf8')
  (CAT/'metadata'/(name+'.service.json')).write_text(json.dumps(service,ensure_ascii=False),encoding='utf8')
  for l in service.get('layers',[]):
   u=url+'/'+str(l['id']);m=get(u);key=name+'__'+str(l['id'])
   (CAT/'metadata'/(key+'.json')).write_text(json.dumps(m,ensure_ascii=False),encoding='utf8')
   # National Esri ACS: retain tract layers; regional infrastructure: all layers.
   if '_esri' in name and 'tract' not in l['name'].lower():continue
   oid=m.get('objectIdField') or next((f['name'] for f in m['fields'] if f['type']=='esriFieldTypeOID'),None)
   p={'where':'1=1','geometry':'-93.34,44.87,-93.19,45.06','geometryType':'esriGeometryEnvelope','inSR':4326,'spatialRel':'esriSpatialRelIntersects'}
   count=get(u+'/query',f='json',returnCountOnly='true',**p)['count']
   if count>120000:raise ValueError('Subset too large: '+str(count))
   fs=[];step=150
   ids=get(u+'/query',f='json',returnIdsOnly='true',**p).get('objectIds',[])
   if len(ids)!=count:raise ValueError('ID count mismatch')
   for offset in range(0,count,step):
    o=get(u+'/query',f='json',outFields='*',outSR=4326,returnGeometry='true',objectIds=','.join(map(str,ids[offset:offset+step])));fs+=o.get('features',[])
   if len(fs)!=count:raise ValueError('Count mismatch')
   if oid and len({f['attributes'][oid] for f in fs})!=count:raise ValueError('Duplicate IDs')
   path=ROOT/'raw/regional'/(key+'.json');path.parent.mkdir(exist_ok=True)
   b=json.dumps({'fields':m['fields'],'geometryType':m.get('geometryType'),'spatialReference':{'wkid':4326},'features':fs},ensure_ascii=False,separators=(',',':')).encode('utf8');path.write_bytes(b)
   results.append({'id':key,'title':l['name'],'publisher':item['owner'],'url':u,'item_id':id,'query_filter':p,'count':count,'path':str(path.relative_to(ROOT)).replace('\\','/'),'status':'downloaded','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 except Exception as e:results.append({'id':name,'item_id':id,'status':'failed','error':str(e)})
 print(name,[(r['status'],r.get('count',r.get('error'))) for r in results],flush=True);return results
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for rs in pool.map(task,items):
  results+=rs;(CAT/'regional_downloads.json').write_text(json.dumps(results,indent=2),encoding='utf8')
