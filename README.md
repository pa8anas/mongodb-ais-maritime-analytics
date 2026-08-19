# MongoDB AIS Maritime Analytics

A portfolio-ready MongoDB project for large-scale maritime analytics using AIS data from the Saronic Gulf, Greece. The project covers document-oriented schema design, GeoJSON modeling, geospatial indexing, relational-style aggregation pipelines, spatio-temporal queries, hashed sharding, and query-performance evaluation.

## Highlights

- Large-scale AIS / maritime mobility data modeled in MongoDB
- GeoJSON `Point`, `Polygon`, and `MultiPolygon` geometries
- `2dsphere` indexes for `$geoWithin`, `$near`, `$geoNear`, and `$geoIntersects`
- Relational-style enrichment with `$lookup` and `$unwind`
- Vessel-centric time-series access with compound indexes
- Hashed sharding by `vessel_id`
- Benchmarking with 30-run p50/p95 wall-clock latency measurements
- Execution-plan analysis with `explain("executionStats")`
- Reproducible scripts, curated sample data, benchmark results, and full academic reports

## Dataset

The project is based on the **Maritime Activity - AIS Dataset for the Saronic Gulf, Greece**, published on Zenodo.

- DOI: `10.5281/zenodo.6323416`
- Study area: Saronic Gulf / Piraeus, Greece
- Data types: AIS trajectories, vessel metadata, geographic layers, trajectory synopses, and weather observations
- The full dataset is intentionally **not redistributed** in this repository because of its size. Small curated samples are provided under [`data/samples`](data/samples/).

## Main collections

| Collection | Purpose |
|---|---|
| `vessels` | Static vessel metadata and embedded ship-type information |
| `ais_dynamic` | Dynamic AIS observations: position, speed, course, heading, timestamp |
| `ais_synopses` | Extracted trajectory events / synopsis records |
| `ship_types` | AIS vessel-type reference dictionary |
| `harbours` | Harbour / marina locations |
| `islands` | Island polygons |
| `piraeus_port` | Piraeus port geometry |
| `regions` | Areas of interest / regional geometries |
| `spatial_coverage` | AIS receiver coverage areas |
| `territorial_waters` | Territorial-water geometries |
| `noaa_weather` | Spatially and temporally referenced weather observations |

## Repository structure

```text
mongodb-ais-maritime-analytics/
├── README.md
├── CITATION.cff
├── Makefile
├── scripts/
│   ├── 01_create_indexes.js
│   ├── 02_relational_queries.js
│   ├── 03_spatial_queries.js
│   ├── 04_spatiotemporal_queries.js
│   ├── 05_sharding.js
│   └── 06_benchmark.js
├── data/
│   └── samples/
│       ├── ais_dynamic_sample.json
│       ├── ais_synopses_sample.json
│       ├── harbours_sample.json
│       ├── noaa_weather_sample.geojson
│       ├── ship_types_sample.json
│       └── vessels_sample.json
├── results/
│   ├── README.md
│   └── benchmark_results.csv
└── report/
    ├── README.md
    ├── mongodb-ais-maritime-analytics-report-en.pdf
    └── mongodb-ais-maritime-analytics-report-gr.pdf
```

## Indexing strategy

The implementation uses indexes aligned with the project workload rather than indexing every field indiscriminately.

```javascript
// Vessel metadata
db.vessels.createIndex({ vessel_id: 1 }, { unique: true, name: "uid_vessel_id" });
db.vessels.createIndex({ country: 1 }, { name: "idx_country" });
db.vessels.createIndex(
  { "shiptype.Type Code": 1 },
  { sparse: true, name: "idx_shiptype_code" }
);
db.vessels.createIndex({ name: "text" }, { name: "text_name", default_language: "none" });

// AIS observations
db.ais_dynamic.createIndex({ geometry: "2dsphere" }, { name: "gix_geom" });
db.ais_dynamic.createIndex(
  { vessel_id: 1, timestamp: -1 },
  { name: "idx_vid_time_desc" }
);
db.ais_dynamic.createIndex({ timestamp: -1 }, { name: "idx_time_desc" });
```

The complete index definitions are in [`scripts/01_create_indexes.js`](scripts/01_create_indexes.js).

## Representative queries

### Vessels within a 5 km radius

```javascript
const center = [23.65, 37.94]; // [longitude, latitude]

db.ais_dynamic.find({
  geometry: {
    $geoWithin: {
      $centerSphere: [center, 5 / 6378.1]
    }
  }
});
```

### Nearest AIS observations

```javascript
db.ais_dynamic.find({
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [23.65, 37.94]
      },
      $maxDistance: 5000
    }
  }
}).limit(10);
```

### Relational-style vessel enrichment

```javascript
db.vessels.aggregate([
  { $match: { country: "Greece" } },
  { $lookup: {
      from: "ship_types",
      localField: "shiptype.Type Code",
      foreignField: "Type Code",
      as: "CodeInfo"
  }},
  { $unwind: "$CodeInfo" },
  { $match: { "CodeInfo.Description": { $regex: "Passenger", $options: "i" } } }
]);
```

## Sharding

`ais_dynamic` was evaluated with a hashed shard key:

```javascript
sh.shardCollection("zenodoDB.ais_dynamic", { vessel_id: "hashed" });
```

The final reported redistribution consisted of **66 chunks** across two data-bearing shards, with a 36/30 chunk split. The measured logical collection size was approximately **1.67 GB** with **5,310,256 documents**. See [`scripts/05_sharding.js`](scripts/05_sharding.js) and the full report for the diagnostics used to inspect chunk and document distribution.

## Performance evaluation

The benchmark harness performs repeated client-side wall-clock measurements and reports p50/p95 latency. MongoDB `executionStats` is used to inspect scanned/returned documents where available.

| Query | Description | p50 (ms) | p95 (ms) | Docs examined | Returned* |
|---|---|---:|---:|---:|---:|
| Q1 | Text + country | 45 | 103 | N/A | N/A |
| Q2 | `$geoWithin` 5 km | 80 | 1,267 | 2,783 | 2,000 |
| Q3 | `$near`, k=10 | 1,734 | 2,055 | 319,519 | 20 |
| Q4 | Geo + time | 2,618 | 3,098 | 1,094,104 | 2,000 |

`*` In a sharded explain plan, shard-level execution work can make `nReturned` differ from the final client-side limit.

The Q1 scan/return values are intentionally reported as `N/A`: placeholder values used while formatting the academic report are not treated as verified measurements.

Raw benchmark values are available in [`results/benchmark_results.csv`](results/benchmark_results.csv).

## Quick start

1. Obtain the source dataset from Zenodo.
2. Import the required collections into MongoDB / MongoDB Atlas.
3. Select the database in `mongosh`:

```javascript
use zenodoDB
```

4. Create indexes:

```javascript
load("scripts/01_create_indexes.js")
```

5. Run the representative queries:

```javascript
load("scripts/02_relational_queries.js")
load("scripts/03_spatial_queries.js")
load("scripts/04_spatiotemporal_queries.js")
```

6. Run the benchmark harness:

```javascript
load("scripts/06_benchmark.js")
```

Sharding operations in `scripts/05_sharding.js` require a sharded deployment and appropriate privileges. Review the target cluster before running any administrative commands.

## Academic reports

- [`report/mongodb-ais-maritime-analytics-report-en.pdf`](report/mongodb-ais-maritime-analytics-report-en.pdf) - English report
- [`report/mongodb-ais-maritime-analytics-report-gr.pdf`](report/mongodb-ais-maritime-analytics-report-gr.pdf) - Greek report

The reports document the data model, indexing strategy, sharding setup, representative query results, experimental methodology, performance measurements, limitations, and future work.

## Reproducibility notes

- GeoJSON coordinate order is `[longitude, latitude]`.
- `$maxDistance` is expressed in meters for GeoJSON proximity queries.
- `$centerSphere` expects the radius in radians; the examples use `radiusKm / 6378.1`.
- Benchmark results depend on cluster tier, cache state, data density, query location, and sharding configuration.
- Sample data are deliberately small and are not a substitute for the original Zenodo dataset.
- Never commit MongoDB connection strings, credentials, certificates, or full raw datasets.

## Technologies

`MongoDB` · `MongoDB Atlas` · `mongosh` · `GeoJSON` · `2dsphere` · `NoSQL` · `Geospatial Analytics` · `AIS` · `Sharding` · `Aggregation Pipelines` · `Query Optimization`

## Authors

- Panagiotis Athanasopoulos
- Marina Nouchou
- Anastasia Achilleos

## Citation

If you use this repository for academic work, see [`CITATION.cff`](CITATION.cff). The underlying dataset should also be cited using its Zenodo DOI: `10.5281/zenodo.6323416`.
