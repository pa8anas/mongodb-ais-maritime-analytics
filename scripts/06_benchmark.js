// Benchmark utilities for the AIS MongoDB project.
// Run in mongosh after selecting `zenodoDB`.

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}

function bench(fn, rounds = 30) {
  const times = [];

  // Warm-up execution, not included in measurements.
  const warmup = fn();
  if (warmup && typeof warmup.toArray === "function") warmup.toArray();

  for (let i = 0; i < rounds; i++) {
    const t0 = Date.now();
    const result = fn();
    if (result && typeof result.toArray === "function") result.toArray();
    times.push(Date.now() - t0);
  }

  times.sort((a, b) => a - b);
  return {
    rounds,
    p50: percentile(times, 0.50),
    p95: percentile(times, 0.95),
    min: times[0],
    max: times[times.length - 1],
    samples: times
  };
}

function executionStatsFind(collection, query, projection = {}, limit = 2000) {
  const stats = collection
    .find(query, projection)
    .limit(limit)
    .explain("executionStats")
    .executionStats;

  return {
    totalDocsExamined: stats.totalDocsExamined,
    totalKeysExamined: stats.totalKeysExamined,
    nReturned: stats.nReturned,
    executionTimeMillis: stats.executionTimeMillis
  };
}

const CENTER = [23.65, 37.94];

const q1 = { country: "Greece", $text: { $search: "AGIOS" } };
const q2 = {
  geometry: {
    $geoWithin: {
      $centerSphere: [CENTER, 5 / 6378.1]
    }
  }
};
const q3 = {
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: CENTER
      }
    }
  }
};

print("Q1 latency");
printjson(bench(() => db.vessels.find(q1, { _id: 0, vessel_id: 1, name: 1 }).limit(2000)));
print("Q1 execution stats");
printjson(executionStatsFind(db.vessels, q1, { _id: 0, vessel_id: 1, name: 1 }, 2000));

print("Q2 latency");
printjson(bench(() => db.ais_dynamic.find(q2).limit(2000)));
print("Q2 execution stats");
printjson(executionStatsFind(db.ais_dynamic, q2, {}, 2000));

print("Q3 latency");
printjson(bench(() => db.ais_dynamic.find(q3).limit(10)));
print("Q3 execution stats");
printjson(executionStatsFind(db.ais_dynamic, q3, {}, 10));

const q4Pipeline = [
  { $geoNear: {
      near: { type: "Point", coordinates: CENTER },
      distanceField: "distance_m",
      maxDistance: 5000,
      spherical: true,
      key: "geometry"
  }},
  { $match: {
      timestamp: {
        $gte: ISODate("2017-05-09T14:00:00Z"),
        $lte: ISODate("2017-05-09T15:00:00Z")
      }
  }},
  { $sort: { timestamp: -1 } },
  { $limit: 2000 }
];

print("Q4 latency");
printjson(bench(() => db.ais_dynamic.aggregate(q4Pipeline, { allowDiskUse: true })));

print("Q4 explain (inspect executionStats/stages in output)");
printjson(db.ais_dynamic.explain("executionStats").aggregate(q4Pipeline, { allowDiskUse: true }));
