'use client';

import React, { useEffect, useState } from 'react';
import { createPatientDirectly, updatePatient } from '@/lib/api/doctor';
import { syncEngine } from '@/lib/offline/sync-engine';
import { UserPlus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { LocationPicker, locationAddressToPatientFields, patientToLocationAddress, EMPTY_LOCATION } from '@/components/location-picker';
import type { LocationAddress } from '@/lib/location/types';

interface ModalProps {
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  patient?: Patient;
}

export function PatientRegistrationModal({ onClose, onSuccess, patient }: ModalProps) {
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
  const [assignedWorker, setAssignedWorker] = useState('');
  const [phc, setPhc] = useState('');
  const [lastVisitDate, setLastVisitDate] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [referralStatus, setReferralStatus] = useState('none');
  const [referredHospital, setReferredHospital] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [riskLevel, setRiskLevel] = useState<Patient['risk_level']>('low');
  const [riskScore, setRiskScore] = useState<number | ''>('');

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!patient) return;
    setName(patient.name);
    setAge(patient.age);
    setGender(patient.gender);
    setLocation(patientToLocationAddress(patient));
    setPhone(patient.phone || '');
    setGuardianName(patient.guardian_name || '');
    setEmergencyContact(patient.emergency_contact || '');
    setBloodGroup(patient.blood_group || 'O+');
    setConditionsText((patient.existing_conditions || []).join(', '));
    setAllergiesText((patient.allergies || []).join(', '));
    setMedicationsText((patient.current_medications || []).join(', '));
    setAssignedWorker(patient.assigned_worker || '');
    setPhc(patient.phc_assigned || '');
    setLastVisitDate(patient.last_visit_date || '');
    setNextFollowUpDate(patient.next_follow_up_date || '');
    setReferralStatus(patient.referral_status || 'none');
    setReferredHospital(patient.referred_hospital || '');
    setSymptoms(patient.symptoms || '');
    setNotes(patient.notes || '');
    setRiskLevel(patient.risk_level || 'low');
    setRiskScore(patient.risk_score ?? '');
  }, [patient]);

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
      let savedPatient: Patient;
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
        locationAccuracy: location.accuracy,
        locationCapturedAt: location.capturedAt,
        locationSource: locFields.location_source,
        gramPanchayat,
        phone,
        guardianName,
        emergencyContact,
        bloodGroup,
        allergies,
        existingConditions,
        currentMedications,
        assignedWorker,
        phcAssigned: phc,
        lastVisitDate,
        nextFollowUpDate,
        referralStatus,
        referredHospital,
        symptoms,
        notes
        ,riskLevel: riskLevel ?? undefined
        ,riskScore: riskScore === '' ? undefined : Number(riskScore)
      };

      if (patient) {
        if (patient.id.startsWith('loc_')) throw new Error('Offline records can be edited after they sync.');
        savedPatient = await updatePatient(patient.id, {
          name: payload.name,
          age: payload.age,
          gender: payload.gender,
          ...locFields,
          location_accuracy: payload.locationAccuracy,
          location_captured_at: payload.locationCapturedAt,
          phone: payload.phone,
          guardian_name: payload.guardianName,
          emergency_contact: payload.emergencyContact,
          blood_group: payload.bloodGroup,
          allergies: payload.allergies,
          existing_conditions: payload.existingConditions,
          current_medications: payload.currentMedications,
          assigned_worker: payload.assignedWorker,
          phc_assigned: payload.phcAssigned,
          last_visit_date: payload.lastVisitDate,
          next_follow_up_date: payload.nextFollowUpDate,
          referral_status: payload.referralStatus as Patient['referral_status'],
          referred_hospital: payload.referredHospital,
          symptoms: payload.symptoms,
          notes: payload.notes,
          risk_level: payload.riskLevel,
          risk_score: payload.riskScore,
        });
      } else if (syncEngine.isOnline()) {
        savedPatient = await createPatientDirectly(payload);
      } else {
        savedPatient = await syncEngine.createPatientOffline(payload);
      }

      setSuccessMsg(`Patient ${savedPatient.name} ${patient ? 'saved' : 'registered'} successfully.`);
      setTimeout(() => {
        onSuccess(savedPatient);
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
              <h2 className="text-xl font-black text-slate-900">{patient ? 'Edit Patient Record' : 'Register New Patient'}</h2>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <label className="block text-xs font-bold text-slate-700">Assigned ASHA / ANM
              <input value={assignedWorker} onChange={e => setAssignedWorker(e.target.value)} className="input mt-1" placeholder="Worker name and role" />
            </label>
            <label className="block text-xs font-bold text-slate-700">PHC / Facility
              <input value={phc} onChange={e => setPhc(e.target.value)} className="input mt-1" placeholder="Assigned PHC" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Last Visit Date
              <input type="date" value={lastVisitDate} onChange={e => setLastVisitDate(e.target.value)} className="input mt-1" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Next Follow-up Date
              <input type="date" value={nextFollowUpDate} onChange={e => setNextFollowUpDate(e.target.value)} className="input mt-1" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Referral Status
              <select value={referralStatus} onChange={e => setReferralStatus(e.target.value)} className="input mt-1 bg-white">
                <option value="none">No referral</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="completed">Completed</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">Referred Hospital
              <input value={referredHospital} onChange={e => setReferredHospital(e.target.value)} className="input mt-1" placeholder="Hospital name" />
            </label>
            <label className="block text-xs font-bold text-slate-700 sm:col-span-2">Symptoms
              <input value={symptoms} onChange={e => setSymptoms(e.target.value)} className="input mt-1" placeholder="Current symptoms" />
            </label>
            <label className="block text-xs font-bold text-slate-700 sm:col-span-2">Notes
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input mt-1 resize-none" placeholder="Care notes" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Risk Level
              <select value={riskLevel || 'low'} onChange={e => setRiskLevel(e.target.value as Patient['risk_level'])} className="input mt-1 bg-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
            </label>
            <label className="block text-xs font-bold text-slate-700">Risk Score (0-100)
              <input type="number" min={0} max={100} value={riskScore} onChange={e => setRiskScore(e.target.value ? Number(e.target.value) : '')} className="input mt-1" placeholder="Optional" />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="secondary-btn text-xs py-2.5">
              Cancel
            </button>
            <button disabled={busy} type="submit" className="primary-btn text-xs py-2.5">
              {busy ? 'Saving patient…' : patient ? 'Save Patient Changes' : 'Save Patient to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
