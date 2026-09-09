'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { getAppointments, createAppointment, getPatients, getDoctors, getFacilities } from '@/lib/api/doctor';
import type { Appointment, PatientRow, DoctorUser, Facility } from '@/lib/types';
import { CalendarCheck, Clock, User, Stethoscope, Building2, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [apps, pts, docs, facs] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
        getFacilities()
      ]);
      setAppointments(apps);
      setPatients(pts);
      setDoctors(docs);
      setFacilities(facs);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !appointmentDate || !purpose.trim()) {
      setErrorMsg('Please select a patient, date/time, and appointment purpose.');
      return;
    }

    setBusy(true);
    setErrorMsg('');
    try {
      await createAppointment({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId || undefined,
        facilityId: selectedFacilityId || undefined,
        appointmentDate: new Date(appointmentDate).toISOString(),
        purpose,
        clinicalNotes: notes
      });

      setShowModal(false);
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setSelectedFacilityId('');
      setAppointmentDate('');
      setPurpose('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to schedule appointment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-950/60 px-3.5 py-1.5 text-xs font-black text-violet-800 dark:text-violet-300 border border-violet-300">
              <CalendarCheck className="h-4 w-4 text-violet-600" />
              <span>Clinical Consultation Scheduling</span>
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
              Patient Appointments
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Scheduled specialist visits, follow-up consultations, and emergency referral reviews.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Appointment</span>
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((app) => (
              <div key={app.id} className="card p-5 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {app.patient?.name || 'Patient Record'}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                      Village: {app.patient?.village || 'Rampur'}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold capitalize ${
                    app.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : app.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Clock className="h-4 w-4 text-violet-500 shrink-0" />
                    <span className="font-extrabold">{new Date(app.appointment_date).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Stethoscope className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{app.doctor?.name || 'Specialist Doctor'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{app.facility?.name || 'Community Health Centre'}</span>
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-200/80 dark:border-slate-800">
                    <span className="block font-bold text-[10px] uppercase text-slate-400">Clinical Purpose</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{app.purpose}</p>
                    {app.clinical_notes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">{app.clinical_notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-violet-700 font-bold">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Schedule Appointment</h2>
                    <p className="text-xs text-slate-500">Connect Patient with Specialist Doctor</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateAppointment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Select Patient *</label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className="input mt-1 bg-white"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.village || 'Village'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Select Doctor</label>
                    <select
                      value={selectedDoctorId}
                      onChange={e => setSelectedDoctorId(e.target.value)}
                      className="input mt-1 bg-white"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Select Facility</label>
                    <select
                      value={selectedFacilityId}
                      onChange={e => setSelectedFacilityId(e.target.value)}
                      className="input mt-1 bg-white"
                    >
                      <option value="">-- Choose Facility --</option>
                      {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Appointment Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Clinical Purpose *</label>
                  <input
                    required
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Glycemic Evaluation, ANC Doppler Check"
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special instructions for patient or ASHA worker"
                    className="input mt-1 resize-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="secondary-btn text-xs py-2.5">
                    Cancel
                  </button>
                  <button disabled={busy} type="submit" className="primary-btn text-xs py-2.5">
                    {busy ? 'Scheduling…' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
