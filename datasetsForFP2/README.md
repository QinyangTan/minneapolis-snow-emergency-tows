# FP2 research datasets

This folder contains the complete collected research package: 661 original files, 180 data snapshots and their source metadata, acquisition scripts and validation reports. These are snapshots/layers, not 180 independent sources.

- [Chinese overview](README_ZH.md)
- [Source catalog](catalog/DATASET_CATALOG_ZH.md)
- [Normal towing search and limitations](docs/NORMAL_TOW_SEARCH_RESULT_ZH.md)
- [FP2 implementation plan](docs/FP2_BUILD_PLAN_ZH.md)
- [Integrity and storage manifest](STORAGE_MANIFEST.json)

Five large JSON files are stored losslessly as `.json.gz` to keep individual Git files small. Original catalog paths describe the uncompressed files. The storage manifest maps every original path to its stored path, with both SHA-256 hashes. Run `python verify_storage.py` to verify all stored and decompressed bytes. Run `python verify_storage.py --restore` to additionally restore the five original JSON paths locally (do not commit the restored copies).

Ordinary-day actual towing records with reason codes were not found as a verified complete public export. 311 complaints, crashes, citations and 911 calls are NOT replacement towing records. Citywide annual towing categories are context only. The prototype therefore uses the documented nine-event snow-emergency baseline (5,423 records; 68 unmatched to neighborhoods), keeping expanded historical layers and the separate ten-event reference distinct.

Dates, geography, uncertainty and data coverage differ by source. Read the source metadata before joining datasets. Neighborhood ACS estimates describe 2020-2024, not individual vehicle owners or causal effects. Current transit and parking snapshots do not represent historical availability.
