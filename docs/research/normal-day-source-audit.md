# Independent normal-day towing source audit

Access date: 2026-11-10. Scope: public, official sources for Minneapolis and Saint Paul. Read-only discovery, schema and aggregate queries only; no vehicle identifiers or individual vehicle records were collected.

## Decision

**No verified public daily neighborhood-level normal-day tow archive was found in this bounded search.** This is a discovery result, not proof that the Cities do not hold such records. Do not create a baseline from missing records, vehicle-search inventories, parking citations, annual totals, or the complement of the selected snow-event sample.

The current evidence supports a descriptive snow-event project plus neighborhood context. A true normal-day comparison is conditional on an audited, completed-tow historical export. Saint Paul should remain a separate potential extension; an unverified regional denominator would weaken the Minneapolis analysis.

## Verified source checks

| Source | Direct evidence | Baseline decision |
|---|---|---|
| Minneapolis official ArcGIS service directory | 1,349 services returned. 34 service names contain `tows` or `impound`; all 34 are Snow Emergency services. This name-filter check does not inspect every other service's fields. | No all-date tow archive identified by this check. |
| City-owned ArcGIS catalog | Query `owner:City_of_Minneapolis AND (tow OR towing OR impound)` returned 51 items. The only title without `snow` is `City of Minneapolis Impound Lot`, a Web Map with embedded facility-location layers, not a historical tow table. | Facility locator is not a baseline. |
| Minneapolis public vehicle search | Official instructions require a VIN or license number. The page links to a TowXchange vehicle lookup and discusses current release fees. Page last updated November 12, 2024. | No historical bulk export, complete historical time range, reason-code schema or tow-origin coordinate coverage was verified. Do not enumerate VINs/plates or scrape current inventory. |
| Saint Paul official impound page | Page last edited August 31, 2026. It distinguishes year-round Police Impound and Snow Emergency Impound, links to vehicle lookup, and lists several reasons for towing. | Operational lookup is not evidence of a complete historical archive. No public normal-day dataset schema, historical row count, date range or coordinate coverage was verified. |
| Minneapolis 2024 Traffic & Parking Services report | PDF page 23 reports 2023/2024 public-street tows 32,560/30,549; Snow Emergency tows 1,191/680; street-sweep tows 5,867/6,273. It separately reports private-property tows, releases and auctions. | Useful annual context only. No dates or neighborhoods. Releases are not tow occurrences. Do not divide by 365 or subtract selected event counts to invent normal-day rates. |

Reproducible primary URLs:

- [Minneapolis service directory](https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services?f=json)
- [City-owned ArcGIS catalog query](https://www.arcgis.com/sharing/rest/search?f=json&num=100&q=owner%3ACity_of_Minneapolis%20AND%20%28tow%20OR%20towing%20OR%20impound%29)
- [Impound Lot Web Map metadata](https://www.arcgis.com/sharing/rest/content/items/246d672368454f608a65c03c9451db44?f=json) and [map layers](https://www.arcgis.com/sharing/rest/content/items/246d672368454f608a65c03c9451db44/data?f=json)
- [Minneapolis vehicle-search page](https://www.minneapolismn.gov/getting-around/parking-driving/impound-lot/vehicle-search/)
- [Saint Paul impound page](https://www.stpaul.gov/departments/police/administration-office-chief/support-services-administration/police-impound-lot)
- [2024 Traffic & Parking Services report, page 23](https://www.minneapolismn.gov/media/-www-content-assets/documents/2024-Accomplishments-TPS.pdf#page=23)

## Event layers remain event layers

Two direct schema/count/statistics checks confirm that older published snow-event layers can extend event coverage, but they do not supply ordinary days:

| Official layer | Count | `Call_Taken` minimum–maximum as returned in UTC | Schema observations |
|---|---:|---|---|
| [Bridge 2025](https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Snow_Emergency_Bridge_Tows_2025/FeatureServer/0?f=json) | 852 | 2025-11-30 00:00 – 2025-12-02 00:00 | Point geometry; `Call_Taken`, `Day`, latitude/longitude and neighborhood-related fields. No general tow-reason, intake or release date fields appear in this layer's schema. |
| [Grant 2015](https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/Snow_Emergency_Grant_Tows_2015/FeatureServer/0?f=json) | 1,736 | 2015-12-29 00:00 – 2015-12-31 00:00 | Point geometry; `Call_Taken`, `Location`, `Day`, `X`, `Y`; different schema from Bridge. |

Counts use `/query?f=json&where=1%3D1&returnCountOnly=true`. Dates use `min`/`max` statistics on `Call_Taken`, with `returnGeometry=false`. These values do not establish precise tow-completion times. Field presence does not establish coordinate completeness or historical neighborhood comparability. No coordinate-coverage claim was measured in this independent audit.

A consultant-owned Web Map titled “Minneapolis towing Data ACS Block Groups” was also traced: its only operational layer is an ACS block-group service, not a tow-history service. It is not a new official normal-day towing source. [Map configuration](https://www.arcgis.com/sharing/rest/content/items/7629b8ad54664a3aa41fd3899947589e/data?f=json).

### Unclassified Day 0 rows are not a normal-day baseline

The latest team snapshot audit found 4,238 `Day=0` rows in Ferry 2021 and 5,223 in Oliver 2021. These rows have null origin geometry and null `Call_taken` / `Call_Taken` dates. Their meaning has not been established as ordinary-day completed tows. An unclassified day value is not evidence of a non-emergency date; without an occurrence date and usable origin geography, these rows cannot supply a daily neighborhood baseline. Keep them separate from valid Day 1–3 observations, and report their exclusion explicitly rather than treating them as zero tows or ordinary-day records. These counts come from the parent agent's audit of the latest team snapshots; this follow-up did not repeat the source queries.

## Availability limits and next action

The [2025 accomplishments PDF](https://lims.minneapolismn.gov/Download/Agenda/8674/5908/TrafficandParkingServices-2025Accomplishments.pdf) appeared in search results with annual towing figures, but direct web retrieval returned HTTP 403 during this audit. Those figures were not independently verified from the PDF body here. The legacy Saint Paul Socrata catalog API requests returned HTTP 404; these failed requests are not zero search results and do not prove no dataset exists.

The [Minneapolis public-data request page](https://www.minneapolismn.gov/government/government-data/request-public-data/) (updated September 10, 2026) and [Saint Paul Open Information page](https://www.stpaul.gov/departments/technology-communications/open-information-saint-paul) identify official request routes. No request was submitted. Reuse the team's existing request draft rather than create duplicate requests.

A usable export needs documented tow-occurrence or completion date, timezone, completed/cancelled status, public/private and jurisdiction scope, reason codes, a deduplication key, and origin neighborhood or suitably generalized origin geometry. Intake/release dates must remain separate. Complete observation dates and a complete Snow Emergency calendar are needed before a no-record day can be called zero or a date can be labeled non-emergency. Street sweeping and extended winter restrictions should be identified rather than silently treated as ordinary days.

**Go:** audited snow-event comparisons, annual context clearly labeled as annual, and neighborhood attributes with explicit denominator limits. **Conditional go:** matched non-emergency neighborhood-day baseline after a historical export passes the checks above. **No-go now:** a normal-versus-snow causal claim, estimated individual tow risk, or pooled Minneapolis/Saint Paul rates from the sources verified in this audit.
