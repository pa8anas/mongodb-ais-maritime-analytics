# Sample data

This directory is reserved for **small, curated examples only**.

The complete AIS dataset is intentionally not stored in this repository because it is very large. Use the Zenodo source referenced in the project README to obtain the original data.

Recommended sample files:

- `vessels_sample.json`
- `ais_dynamic_sample.json`
- `ais_synopses_sample.json`
- `harbours_sample.json`
- `noaa_weather_sample.json`

When adding examples:

1. Keep only a handful of representative documents.
2. Preserve the MongoDB/GeoJSON schema used by the project.
3. Do not include credentials, connection strings, or private infrastructure details.
4. Prefer MongoDB Extended JSON when values such as `ObjectId` or `Date` need to be preserved.
