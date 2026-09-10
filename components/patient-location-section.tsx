'use client';

import { useState } from 'react';
import { MapPin, Navigation, Edit3, Map, X, Loader2 } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { LocationPicker, patientToLocationAddress, locationAddressToPatientFields } from '@/components/location-picker';
import { LocationMap } from '@/components/location-map';
import { updatePatient } from '@/lib/api/doctor';
import type { LocationAddress } from '@/lib/location/types';
import { EMPTY_LOCATION } from '@/lib/location/types';

interface PatientLocationSectionProps {
  patient: Patient;
  onUpdated: () => void;
  /** Whether to show exact coordinates (authorized healthcare workers) */
  showCoordinates?: boolean;
}

export function PatientLocationSection({ patient, onUpdated, showCoordinates = true }: PatientLocationSectionProps) {
  const [editing, setEditing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<LocationAddress>(() => patientToLocationAddress(patient));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasLocation =
    patient.village || patient.district || patient.state || patient.address || patient.pincode;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updatePatient(patient.id, locationAddressToPatientFields(location));
      setEditing(false);
      onUpdated();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setEditing(true);
    setLocation(patientToLocationAddress(patient));
  };

  if (editing) {
    return (
      <div className="card p-6 border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Edit Location
          </h2>
          <button onClick={() => setEditing(false)} className="h-8 w-8 rounded-full bg-slate-100 grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <LocationPicker value={location} onChange={setLocation} compact />

        {error && <p className="mt-3 text-xs font-bold text-rose-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="secondary-btn text-xs py-2">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="primary-btn text-xs py-2">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save Location'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 border-slate-200">
      <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <MapPin className="h-5 w-5 text-blue-600" />
        Location
      </h2>

      {hasLocation ? (
        <dl className="mt-4 space-y-2 text-xs">
          {patient.address && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">Address</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.address}</dd></div>
          )}
          {patient.village && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">Village</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.village}</dd></div>
          )}
          {patient.block && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">Taluka / Block</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.block}</dd></div>
          )}
          {patient.district && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">District</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.district}</dd></div>
          )}
          {patient.state && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">State</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.state}</dd></div>
          )}
          {patient.pincode && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">PIN</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.pincode}</dd></div>
          )}
          {showCoordinates && patient.latitude != null && patient.longitude != null && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">Coordinates</dt><dd className="font-mono font-bold text-slate-600 dark:text-slate-400">{patient.latitude.toFixed(5)}, {patient.longitude.toFixed(5)}</dd></div>
          )}
          {showCoordinates && patient.location_accuracy != null && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">GPS Accuracy</dt><dd className="font-bold text-slate-600 dark:text-slate-400">{Math.round(patient.location_accuracy)} meters</dd></div>
          )}
          {patient.location_source && (
            <div><dt className="text-slate-400 font-bold uppercase text-[10px]">Source</dt><dd className="font-bold text-slate-600">{patient.location_source}</dd></div>
          )}
        </dl>
      ) : (
        <p className="mt-4 text-xs font-semibold text-slate-500">No location recorded. Use GPS or enter address manually.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleUseCurrentLocation} className="secondary-btn text-xs py-2">
          <Navigation className="h-4 w-4" />
          Use current location
        </button>
        <button type="button" onClick={() => { setLocation(patientToLocationAddress(patient)); setEditing(true); }} className="secondary-btn text-xs py-2">
          <Edit3 className="h-4 w-4" />
          Edit location
        </button>
        {patient.latitude != null && patient.longitude != null && (
          <button type="button" onClick={() => setShowMap(!showMap)} className="secondary-btn text-xs py-2">
            <Map className="h-4 w-4" />
            {showMap ? 'Hide map' : 'View on map'}
          </button>
        )}
        {patient.latitude != null && patient.longitude != null && (
          <a className="secondary-btn text-xs py-2" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(patient.latitude)}&mlon=${encodeURIComponent(patient.longitude)}#map=16/${encodeURIComponent(patient.latitude)}/${encodeURIComponent(patient.longitude)}`}>
            Open map service
          </a>
        )}
      </div>

      {showMap && patient.latitude != null && patient.longitude != null && (
        <div className="mt-4">
          <LocationMap
            markers={[{ lat: patient.latitude, lng: patient.longitude, label: patient.name, color: 'blue' }]}
            approximate
            height="240px"
          />
          <p className="mt-2 text-[10px] font-semibold text-slate-400">Approximate location shown for privacy.</p>
        </div>
      )}
    </div>
  );
}
