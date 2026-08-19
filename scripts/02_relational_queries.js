// Relational-style queries over vessel metadata.

print("Q1: Greek vessels matching text term AGIOS");

db.vessels.find(
  { country: "Greece", $text: { $search: "AGIOS" } },
  { vessel_id: 1, name: 1, country: 1, _id: 0 }
).limit(20).forEach(printjson);

print("Join vessels with ship_types using exact passenger description");

db.vessels.aggregate([
  { $match: { country: "Greece" } },
  { $lookup: {
      from: "ship_types",
      localField: "shiptype.Type Code",
      foreignField: "Type Code",
      as: "CodeInfo"
  }},
  { $unwind: "$CodeInfo" },
  { $match: {
      "CodeInfo.Description": "Passenger, all ships of this type"
  }},
  { $project: {
      _id: 0,
      vessel_id: 1,
      country: 1,
      shiptype: "$CodeInfo.Description"
  }},
  { $limit: 20 }
]).forEach(printjson);

print("Join vessels with ship_types using case-insensitive regex");

db.vessels.aggregate([
  { $match: { country: "Greece" } },
  { $lookup: {
      from: "ship_types",
      localField: "shiptype.Type Code",
      foreignField: "Type Code",
      as: "CodeInfo"
  }},
  { $unwind: "$CodeInfo" },
  { $match: {
      "CodeInfo.Description": { $regex: "Passenger", $options: "i" }
  }},
  { $project: {
      _id: 0,
      vessel_id: 1,
      country: 1,
      typeCode: "$CodeInfo.Type Code",
      description: "$CodeInfo.Description"
  }},
  { $limit: 20 }
]).forEach(printjson);
