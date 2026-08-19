// Spatial queries over AIS positions.

const EARTH_RADIUS_KM = 6378.1;
const CENTER = [23.65, 37.94]; // [longitude, latitude]

print("Q2: AIS positions within 5 km of CENTER");

db.ais_dynamic.find({
  geometry: {
    $geoWithin: {
      $centerSphere: [CENTER, 5 / EARTH_RADIUS_KM]
    }
  }
}).limit(20).forEach(printjson);

print("Q3: 10 nearest AIS positions");

db.ais_dynamic.find({
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: CENTER
      }
    }
  }
}).limit(10).forEach(printjson);

print("Nearest 10 positions constrained to 5 km");

db.ais_dynamic.find({
  geometry: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: CENTER
      },
      $maxDistance: 5000
    }
  }
}).limit(10).forEach(printjson);

print("GeoNear example including computed distance");

db.ais_dynamic.aggregate([
  { $geoNear: {
      near: { type: "Point", coordinates: CENTER },
      distanceField: "distance_m",
      maxDistance: 5000,
      spherical: true,
      key: "geometry"
  }},
  { $project: {
      _id: 0,
      vessel_id: 1,
      timestamp: 1,
      speed: 1,
      course: 1,
      heading: 1,
      geometry: 1,
      distance_m: 1
  }},
  { $limit: 10 }
]).forEach(printjson);
