// Sharding setup for ais_dynamic.
// Requires a sharded MongoDB deployment and sufficient privileges.
// Review database/collection names before executing.

const DB_NAME = "zenodoDB";
const COLL = `${DB_NAME}.ais_dynamic`;

print(`Enabling sharding for ${DB_NAME}...`);
sh.enableSharding(DB_NAME);

print("Creating hashed shard-key index...");
db.ais_dynamic.createIndex(
  { vessel_id: "hashed" },
  { name: "hs_vessel_id" }
);

print(`Sharding ${COL} by hashed vessel_id...`);
sh.shardCollection(COLL, { vessel_id: "hashed" });

print("Current sharding status:");
sh.status();

// Alternative strategy for vessel-centric range queries:
// 1. Create an index on { vessel_id: 1, timestamp: 1 }
// 2. Evaluate a compound shard key only after measuring workload distribution.
//
// Trade-off:
// - hashed vessel_id: better write/load distribution
// - ordered compound key: potentially better targeted vessel/time range queries,
//   but can introduce hotspotting or balancing trade-offs depending on workload.
