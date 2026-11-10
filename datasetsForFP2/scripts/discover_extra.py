import json,re,requests,concurrent.futures
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; CAT=ROOT/'catalog'
def get(url,**params):
 r=requests.get(url,params=params or {'f':'json'},timeout=45);r.raise_for_status();return r.json()
ids=['e46e307b0ecd47089db678eb3e4f26ca','f8faee0626e3489a9abbd0c36b840755','f34db797111f4b6eaf271a816466543c','7629b8ad54664a3aa41fd3899947589e']
for id in ids:
 x=get('https://www.arcgis.com/sharing/rest/content/items/'+id+'/data');(CAT/(id+'.data.json')).write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf8')
 urls=sorted(set(re.findall(r'https?[^<>\s"\\]+',json.dumps(x))))
 print(id,urls)
queries=['AADT Minnesota type:"Feature Service"','orgid:afSMGVsC7QlRK1kZ (income OR vehicle OR commute OR sales OR tow OR impound)','owner:esri_demographics ACS income','owner:esri_demographics ACS housing','owner:MPLS_Open_Data income']
for q in queries:
 x=get('https://www.arcgis.com/sharing/rest/search',f='json',q=q,num=100);(CAT/('extra_'+re.sub(r'\W+','_',q)+'.json')).write_text(json.dumps(x,ensure_ascii=False),encoding='utf8')
 print(q,[(r['id'],r['title'],r['owner'],r.get('url')) for r in x.get('results',[])][:45])
