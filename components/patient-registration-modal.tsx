'use client';

import React, { useState } from 'react';
import { createPatientDirectly } from '@/lib/api/doctor';
import { syncEngine } from '@/lib/offline/sync-engine';
import { UserPlus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { LocationPicker, locationAddressToPatientFields, EMPTY_LOCATION } from '@/components/location-picker';
import type { LocationAddress } from '@/lib/location/types';

interface ModalProps {
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

export function PatientRegistrationModal({ onClose, onSuccess }: ModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('female');
  const [location, setLocation] = useState<LocationAddress>({ ...EMPTY_LOCATION });
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || age === '') return;

    setBusy(true);
    setErrorMsg('');
    setSuccessMsg('');

    const allergies = allergiesText.split(',').map(s => s.trim()).filter(Boolean);
    const existingConditions = conditionsText.split(',').map(s => s.trim()).filter(Boolean);
    const currentMedications = medicationsText.split(',').map(s => s.trim()).filter(Boolean);
    const locFields = locationAddressToPatientFields(location);

    try {
      let patient: Patient;
      const payload = {
        name,
        age: Number(age),
        gender,
        village: locFields.village || undefined,
        address: locFields.address || undefined,
        taluka: locFields.block || undefined,
        district: locFields.district || undefined,
        state: locFields.state || undefined,
        pincode: locFields.pincode || undefined,
        latitude: locFields.latitude,
        longitude: locFields.longitude,
        locationSource: locFields.location_source,
        gramPanchayat,
        phone,
        guardianName,
        emergencyContact,
        bloodGroup,
        allergies,
        existingConditions,
        currentMedications
      };

      if (syncEngine.isOnline()) {
        patient = await createPatientDirectly(payload);
      } else {
        patient = await syncEngine.createPatientOffline(payload);
      }

      setSuccessMsg(`Patient ${patient.name} registered successfully!`);
      setTimeout(() => {
        onSuccess(patient);
        onClose();
      }, 600);
    } catch (err: unknown) {
      console.error('Patient registration failed:', err);
      setErrorMsg((err as Error)?.message || 'Unable to save patient to database. Please check your network and permissions.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-bold">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">Register New Patient</h2>
              <p className="text-xs text-slate-500">Comprehensive Rural Health Intake Form</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Patient Full Name *</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sunita Devi"
              className="input mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Age (Years) *</label>
              <input
                required
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 34"
                className="input mt-1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Gender *</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="input mt-1 bg-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="input mt-1 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <LocationPicker value={location} onChange={setLocation} compact />

          <div>
            <label className="block text-xs font-bold text-slate-700">Gram Panchayat</label>
            <input
              type="text"
              value={gramPanchayat}
              onChange={e => setGramPanchayat(e.target.value)}
              placeholder="Gram Panchayat name"
              className="input mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="input mt-1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Emergency Contact Phone</label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                placeholder="Family emergency contact"
                className="input mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Guardian / Family Head Name</label>
            <input
              type="text"
              value={guardianName}
              onChange={e => setGuardianName(e.target.value)}
              placeholder="Guardian's name if applicable"
              className="input mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Existing Conditions</label>
              <input
                type="text"
                value={conditionsText}
                onChange={e => setConditionsText(e.target.value)}
                placeholder="e.g. Diabetes, ANC"
                className="input mt-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Known Allergies</label>
              <input
                type="text"
                value={allergiesText}
                onChange={e => setAllergiesText(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa"
                className="input mt-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Current Medications</label>
              <input
                type="text"
                value={medicationsText}
                onChange={e => setMedicationsText(e.target.value)}
                placeholder="e.g. Metformin, IFA"
                className="input mt-1 text-xs"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="secondary-btn text-xs py-2.5">
              Cancel
            </button>
            <button disabled={busy} type="submit" className="primary-btn text-xs py-2.5">
              {busy ? 'Saving patient…' : 'Save Patient to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
