// MongoDB indexes used by the AIS maritime analytics project.
// Run in mongosh after selecting the target database, e.g. `use zenodoDB`.

print("Creating indexes for vessels...");

db.vessels.createIndex(
  { vessel_id: 1 },
  { unique: true, name: "uid_vessel_id" }
);

db.vessels.createIndex(
  { country: 1 },
  { name: "idx_country" }
);

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

print("Creating indexes for ais_dynamic...");

db.ais_dynamic.createIndex(
  { geometry: "2dsphere" },
  { name: "gix_geom" }
);

db.ais_dynamic.createIndex(
  { vessel_id: 1, timestamp: 1 },
  { name: "idx_vid_time" }
);

db.ais_dynamic.createIndex(
  { timestamp: -1 },
  { name: "idx_time_desc" }
);

db.ais_dynamic.createIndex(
  { geometry: "2dsphere", timestamp: 1 },
  { name: "idx_geo_time" }
);

print("Creating indexes for supporting collections...");

db.ais_synopses.createIndex(
  { vessel_id: 1, t: 1 },
  { name: "idx_vid_t" }
);

db.ship_types.createIndex(
  { "Type Code": 1 },
  { name: "idx_type_code" }
);

db.harbours.createIndex(
  { geometry: "2dsphere" },
  { name: "gix_harbours" }
);

db.islands.createIndex(
  { geometry: "2dsphere" },
  { name: "gix_islands" }
);

db.noaa_weather.createIndex(
  { geometry: "2dsphere" },
  { name: "gix_weather_geom" }
);

db.noaa_weather.createIndex(
  { "properties.timestamp_": 1 },
  { name: "idx_weather_time" }
);

print("Index creation complete.");
