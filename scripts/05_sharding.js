// Sharding setup and diagnostics for zenodoDB.ais_dynamic.
// Requires a sharded MongoDB deployment and sufficient privileges.
// Review the target environment before executing administrative commands.

const DB_NAME = "zenodoDB";
const COLL_NAME = "ais_dynamic";
const NS = `${DB_NAME}.${COLL_NAME}`;

print(`Enabling sharding for ${DB_NAME}...`);
sh.enableSharding(DB_NAME);

use(DB_NAME);

print("Creating hashed shard-key index...");
db.ais_dynamic.createIndex(
  { vessel_id: "hashed" },
  { name: "vessel_id_hashed" }
);

print(`Sharding ${NS} by hashed vessel_id...`);
sh.shardCollection(NS, { vessel_id: "hashed" });

print("Ensuring supporting query indexes exist...");
db.ais_dynamic.createIndex({ geometry: "2dsphere" }, { name: "gix_geom" });
db.ais_dynamic.createIndex(
  { vessel_id: 1, timestamp: -1 },
  { name: "idx_vid_time_desc" }
);
db.ais_dynamic.createIndex({ timestamp: -1 }, { name: "idx_time_desc" });

print("Current sharding status:");
sh.status();

print("Chunk distribution for ais_dynamic:");
const cfg = db.getSiblingDB("config");
const coll = cfg.collections.findOne({ _id: NS }, { uuid: 1 });

if (coll && coll.uuid) {
  printjson(
    cfg.chunks.aggregate([
      { $match: { uuid: coll.uuid } },
      { $group: { _id: "$shard", chunks: { $sum: 1 } } },
      { $sort: { chunks: -1 } }
    ]).toArray()
  );
} else {
  print("Collection metadata / UUID not found in config.collections.");
}

print("Collection statistics by shard:");
const stats = db.getSiblingDB(DB_NAME)[COLL_NAME].stats({ scale: 1024 * 1024 });
print(`TOTAL sizeMB=${stats.size} count=${stats.count}`);

if (stats.shards) {
  Object.entries(stats.shards).forEach(([shard, s]) => {
    print(
      `${shard} sizeMB=${Number(s.size).toFixed(2)} ` +
      `count=${s.count} avgObjSizeB=${Math.round(s.avgObjSize || 0)}`
    );
  });
}

// Alternative strategy to evaluate for vessel/time dominated workloads:
// { vessel_id: 1, timestamp: 1 }
//
// Trade-off:
// - hashed vessel_id: more uniform write/load distribution
// - ordered compound key: more targeted vessel/time range queries, but potentially
//   less even distribution depending on the workload.
