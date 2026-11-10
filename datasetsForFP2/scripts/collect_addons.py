import requests,json,datetime,hashlib,concurrent.futures,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CAT=ROOT/'catalog'
def get(url,**p):
 r=requests.get(url,params=p or {'f':'json'},timeout=90);r.raise_for_status();o=r.json()
 if 'error' in o:raise ValueError(str(o['error']))
 return o
base='https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/'
names=['Property_Sales_2021_to_2025','Active_Rental_Licenses','Incidents_Reported_911']
results=[]
for name in names:
 try:
  url=base+name+'/FeatureServer';service=get(url)
  (CAT/'metadata'/(name+'.service.json')).write_text(json.dumps(service,ensure_ascii=False),encoding='utf8')
  if service.get('serviceItemId'):
   item=get('https://www.arcgis.com/sharing/rest/content/items/'+service['serviceItemId']);(CAT/'metadata'/(name+'.item.json')).write_text(json.dumps(item,ensure_ascii=False),encoding='utf8')
  for l in service.get('layers',[])+service.get('tables',[]):
   u=url+'/'+str(l['id']);m=get(u);(CAT/'metadata'/(name+'.'+str(l['id'])+'.json')).write_text(json.dumps(m,ensure_ascii=False),encoding='utf8')
   print(name,l['id'],[f['name'] for f in m.get('fields',[])],flush=True)
   if name=='Incidents_Reported_911':
    results.append({'id':name,'url':u,'status':'metadata_only','reason':'Calls for service are not confirmed tows; inspect categories and dates before acquisition.'});continue
   fields=[f['name'] for f in m['fields'] if not re.search(r'owner|taxpayer|applicant|contact|email|phone|address|formatted|houseno|streetname|grantor|grantee',f['name'],re.I)]
   oid=m.get('objectIdField') or next(f['name'] for f in m['fields'] if f['type']=='esriFieldTypeOID')
   ids=get(u+'/query',f='json',where='1=1',returnIdsOnly='true').get('objectIds',[]);fs=[]
   step=min(2000,m.get('maxRecordCount',1000))
   for start in range(0,len(ids),step):
    fs+=get(u+'/query',f='json',where='1=1',resultOffset=start,resultRecordCount=step,orderByFields=oid,outFields=','.join(fields),outSR=4326,returnGeometry='true').get('features',[])
   if len(fs)!=len(ids) or len({f['attributes'][oid] for f in fs})!=len(ids):raise ValueError('Count mismatch')
   p=ROOT/'raw/city'/(name+'__'+str(l['id'])+'.json');b=json.dumps({'geometryType':m.get('geometryType'),'spatialReference':{'wkid':4326},'fields':[f for f in m['fields'] if f['name'] in fields],'features':fs},ensure_ascii=False,separators=(',',':')).encode('utf8');p.write_bytes(b)
   results.append({'id':name+'__'+str(l['id']),'url':u,'path':str(p.relative_to(ROOT)).replace('\\','/'),'status':'downloaded','count':len(fs),'out_fields':fields,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 except Exception as e:results.append({'id':name,'status':'failed','error':str(e)})
 (CAT/'addon_downloads.json').write_text(json.dumps(results,indent=2),encoding='utf8')
