import json,re,requests,concurrent.futures,datetime,hashlib,time,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CAT=ROOT/'catalog'
def get(url,**params):
 for attempt in range(3):
  try:
   r=requests.get(url,params=params,timeout=80);r.raise_for_status();x=r.json()
   if 'error' in x:raise ValueError(str(x['error']))
   return x
  except Exception:
   if attempt==2:raise
   time.sleep(attempt+1)
def harvest(t):
 s,l=t; name=s['name']; identity=name+'__'+str(l['id']); path=ROOT/'raw/city'/f'{identity}.json';path.parent.mkdir(parents=True,exist_ok=True)
 record={'id':identity,'title':l['name'],'publisher':'City of Minneapolis','url':l['url'],'item_id':s.get('itemId'),'retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  fields=l['fields']; where='1=1'; geometry=bool(l.get('geometryType'))
  if 'Parcel_Data' in name:
   allowed=['PIN','TAX_MAP_UFMT','ASMTYEAR','TAXYEAR','TAXYR','NEIGHBORHOOD','COMMUNITY','WARD','ZONING','LANDUSE','PARCEL_AREA_SQFT','PARCELAREA','X','Y','PRIMARY_PROP_TYPE','PROPERTYTYPE','LANDVALUE','BLDGVALUE','BUILDINGVALUE','TOTALVALUE','IS_MULTIPLE_USES','MULTIPLEUSES','IS_EXEMPT','ISEXEMPT','IS_HOMESTEAD','HOMESTEAD','NUM_BLDGS','NUMBEROFBUILDINGS','BUILDINGUSE','YEARBUILT','NUM_GAR_STALLS','GARAGESTALLS','TOTAL_UNITS','TOTALUNITS','FID','ObjectId','OBJECTID']
   fields=[f for f in fields if f in allowed];geometry=False
  elif re.search('Snow.*(Tows|Tags)',name):
   fields=[f for f in fields if re.search(r'^(OBJECTID|FID|Day.*|Latitude|Longitude|Neigh.*|Community|Ward.*|Call_Taken|Snow_.*|Tow_.*|TowDist|Date.*|Time|Service_Da|Creation_[DT]|Ordinanc.*|Violation|Code|Descriptio|Ticket_Typ|Infraction|Status|Void_Reaso|By_Law|Fine|X.*|Y.*)$',f,re.I)]
  elif name.startswith('Public_311'):
   fields=[f for f in fields if f!='TITLE']
   where="UPPER(SUBJECTNAME) LIKE '%VEHICLE%' OR UPPER(REASONNAME) LIKE '%VEHICLE%' OR UPPER(TYPENAME) LIKE '%VEHICLE%' OR UPPER(SUBJECTNAME) LIKE '%PARKING%' OR UPPER(REASONNAME) LIKE '%PARKING%' OR UPPER(TYPENAME) LIKE '%PARKING%' OR UPPER(SUBJECTNAME) LIKE '%SNOW%' OR UPPER(REASONNAME) LIKE '%SNOW%' OR UPPER(TYPENAME) LIKE '%SNOW%' OR UPPER(TYPENAME) LIKE '%TOW%'"
  elif name.startswith('Serious_Injury'):
   fields=[f for f in fields if f in ['OBJECTID','INCIDENTID','CITY_NAME','CRASH_MONT','CRASH_DAY','CRASH_YEAR','CRASH_DAYO','CRASH_HOUR','CRASH_DATE','CRASHSEVER','NUMBERKILL','NUMBEROFVE','MANNEROFCO','FIRSTHARMF','LIGHTCONDI','WEATHERPRI','WEATHERSEC','RDWYSURFAC','ROADWAY_NA','LATITUDE','LONGITUDE','SNOW_EMERGENCY_ROUTE','SPEED_LIM','FUNC_CLASS']]
  mpath=CAT/'metadata'/f'{name}.{l["id"]}.json';meta=json.loads(mpath.read_text(encoding='utf8'))
  oid=meta.get('objectIdField') or next((f['name'] for f in meta.get('fields',[]) if f['type']=='esriFieldTypeOID'),None)
  if oid and oid not in fields:fields.append(oid)
  count=get(l['url']+'/query',f='json',where=where,returnCountOnly='true')['count']
  record.update(expected_count=count,where=where,out_fields=fields,return_geometry=geometry,source_last_edit=meta.get('editingInfo'))
  features=[];step=min(2000,meta.get('maxRecordCount',1000))
  for offset in range(0,count,step):
   obj=get(l['url']+'/query',f='json',where=where,outFields=','.join(fields),returnGeometry=str(geometry).lower(),outSR=4326,resultOffset=offset,resultRecordCount=step,orderByFields=oid or '')
   page=obj.get('features',[])
   if not page:raise ValueError('Empty page before expected end')
   features.extend(page)
  if len(features)!=count:raise ValueError(f'Incomplete snapshot: {len(features)} vs {count}')
  if oid and len({f['attributes'][oid] for f in features})!=count:raise ValueError('Duplicate IDs / unstable pagination')
  payload={'geometryType':l.get('geometryType'),'spatialReference':{'wkid':4326} if geometry else None,'fields':[f for f in meta.get('fields',[]) if f['name'] in fields],'features':features}
  b=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode('utf8');path.write_bytes(b)
  record.update(status='downloaded',path=str(path.relative_to(ROOT)).replace('\\','/'),count=count,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
  if s.get('itemId'):
   item=get('https://www.arcgis.com/sharing/rest/content/items/'+s['itemId'],f='json');(CAT/'metadata'/f'{name}.item.json').write_text(json.dumps(item,ensure_ascii=False),encoding='utf8')
 except Exception as e:record.update(status='failed',error=str(e))
 return record
sources=json.loads((CAT/'inspected_city_sources.json').read_text(encoding='utf8'))
tasks=[]
for s in sources:
 for l in s.get('layers',[]):
  if s['name']=='TylerParkingProd' and l['id']!=9:continue
  if s['name']=='Downtown_Core_Area_Map' and l['id']!=0:continue
  tasks.append((s,l))
manifest=CAT/'city_downloads.json';results=[]
existing={r['id']:r for r in json.loads(manifest.read_text(encoding='utf8'))} if manifest.exists() else {}
todo=[]
for s,l in tasks:
 old=existing.get(s['name']+'__'+str(l['id']))
 refresh_snow='--refresh-snow' in sys.argv and re.search('Snow.*(Tows|Tags)',s['name'])
 if old and old.get('status')=='downloaded' and (ROOT/old['path']).exists() and not refresh_snow:results.append(old)
 else:todo.append((s,l))
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for r in pool.map(harvest,todo):
  results.append(r);manifest.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
  print(r['id'],r['status'],r.get('count',r.get('error','')),flush=True)
