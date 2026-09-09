'use client';

import React, { useState } from 'react';
import { syncEngine } from '@/lib/offline/sync-engine';
import { UserPlus, X } from 'lucide-react';
import type { Patient } from '@/lib/types';

interface ModalProps {
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

export function PatientRegistrationModal({ onClose, onSuccess }: ModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('female');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || age === '') return;

    setBusy(true);
    try {
      const patient = await syncEngine.createPatientOffline({
        name,
        age: Number(age),
        gender,
        village,
        address,
        phone,
        guardianName
      });

      onSuccess(patient);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-bold">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">Register New Patient</h2>
              <p className="text-xs text-slate-500">Offline & Online Patient Intake Form</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Patient Full Name *</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="input mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Age (Years) *</label>
              <input
                required
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 45"
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Village / Gram Panchayat</label>
              <input
                type="text"
                value={village}
                onChange={e => setVillage(e.target.value)}
                placeholder="e.g. Rampur"
                className="input mt-1"
              />
            </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700">Full Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="House number, landmark, street"
              className="input mt-1 resize-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="secondary-btn text-xs py-2.5">
              Cancel
            </button>
            <button disabled={busy} type="submit" className="primary-btn text-xs py-2.5">
              {busy ? 'Saving patient…' : 'Save Patient (Offline Ready)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
