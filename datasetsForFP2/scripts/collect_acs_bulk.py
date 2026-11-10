import requests,json,hashlib,datetime,concurrent.futures,gzip
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
groups=['B01003','B19301','B19013','B25077','B25064','B25003','B08201','B08301','B25024','B25070','B25002','C17002']
tasks=[(year,g) for year in [2022,2023,2024] for g in groups]
def task(t):
 year,g=t;url=f'https://www2.census.gov/programs-surveys/acs/summary_file/{year}/table-based-SF/data/5YRData/acsdt5y{year}-{g.lower()}.dat'
 out=ROOT/'raw/acs_bulk'/str(year);out.mkdir(parents=True,exist_ok=True)
 try:
  r=requests.get(url,timeout=150);r.raise_for_status();lines=r.content.splitlines()
  if b'GEO_ID' not in lines[0]:raise ValueError('Unexpected table header')
  # Keep original rows for Hennepin tracts / block groups, county and Minneapolis city.
  kept=[lines[0]]+[line for line in lines[1:] if line.startswith((b'1400000US27053',b'1500000US27053',b'0500000US27053|',b'1600000US2743000|'))]
  if len(kept)<300:raise ValueError('Too few Hennepin rows: '+str(len(kept)))
  p=out/(g+'_hennepin.dat');b=b'\n'.join(kept)+b'\n';p.write_bytes(b)
  # Archive the exact full source compressed; geographic subset is the smaller working file.
  archive=out/(g+'_national.dat.gz')
  with gzip.GzipFile(filename=str(archive),mode='wb',mtime=0) as f:f.write(r.content)
  record={'id':f'acs{year}_{g}','publisher':'US Census Bureau','url':url,'path':str(p.relative_to(ROOT)).replace('\\','/'),'archive_path':str(archive.relative_to(ROOT)).replace('\\','/'),'count':len(kept)-1,'source_rows':len(lines)-1,'bytes':len(b),'source_bytes':len(r.content),'sha256':hashlib.sha256(b).hexdigest(),'source_sha256':hashlib.sha256(r.content).hexdigest(),'status':'downloaded','geography':'Hennepin County tracts and block groups; county total; Minneapolis city total','period':f'{year-4}-{year}','retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 except Exception as e:record={'id':f'acs{year}_{g}','url':url,'status':'failed','error':str(e)}
 print(record['id'],record['status'],record.get('count',record.get('error')),flush=True);return record
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for r in pool.map(task,tasks):
  results.append(r);(ROOT/'catalog/acs_bulk_downloads.json').write_text(json.dumps(results,indent=2),encoding='utf8')
