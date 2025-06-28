/**
 * Utility functions for geospatial calculations and clustering
 */

/**
 * Calculate distance between two points in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => (value * Math.PI) / 180;

/**
 * Create clusters from an array of bins based on proximity
 */
export const createClusters = (bins, radius = 0.5) => {
  const clusters = [];
  const processed = new Set();

  bins.forEach((bin) => {
    if (processed.has(bin._id)) return;

    const cluster = {
      center: bin.location.coordinates,
      bins: [bin],
      count: 1
    };

    bins.forEach((otherBin) => {
      if (bin._id === otherBin._id || processed.has(otherBin._id)) return;

      const distance = calculateDistance(
        bin.location.coordinates[1],
        bin.location.coordinates[0],
        otherBin.location.coordinates[1],
        otherBin.location.coordinates[0]
      );

      if (distance <= radius) {
        cluster.bins.push(otherBin);
        cluster.count++;
        processed.add(otherBin._id);
      }
    });

    clusters.push(cluster);
    processed.add(bin._id);
  });

  return clusters;
};

/**
 * Check if a point is within a geofence polygon
 */
export const isPointInGeofence = (point, polygon) => {
  const x = point[1]; // longitude
  const y = point[0]; // latitude
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Calculate optimal route for bin collection
 * Uses a simple nearest neighbor algorithm
 */
export const calculateOptimalRoute = (bins, startPoint) => {
  const unvisited = [...bins];
  const route = [];
  let currentPoint = startPoint;

  while (unvisited.length > 0) {
    let nearestBin = null;
    let minDistance = Infinity;
    let nearestIndex = -1;

    unvisited.forEach((bin, index) => {
      const distance = calculateDistance(
        currentPoint[1],
        currentPoint[0],
        bin.location.coordinates[1],
        bin.location.coordinates[0]
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestBin = bin;
        nearestIndex = index;
      }
    });

    if (nearestBin) {
      route.push(nearestBin);
      currentPoint = nearestBin.location.coordinates;
      unvisited.splice(nearestIndex, 1);
    }
  }

  return route;
}; 