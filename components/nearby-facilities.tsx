'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Navigation, Loader2 } from 'lucide-react';
import { getNearbyFacilities } from '@/lib/api/doctor';
import { formatDistance } from '@/lib/location/distance';
import type { NearbyFacilityResult } from '@/lib/location/types';

interface NearbyFacilitiesProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelect?: (facility: NearbyFacilityResult) => void;
  selectedFacilityId?: string | null;
  maxResults?: number;
}

export function NearbyFacilities({
  latitude,
  longitude,
  onSelect,
  selectedFacilityId,
  maxResults = 10,
}: NearbyFacilitiesProps) {
  const [facilities, setFacilities] = useState<NearbyFacilityResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setFacilities([]);
      return;
    }

    setLoading(true);
    getNearbyFacilities(latitude, longitude, maxResults)
      .then(setFacilities)
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  }, [latitude, longitude, maxResults]);

  if (latitude == null || longitude == null) {
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-xs font-semibold text-slate-500">
        Set patient location coordinates to find nearby healthcare facilities.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 p-4 text-xs font-semibold text-blue-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Finding nearby healthcare facilities…
      </div>
    );
  }

  if (!facilities.length) {
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-xs font-semibold text-slate-500">
        No facilities with verified location data found nearby. Enter destination manually.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Navigation className="h-4 w-4 text-emerald-600" />
        Nearby Healthcare Facilities
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {facilities.map((fac) => (
          <button
            key={fac.id}
            type="button"
            onClick={() => onSelect?.(fac)}
            className={`w-full text-left rounded-xl border p-3 transition ${
              selectedFacilityId === fac.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-200'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100">{fac.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{fac.facility_type || 'Healthcare Facility'}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 shrink-0">
                {formatDistance(fac.distanceKm)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              <MapPin className="h-3 w-3" />
              {[fac.village, fac.district, fac.state].filter(Boolean).join(', ') || fac.address || 'Address not available'}
            </div>
            {fac.referral_available && (
              <span className="mt-1.5 inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                Referral available
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
