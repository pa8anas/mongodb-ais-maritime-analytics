// Spatio-temporal AIS queries.

const CENTER = [23.64, 37.94];

print("AIS positions within 2 km and a one-hour time window");

db.ais_dynamic.find({
  timestamp: {
    $gte: ISODate("2017-05-09T14:00:00Z"),
    $lte: ISODate("2017-05-09T15:00:00Z")
  },
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: CENTER
      },
      $maxDistance: 2000
    }
  }
}).limit(20).forEach(printjson);

print("Geo + time aggregation with distance");

db.ais_dynamic.aggregate([
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
], { allowDiskUse: true }).forEach(printjson);

print("Candidate vessel pairs close in space and time");

db.ais_dynamic.aggregate([
  { $geoNear: {
      near: { type: "Point", coordinates: [23.65, 37.94] },
      distanceField: "distance_m",
      maxDistance: 500,
      spherical: true,
      key: "geometry"
  }},
  { $match: {
      timestamp: {
        $gte: ISODate("2017-05-09T15:05:26Z"),
        $lte: ISODate("2017-05-09T15:07:27Z")
      }
  }},
  { $lookup: {
      from: "ais_dynamic",
      let: { ship1: "$vessel_id" },
      pipeline: [
        { $match: {
            timestamp: {
              $gte: ISODate("2017-05-09T15:05:26Z"),
              $lte: ISODate("2017-05-09T15:07:27Z")
            },
            $expr: { $ne: ["$vessel_id", "$$ship1"] }
        }}
      ],
      as: "closeShips"
  }},
  { $limit: 20 }
], { allowDiskUse: true }).forEach(printjson);
