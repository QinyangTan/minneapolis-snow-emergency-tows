## 1. Snow, Streets & Neighborhoods

Timing: 35 seconds. Our question is whether neighborhood conditions are associated with recorded snow-emergency towing. This is an exploratory FP2 proof of concept, not a causal evaluation. Team names follow the existing private repository membership record; no individual contribution ownership is asserted. Source: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/docs/TEAM_CONTRIBUTIONS.md.

## 2. Research question and analytical scope

Timing: 40 seconds. The unit of analysis is neighborhood by selected event and emergency phase. Economic context may relate to parking exposure, but association does not identify a direct mechanism. Towed vehicles may belong to visitors. Poverty and income distribution are available by neighborhood; per-capita income remains at census tract scale. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 3. The baseline is a selected sample

Timing: 40 seconds. There are 5,423 records across nine selected emergencies. Of these, 5,355 match 87 neighborhoods and 68 lack a mapped neighborhood. Keep citywide and mapped denominators distinct. The separately collected historical layers are not automatically added to the baseline. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 4. Data assembled for FP2

Timing: 45 seconds. The archive preserves 180 data snapshots, 661 original files, source URLs, metadata and SHA-256 hashes. A snapshot may be a layer or vintage, not an independent source. Raw inputs are kept apart from the lightweight plotted data. ACS economics is 2019-2023, while housing and population are 2020-2024. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 5. The demo coordinates maps and charts

Timing: 50 seconds, including a brief live interaction if available. Select a neighborhood in the map or scatterplot; the detail view follows. Change emergency, day, measure or context indicator. The range controls highlight the same neighborhoods in both views. This image is an actual browser capture. Local route: /fp2/. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 6. Marcy Holmes has the largest observed count

Timing: 35 seconds. Marcy Holmes has 577 records, or 10.8 percent of the mapped sample. These are event records, not necessarily unique vehicles or residents. The next view checks how population adjustment changes interpretation. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 7. Population adjustment changes the ranking

Timing: 50 seconds. East Bde Maka Ska has 238 records and 2,436 estimated residents, giving 97.7 records per thousand residents across the sample. Camden Industrial has only 31 estimated residents: three records produce 96.8 per thousand. This is a warning about small denominators, not evidence of extreme individual risk. Population uncertainty is visible in the demo. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 8. Poverty has a modest positive rank association

Timing: 45 seconds. Across 86 matched neighborhoods, the poverty share has Spearman rank correlation 0.26 with records per thousand residents. The count association is 0.32. This is descriptive: no p-value, causal interpretation, ACS-error propagation or spatial adjustment is claimed. Source economics: https://tableau.minneapolismn.gov/views/MinneapolisCensusDataDownload/MplsNeighborhoodEconomicWellbeingDownload.csv. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 9. Sale prices show a negative rank association

Timing: 45 seconds. Among 54 neighborhoods with at least ten qualifying 2024 sales, the Spearman association is -0.39 for records per thousand residents. Included records are single-parcel, non-land, one-unit residential, condo or townhouse sales not excluded from the city's ratio study. Deduplicate ECRV plus parcel. This is the median of transacted homes, not all homes. Neighborhoods without enough sales are omitted. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 10. Associations depend on the indicator

Timing: 45 seconds. These are separate bivariate Spearman correlations, not a multivariable model or independent effects. Household income below 35,000 and vehicle access show larger positive rank associations than poverty in this sample. Median sampled-site AADT is near zero. Its spatial sampling and annual time scale do not directly measure snow-day curbside parking exposure. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 11. The poverty association varies across events

Timing: 40 seconds. Recompute the same poverty-versus-population-adjusted measure separately for each event. Spearman rho ranges from 0.09 to 0.35. These events share communities and overlapping ACS context; they are not independent experimental replications. The demo supports day-level sensitivity too. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 12. Income and traffic retain their source geography

Timing: 50 seconds. Per-capita income is shown for 121 census tracts using B19301 from the 2020-2024 ACS. We do not average tract medians or income values into invented neighborhood measures. The separate traffic view contains 1,228 2024 AADT sites joined through LOCATION_ID to current geometry, then matched to a single city neighborhood. 103 historical sites have no current geometry and three have ambiguous or outside-city matches. Traffic includes modeled estimates. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline. Census source: https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b19301.dat. MnDOT source: https://webgis.dot.state.mn.us/65agsf1/rest/services/sdw_incdt/AADT_HISTORY_SAMPLED/FeatureServer/0.

## 13. Ordinary-day towing remains a data gap

Timing: 40 seconds. The search did not verify a complete public Minneapolis tow log with ordinary-day records and reason codes. The retention schedule describes tow logs, but a retention description is not a downloadable dataset. Complaints, calls, tickets and crashes are distinct administrative events. Citywide annual categories provide context only. The user authorized skipping this comparison if a valid substitute was unavailable. Sources: https://www.minneapolismn.gov/media/-www-content-assets/documents/Public-Works-Retention-Schedule.pdf; https://www.minneapolismn.gov/media/-www-content-assets/documents/2024-Accomplishments-TPS.pdf; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/datasetsForFP2/docs/NORMAL_TOW_SEARCH_RESULT_ZH.md.

## 14. FP2 narrative and demonstration sequence

Timing: 50 seconds. Demonstrate the actual interface in this order: start at the count view, select a neighborhood, change to per-thousand residents, switch context indicators, then vary event and emergency phase. The three guided buttons provide the narrative entry points. Selection is preserved across the views. Animated narrative transitions are a later refinement, as allowed by FP2; reduced-motion access remains a requirement. Keyboard selection and mobile layout are implemented and tested. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.

## 15. Feedback for the next milestone

Timing: 40 seconds, then questions. Ask peers which denominator best represents exposure: residents, curbside spaces, vehicles or road traffic. Ask whether the interface distinguishes missing data, low precision and small denominators clearly. Ask which event comparison most helps judge stability. Next analytical work requires event-time parking and traffic exposure, boundary checks, ACS uncertainty and an actual towing reason log. The current deliverables are the working /fp2 demo, full source dataset archive, reproducible analysis and this presentation. Sources: https://github.com/QinyangTan/minneapolis-snow-emergency-tows/tree/main/datasetsForFP2; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/static/data/summary.json; https://github.com/QinyangTan/minneapolis-snow-emergency-tows/blob/main/deliverables/FP2/analysis-results.json. All calculations use the selected nine-event baseline.
