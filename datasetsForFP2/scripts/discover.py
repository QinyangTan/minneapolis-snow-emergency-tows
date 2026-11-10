import json, re, concurrent.futures
from pathlib import Path
import requests
ROOT=Path(__file__).resolve().parents[1]
def get(url, **params):
    r=requests.get(url,params=params,timeout=60); r.raise_for_status(); return r.json()
def save(name,obj):
    (ROOT/'catalog'/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
base='https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services'
obj=get(base,f='json'); save('minneapolis_services.json',obj)
matches=[s for s in obj.get('services',[]) if re.search(r'tow|impound|census|income|poverty|housing|parcel|crash|accident|traffic|parking|snow|street|311|neighborhood|land.use|transit',s['name'],re.I)]
save('minneapolis_service_candidates.json',matches)
print('CITY CANDIDATES',json.dumps(matches))
queries=['Minneapolis census neighborhood income','Minneapolis impound towing','Minneapolis vehicle crashes','Minneapolis parking meters','Minneapolis assessor parcel','Minnesota AADT owner:MnDOT','Minneapolis 311 abandoned vehicle','Metro Transit stops routes','Minneapolis snow emergency tows','Minneapolis census ACS']
def search(q):
    try:
        x=get('https://www.arcgis.com/sharing/rest/search',f='json',q=q,num=50)
        save('search_'+re.sub(r'\W+','_',q)+'.json',x)
        return {'q':q,'total':x.get('total'),'items':[{k:i.get(k) for k in ['id','title','owner','type','url']} for i in x.get('results',[])][:30]}
    except Exception as e:return {'q':q,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    for result in pool.map(search,queries):print(json.dumps(result))
