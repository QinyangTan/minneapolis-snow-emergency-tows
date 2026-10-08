"""Reproducible, address-redacted Bridge event join to official neighborhood polygons."""
import argparse
import csv
import hashlib
import json
import math
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

from shapely.geometry import Point, shape, mapping

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/'
SOURCES = {
    'tows': BASE+'Snow_Emergency_Bridge_Tows_2025/FeatureServer/0',
    'neighborhoods': BASE+'Minneapolis_Neighborhoods/FeatureServer/0',
    'water': BASE+'Water/FeatureServer/0',
}

def request(url, **params):
    with urlopen(url+'?'+urlencode(params), timeout=60) as response:
        data=json.load(response)
    if 'error' in data:
        raise RuntimeError(data['error'])
    return data

def fetch_layer(url, fields='*', **filters):
    count=request(url+'/query', where=filters.get('where','1=1'),f='json',returnCountOnly='true')['count']
    features=[]
    while len(features)<count:
        page=request(url+'/query',f='geojson',where='1=1',outFields=fields,outSR=4326,
                     resultOffset=len(features),resultRecordCount=1000,**filters)
        rows=page.get('features',[])
        if not rows: raise RuntimeError('Empty pagination page before expected count')
        features.extend(rows)
    # Geometry filters can yield fewer records than the unfiltered count.
    return {'type':'FeatureCollection','features':features}

def interior_anchor(geometry):
    p=shape(geometry).representative_point()
    return [p.x,p.y]

def join_records(rows, features):
    polygons=[(f['properties']['id'],shape(f['geometry'])) for f in features]
    counts={id:[0,0,0] for id,_ in polygons}
    qa={'matched':0,'unmatched':0,'unmatchedByDay':[0,0,0],'ambiguousBoundary':0,'unmatchedRecords':[]}
    for row in rows:
        day=row['day']
        if day not in (1,2,3): raise ValueError(f'Invalid source Day: {day}')
        p=Point(row['lon'],row['lat'])
        ids=[id for id,poly in polygons if poly.covers(p)]
        row['neighborhoodId']=ids[0] if len(ids)==1 else None
        if len(ids)==1:
            counts[ids[0]][day-1]+=1;qa['matched']+=1
        else:
            qa['unmatched']+=1;qa['unmatchedByDay'][day-1]+=1
            qa['ambiguousBoundary']+=int(len(ids)>1)
            qa['unmatchedRecords'].append({'id':row['id'],'day':day,'reason':'boundary ambiguity' if ids else 'outside boundary'})
    return counts,qa

def clean_features(raw):
    return [{'type':'Feature','properties':{'id':str(f['properties']['BDNUM']),
             'name':f['properties']['BDNAME']},'geometry':f['geometry']} for f in raw['features']]

def main(fetch=False):
    rawdir=ROOT/'data/raw';out=ROOT/'public/data'
    rawdir.mkdir(parents=True,exist_ok=True);out.mkdir(parents=True,exist_ok=True)
    if fetch:
        towmeta=request(SOURCES['tows'],f='json')
        names=[f['name'] for f in towmeta['fields']]
        fields=[n for n in names if n in ['OBJECTID','FID','Day','Latitude','Longitude','Neighborho','Call_Taken']]
        for key in ['tows','neighborhoods','water']:
            payload=fetch_layer(SOURCES[key],','.join(fields) if key=='tows' else '*')
            (rawdir/f'{key}.geojson').write_text(json.dumps(payload,separators=(',',':')))
            print('Fetched',key,len(payload['features']))
        (rawdir/'acquisition.json').write_text(json.dumps({'fetchedAt':datetime.now(timezone.utc).isoformat(),'sources':SOURCES},indent=2))
    raw={key:json.loads((rawdir/f'{key}.geojson').read_text()) for key in SOURCES}
    features=clean_features(raw['neighborhoods'])
    rows=[]
    for f in raw['tows']['features']:
        p=f['properties']
        lon,lat=p['Longitude'],p['Latitude']
        if not (math.isfinite(lon) and math.isfinite(lat)):raise ValueError('Missing coordinates')
        rows.append({'id':str(p.get('OBJECTID',p.get('FID'))),'day':int(p['Day']),
                     'lon':lon,'lat':lat,'sourceNeighborhood':p.get('Neighborho')})
    counts,qa=join_records(rows,features)
    totals=[sum(r['day']==day for r in rows) for day in [1,2,3]]
    assert len(rows)==852 and totals==[86,418,348],(len(rows),totals)
    assert len(features)==87
    names={f['properties']['id']:f['properties']['name'] for f in features}
    normalize=lambda n:''.join(c for c in (n or '').lower() if c.isalnum())
    qa['sourceLabelMissing']=sum(not (r['sourceNeighborhood'] or '').strip() for r in rows)
    disagreements=[r for r in rows if r['neighborhoodId'] and normalize(r['sourceNeighborhood'])
                   and normalize(r['sourceNeighborhood'])!=normalize(names[r['neighborhoodId']])]
    qa['sourceLabelDisagreements']=len(disagreements)
    dataset={'event':{'id':'bridge-2025','name':'Bridge','start':'2025-11-30','end':'2025-12-02',
                     'total':len(rows),'dayTotals':totals},
             'neighborhoods':[{'id':f['properties']['id'],'name':f['properties']['name'],
                 'anchor':interior_anchor(f['geometry']),'counts':counts[f['properties']['id']]} for f in features],
             'quality':qa,'sources':[{'name':k,'url':v} for k,v in SOURCES.items()]}
    dataset['neighborhoods'].sort(key=lambda n:n['name'])
    dataset['quality']['boundaryVersion']='Current official Minneapolis_Neighborhoods snapshot; see acquisition.json'
    dataset['quality']['expectedAddressError']='8–14% in publisher disclaimer; not measured in this sample'
    (out/'bridge.json').write_text(json.dumps(dataset,separators=(',',':')))
    simplified=[]
    for f in features:
        geometry=shape(f['geometry']).simplify(.000045,preserve_topology=True)
        simplified.append({**f,'geometry':mapping(geometry)})
    (out/'neighborhoods.geojson').write_text(json.dumps({'type':'FeatureCollection','features':simplified},separators=(',',':')))
    # Water is clipped to the city's bounds with a small frame for the river.
    from shapely.geometry import box
    city_bounds=shape({'type':'GeometryCollection','geometries':[f['geometry'] for f in features]}).bounds
    xmin,ymin,xmax,ymax=city_bounds
    frame=box(xmin-.003,ymin-.003,xmax+.003,ymax+.003)
    waters=[]
    for f in raw['water']['features']:
        g=shape(f['geometry']).intersection(frame)
        if not g.is_empty and g.area>0:
            waters.append({'type':'Feature','properties':{'name':f['properties'].get('NAME',f['properties'].get('name','Water'))},
                           'geometry':mapping(g.simplify(.00004,preserve_topology=True))})
    (out/'water.geojson').write_text(json.dumps({'type':'FeatureCollection','features':waters},separators=(',',':')))
    with (out/'neighborhood-day-counts.csv').open('w',newline='') as handle:
        writer=csv.writer(handle);writer.writerow(['neighborhood','day1','day2','day3','total'])
        for n in dataset['neighborhoods']:writer.writerow([n['name'],*n['counts'],sum(n['counts'])])
        writer.writerow(['Unmatched coordinates',*qa['unmatchedByDay'],qa['unmatched']])
    for day in range(3):assert sum(n['counts'][day] for n in dataset['neighborhoods'])+qa['unmatchedByDay'][day]==totals[day]
    provenance={'method':'Shapely covers against unsimplified official polygons. Multiple matches remain unmatched.',
                'geometrySimplificationDegrees':.000045,'recordsContainAddresses':False,
                'shapelyVersion':__import__('shapely').__version__,
                'sourceHashes':{key:hashlib.sha256((rawdir/f'{key}.geojson').read_bytes()).hexdigest() for key in SOURCES},
                'quality':qa,'sources':SOURCES}
    (out/'provenance.json').write_text(json.dumps(provenance,indent=2))
    print(json.dumps({'dayTotals':totals,'neighborhoods':len(features),'waterFeatures':len(waters),'quality':qa},indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true')
    main(parser.parse_args().fetch)
