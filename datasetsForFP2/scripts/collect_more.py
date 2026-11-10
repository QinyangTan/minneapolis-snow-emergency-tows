import requests,json,re,hashlib,datetime,concurrent.futures
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CAT=ROOT/'catalog'
tasks=[('census_download_workbook','https://tableau.minneapolismn.gov/workbooks/MinneapolisCensusDataDownload.twb'),('city_census_population','https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodDemographicsDownload.csv'),('city_census_economics','https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodEconomicWellbeingDownload.csv'),('city_census_housing','https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodHousingDownload.csv')]
def dl(t):
 name,url=t
 try:
  r=requests.get(url,timeout=90);r.raise_for_status();kind=r.headers.get('Content-Type','');suffix='.zip' if r.content.startswith(b'PK') else '.csv' if 'csv' in kind else '.xml' if r.content.startswith(b'<?xml') else '.html'
  p=ROOT/'raw/acs'/(name+suffix);p.write_bytes(r.content)
  return {'id':name,'url':r.url,'path':str(p.relative_to(ROOT)).replace('\\','/'),'bytes':len(r.content),'sha256':hashlib.sha256(r.content).hexdigest(),'content_type':kind,'status':'downloaded' if suffix in ['.csv','.zip','.xml'] else 'response_not_data','retrieved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 except Exception as e:return {'id':name,'url':url,'status':'failed','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as p:results=list(p.map(dl,tasks))
(CAT/'tableau_downloads.json').write_text(json.dumps(results,indent=2),encoding='utf8');print(json.dumps(results,indent=2))
