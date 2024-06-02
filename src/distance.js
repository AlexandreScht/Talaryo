function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0; // Radius of the Earth in km

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Compute differences
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in km
  const distance = R * c;

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Example usage
const lat1 = 48.5183; // Paris coordinates
const lon1 = 2.0534;
const lat2 = 48.532; // London coordinates
const lon2 = 1.9924;

const distance = haversineDistance(lat1, lon1, lat2, lon2);
console.log(`The distance between Paris and London is ${distance.toFixed(2)} km.`);
