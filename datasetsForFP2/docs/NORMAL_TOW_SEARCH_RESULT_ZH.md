# 常态实际拖车与原因码：补充检索结果（2026-11-10）

## 结论

没有找到可验证为完整、可下载、包含 Minneapolis 拖车起点、日期、完成状态和原因码的历史常态明细。此结论是本轮公开检索的结果，不意味着政府没有记录。

官方 Public Works 记录保留表列明 PBW-78-022 Tow Logs，字段包含日期时间、拖车地点、原因、状态和公司；但这份目录不是可下载的拖车日志，也没有给出原因码字典。当前车辆查找工具是查车服务，不能当历史全量数据库。

## 检查过的来源

- Minneapolis 官方 ArcGIS 服务目录：已存 `catalog/minneapolis_services.json`。找到多年的 Snow Emergency Tags/Tows，没有找到已核实的常态全量拖车服务。
- ArcGIS 全站检索 Minneapolis impound/towing：包括先前名为 Minneapolis towing Data ACS Block Groups 的第三方地图。地图名称不能证明底层含完整常态拖车；不能未经核验当作目标数据。
- 市政府扣押场页面：https://www.minneapolismn.gov/getting-around/parking-driving/impound-lot/
- 记录保留表：https://www.minneapolismn.gov/media/-www-content-assets/documents/Public-Works-Retention-Schedule.pdf
- 市政府公开数据申请：https://www.minneapolismn.gov/government/government-data/request-public-data/
- 2024 Traffic & Parking Services 成果报告：https://www.minneapolismn.gov/media/-www-content-assets/documents/2024-Accomplishments-TPS.pdf
- 警察拖车政策、公开数据门户以及学术／新闻数据线索：提供原因分类或个案，不构成所需完整历史明细。

## 可采用的有限替代

`prepared/citywide_towing_context_2023_2024.json` 是依据官方 2024 成果报告第 23 页公开索引内容转录的年度数量。报告 PDF 的直接下载请求返回 404；公开检索工具仍能读取该报告的索引表格，因此明确保留此来源获取限制。这是年度全市背景，不是社区常态数据，也不用于社区散点图。

可用于说明公共街道拖车不仅涉及雪灾，还涉及清扫街道和弃置车辆。**不能把全年公共街道总数减去雪灾原因数量后称为“无雪日拖车”**：雪灾期间可能发生其他原因的拖车，且分类范围／互斥性未被完整核验。

## 不采用的替代

- 311 请求：投诉／请求与实际完成拖车并非一一对应。
- 911 接警及事故：不能证明是否拖车、是否完成、由谁完成。
- Tags 罚单：不是 Tows 拖车。
- Norfolk Towing & Recovery Inventory 等其他城市数据：即使包含真实拖车原因，也不能与 Minneapolis 社区收入、房产和地理位置拼接。它只能作为未来独立跨城市项目或数据结构参考，本原型不混入外市记录。
- 单笔理赔材料、车牌查询结果和拍卖清单：选择性强，不构成历史拖车全量。

## FP2 执行决定

按用户授权，暂时跳过“社区常态实际拖车对照”和“按完整原因码比较”。继续做雪灾实际拖车与社区人口、贫困、收入分布、住房和停车资源的描述性关联。年度全市数量仅可独立展示为背景，明确地理和时间口径。

申请草稿仍然保留，未向任何机构发送申请。取得真实记录后，再连接社区×日期×原因×完成状态，并建立完整的历史紧急状态日历。
