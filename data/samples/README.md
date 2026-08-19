# Curated sample data

This directory contains **small, representative samples** of the schemas used by the project. The complete AIS dataset is intentionally not stored in GitHub because of its size.

Included samples:

- `vessels_sample.json` - static vessel metadata enriched with AIS type descriptions
- `ship_types_sample.json` - vessel-type reference records
- `ais_dynamic_sample.json` - representative dynamic AIS observations
- `ais_synopses_sample.json` - trajectory synopsis/event records
- `harbours_sample.json` - harbour GeoJSON point example
- `noaa_weather_sample.geojson` - NOAA weather GeoJSON features

The samples are intended for schema inspection, documentation, and lightweight experimentation only. For reproducible large-scale experiments, obtain the original dataset from Zenodo using DOI `10.5281/zenodo.6323416`.

Do not add credentials, connection strings, private infrastructure information, or complete raw datasets to this directory.
