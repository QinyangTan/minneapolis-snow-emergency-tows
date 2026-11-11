"""Prepare machine-readable working inputs without inventing spatial allocation or causality."""
import json,csv,re,hashlib,datetime,calendar,collections,shutil,zipfile,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];PRE=ROOT/'prepared';PRE.mkdir(exist_ok=True)
def read(p):return json.loads(p.read_text(encoding='utf8'))
def save(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf8')
def num(x):
 try:
  value=float(str(x).replace(',',''))
  return None if value<0 else int(value) if value.is_integer() else value
 except (ValueError,TypeError):return None
repo=ROOT.parent if (ROOT.parent/'static/data').exists() else ROOT.parent/'fp2-repo-review'
for file in ['summary.json','neighborhoods.geojson','quality.json']:
 p=PRE/'baseline_9_events'/file;p.parent.mkdir(exist_ok=True);shutil.copy2(repo/'static/data'/file,p)
for file in ['snow-emergencies.json','snow-emergencies-provenance.json','snow-emergencies-weather.csv']:
 p=PRE/'reference_10_events'/file;p.parent.mkdir(exist_ok=True);shutil.copy2(repo/'demo/public/data'/file,p)
save(PRE/'baseline_provenance.json',{'repository':'https://github.com/QinyangTan/minneapolis-snow-emergency-tows','commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'note':'Copied existing versioned project aggregates; not merged with expanded historical collection. 9-event baseline remains separate from 10-event reference.'})
norm=lambda x:re.sub('[^a-z0-9]','',x.lower())
geo=read(PRE/'baseline_9_events/neighborhoods.geojson')
names={norm(f['properties']['name']):f['properties']['name'] for f in geo['features']}
allrows=[];index={}
for topic in ['population','economics','housing']:
 path=ROOT/'raw/acs'/f'city_census_{topic}.csv'
 rows=list(csv.DictReader(path.open(encoding='utf-8-sig',newline='')))
 for r in rows:
  name=names.get(norm(r['Neighborhood Name']));assert name is not None
  converted={**r,'map_neighborhood':name,'estimate_numeric':num(r['Estimate']),'moe_numeric':num(r['MOE']),'source_file':str(path.relative_to(ROOT)).replace('\\','/')}
  allrows.append(converted)
  index[r['Neighborhood Name']]={'city_neighborhood_id':r['Neighborhood ID'],'city_name':r['Neighborhood Name'],'map_name':name,'match_method':'case/punctuation/whitespace normalization only'}
save(PRE/'city_acs2024_observations.json',{'period':'Mixed ACS releases: economics 2019-2023; population and housing 2020-2024','rows':allrows,'note':'Official City neighborhood aggregates. Preserve MOE, reliability, universe and units. Overlapping categories must not be summed blindly. Not annual 2024 measurements.'})
missing=sorted(set(names.values())-{r['map_name'] for r in index.values()})
save(PRE/'neighborhood_name_crosswalk.json',{'matched':list(index.values()),'map_without_city_acs':missing,'policy':'Missing estimates remain null; never zero-fill. This is a NAME correspondence, not proof of historical polygon equivalence.'})
starter=[]
for name in names.values():
 rows=[r for r in allrows if r['map_neighborhood']==name]
 def metric(table,desc,desc2=''):
  found=[r for r in rows if r['ACS5 Table ID']==table and r['Desc1']==desc and r['Desc2']==desc2]
  if not found:return None
  assert len(found)==1,(name,table,desc)
  r=found[0];return {'estimate':r['estimate_numeric'],'moe':r['moe_numeric'],'source_percent':num(r['Percent Universe']),'reliability':r['Reliability Level'],'universe':r['Universe'],'table':table,'dataset_id':r['Dataset ID'],'period':r['ACS5 Release']}
 starter.append({'neighborhood':name,'period':'mixed; see each metric period','population':metric('B01003','total population'),'renter_households':metric('B25003','renter-occupied'),'owner_households':metric('B25003','owner-occupied'),'households_no_vehicle':metric('B25044','no vehicle'),'occupied_housing_units':metric('B25002','occupied'),'vacant_housing_units':metric('B25002','vacant'),'people_below_poverty':metric('B17021','below poverty'),'per_capita_income':None,'per_capita_income_note':'Available at tract/block-group scale in ACS bulk files; neighborhood allocation has NOT been performed.'})
save(PRE/'neighborhood_context_starter.json',starter)
# Wide ACS tables with E/M values kept distinct; no averaging of medians.
for year in [2022,2023,2024]:
 merged={};fields={}
 for path in sorted((ROOT/'raw/acs_bulk'/str(year)).glob('*_hennepin.dat')):
  table=path.name.split('_')[0];meta=read(ROOT/'raw/acs/metadata'/f'{table}.json') if (ROOT/'raw/acs/metadata'/f'{table}.json').exists() else {}
  for r in csv.DictReader(path.open(encoding='utf-8-sig'),delimiter='|'):
   geoid=r.pop('GEO_ID');row=merged.setdefault(geoid,{'GEO_ID':geoid,'geoid':geoid.split('US')[-1],'summary_level':geoid[:3],'period':f'{year-4}-{year}'})
   for key,value in r.items():
    row[key]=num(value)
    if row[key] is None and value not in ['',None]:row[key+'_raw']=value
    match=re.fullmatch(r'(\w+)_([EM])(\d+)',key)
    if match:
     group,kind,number=match.groups();api=group+'_'+number+kind
     fields[key]={'table':table,'api_variable':api,'statistic':'estimate' if kind=='E' else '90% margin of error','label':meta.get('variables',{}).get(api,{}).get('label'),'note':'Label from 2024 API metadata where available; dollar values use the specific file vintage.'}
 save(PRE/f'acs_{year}_hennepin_wide.json',{'period':f'{year-4}-{year}','rows':list(merged.values()),'fields':fields,'geography_note':'140=tract;150=block group;050=county;160=city. Hennepin includes places outside Minneapolis. B08201 is not available for block groups in this collection. Missing/suppressed values are null with raw code retained.'})
# Daily airport observations; each value retains flags, trace, units, and quality exclusions.
days={}
for line in (ROOT/'raw/weather/USW00014922.dly').read_text().splitlines():
 if len(line)<29:continue
 year,month,element=int(line[11:15]),int(line[15:17]),line[17:21]
 if not 2015<=year<=2026 or element not in ['SNOW','SNWD','PRCP','TMIN','TMAX']:continue
 for d in range(1,calendar.monthrange(year,month)[1]+1):
  cell=line[21+(d-1)*8:29+(d-1)*8];raw=int(cell[:5]);mf,qf,sf=cell[5:8]
  date=f'{year:04d}-{month:02d}-{d:02d}'
  if date>'2026-11-10':continue
  value=None if raw==-9999 or qf.strip() else raw/10 if element in ['PRCP','TMIN','TMAX'] else raw
  days.setdefault(date,{'date':date,'station':'USW00014922'})[element]={'value':value,'units':'degC' if element.startswith('T') else 'mm','raw':raw,'measurement_flag':mf.strip(),'quality_flag':qf.strip(),'source_flag':sf.strip(),'trace':mf=='T'}
save(PRE/'weather_msp_daily_2015_2026.json',{'station':'USW00014922','rows':list(days.values()),'note':'Station observations, not neighborhood snowfall. Dates through 2026-11-10 only; missing/failed-quality is null, not zero; trace retained.'})
# Audit raw snow layers: completeness, date support, and suspicious tag/tow duplication.
audits=[];fingerprints={}
for p in sorted((ROOT/'raw/city').glob('*Snow*json')):
 if not re.search('Tags|Tows',p.name,re.I):continue
 x=read(p);counts=collections.Counter();dates=[];signature=[]
 for f in x['features']:
  a=f['attributes'];day=next((v for k,v in a.items() if re.sub('[^a-z]','',k.lower()) in ['day','dayid','dayidenti']),None);counts[str(day)]+=1
  dates.extend(v for k,v in a.items() if k.lower()=='call_taken' and isinstance(v,(int,float)))
  signature.append(json.dumps({'geometry':f.get('geometry'),'day':day},sort_keys=True))
 sig=hashlib.sha256('\n'.join(sorted(signature)).encode()).hexdigest();fingerprints.setdefault(sig,[]).append(p.name)
 audits.append({'file':p.name,'count':len(x['features']),'day_counts':dict(counts),'call_taken_min':min(dates) if dates else None,'call_taken_max':max(dates) if dates else None,'status':'requires_semantic_review_before_expanding_baseline','geometry_day_fingerprint':sig})
duplicates=[v for v in fingerprints.values() if len(v)>1]
save(ROOT/'catalog/snow_layer_audit.json',{'layers':audits,'identical_geometry_day_multisets':duplicates,'note':'Equal geometry+day multisets are suspicious but do not by themselves prove identical underlying operations. New layers are NOT automatically admitted as true tow events.'})
# Remove names of transaction parties if an earlier acquisition included them.
addon=ROOT/'catalog/addon_downloads.json'
if addon.exists():
 records=read(addon)
 for r in records:
  if r.get('status')!='downloaded':continue
  p=ROOT/r['path'];x=read(p);remove={f['name'] for f in x.get('fields',[]) if re.search('grantor|grantee',f['name'],re.I)}
  if remove:
   x['fields']=[f for f in x['fields'] if f['name'] not in remove]
   for f in x['features']:
    for k in remove:f['attributes'].pop(k,None)
   b=json.dumps(x,ensure_ascii=False,separators=(',',':')).encode();p.write_bytes(b);r.update(bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),out_fields=[f for f in r['out_fields'] if f not in remove])
 save(addon,records)
print(json.dumps({'city_acs_rows':len(allrows),'matched_communities':len(index),'missing_community':missing,'weather_days':len(days),'snow_layers':len(audits),'duplicate_geometry_day':duplicates},indent=2))
