import type { GeolocationErrorCode, GeolocationResult } from './types';

export function mapGeolocationError(error: GeolocationPositionError): GeolocationErrorCode {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'PERMISSION_DENIED';
    case error.POSITION_UNAVAILABLE:
      return 'POSITION_UNAVAILABLE';
    case error.TIMEOUT:
      return 'TIMEOUT';
    default:
      return 'UNKNOWN';
  }
}

export function getGeolocationErrorMessage(code: GeolocationErrorCode): string {
  switch (code) {
    case 'PERMISSION_DENIED':
      return 'Location permission was denied. You can enter the address manually.';
    case 'POSITION_UNAVAILABLE':
      return 'Unable to detect your location. Please enter the address manually.';
    case 'TIMEOUT':
      return 'Location detection timed out. Please try again or enter the address manually.';
    case 'OFFLINE':
      return 'You are offline. GPS coordinates will be saved locally and synced when connection returns.';
    default:
      return 'Unable to detect your location. Please enter the address manually.';
  }
}

export function requestCurrentPosition(timeoutMs = 15000): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({ code: 'POSITION_UNAVAILABLE' as GeolocationErrorCode });
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      reject({ code: 'OFFLINE' as GeolocationErrorCode });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject({ code: mapGeolocationError(error) });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000,
      }
    );
  });
}

export async function reverseGeocodeClient(
  latitude: number,
  longitude: number
): Promise<{ ok: true; data: import('./types').ReverseGeocodeResult } | { ok: false; error: string }> {
  try {
    const res = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.error || 'Reverse geocoding unavailable. Please enter address manually.' };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Reverse geocoding unavailable. Please enter address manually.' };
  }
}

export async function searchLocationClient(
  query: string
): Promise<{ ok: true; results: Array<{ displayName: string; lat: number; lon: number; address: import('./types').ReverseGeocodeResult }> } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      return { ok: false, error: 'Location search unavailable.' };
    }
    const data = await res.json();
    return { ok: true, results: data.results || [] };
  } catch {
    return { ok: false, error: 'Location search unavailable.' };
  }
}
