/**
 * Geolocation & Reverse Geocoding Utility
 * Enforces mandatory GPS check-in and resolves coordinates to named localities like "Goregaon East, Mumbai"
 */

export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  locality: string;
  subLocality: string;
  city: string;
  isSimulated?: boolean;
}

// Common Mumbai & Major Hub landmarks for instant, ultra-reliable fallback reverse geocoding
const KNOWN_LOCALITY_BOUNDS: Array<{
  name: string;
  sub: string;
  city: string;
  lat: number;
  lon: number;
  radiusKm: number;
}> = [
  {
    name: 'Goregaon East, Mumbai',
    sub: 'Nesco IT Park / Western Express Hwy',
    city: 'Mumbai',
    lat: 19.1663,
    lon: 72.8526,
    radiusKm: 3.5,
  },
  {
    name: 'Goregaon West, Mumbai',
    sub: 'Link Road Commercial Zone',
    city: 'Mumbai',
    lat: 19.1624,
    lon: 72.8427,
    radiusKm: 3.0,
  },
  {
    name: 'Andheri East, Mumbai',
    sub: 'MIDC / SEEPZ Industrial Area',
    city: 'Mumbai',
    lat: 19.1136,
    lon: 72.8697,
    radiusKm: 3.5,
  },
  {
    name: 'Bandra Kurla Complex (BKC), Mumbai',
    sub: 'G-Block Financial District',
    city: 'Mumbai',
    lat: 19.0664,
    lon: 72.8677,
    radiusKm: 2.5,
  },
  {
    name: 'Powai, Mumbai',
    sub: 'Hiranandani Business Park',
    city: 'Mumbai',
    lat: 19.1197,
    lon: 72.9051,
    radiusKm: 3.0,
  },
  {
    name: 'Lower Parel, Mumbai',
    sub: 'One World Center / Senapati Bapat Marg',
    city: 'Mumbai',
    lat: 18.9953,
    lon: 72.8288,
    radiusKm: 2.5,
  },
  {
    name: 'Malad West, Mumbai',
    sub: 'Mindspace Tech Park',
    city: 'Mumbai',
    lat: 19.1864,
    lon: 72.8347,
    radiusKm: 3.0,
  },
  {
    name: 'Nariman Point, Mumbai',
    sub: 'Mittal Chambers / Marine Drive',
    city: 'Mumbai',
    lat: 18.9256,
    lon: 72.8242,
    radiusKm: 2.0,
  },
  {
    name: 'Thane West, MMR',
    sub: 'Wagle Industrial Estate',
    city: 'Thane',
    lat: 19.1963,
    lon: 72.9567,
    radiusKm: 4.0,
  },
  {
    name: 'Viman Nagar, Pune',
    sub: 'Phoenix Market City Corporate Wing',
    city: 'Pune',
    lat: 18.5679,
    lon: 73.9143,
    radiusKm: 3.5,
  },
  {
    name: 'Whitefield, Bengaluru',
    sub: 'ITPL Tech Park',
    city: 'Bengaluru',
    lat: 12.9698,
    lon: 77.7500,
    radiusKm: 4.0,
  },
  {
    name: 'Cyber City, Gurugram',
    sub: 'DLF Cyber Hub / Phase 2',
    city: 'Gurugram',
    lat: 28.4907,
    lon: 77.0894,
    radiusKm: 3.5,
  },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Memory cache for reverse geocode calls
const geocodeCache = new Map<string, { locality: string; subLocality: string; city: string }>();

/**
 * Reverse geocode latitude and longitude to human-readable locality
 * e.g., "Goregaon East, Mumbai"
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ locality: string; subLocality: string; city: string }> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 1. Check known landmark bounds first for highest accuracy
  for (const hub of KNOWN_LOCALITY_BOUNDS) {
    const dist = calculateDistanceKm(lat, lon, hub.lat, hub.lon);
    if (dist <= hub.radiusKm) {
      const result = {
        locality: hub.name,
        subLocality: hub.sub,
        city: hub.city,
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  }

  // 2. Query OpenStreetMap Nominatim reverse geocoder
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.commercial || addr.district || '';
      const city = addr.city || addr.town || addr.state_district || addr.state || 'Mumbai';
      const road = addr.road || addr.industrial || addr.commercial || '';

      let locality = suburb ? `${suburb}, ${city}` : (data.display_name?.split(',').slice(0, 2).join(',') || `Area near ${city}`);
      let subLocality = road ? `${road}` : 'Field GPS Location';

      const result = {
        locality,
        subLocality,
        city,
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // network timeout or offline
  }

  // 3. Fallback to nearest hub or coordinate description
  let closestHub = KNOWN_LOCALITY_BOUNDS[0]; // default Goregaon East
  let minDist = calculateDistanceKm(lat, lon, closestHub.lat, closestHub.lon);

  for (let i = 1; i < KNOWN_LOCALITY_BOUNDS.length; i++) {
    const d = calculateDistanceKm(lat, lon, KNOWN_LOCALITY_BOUNDS[i].lat, KNOWN_LOCALITY_BOUNDS[i].lon);
    if (d < minDist) {
      minDist = d;
      closestHub = KNOWN_LOCALITY_BOUNDS[i];
    }
  }

  if (minDist <= 15) {
    const res = {
      locality: closestHub.name,
      subLocality: closestHub.sub,
      city: closestHub.city,
    };
    geocodeCache.set(cacheKey, res);
    return res;
  }

  const fallback = {
    locality: `Locality at ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
    subLocality: 'Field GPS Verified Checkpoint',
    city: 'Field Area',
  };
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

export interface GeolocationState {
  isChecking: boolean;
  hasPermission: boolean | null; // null = untouched, true = granted, false = denied
  location: GeoLocationResult | null;
  errorMessage: string | null;
}

/**
 * Request real browser GPS position
 */
export function requestDeviceLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or environment.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve(pos.coords);
      },
      (err) => {
        let msg = 'Failed to retrieve GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Mandatory GPS location must be enabled to log field visits.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable. Please verify GPS or network settings.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try refreshing GPS.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Pre-defined field hubs to support testing in environments where hardware GPS is simulated or mockable
 */
export const FIELD_TEST_LOCATIONS = KNOWN_LOCALITY_BOUNDS.map((k) => ({
  id: k.name,
  label: k.name,
  subLocality: k.sub,
  city: k.city,
  latitude: k.lat,
  longitude: k.lon,
  accuracy: 12,
}));
