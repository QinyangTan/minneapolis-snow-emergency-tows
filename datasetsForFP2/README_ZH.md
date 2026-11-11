> 统计期更正：市政府社区人口和住房为 2020–2024 ACS；经济（收入、贫困）为 2019–2023 ACS。文件名 city_acs2024_observations 是历史命名，以行内 ACS5 Release 和每项 period 为准。

# FP2 数据资料包

已联网采集并保存，日期：2026-11-10。

- **180 个数据快照**，另含原始来源说明、字段字典、下载日志与研究接入说明。快照按年份／图层拆分，不等于独立数据源数量。
- **34 个雪灾拖车图层 + 33 个罚单图层**，作为扩充候选；正式九事件基线仍单独保留。
- **36 份 ACS 官方表格子集：12 张表 × 2022/2023/2024 三个五年估计版本**。保留 Hennepin tract/block group、县和 Minneapolis 市汇总，以及压缩的全国原始源表。
- **86 个社区的市政府人口、经济和住房导出**，共 11,954 行；保留估计值、MOE 和可靠性。
- **2022–2025 年房产评估、2021–2025 年成交、有效租赁许可**；包含住宅单元和车库车位相关字段，原始变量语义仍需核验。
- **历史及当前交通流量、公交、道路、路缘停车、严重事故、311、天气及边界**。十个现有雪灾事件对应的历史周度 GTFS 都已下载，另有当前计划及实时快照。
- 全包目前约 **1.32 GB**（含全国 ACS 压缩存档、地图几何和历史公交）；正式网页只加载 prepared 和下一步审定的聚合结果。

## 从哪里开始

1. [完整数据目录](catalog/DATASET_CATALOG_ZH.md)：每份已保存文件、来源接口与用途。
2. [FP2 构建与数据接入说明](docs/FP2_BUILD_PLAN_ZH.md)：哪些能立即接图、哪些还需统一口径。
3. [机器可读清单](catalog/datasets.json)：来源、抓取时间、筛选、SHA-256、文件路径。
4. [验证报告](catalog/validation_report.json)：文件哈希、记录数和 ZIP 完整性；本轮验证错误 0。
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
