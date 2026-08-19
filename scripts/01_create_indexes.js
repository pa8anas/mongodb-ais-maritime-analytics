// MongoDB indexes used by the AIS maritime analytics project.
// Run in mongosh after selecting the target database, e.g. `use zenodoDB`.

print("Creating indexes for vessels...");

db.vessels.createIndex({ vessel_id: 1 }, { unique: true, name: "uid_vessel_id" });
db.vessels.createIndex({ country: 1 }, { name: "idx_country" });
db.vessels.createIndex(
  { "shiptype.Type Code": 1 },
  { sparse: true, name: "idx_shiptype_code" }
);
db.vessels.createIndex(
  { country: 1, "shiptype.Type Code": 1 },
  { name: "idx_country_shiptype" }
);
db.vessels.createIndex(
  { name: "text" },
  { name: "text_name", default_language: "none" }
);

print("Creating indexes for ship_types...");
db.ship_types.createIndex(
  { "Type Code": 1 },
  { unique: true, name: "uid_type_code" }
);

print("Creating indexes for ais_dynamic...");
db.ais_dynamic.createIndex({ geometry: "2dsphere" }, { name: "gix_geom" });
db.ais_dynamic.createIndex(
  { vessel_id: 1, timestamp: -1 },
  { name: "idx_vid_time_desc" }
);
db.ais_dynamic.createIndex({ timestamp: -1 }, { name: "idx_time_desc" });

// Optional deduplication constraint. Enable only after verifying that the
// source data do not contain legitimate same-vessel/same-timestamp duplicates.
// db.ais_dynamic.createIndex(
//   { vessel_id: 1, timestamp: 1 },
//   { unique: true, name: "uid_vid_time" }
// );

print("Creating indexes for ais_synopses...");
db.ais_synopses.createIndex({ vessel_id: 1, t: 1 }, { name: "vessel_ts" });
db.ais_synopses.createIndex({ lon: 1, lat: 1, t: 1 }, { name: "bbox_ts" });

print("Creating geospatial/supporting indexes...");
db.harbours.createIndex({ geometry: "2dsphere" }, { name: "geo_2dsphere" });
db.harbours.createIndex(
  { "properties.Port Name": 1 },
  { name: "idx_prop_port_name" }
);
db.harbours.createIndex({ "properties.type": 1 }, { name: "idx_prop_type" });

db.islands.createIndex({ geometry: "2dsphere" }, { name: "geo_2dsphere" });
db.islands.createIndex({ name: 1 }, { sparse: true, name: "idx_name" });

db.spatial_coverage.createIndex(
  { geometry: "2dsphere" },
  { name: "gix_spatial_coverage" }
);

db.territorial_waters.createIndex(
  { "features.geometry": "2dsphere" },
  { name: "geo_2dsphere" }
);

db.regions.createIndex({ geometry: "2dsphere" }, { name: "gix_regions" });
db.regions.createIndex({ name: 1 }, { name: "idx_name" });

db.noaa_weather.createIndex(
  { geometry: "2dsphere" },
  { name: "gix_weather_geom" }
);
db.noaa_weather.createIndex(
  { "properties.timestamp_": 1 },
  { name: "idx_weather_time" }
);

print("Index creation complete.");
