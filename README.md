# MongoDB AIS Maritime Analytics

Design and implementation of a MongoDB database for large-scale AIS maritime data from the Saronic Gulf, Greece. The project focuses on document-oriented schema design, GeoJSON modeling, geospatial indexing, spatial and spatio-temporal queries, sharding strategies, and query-performance evaluation.

## Project goals

- Model heterogeneous maritime data in MongoDB.
- Store AIS positions as GeoJSON `Point` objects.
- Support relational-style queries with `$lookup`.
- Support spatial queries with `$geoWithin`, `$near`, and `$geoNear`.
- Support spatio-temporal filtering using geospatial and timestamp indexes.
- Evaluate indexing and sharding choices with `explain("executionStats")` and repeated wall-clock benchmarks.

## Dataset

The project uses the **Piraeus AIS / Maritime Activity dataset for the Saronic Gulf, Greece**, published on Zenodo:

- DOI: `10.5281/zenodo.6323416`
- Coverage: AIS trajectories and supporting maritime, geographic, and weather data for the Saronic Gulf.
- The full dataset is **not redistributed in this repository** because of its size. Only small examples/samples should be committed.

## Main collections

| Collection | Purpose |
|---|---|
| `vessels` | Static vessel metadata and embedded ship-type information |
| `ais_dynamic` | Dynamic AIS positions, speed, course, heading, timestamp, vessel id |
| `ais_synopses` | Extracted trajectory events / synopsis records |
| `ship_types` | Reference dictionary for AIS vessel type codes |
| `harbours` | Harbour locations represented with GeoJSON |
| `islands` | Island polygons |
| `piraeus_port` | Piraeus port geometry |
| `regions` | Geographic regions / polygons |
| `spatial_coverage` | AIS spatial coverage areas |
| `noaa_weather` | Spatially and temporally referenced weather observations |

## MongoDB features used

- Document embedding and selective normalization
- GeoJSON (`Point`, `Polygon`, `MultiPolygon`)
- `2dsphere` indexes
- Text and scalar indexes
- Compound indexes
- Aggregation pipelines
- `$lookup` / `$unwind`
- `$geoWithin`
- `$near`
- `$geoNear`
- Hashed sharding by `vessel_id`
- `explain("executionStats")`
- p50 / p95 latency benchmarking

## Repository structure

```text
mongodb-ais-maritime-analytics/
├── README.md
├── .gitignore
├── scripts/
│   ├── 01_create_indexes.js
│   ├── 02_relational_queries.js
│   ├── 03_spatial_queries.js
│   ├── 04_spatiotemporal_queries.js
│   ├── 05_sharding.js
│   └── 06_benchmark.js
├── data/
│   └── samples/
├── results/
│   └── benchmark_results.csv
└── report/
    └── README.md
```

## Indexing strategy

Representative indexes used in the project:

```javascript
db.vessels.createIndex({ vessel_id: 1 }, { unique: true, name: "uid_vessel_id" });
db.vessels.createIndex({ country: 1 }, { name: "idx_country" });
db.vessels.createIndex({ "shiptype.Type Code": 1 }, { name: "idx_shiptype_code" });
db.vessels.createIndex({ name: "text" }, { name: "text_name" });

db.ais_dynamic.createIndex({ geometry: "2dsphere" }, { name: "gix_geom" });
db.ais_dynamic.createIndex({ vessel_id: 1, timestamp: 1 }, { name: "idx_vid_time" });
db.ais_dynamic.createIndex(
  { geometry: "2dsphere", timestamp: 1 },
  { name: "idx_geo_time" }
);
```

## Example spatial query

Find AIS positions within a 5 km radius of a point in the Piraeus area:

```javascript
db.ais_dynamic.find({
  geometry: {
    $geoWithin: {
      $centerSphere: [[23.65, 37.94], 5 / 6378.1]
    }
  }
});
```

## Example k-nearest query

```javascript
db.ais_dynamic.find({
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [23.65, 37.94]
      }
    }
  }
}).limit(10);
```

## Performance evaluation

The evaluation uses repeated wall-clock execution and MongoDB execution statistics. Reported benchmark values from the project include:

| Query | Description | p50 (ms) | p95 (ms) | Docs examined | Returned* |
|---|---|---:|---:|---:|---:|
| Q1 | Text + country | 45 | 103 | N/A | N/A |
| Q2 | `$geoWithin` 5 km | 80 | 1267 | 2,783 | 2,000 |
| Q3 | `$near`, k=10 | 1,734 | 2,055 | 319,519 | 20 |
| Q4 | Geo + time | 2,618 | 3,098 | 1,094,104 | 2,000 |

`*` In a sharded explain plan, execution statistics can reflect work performed across shards and therefore may differ from the final client-side limit.

The Q1 scan/return values are intentionally left as `N/A` here because placeholder values used while formatting the report are not treated as experimental measurements.

## Run the scripts

Open `mongosh`, select the target database, and load the scripts in order:

```javascript
use zenodoDB
load("scripts/01_create_indexes.js")
load("scripts/02_relational_queries.js")
load("scripts/03_spatial_queries.js")
load("scripts/04_spatiotemporal_queries.js")
load("scripts/06_benchmark.js")
```

Sharding commands in `scripts/05_sharding.js` require a sharded deployment and appropriate privileges.

## Reproducibility notes

- GeoJSON coordinate order is `[longitude, latitude]`.
- Distances passed to `$maxDistance` are in meters for GeoJSON queries.
- `$centerSphere` expects the radius in radians; this project uses `radiusKm / 6378.1`.
- Benchmark results depend on cluster tier, cache state, data distribution, query location, and sharding configuration.
- Do not commit MongoDB connection strings, usernames, passwords, certificates, or the full dataset.

## Technologies

`MongoDB` · `MongoDB Atlas` · `mongosh` · `GeoJSON` · `2dsphere` · `NoSQL` · `Geospatial Analytics` · `AIS` · `Sharding` · `Query Optimization`

## Academic context

This repository packages an academic Big Data / Analytics project into a reproducible portfolio format. The implementation and report investigate how MongoDB schema design, indexing, geospatial operators, and sharding affect queries over large-scale maritime mobility data.
