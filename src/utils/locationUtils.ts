import {
  KARNATAKA_DISTRICTS,
  MAJOR_INDIAN_STARTING_CITIES,
} from '../data/karnatakaDistricts';
import { INDIAN_STATES_AND_UTS } from '../data/states';
import type { Destination } from '../types/travel';

export interface LiveLocationResult {
  coordinates: [number, number];
  accuracyMeters?: number;
  label: string;
  nearestDistrictOrCity: string;
  distanceToNearestKm: number;
  source: 'nominatim' | 'nearest-match';
  fetchedAt: string;
}

export interface NearestPlaceMatch {
  label: string;
  name: string;
  distanceKm: number;
  isKarnatakaDistrict: boolean;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Computes great-circle distance in kilometers between two [lat, lng] points.
 */
export function haversineDistanceKm(
  a: [number, number],
  b: [number, number]
): number {
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat + Math.cos(rLat1) * Math.cos(rLat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(6371 * c * 10) / 10;
}

export function formatCoordinatesLabel(coords: [number, number]): string {
  const [lat, lng] = coords;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function findNearestStartingPoint(
  coords: [number, number]
): NearestPlaceMatch {
  let best: NearestPlaceMatch = {
    label: 'Bengaluru Urban (Bengaluru), Karnataka',
    name: 'Bengaluru Urban',
    distanceKm: Number.POSITIVE_INFINITY,
    isKarnatakaDistrict: true,
  };

  for (const dist of KARNATAKA_DISTRICTS) {
    const distanceKm = haversineDistanceKm(coords, dist.coordinates);
    if (distanceKm < best.distanceKm) {
      best = {
        label: dist.originLabel,
        name: dist.name,
        distanceKm,
        isKarnatakaDistrict: true,
      };
    }
  }

  for (const city of MAJOR_INDIAN_STARTING_CITIES) {
    const distanceKm = haversineDistanceKm(coords, city.coordinates);
    if (distanceKm < best.distanceKm) {
      best = {
        label: city.label,
        name: city.label,
        distanceKm,
        isKarnatakaDistrict: false,
      };
    }
  }

  for (const region of INDIAN_STATES_AND_UTS) {
    const distanceKm = haversineDistanceKm(coords, region.coordinates);
    if (distanceKm < best.distanceKm) {
      best = {
        label: `${region.capital}, ${region.name}`,
        name: region.capital,
        distanceKm,
        isKarnatakaDistrict: region.slug === 'karnataka',
      };
    }
  }

  return best;
}

export function buildLocationLabelFromReverseGeocode(
  address: Record<string, string | undefined> | undefined,
  coords: [number, number]
): string {
  if (!address) {
    return findNearestStartingPoint(coords).label;
  }

  const locality =
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.county ||
    address.state_district;
  const state = address.state;

  const cleanLocality = locality?.replace(/\s+district$/i, '').trim();
  const cleanState = state?.trim();

  if (cleanLocality && cleanState) {
    if (cleanLocality.toLowerCase() === cleanState.toLowerCase()) {
      return cleanState;
    }
    return `${cleanLocality}, ${cleanState}`;
  }

  if (cleanLocality) return cleanLocality;
  if (cleanState) return cleanState;

  return findNearestStartingPoint(coords).label;
}

export function sortDestinationsByDistance(
  destinations: Destination[],
  origin: [number, number]
): Array<{ destination: Destination; distanceKm: number }> {
  return destinations
    .map((destination) => ({
      destination,
      distanceKm: haversineDistanceKm(origin, destination.coordinates),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function requestBrowserCoordinates(options?: {
  timeoutMs?: number;
}): Promise<{ coordinates: [number, number]; accuracyMeters?: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(
        new Error(
          'Live location is not supported by this browser. Please select a district or city manually.'
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: [
            Math.round(position.coords.latitude * 100000) / 100000,
            Math.round(position.coords.longitude * 100000) / 100000,
          ],
          accuracyMeters:
            typeof position.coords.accuracy === 'number'
              ? Math.round(position.coords.accuracy)
              : undefined,
        });
      },
      (geoError) => {
        if (geoError.code === 1) {
          reject(
            new Error(
              'Location permission was denied. Enable browser location access or choose a starting district or city.'
            )
          );
        } else if (geoError.code === 3) {
          reject(
            new Error(
              'Location request timed out. Please try again or pick a starting city manually.'
            )
          );
        } else {
          reject(
            new Error(
              'Unable to determine your live GPS position right now. Please select a district or city manually.'
            )
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: options?.timeoutMs ?? 10000,
        maximumAge: 60000,
      }
    );
  });
}
