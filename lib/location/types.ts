export type LocationSource = 'GPS' | 'Manual' | 'Existing Record';

export interface LocationAddress {
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  capturedAt: string | null;
  locationSource: LocationSource;
}

export const EMPTY_LOCATION: LocationAddress = {
  address: '',
  village: '',
  taluka: '',
  district: '',
  state: '',
  pincode: '',
  latitude: null,
  longitude: null,
  accuracy: null,
  capturedAt: null,
  locationSource: 'Manual',
};

export type GeolocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'OFFLINE'
  | 'UNKNOWN';

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ReverseGeocodeResult {
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
}

export interface NearbyFacilityResult {
  id: string;
  name: string;
  facility_type: string | null;
  address: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  referral_available: boolean;
  distanceKm: number;
}

/** India geographic center — neutral map default, not any specific city */
export const INDIA_MAP_CENTER: [number, number] = [20.5937, 78.9629];
export const INDIA_MAP_ZOOM = 5;
