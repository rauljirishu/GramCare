'use client';

import React, { useState, useCallback } from 'react';
import { MapPin, Navigation, Edit3, Loader2, AlertCircle, Search } from 'lucide-react';
import {
  requestCurrentPosition,
  reverseGeocodeClient,
  searchLocationClient,
  getGeolocationErrorMessage,
} from '@/lib/location/geolocation';
import type { LocationAddress, GeolocationErrorCode } from '@/lib/location/types';
import { EMPTY_LOCATION } from '@/lib/location/types';

interface LocationPickerProps {
  value: LocationAddress;
  onChange: (location: LocationAddress) => void;
  /** Show compact layout for modals */
  compact?: boolean;
}

type EntryMode = 'manual' | 'gps';

export function LocationPicker({ value, onChange, compact = false }: LocationPickerProps) {
  const [mode, setMode] = useState<EntryMode>('manual');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsSuccess, setGpsSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ displayName: string; lat: number; lon: number; address: Omit<LocationAddress, 'latitude' | 'longitude' | 'locationSource'> }>
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const updateField = useCallback(
    (field: keyof LocationAddress, fieldValue: string) => {
      onChange({
        ...value,
        [field]: fieldValue,
        locationSource: value.locationSource === 'GPS' && field !== 'latitude' && field !== 'longitude' ? 'GPS' : 'Manual',
      });
    },
    [value, onChange]
  );

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsError('');
    setGpsSuccess('');
    setMode('gps');

    try {
      const pos = await requestCurrentPosition();
      let updated: LocationAddress = {
        ...value,
        latitude: pos.latitude,
        longitude: pos.longitude,
        locationSource: 'GPS',
      };

      const geocode = await reverseGeocodeClient(pos.latitude, pos.longitude);
      if (geocode.ok) {
        updated = {
          ...updated,
          address: geocode.data.address || value.address,
          village: geocode.data.village || value.village,
          taluka: geocode.data.taluka || value.taluka,
          district: geocode.data.district || value.district,
          state: geocode.data.state || value.state,
          pincode: geocode.data.pincode || value.pincode,
        };
        setGpsSuccess(
          `Location detected: ${[geocode.data.village, geocode.data.district, geocode.data.state].filter(Boolean).join(', ') || 'Coordinates captured'}`
        );
      } else {
        setGpsSuccess(`Coordinates captured (${pos.latitude.toFixed(5)}, ${pos.longitude.toFixed(5)}). ${geocode.error}`);
      }

      onChange(updated);
    } catch (err: unknown) {
      const code = (err as { code?: GeolocationErrorCode })?.code || 'UNKNOWN';
      setGpsError(getGeolocationErrorMessage(code));
      setMode('manual');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);

    const result = await searchLocationClient(searchQuery.trim());
    if (result.ok) {
      setSearchResults(result.results);
    }
    setSearchLoading(false);
  };

  const applySearchResult = (result: (typeof searchResults)[0]) => {
    onChange({
      ...value,
      address: result.address.address || value.address,
      village: result.address.village || value.village,
      taluka: result.address.taluka || value.taluka,
      district: result.address.district || value.district,
      state: result.address.state || value.state,
      pincode: result.address.pincode || value.pincode,
      latitude: result.lat,
      longitude: result.lon,
      locationSource: 'Manual',
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-3 ${compact ? '' : 'rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/50'}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-blue-600" />
          Patient Location
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {gpsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
            Use current location
          </button>
          <button
            type="button"
            onClick={() => { setMode('manual'); setGpsError(''); setGpsSuccess(''); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Enter manually
          </button>
        </div>
      </div>

      {gpsLoading && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 text-xs font-semibold text-blue-800 dark:text-blue-200">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          Detecting your location…
        </div>
      )}

      {gpsError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-xs font-semibold text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {gpsError}
        </div>
      )}

      {gpsSuccess && !gpsLoading && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          {gpsSuccess}
        </div>
      )}

      {/* Location search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="Search village, taluka, district, state, or PIN…"
          className="input text-xs flex-1"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searchLoading}
          className="secondary-btn text-xs py-2 px-3 shrink-0"
        >
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto">
          {searchResults.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => applySearchResult(r)}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
              >
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700">Address</label>
          <textarea
            rows={2}
            value={value.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="House number, landmark, street"
            className="input mt-1 text-xs resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Village / City</label>
          <input
            type="text"
            value={value.village}
            onChange={(e) => updateField('village', e.target.value)}
            placeholder="Village or city name"
            className="input mt-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Taluka / Block</label>
          <input
            type="text"
            value={value.taluka}
            onChange={(e) => updateField('taluka', e.target.value)}
            placeholder="Taluka or block"
            className="input mt-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">District</label>
          <input
            type="text"
            value={value.district}
            onChange={(e) => updateField('district', e.target.value)}
            placeholder="District"
            className="input mt-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">State</label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="State"
            className="input mt-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">PIN Code</label>
          <input
            type="text"
            value={value.pincode}
            onChange={(e) => updateField('pincode', e.target.value)}
            placeholder="6-digit PIN"
            maxLength={6}
            pattern="\d{6}"
            className="input mt-1 text-xs"
          />
        </div>
      </div>

      {value.latitude != null && value.longitude != null && (
        <p className="text-[10px] font-semibold text-slate-400">
          Coordinates: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          {value.locationSource && ` · Source: ${value.locationSource}`}
        </p>
      )}
    </div>
  );
}

export function patientToLocationAddress(patient: {
  address?: string | null;
  village?: string | null;
  block?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_source?: string | null;
}): LocationAddress {
  return {
    address: patient.address || '',
    village: patient.village || '',
    taluka: patient.block || '',
    district: patient.district || '',
    state: patient.state || '',
    pincode: patient.pincode || '',
    latitude: patient.latitude ?? null,
    longitude: patient.longitude ?? null,
    locationSource: (patient.location_source as LocationAddress['locationSource']) || 'Manual',
  };
}

export function locationAddressToPatientFields(loc: LocationAddress) {
  return {
    address: loc.address.trim() || null,
    village: loc.village.trim() || null,
    block: loc.taluka.trim() || null,
    district: loc.district.trim() || null,
    state: loc.state.trim() || null,
    pincode: loc.pincode.trim() || null,
    latitude: loc.latitude,
    longitude: loc.longitude,
    location_source: loc.locationSource,
  };
}

export { EMPTY_LOCATION };
