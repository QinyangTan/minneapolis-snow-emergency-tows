# FP2 数据目录

采集日期：2026-11-10。188 个已保存资料条目，其中 180 个数据快照。快照按图层、版本或时期计数，不代表同样数量的独立研究数据源。

所有可更新接口均保存为静态快照；本包不会自动轮询。失败或需要密钥的尝试见 acquisition_attempts.json；Census API 的失败已由官方 bulk 下载补足。

## 交通与事故

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| Serious_Injury_and_Fatal_Crashes_2020_2024__0 | 864 条 | [文件](../raw/city/Serious_Injury_and_Fatal_Crashes_2020_2024__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Serious_Injury_and_Fatal_Crashes_2020_2024/FeatureServer/0) | 只含严重伤亡和死亡事故，不能代表全部事故或事故拖车。 |
| traffic_current_segments__0 | 1932 条 | [文件](../raw/regional/traffic_current_segments__0.json) | [来源](https://webgis.dot.state.mn.us/65agsf1/rest/services/sdw_incdt/AADT_SEGMENT_CURRENT/FeatureServer/0) | 流量／计数站；查 DATA_YEAR，历史 LOCATION_ID 连接；区域不一定严格限于市界。 |
| traffic_current_locations__0 | 1864 条 | [文件](../raw/regional/traffic_current_locations__0.json) | [来源](https://webgis.dot.state.mn.us/65agsf1/rest/services/sdw_incdt/AADT_LOCATIONS_CURRENT/FeatureServer/0) | 流量／计数站；查 DATA_YEAR，历史 LOCATION_ID 连接；区域不一定严格限于市界。 |
| traffic_active_counts__0 | 1969 条 | [文件](../raw/regional/traffic_active_counts__0.json) | [来源](https://webgis.dot.state.mn.us/65agsf1/rest/services/sdw_incdt/TRAFFIC_COUNT_LOCS_ACTIVE/FeatureServer/0) | 流量／计数站；查 DATA_YEAR，历史 LOCATION_ID 连接；区域不一定严格限于市界。 |
| traffic_history_hennepin_2022_2025 | 20769 条 | [文件](../raw/regional/traffic_history_hennepin_2022_2025.json) | [来源](https://webgis.dot.state.mn.us/65agsf1/rest/services/sdw_incdt/AADT_HISTORY_SAMPLED/FeatureServer/0) | 流量／计数站；查 DATA_YEAR，历史 LOCATION_ID 连接；区域不一定严格限于市界。 |

## 人口收入与住房统计

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| Neighborhood_Dem_Tenure_WFL1__20 | 87 条 | [文件](../raw/city/Neighborhood_Dem_Tenure_WFL1__20.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Neighborhood_Dem_Tenure_WFL1/FeatureServer/20) | 市政府背景图层；具体来源年份见元数据，不默认与最新 ACS 一致。 |
| PCT_HH_Income_Transportation__0 | 414 条 | [文件](../raw/city/PCT_HH_Income_Transportation__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/PCT_HH_Income_Transportation/FeatureServer/0) | 市政府背景图层；具体来源年份见元数据，不默认与最新 ACS 一致。 |
| Poverty__3 | 151 条 | [文件](../raw/city/Poverty__3.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Poverty/FeatureServer/3) | 市政府背景图层；具体来源年份见元数据，不默认与最新 ACS 一致。 |
| acs_income_distribution_esri__2 | 185 条 | [文件](../raw/regional/acs_income_distribution_esri__2.json) | [来源](https://P3ePLMYs2RVChkJx.svcs.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Household_Income_Distribution_View_Boundaries/FeatureServer/2) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs_income_median_esri__2 | 185 条 | [文件](../raw/regional/acs_income_median_esri__2.json) | [来源](https://P3ePLMYs2RVChkJx.svcs.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Median_Household_Income_View_Boundaries/FeatureServer/2) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs_housing_cost_esri__2 | 185 条 | [文件](../raw/regional/acs_housing_cost_esri__2.json) | [来源](https://P3ePLMYs2RVChkJx.svcs.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Housing_Costs_View_Boundaries/FeatureServer/2) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs_population_esri__2 | 185 条 | [文件](../raw/regional/acs_population_esri__2.json) | [来源](https://P3ePLMYs2RVChkJx.svcs.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Population_and_Housing_Basics_View_Boundaries/FeatureServer/2) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| vehicle_availability_city__1 | 121 条 | [文件](../raw/regional/vehicle_availability_city__1.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Vehicle_Availability/FeatureServer/1) | 市政府背景图层；具体来源年份见元数据，不默认与最新 ACS 一致。 |
| commute_time_city__120 | 121 条 | [文件](../raw/regional/commute_time_city__120.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Commute_Time/FeatureServer/120) | 市政府背景图层；具体来源年份见元数据，不默认与最新 ACS 一致。 |
| acs2022_B01003 | 1429 条 | [文件](../raw/acs_bulk/2022/B01003_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b01003.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B19301 | 1428 条 | [文件](../raw/acs_bulk/2022/B19301_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b19301.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B19013 | 1429 条 | [文件](../raw/acs_bulk/2022/B19013_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b19013.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B25077 | 1429 条 | [文件](../raw/acs_bulk/2022/B25077_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b25077.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B25064 | 1429 条 | [文件](../raw/acs_bulk/2022/B25064_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b25064.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B25003 | 1429 条 | [文件](../raw/acs_bulk/2022/B25003_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b25003.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B08201 | 331 条 | [文件](../raw/acs_bulk/2022/B08201_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b08201.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B08301 | 1429 条 | [文件](../raw/acs_bulk/2022/B08301_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b08301.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B25024 | 1429 条 | [文件](../raw/acs_bulk/2022/B25024_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b25024.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B25070 | 1429 条 | [文件](../raw/acs_bulk/2022/B25070_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b25070.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_B25002 | 1429 条 | [文件](../raw/acs_bulk/2022/B25002_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-b25002.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2022_C17002 | 1429 条 | [文件](../raw/acs_bulk/2022/C17002_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2022/table-based-SF/data/5YRData/acsdt5y2022-c17002.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B01003 | 1429 条 | [文件](../raw/acs_bulk/2023/B01003_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b01003.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B19301 | 1428 条 | [文件](../raw/acs_bulk/2023/B19301_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b19301.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B19013 | 1429 条 | [文件](../raw/acs_bulk/2023/B19013_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b19013.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B25077 | 1429 条 | [文件](../raw/acs_bulk/2023/B25077_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b25077.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B25064 | 1429 条 | [文件](../raw/acs_bulk/2023/B25064_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b25064.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B25003 | 1429 条 | [文件](../raw/acs_bulk/2023/B25003_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b25003.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B08201 | 331 条 | [文件](../raw/acs_bulk/2023/B08201_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b08201.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B08301 | 1429 条 | [文件](../raw/acs_bulk/2023/B08301_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b08301.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B25024 | 1429 条 | [文件](../raw/acs_bulk/2023/B25024_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b25024.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B25070 | 1429 条 | [文件](../raw/acs_bulk/2023/B25070_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b25070.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_B25002 | 1429 条 | [文件](../raw/acs_bulk/2023/B25002_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b25002.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2023_C17002 | 1429 条 | [文件](../raw/acs_bulk/2023/C17002_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-c17002.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B01003 | 1429 条 | [文件](../raw/acs_bulk/2024/B01003_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b01003.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B19301 | 1428 条 | [文件](../raw/acs_bulk/2024/B19301_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b19301.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B19013 | 1429 条 | [文件](../raw/acs_bulk/2024/B19013_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b19013.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B25077 | 1429 条 | [文件](../raw/acs_bulk/2024/B25077_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25077.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B25064 | 1429 条 | [文件](../raw/acs_bulk/2024/B25064_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25064.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B25003 | 1429 条 | [文件](../raw/acs_bulk/2024/B25003_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25003.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B08201 | 331 条 | [文件](../raw/acs_bulk/2024/B08201_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08201.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B08301 | 1429 条 | [文件](../raw/acs_bulk/2024/B08301_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08301.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B25024 | 1429 条 | [文件](../raw/acs_bulk/2024/B25024_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25024.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B25070 | 1429 条 | [文件](../raw/acs_bulk/2024/B25070_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25070.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_B25002 | 1429 条 | [文件](../raw/acs_bulk/2024/B25002_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25002.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| acs2024_C17002 | 1429 条 | [文件](../raw/acs_bulk/2024/C17002_hennepin.dat) | [来源](https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-c17002.dat) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| city_census_population | 0.82 MB | [文件](../raw/acs/city_census_population.csv) | [来源](https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodDemographicsDownload.csv) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| city_census_economics | 0.9 MB | [文件](../raw/acs/city_census_economics.csv) | [来源](https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodEconomicWellbeingDownload.csv) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |
| city_census_housing | 0.99 MB | [文件](../raw/acs/city_census_housing.csv) | [来源](https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodHousingDownload.csv) | 核对地理层级、五年窗口、估计值与 MOE；Esri 为 Census 二次发布，保留来源年份。 |

## 住房与房产

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| Assessing_Department_Parcel_Data_2023__0 | 130995 条 | [文件](../raw/city/Assessing_Department_Parcel_Data_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Assessing_Department_Parcel_Data_2023/FeatureServer/0) | 评估值、社区、车库位和住宅单元；不是实际成交价。 |
| Assessing_Department_Parcel_Data_2024__0 | 130994 条 | [文件](../raw/city/Assessing_Department_Parcel_Data_2024__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Assessing_Department_Parcel_Data_2024/FeatureServer/0) | 评估值、社区、车库位和住宅单元；不是实际成交价。 |
| Assessing_Department_Parcel_Data_2025__0 | 131978 条 | [文件](../raw/city/Assessing_Department_Parcel_Data_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Assessing_Department_Parcel_Data_2025/FeatureServer/0) | 评估值、社区、车库位和住宅单元；不是实际成交价。 |
| Assessors_Parcel_Data_2022__0 | 130765 条 | [文件](../raw/city/Assessors_Parcel_Data_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Assessors_Parcel_Data_2022/FeatureServer/0) | 评估值、社区、车库位和住宅单元；不是实际成交价。 |
| Property_Sales_2021_to_2025__0 | 38566 条 | [文件](../raw/city/Property_Sales_2021_to_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Property_Sales_2021_to_2025/FeatureServer/0) | 真实成交记录；须过滤土地／非市场交易、多地块交易及住宅类型。 |
| Active_Rental_Licenses__0 | 23376 条 | [文件](../raw/city/Active_Rental_Licenses__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Active_Rental_Licenses/FeatureServer/0) | 当前有效许可快照；不是历史全部出租住房。 |

## 公交与可达性

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| gtfs_20221126 | 25.97 MB | [文件](../raw/transit/gtfs_20221126.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20221126.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20221210 | 14.97 MB | [文件](../raw/transit/gtfs_20221210.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20221210.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20221217 | 14.98 MB | [文件](../raw/transit/gtfs_20221217.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20221217.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20221231 | 14.92 MB | [文件](../raw/transit/gtfs_20221231.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20221231.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20230218 | 23.01 MB | [文件](../raw/transit/gtfs_20230218.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20230218.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20241214 | 16.62 MB | [文件](../raw/transit/gtfs_20241214.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20241214.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20250208 | 23.0 MB | [文件](../raw/transit/gtfs_20250208.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20250208.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20251129 | 21.41 MB | [文件](../raw/transit/gtfs_20251129.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20251129.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20251206 | 26.08 MB | [文件](../raw/transit/gtfs_20251206.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20251206.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| gtfs_20251227 | 21.94 MB | [文件](../raw/transit/gtfs_20251227.zip) | [来源](https://svc.metrotransit.org/mtgtfs/archive/gtfs20251227.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| transit/gtfs_current.zip | 29.41 MB | [文件](../raw/transit/gtfs_current.zip) | [来源](https://svc.metrotransit.org/mtgtfs/gtfs.zip) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| transit/feed_documentation.html | 0.01 MB | [文件](../raw/transit/feed_documentation.html) | [来源](https://svc.metrotransit.org/) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| transit/archive_index.html | 0.04 MB | [文件](../raw/transit/archive_index.html) | [来源](https://svc.metrotransit.org/mtgtfs/archive/) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| transit/tripupdates.pb | 0.98 MB | [文件](../raw/transit/tripupdates.pb) | [来源](https://svc.metrotransit.org/mtgtfs/tripupdates.pb) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| transit/vehiclepositions.pb | 0.08 MB | [文件](../raw/transit/vehiclepositions.pb) | [来源](https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |
| transit/alerts.pb | 0.08 MB | [文件](../raw/transit/alerts.pb) | [来源](https://svc.metrotransit.org/mtgtfs/alerts.pb) | 计划服务而非实际客流；历史周档案需结合 calendar/calendar_dates。实时快照只代表抓取时刻。 |

## 天气

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| weather/USW00014922.dly | 5.09 MB | [文件](../raw/weather/USW00014922.dly) | [来源](https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/USW00014922.dly) | MSP 机场站或 NOAA 说明；保留质量和 trace 标记，缺失不能当零。 |
| weather/ghcn_daily_readme.txt | 0.03 MB | [文件](../raw/weather/ghcn_daily_readme.txt) | [来源](https://www.ncei.noaa.gov/pub/data/ghcn/daily/readme.txt) | MSP 机场站或 NOAA 说明；保留质量和 trace 标记，缺失不能当零。 |
| weather/ghcn_stations.txt | 11.44 MB | [文件](../raw/weather/ghcn_stations.txt) | [来源](https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt) | MSP 机场站或 NOAA 说明；保留质量和 trace 标记，缺失不能当零。 |

## 投诉与执法背景

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| Public_311_2022__0 | 33433 条 | [文件](../raw/city/Public_311_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Public_311_2022/FeatureServer/0) | 车辆／停车／积雪关键词筛选的请求；绝不等同于拖车。 |
| Public_311_2023__0 | 43512 条 | [文件](../raw/city/Public_311_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Public_311_2023/FeatureServer/0) | 车辆／停车／积雪关键词筛选的请求；绝不等同于拖车。 |
| Public_311_2024__0 | 26479 条 | [文件](../raw/city/Public_311_2024__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Public_311_2024/FeatureServer/0) | 车辆／停车／积雪关键词筛选的请求；绝不等同于拖车。 |
| Public_311_2025__0 | 34189 条 | [文件](../raw/city/Public_311_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Public_311_2025/FeatureServer/0) | 车辆／停车／积雪关键词筛选的请求；绝不等同于拖车。 |

## 空间边界与土地使用

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| Downtown_Core_Area_Map__0 | 1 条 | [文件](../raw/city/Downtown_Core_Area_Map__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Downtown_Core_Area_Map/FeatureServer/0) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |
| Existing_Land_Use__0 | 102518 条 | [文件](../raw/city/Existing_Land_Use__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Existing_Land_Use/FeatureServer/0) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |
| Minneapolis_Neighborhoods__0 | 87 条 | [文件](../raw/city/Minneapolis_Neighborhoods__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Minneapolis_Neighborhoods/FeatureServer/0) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |
| Mpls_Census_Tracts_2020__0 | 121 条 | [文件](../raw/city/Mpls_Census_Tracts_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Mpls_Census_Tracts_2020/FeatureServer/0) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |
| Neighborhood_Commercial_Nodes__0 | 69 条 | [文件](../raw/city/Neighborhood_Commercial_Nodes__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Neighborhood_Commercial_Nodes/FeatureServer/0) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |
| geography/tl_2024_27_tract.zip | 7.49 MB | [文件](../raw/geography/tl_2024_27_tract.zip) | [来源](https://www2.census.gov/geo/tiger/TIGER2024/TRACT/tl_2024_27_tract.zip) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |
| geography/tl_2024_27_bg.zip | 13.1 MB | [文件](../raw/geography/tl_2024_27_bg.zip) | [来源](https://www2.census.gov/geo/tiger/TIGER2024/BG/tl_2024_27_bg.zip) | 核验边界版本与坐标系；区域筛选不等于精确市界裁剪。 |

## 说明与参考

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| census_download_workbook | 1.64 MB | [文件](../raw/acs/census_download_workbook.zip) | [来源](https://tableau.minneapolismn.gov/workbooks/MinneapolisCensusDataDownload.twb) | 来源／说明资料，不作为独立观测数据计数。 |
| references/Public_Works_Retention_Schedule.pdf | 0.45 MB | [文件](../raw/references/Public_Works_Retention_Schedule.pdf) | [来源](https://www.minneapolismn.gov/media/-www-content-assets/documents/Public-Works-Retention-Schedule.pdf) | 来源／说明资料，不作为独立观测数据计数。 |
| references/public_data_request.html | 0.19 MB | [文件](../raw/references/public_data_request.html) | [来源](https://www.minneapolismn.gov/government/government-data/request-public-data/) | 来源／说明资料，不作为独立观测数据计数。 |
| references/traffic_data_products.html | 0.01 MB | [文件](../raw/references/traffic_data_products.html) | [来源](https://www.dot.state.mn.us/traffic/data/data-products.html) | 来源／说明资料，不作为独立观测数据计数。 |

## 道路停车与公交设施

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| All_Transit_Routes__0 | 22 条 | [文件](../raw/city/All_Transit_Routes__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/All_Transit_Routes/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| All_Transit_Routes__1 | 152 条 | [文件](../raw/city/All_Transit_Routes__1.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/All_Transit_Routes/FeatureServer/1) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| DowntownParking__0 | 494 条 | [文件](../raw/city/DowntownParking__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/DowntownParking/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| High_Frequency_Transit_And_Walksheds__0 | 12 条 | [文件](../raw/city/High_Frequency_Transit_And_Walksheds__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/High_Frequency_Transit_And_Walksheds/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| High_Frequency_Transit_And_Walksheds__1 | 22 条 | [文件](../raw/city/High_Frequency_Transit_And_Walksheds__1.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/High_Frequency_Transit_And_Walksheds/FeatureServer/1) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| High_Frequency_Transit_And_Walksheds__2 | 793 条 | [文件](../raw/city/High_Frequency_Transit_And_Walksheds__2.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/High_Frequency_Transit_And_Walksheds/FeatureServer/2) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| High_Frequency_Transit_And_Walksheds__3 | 22 条 | [文件](../raw/city/High_Frequency_Transit_And_Walksheds__3.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/High_Frequency_Transit_And_Walksheds/FeatureServer/3) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| High_Frequency_Transit_And_Walksheds__4 | 34 条 | [文件](../raw/city/High_Frequency_Transit_And_Walksheds__4.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/High_Frequency_Transit_And_Walksheds/FeatureServer/4) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| High_Frequency_Transit_And_Walksheds__5 | 34 条 | [文件](../raw/city/High_Frequency_Transit_And_Walksheds__5.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/High_Frequency_Transit_And_Walksheds/FeatureServer/5) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__0 | 4007 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__1 | 378 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__1.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/1) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__2 | 1531 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__2.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/2) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__3 | 1548 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__3.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/3) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__4 | 99 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__4.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/4) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__5 | 61 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__5.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/5) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__6 | 624 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__6.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/6) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__7 | 93 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__7.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/7) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__8 | 104 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__8.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/8) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| MinneapolisCurbMap_WFL1__9 | 40 条 | [文件](../raw/city/MinneapolisCurbMap_WFL1__9.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/MinneapolisCurbMap_WFL1/FeatureServer/9) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| Parking_Meter_Inventory__0 | 8196 条 | [文件](../raw/city/Parking_Meter_Inventory__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Parking_Meter_Inventory/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| Parking_Meter_Pay_Stations__0 | 661 条 | [文件](../raw/city/Parking_Meter_Pay_Stations__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Parking_Meter_Pay_Stations/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| Snow_Emergency_Parkways_in_Minneapolis__0 | 3 条 | [文件](../raw/city/Snow_Emergency_Parkways_in_Minneapolis__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Parkways_in_Minneapolis/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| Snow_Emergency_Parkways_in_Minneapolis__1 | 457 条 | [文件](../raw/city/Snow_Emergency_Parkways_in_Minneapolis__1.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Parkways_in_Minneapolis/FeatureServer/1) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| TransitStops__0 | 2364 条 | [文件](../raw/city/TransitStops__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/TransitStops/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| Transportation_Action_Plan_Street_Types__0 | 12833 条 | [文件](../raw/city/Transportation_Action_Plan_Street_Types__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Transportation_Action_Plan_Street_Types/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| PW_Street_Centerline__0 | 13021 条 | [文件](../raw/city/PW_Street_Centerline__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/PW_Street_Centerline/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| TylerParkingProd__9 | 10012 条 | [文件](../raw/city/TylerParkingProd__9.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/TylerParkingProd/FeatureServer/9) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |
| Snow_Emergency_Routes__0 | 21644 条 | [文件](../raw/city/Snow_Emergency_Routes__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Routes/FeatureServer/0) | 设施／规则快照；确认覆盖范围与更新时间，不能直接当历史停车暴露。 |

## 雪灾拖车与罚单

| 数据 | 记录／大小 | 本地文件 | 来源接口 | 使用注意 |
|---|---:|---|---|---|
| Snow_Emergency_Armatage_Tags_2019__0 | 5153 条 | [文件](../raw/city/Snow_Emergency_Armatage_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Armatage_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Armatage_Tows_2019__0 | 948 条 | [文件](../raw/city/Snow_Emergency_Armatage_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Armatage_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Bridge_Tags_2025__0 | 5456 条 | [文件](../raw/city/Snow_Emergency_Bridge_Tags_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Bridge_Tags_2025/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Bridge_Tows_2025__0 | 852 条 | [文件](../raw/city/Snow_Emergency_Bridge_Tows_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Bridge_Tows_2025/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Dana_Tags_2016_b__0 | 7058 条 | [文件](../raw/city/Snow_Emergency_Dana_Tags_2016_b__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Dana_Tags_2016_b/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Dana_Tows_2016_b__0 | 1354 条 | [文件](../raw/city/Snow_Emergency_Dana_Tows_2016_b__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Dana_Tows_2016_b/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Diamond_Lake_Tags_2019__0 | 5088 条 | [文件](../raw/city/Snow_Emergency_Diamond_Lake_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Diamond_Lake_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Diamond_Lake_Tows_2019__0 | 982 条 | [文件](../raw/city/Snow_Emergency_Diamond_Lake_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Diamond_Lake_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Dover_Tags_2022__0 | 5942 条 | [文件](../raw/city/Snow_Emergency_Dover_Tags_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Dover_Tags_2022/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Dover_Tows_2022__0 | 631 条 | [文件](../raw/city/Snow_Emergency_Dover_Tows_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Dover_Tows_2022/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Ferry_Tags_2016__0 | 6562 条 | [文件](../raw/city/Snow_Emergency_Ferry_Tags_2016__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Ferry_Tags_2016/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Ferry_Tags_2021__0 | 4797 条 | [文件](../raw/city/Snow_Emergency_Ferry_Tags_2021__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Ferry_Tags_2021/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Ferry_Tows_2016__0 | 1328 条 | [文件](../raw/city/Snow_Emergency_Ferry_Tows_2016__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Ferry_Tows_2016/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Ferry_Tows_2021__0 | 4868 条 | [文件](../raw/city/Snow_Emergency_Ferry_Tows_2021__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Ferry_Tows_2021/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Fremont_Tags_2019__0 | 4263 条 | [文件](../raw/city/Snow_Emergency_Fremont_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Fremont_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Fremont_Tows_2019__0 | 1235 条 | [文件](../raw/city/Snow_Emergency_Fremont_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Fremont_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Glenwood_Tags_2025__3 | 5138 条 | [文件](../raw/city/Snow_Emergency_Glenwood_Tags_2025__3.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Glenwood_Tags_2025/FeatureServer/3) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Glenwood_Tows_2025__0 | 719 条 | [文件](../raw/city/Snow_Emergency_Glenwood_Tows_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Glenwood_Tows_2025/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Grant_Tags_2015__0 | 6235 条 | [文件](../raw/city/Snow_Emergency_Grant_Tags_2015__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Grant_Tags_2015/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Grant_Tows_2015__0 | 1736 条 | [文件](../raw/city/Snow_Emergency_Grant_Tows_2015__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Grant_Tows_2015/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Howard_Tags_2024__0 | 5655 条 | [文件](../raw/city/Snow_Emergency_Howard_Tags_2024__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Howard_Tags_2024/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Howard_Tows_2024__0 | 665 条 | [文件](../raw/city/Snow_Emergency_Howard_Tows_2024__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Howard_Tows_2024/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Howe_Tows_2018__0 | 844 条 | [文件](../raw/city/Snow_Emergency_Howe_Tows_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Howe_Tows_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_James_Tags_2020__0 | 2262 条 | [文件](../raw/city/Snow_Emergency_James_Tags_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_James_Tags_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_James_Tows_2020__0 | 465 条 | [文件](../raw/city/Snow_Emergency_James_Tows_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_James_Tows_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Jane_Tags_2022__0 | 4983 条 | [文件](../raw/city/Snow_Emergency_Jane_Tags_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Jane_Tags_2022/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Jane_Tows_2017__0 | 1430 条 | [文件](../raw/city/Snow_Emergency_Jane_Tows_2017__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Jane_Tows_2017/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Jane_Tows_2022__0 | 584 条 | [文件](../raw/city/Snow_Emergency_Jane_Tows_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Jane_Tows_2022/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Jefferson_Tags_2025__0 | 5350 条 | [文件](../raw/city/Snow_Emergency_Jefferson_Tags_2025__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Jefferson_Tags_2025/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Jefferson_Tows_2025__1 | 566 条 | [文件](../raw/city/Snow_Emergency_Jefferson_Tows_2025__1.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Jefferson_Tows_2025/FeatureServer/1) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Kasota_Tags_2019_2020__0 | 6803 条 | [文件](../raw/city/Snow_Emergency_Kasota_Tags_2019_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Kasota_Tags_2019_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Kasota_Tows_2019_2020__0 | 1246 条 | [文件](../raw/city/Snow_Emergency_Kasota_Tows_2019_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Kasota_Tows_2019_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Lourdes_Tags_2022__0 | 3542 条 | [文件](../raw/city/Snow_Emergency_Lourdes_Tags_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Lourdes_Tags_2022/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Lourdes_Tows_2022__0 | 435 条 | [文件](../raw/city/Snow_Emergency_Lourdes_Tows_2022__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Lourdes_Tows_2022/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Newton_Tags_2020__0 | 6439 条 | [文件](../raw/city/Snow_Emergency_Newton_Tags_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Newton_Tags_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Newton_Tows_2020__0 | 1140 条 | [文件](../raw/city/Snow_Emergency_Newton_Tows_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Newton_Tows_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Northrop_Tags_2023__0 | 3977 条 | [文件](../raw/city/Snow_Emergency_Northrop_Tags_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Northrop_Tags_2023/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Northrop_Tows_2023__0 | 465 条 | [文件](../raw/city/Snow_Emergency_Northrop_Tows_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Northrop_Tows_2023/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Olive_Tags_2018__0 | 6544 条 | [文件](../raw/city/Snow_Emergency_Olive_Tags_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Olive_Tags_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Olive_Tows_2018__0 | 1161 条 | [文件](../raw/city/Snow_Emergency_Olive_Tows_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Olive_Tows_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Oliver_Tags_2021__0 | 6491 条 | [文件](../raw/city/Snow_Emergency_Oliver_Tags_2021__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Oliver_Tags_2021/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Oliver_Tows_2021__0 | 6491 条 | [文件](../raw/city/Snow_Emergency_Oliver_Tows_2021__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Oliver_Tows_2021/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Omega_Tags__0 | 5475 条 | [文件](../raw/city/Snow_Emergency_Omega_Tags__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Omega_Tags/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Omega_Tows__0 | 695 条 | [文件](../raw/city/Snow_Emergency_Omega_Tows__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Omega_Tows/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Polk_Tags_2016__0 | 5435 条 | [文件](../raw/city/Snow_Emergency_Polk_Tags_2016__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Polk_Tags_2016/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Polk_Tows_2016__0 | 1480 条 | [文件](../raw/city/Snow_Emergency_Polk_Tows_2016__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Polk_Tows_2016/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Quincy_Tags_2019__0 | 2825 条 | [文件](../raw/city/Snow_Emergency_Quincy_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Quincy_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Quincy_Tows_2019__0 | 617 条 | [文件](../raw/city/Snow_Emergency_Quincy_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Quincy_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Spruce_Tags_2020__0 | 6110 条 | [文件](../raw/city/Snow_Emergency_Spruce_Tags_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Spruce_Tags_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Spruce_Tows_2020__0 | 1253 条 | [文件](../raw/city/Snow_Emergency_Spruce_Tows_2020__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Spruce_Tows_2020/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Upton_Tags_2019__0 | 5656 条 | [文件](../raw/city/Snow_Emergency_Upton_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Upton_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Upton_Tows_2019__0 | 805 条 | [文件](../raw/city/Snow_Emergency_Upton_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Upton_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Victory1_Tags_2023__0 | 3755 条 | [文件](../raw/city/Snow_Emergency_Victory1_Tags_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Victory1_Tags_2023/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Victory1_Tows_2023__0 | 506 条 | [文件](../raw/city/Snow_Emergency_Victory1_Tows_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Victory1_Tows_2023/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Victory2_Tags_2023__0 | 758 条 | [文件](../raw/city/Snow_Emergency_Victory2_Tags_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Victory2_Tags_2023/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Victory2_Tows_2023__0 | 187 条 | [文件](../raw/city/Snow_Emergency_Victory2_Tows_2023__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Victory2_Tows_2023/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Westminster_Tags_2019__0 | 4151 条 | [文件](../raw/city/Snow_Emergency_Westminster_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Westminster_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Westminster_Tows_2019__0 | 980 条 | [文件](../raw/city/Snow_Emergency_Westminster_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Westminster_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Xerxes_Tags_2018__0 | 7941 条 | [文件](../raw/city/Snow_Emergency_Xerxes_Tags_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Xerxes_Tags_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Xerxes_Tows_2018__0 | 1215 条 | [文件](../raw/city/Snow_Emergency_Xerxes_Tows_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Xerxes_Tows_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Yale_Tags_2019__0 | 3983 条 | [文件](../raw/city/Snow_Emergency_Yale_Tags_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Yale_Tags_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Yale_Tows_2019__0 | 894 条 | [文件](../raw/city/Snow_Emergency_Yale_Tows_2019__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Yale_Tows_2019/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Yardville_Tags_2018__0 | 3857 条 | [文件](../raw/city/Snow_Emergency_Yardville_Tags_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Yardville_Tags_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| Snow_Emergency_Yardville_Tows_2018__0 | 728 条 | [文件](../raw/city/Snow_Emergency_Yardville_Tows_2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Yardville_Tows_2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| SnowEmergencyJaneTags__0 | 6320 条 | [文件](../raw/city/SnowEmergencyJaneTags__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/SnowEmergencyJaneTags/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| SnowEmergencyPembinaTags2018__0 | 4267 条 | [文件](../raw/city/SnowEmergencyPembinaTags2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/SnowEmergencyPembinaTags2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
| SnowEmergencyPembinaTows2018__0 | 962 条 | [文件](../raw/city/SnowEmergencyPembinaTows2018__0.json) | [来源](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/SnowEmergencyPembinaTows2018/FeatureServer/0) | 历史事件图层；先核实 Day 完整性和 Tags/Tows 定义，再扩大九事件样本。 |
