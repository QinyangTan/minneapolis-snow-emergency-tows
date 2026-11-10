import json,hashlib,zipfile,csv,collections,re,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CAT=ROOT/'catalog'
def read(p):return json.loads(p.read_text(encoding='utf8'))
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf8')
def classify(r):
 key=r['id'];path=r.get('path','')
 if 'Snow' in key and ('Tags' in key or 'Tows' in key):return '雪灾拖车与罚单','历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。'
 if 'Parcel_Data' in key:return '住房与房产','评估值、社区、车库位和住宅单元；不是实际成交价。'
 if 'Property_Sales' in key:return '住房与房产','真实成交记录；须过滤土地／非市场交易、多地块交易及住宅类型。'
 if 'Rental' in key:return '住房与房产','当前有效许可快照；不是历史全部出租住房。'
 if 'Public_311' in key:return '投诉与执法背景','车辆／停车／积雪关键词筛选的请求；绝不等同于拖车。'
 if '911' in key:return '投诉与执法背景','接警类别统计／元数据；不是实际拖车完成记录。'
 if 'Crashes' in key:return '交通与事故','只含严重伤亡和死亡事故，不能代表全部事故或事故拖车。'
 if key.startswith('traffic_'):return '交通与事故','流量／计数站；查 DATA_YEAR，历史 LOCATION_ID 连接；区域不一定严格限于市界。'
 if key.startswith('acs20') or '_esri' in key or key.startswith('city_census'):return '人口收入与住房统计','核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。'
 if 'Vehicle' in key or 'vehicle_availability' in key or 'commute_time' in key or key in ['Poverty__3','PCT_HH_Income_Transportation__0','Neighborhood_Dem_Tenure_WFL1__20']:return '人口收入与住房统计','市政府背景图层；具体来源年份见元数据，不默认与最新 ACS 一致。'
 if 'transit/' in path or key.startswith('gtfs_'):return '公交与可达性','计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。'
 if 'weather/' in path:return '天气','MSP 机场站或 NOAA 说明；保留质量和 trace 标记，缺失不能当零。'
 if any(t in key for t in ['Parking','Curb','Meter','Street','Routes','Transit','Parkways']):return '道路停车与公交设施','设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。'
 if 'references/' in path or 'workbook' in key:return '说明与参考','来源／说明资料，不作为独立观测数据计数。'
 return '空间边界与土地使用','核验边界版本与坐标系；区域筛选不等于精确市界裁剪。'
records=[];attempts=[]
for filename in ['city_downloads.json','regional_downloads.json','acs_bulk_downloads.json','history_downloads.json','addon_downloads.json','tableau_downloads.json','context_downloads.json']:
 for source in read(CAT/filename):
  r={**source,'acquisition_log':filename}
  if filename=='context_downloads.json' and r['id'].startswith('acs/'):
   attempts.append(r);continue
  if r.get('status')!='downloaded':attempts.append(r);continue
  category,note=classify(r);r.update(category=category,interpretation_note=note)
  r['asset_role']='reference' if category=='说明与参考' or any(k in r['id'] for k in ['readme','stations.txt','documentation','archive_index']) else 'data_snapshot'
  if '/metadata/' in r.get('path',''):r['asset_role']='metadata'
  if filename=='city_downloads.json':
   service=r['id'].split('__')[0];r['field_dictionary']=f'catalog/metadata/{service}.{r["id"].split("__")[-1]}.json'
   item=CAT/'metadata'/(service+'.item.json')
   if item.exists():
    m=read(item);r['publisher']=m.get('owner');r['source_title']=m.get('title');r['source_description']=m.get('description');r['source_modified_epoch_ms']=m.get('modified');r['source_terms']=m.get('licenseInfo');r['source_attribution']=m.get('accessInformation')
  records.append(r)
save(CAT/'datasets.json',records);save(CAT/'acquisition_attempts.json',attempts)
errors=[];checks=[]
for r in records:
 p=ROOT/r['path'];b=p.read_bytes();digest=hashlib.sha256(b).hexdigest()
 if digest!=r.get('sha256'):errors.append({'id':r['id'],'error':'sha256 mismatch'})
 count=None;nullgeo=None
 if p.suffix=='.json':
  o=json.loads(b)
  if isinstance(o,dict) and 'features' in o:
   count=len(o['features']);nullgeo=sum(f.get('geometry') is None for f in o['features']) if o.get('geometryType') else None
   if count!=r.get('count'):errors.append({'id':r['id'],'error':'count mismatch'})
 if p.suffix=='.zip':
  try:
   with zipfile.ZipFile(p) as z:
    bad=z.testzip()
    if bad:errors.append({'id':r['id'],'error':'zip CRC '+bad})
    if 'gtfs_' in p.name and not {'stops.txt','routes.txt','trips.txt','stop_times.txt'}.issubset(set(z.namelist())):errors.append({'id':r['id'],'error':'missing GTFS tables'})
  except Exception as e:errors.append({'id':r['id'],'error':str(e)})
 checks.append({'id':r['id'],'hash_verified':digest==r.get('sha256'),'record_count':count,'null_geometry_count':nullgeo})
baseline=read(ROOT/'prepared/baseline_9_events/summary.json');assert baseline['total']==5423 and len(baseline['events'])==9
cross=read(ROOT/'prepared/neighborhood_name_crosswalk.json');assert len(cross['matched'])==86 and cross['map_without_city_acs']==['Humboldt Industrial Area']
city=read(CAT/'city_downloads.json');snow=[r for r in city if re.search('Snow.*(Tows|Tags)',r['id'],re.I)]
stats={'created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'asset_count':len(records),'data_snapshot_count':sum(r['asset_role']=='data_snapshot' for r in records),'categories':dict(collections.Counter(r['category'] for r in records)),'snow_layers':len(snow),'tow_layers':sum('Tows' in r['id'] for r in snow),'tag_layers':sum('Tags' in r['id'] for r in snow),'acs_bulk_tables':len(read(CAT/'acs_bulk_downloads.json')),'source_files_total_bytes':sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file()),'validation_errors':errors,'checks':checks,'baseline_total':5423,'community_matches':86,'remaining_core_gap':'Complete non-snow-emergency tow records with reason, date, origin and completion status; complete emergency calendar.'}
save(CAT/'validation_report.json',stats)
lines=['# FP2 数据目录','',f'采集日期：2026-11-10。{len(records)} 个已保存资料条目，其中 {stats["data_snapshot_count"]} 个数据快照。快照按图层、版本或时期计数，不代表同样数量的独立研究数据源。','', '所有可更新接口均保存为静态快照；本包不会自动轮询。失败或需要密钥的尝试见 acquisition_attempts.json；Census API 的失败已由官方 bulk 下载补足。','']
for category in sorted({r['category'] for r in records}):
 lines+=['## '+category,'','| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |','|---|---:|---|---|---|']
 for r in records:
  if r['category']!=category:continue
  value=str(r.get('count',round(r.get('bytes',0)/1e6,2)))+(' 条' if 'count' in r else ' MB')
  lines.append(f'| {r["id"]} | {value} | [文件](../{r["path"]}) | [来源]({r.get("url","")}) | {r["interpretation_note"]} |')
 lines+=['']
(CAT/'DATASET_CATALOG_ZH.md').write_text('\n'.join(lines),encoding='utf8')
summary=f'''# FP2 数据资料包

已联网采集并保存，日期：2026-11-10。

- **{stats['data_snapshot_count']} 个数据快照**，另含原始来源说明、字段字典、下载日志与研究接入说明。快照按年份／图层拆分，不等于独立数据源数量。
- **{stats['tow_layers']} 个雪灾拖车图层 + {stats['tag_layers']} 个罚单图层**，作为扩充候选；正式九事件基线仍单独保留。
- **36 份 ACS 官方表格子集：12 张表 × 2022/2023/2024 三个五年估计版本**。保留 Hennepin tract/block group、县和 Minneapolis 市汇总，以及压缩的全国原始源表。
- **86 个社区的市政府人口、经济和住房导出**，共 11,954 行；保留估计值、MOE 和可靠性。
- **2022–2025 年房产评估、2021–2025 年成交、有效租赁许可**；包含住宅单元和车库车位相关字段，原始变量语义仍需核验。
- **历史及当前交通流量、公交、道路、路缘停车、严重事故、311、天气及边界**。十个现有雪灾事件对应的历史周度 GTFS 都已下载，另有当前计划及实时快照。
- 全包目前约 **{stats['source_files_total_bytes']/1e9:.2f} GB**（含全国 ACS 压缩存档、地图几何和历史公交）；正式网页只加载 prepared 和下一步审定的聚合结果。

## 从哪里开始

1. [完整数据目录](catalog/DATASET_CATALOG_ZH.md)：每份已保存文件、来源接口与用途。
2. [FP2 构建与数据接入说明](docs/FP2_BUILD_PLAN_ZH.md)：哪些能立即接图、哪些还需统一口径。
3. [机器可读清单](catalog/datasets.json)：来源、抓取时间、筛选、SHA-256、文件路径。
4. [验证报告](catalog/validation_report.json)：文件哈希、记录数和 ZIP 完整性；本轮验证错误 {len(errors)}。
5. [常态拖车数据申请草稿](docs/NORMAL_TOW_DATA_REQUEST_DRAFT.md)：尚未发送。

## 下一步代码优先读取

- `prepared/baseline_9_events/`：原项目 5,423 条／9 次事件的地图与汇总。
- `prepared/neighborhood_context_starter.json`：87 个地图社区的背景表；86 个有 ACS，工业区为 null。
- `prepared/neighborhood_name_crosswalk.json`：86 个名称对应；不是空间加权结果。
- `prepared/city_acs2024_observations.json`：社区人口、经济与住房原始观察行的 JSON 版。
- `prepared/acs_2022_hennepin_wide.json`、2023、2024：按 GEOID 整理的收入、住房、车辆和通勤指标及误差。
- `prepared/weather_msp_daily_2015_2026.json`：保留质量标记的 MSP 日天气。
- `prepared/reference_10_events/`：原项目十事件数据和时间窗，仅供独立参考。

## 关键缺口

**尚未取得完整的常态实际拖车明细与原因码，也未取得完整的历史紧急状态日历。** 311、911、事故和罚单都不能替代真实拖车。现有数据足以开始“雪灾拖车 × 社区背景”的 FP2；完整雪天／常态分原因比较要待数据补齐。

社区 ACS 缺失的是 Humboldt Industrial Area；没有补零。人均收入在 tract/block group 级别已下载，但没有伪造社区级人均收入或平均各 tract 中位数。部分较早的雪灾图层存在完整性／定义疑点，详见 `catalog/snow_layer_audit.json`。

## 文件与更新

`raw/` 为下载数据；`catalog/metadata/` 为 ArcGIS 字段、来源描述、更新时间与使用条款；`prepared/` 为轻量整理；`scripts/` 为采集与整理程序。数据源各自的使用条款保留在元数据中；本资料包不重新声明统一许可证。

没有创建后台任务，也没有向外部机构发送信息或提交数据申请。`scripts/catalog_and_validate.py` 可重新核对当前包；网络采集脚本有明确 URL 和查询条件，运行时会更新相应下载文件，应先复制归档现有版本。
'''
(ROOT/'README_ZH.md').write_text(summary,encoding='utf8')
print(json.dumps({k:v for k,v in stats.items() if k!='checks'},ensure_ascii=False,indent=2))
if errors:raise SystemExit(1)
