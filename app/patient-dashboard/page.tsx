'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  HeartPulse, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  UserCheck, 
  Plus, 
  FileText,
  X,
  Tv,
  Stethoscope
} from 'lucide-react';

type Appointment = {
  id: string;
  appointment_date: string;
  purpose: string;
  status: string;
  clinical_notes: string | null;
  facility?: { name: string; phone?: string | null } | null;
};

export default function PatientDashboard() {
  const { t } = useTranslation();
  const [patientRecord, setPatientRecord] = useState<any>(null);
  const [phcFacility, setPhcFacility] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentPurpose, setAppointmentPurpose] = useState('General PHC Wellness Checkup');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadPatientData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get linked patient account
    const { data: account } = await supabase
      .from('patient_accounts')
      .select('patient_id, patients(*, facilities(*))')
      .eq('user_id', user.id)
      .single();

    const rawPatient: any = Array.isArray(account?.patients) ? account.patients[0] : account?.patients;
    if (rawPatient) {
      setPatientRecord(rawPatient);
      const rawFac = Array.isArray(rawPatient.facilities) ? rawPatient.facilities[0] : rawPatient.facilities;
      if (rawFac) setPhcFacility(rawFac);
    } else {
      // Fallback demo patient query
      const { data: demoPatient } = await supabase
        .from('patients')
        .select('*, facilities(*)')
        .eq('is_demo', true)
        .single();

      if (demoPatient) {
        setPatientRecord(demoPatient);
        const rawFac: any = Array.isArray(demoPatient.facilities) ? demoPatient.facilities[0] : demoPatient.facilities;
        if (rawFac) setPhcFacility(rawFac);
      }
    }

    // Default Demo PHC Facility details if missing
    if (!phcFacility) {
      const { data: fac } = await supabase.from('facilities').select('*').limit(1).single();
      if (fac) setPhcFacility(fac);
    }

    // Load appointments
    const { data: appts } = await supabase
      .from('appointments')
      .select('id,appointment_date,purpose,status,clinical_notes,facilities(name)')
      .order('appointment_date', { ascending: true });

    if (appts) setAppointments(appts as unknown as Appointment[]);
  }

  useEffect(() => { loadPatientData(); }, []);

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!appointmentDate) { setMessage('Please select a valid date for your appointment.'); return; }
    setBusy(true); setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('appointments').insert({
      patient_id: patientRecord?.id || 'd0000000-0000-0000-0000-000000000002',
      facility_id: phcFacility?.id || null,
      appointment_date: appointmentDate,
      purpose: appointmentPurpose,
      clinical_notes: notes.trim() || 'Patient self-scheduled visit',
      status: 'scheduled'
    });

    setBusy(false);
    if (error) {
      setMessage(`Unable to book appointment: ${error.message}`);
      return;
    }

    setAppointmentDate(''); setNotes(''); setShowAppointmentModal(false);
    setMessage('Appointment request submitted successfully to your PHC.');
    loadPatientData();
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Patient Welcome Header */}
        <section className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-purple-200 backdrop-blur">
                <UserCheck className="h-4 w-4 text-purple-300" /> TIER 4 — PERSONAL PATIENT HEALTH PORTAL
              </div>
              <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
                Welcome, {patientRecord?.name || 'Patient'}
              </h1>
              <p className="mt-2 text-sm text-purple-100 max-w-2xl leading-relaxed">
                View your verified health record, check assigned PHC location & doctor contacts, book clinical appointments, and watch animated guidance videos.
              </p>
            </div>
            <button onClick={() => setShowAppointmentModal(true)} className="primary-btn bg-purple-500 hover:bg-purple-600 text-white font-black">
              <Plus className="h-4 w-4" /> Book PHC Appointment
            </button>
          </div>
        </section>

        {message && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{message}</div>}

        {/* 3 Main Patient Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: My Health Record */}
          <Link href={patientRecord ? `/patients/${patientRecord.patient_code || 'GS-DEMO-001'}` : '#'} className="group card p-6 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900">My Verified Health Record</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {patientRecord ? `${patientRecord.patient_code} · ${patientRecord.age} yrs · ${patientRecord.blood_group || 'B+'}` : 'View your clinical timeline, BP vitals, and test history.'}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-4">
              View History Timeline →
            </span>
          </Link>

          {/* Card 2: Cartoon Guidance Videos */}
          <Link href="/health-education" className="group card p-6 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Tv className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900">Cartoon Guidance Videos</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Watch fun animated health stories with ASHA Didi on nutrition, pregnancy & hygiene.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-4">
              Watch Animated Stories →
            </span>
          </Link>

          {/* Card 3: Nearby Care & Map */}
          <Link href="/map" className="group card p-6 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900">Nearby Care & Hospitals</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Find PHCs, hospitals, emergency care centers, and health camps nearby.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-4">
              Find Nearby PHCs →
            </span>
          </Link>
        </div>

        {/* Assigned PHC Location, Name & Contact Section */}
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">My Assigned Primary Health Centre (PHC)</h2>
              <p className="text-xs text-slate-500">Location, facility details, and direct contact numbers.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Facility Name</p>
              <p className="mt-1 text-sm font-black text-slate-900">{phcFacility?.name || 'Demo Primary Health Centre'}</p>
              <p className="text-xs text-slate-500">{phcFacility?.code || 'PHC-DEMO-001'}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location Address</p>
              <p className="mt-1 text-xs font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-rose-600" /> {phcFacility?.address || 'Main Road, Demo Village'}
              </p>
              <p className="text-xs text-slate-500">{phcFacility?.district || 'Demo Area District'}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medical Officer in Charge</p>
              <p className="mt-1 text-xs font-bold text-slate-800 flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5 text-blue-600" /> Dr. Rajesh Sharma
              </p>
              <p className="text-xs text-slate-500">General Medicine & PHC Lead</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PHC Emergency Helpline</p>
              <p className="mt-1 text-xs font-bold text-slate-800 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-600" /> +91 98765 43210
              </p>
              <p className="text-xs text-slate-500">Available 24/7 for PHC Care</p>
            </div>
          </div>
        </section>

        {/* PHC Medication Schedule & Treatment Process Reminders */}
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">PHC Medication Schedule & Care Plan Reminders</h2>
              <p className="text-xs text-slate-500">Treatment process & medication advice prescribed by your PHC doctor and ASHA worker.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* Active Prescriptions */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5">
              <h3 className="text-sm font-black text-purple-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-700" /> Prescribed Daily Medicines
              </h3>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-purple-100 shadow-sm text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">Amlodipine 5mg (BP)</p>
                    <p className="text-slate-500">1 Tablet Daily · After Breakfast</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">Morning 8:00 AM</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-purple-100 shadow-sm text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">Metformin 500mg (Blood Sugar)</p>
                    <p className="text-slate-500">1 Tablet Daily · After Dinner</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-extrabold text-indigo-800">Night 8:00 PM</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-purple-100 shadow-sm text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">Iron & Folic Acid Supplement</p>
                    <p className="text-slate-500">1 Tablet Daily · Post Meal</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800">Afternoon 1:00 PM</span>
                </div>
              </div>
            </div>

            {/* Doctor Advice & PHC Process Instructions */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-700" /> PHC Doctor & ASHA Didi Guidelines
              </h3>
              <ul className="mt-3 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-start gap-2 rounded-xl bg-white p-3 border border-blue-100 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Diet & Exercise:</strong> Walk for 30 mins every morning. Restrict daily salt intake to below 5 grams.</span>
                </li>
                <li className="flex items-start gap-2 rounded-xl bg-white p-3 border border-blue-100 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>BP Monitoring:</strong> Record Blood Pressure at PHC center every Tuesday with ASHA worker.</span>
                </li>
                <li className="flex items-start gap-2 rounded-xl bg-white p-3 border border-blue-100 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Hydration:</strong> Drink 3-4 Liters of clean boiled water daily during warm weather.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Nearby Doctors & PHC Staff List */}
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">DOCTORS & MEDICAL OFFICERS</span>
              <h2 className="text-xl font-black text-slate-900">Nearby PHC Doctors & Medical Officers</h2>
              <p className="text-xs text-slate-500">Available doctors in your nearby primary health area.</p>
            </div>
            <Link href="/map" className="secondary-btn text-xs">
              <MapPin className="h-3.5 w-3.5" /> View Map Locations
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700 font-black">
                  DR
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Dr. Rajesh Sharma</p>
                  <p className="text-xs text-slate-500">MBBS · Lead Medical Officer</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /> PHC Rampur Central</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> +91 98765 12345</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 font-black">
                  DR
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Dr. Ananya Sharma</p>
                  <p className="text-xs text-slate-500">MD Obstetrics · PHC Area Lead</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /> PHC Rampur East Sub-branch</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> +91 98765 23456</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-700 font-black">
                  DR
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Dr. Vikramaditya Roy</p>
                  <p className="text-xs text-slate-500">Chief Health Authority Specialist</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /> District Headquarters CHC</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> +91 98765 34567</p>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Complaint & Feedback Box */}
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Patient Complaint Box & Help Desk</h2>
              <p className="text-xs text-slate-500">Report PHC facility issues, staff complaints, or submit feedback directly to the Central Authority.</p>
            </div>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            const complaintTitle = (formEl.querySelector('#complaint-title') as HTMLInputElement).value;
            const complaintDetails = (formEl.querySelector('#complaint-details') as HTMLTextAreaElement).value;
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('support_requests').insert({
              requested_by: user?.id || null,
              facility_id: phcFacility?.id || null,
              request_type: 'complaint',
              title: complaintTitle.trim(),
              details: complaintDetails.trim(),
              priority: 'high',
              status: 'requested'
            });
            if (error) {
              setMessage(`Unable to submit complaint: ${error.message}`);
            } else {
              setMessage('Your complaint has been submitted to the Central Authority Help Desk for review.');
              formEl.reset();
            }
          }} className="mt-5 grid gap-4 max-w-2xl">
            <label className="text-xs font-bold text-slate-800">
              Complaint / Feedback Subject
              <input required id="complaint-title" placeholder="e.g. Medicine shortage at PHC center / Staff availability" className="input mt-1 text-xs font-semibold" />
            </label>

            <label className="text-xs font-bold text-slate-800">
              Detailed Description of Complaint or Problem
              <textarea required id="complaint-details" placeholder="Explain the problem you faced at your PHC or healthcare center..." className="input mt-1 min-h-24 text-xs font-normal" />
            </label>

            <button className="primary-btn bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs w-fit">
              Submit Complaint to Central Authority
            </button>
          </form>
        </section>

        {/* Appointment Scheduler Section */}
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">CLINICAL CARE APPOINTMENTS</span>
              <h2 className="text-xl font-black text-slate-900">Book & Track PHC Doctor Appointments</h2>
              <p className="text-xs text-slate-500">Schedule your next doctor visit or wellness checkup at your PHC.</p>
            </div>
            <button onClick={() => setShowAppointmentModal(true)} className="primary-btn text-xs bg-purple-600 hover:bg-purple-700">
              <Plus className="h-3.5 w-3.5" /> Schedule New Appointment
            </button>
          </div>

          {appointments.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-3">Appointment Date</th>
                    <th className="p-3">Purpose of Visit</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt.id} className="border-t border-slate-100">
                      <td className="p-3 font-bold text-slate-900">{appt.appointment_date}</td>
                      <td className="p-3 text-xs font-semibold text-slate-800">{appt.purpose}</td>
                      <td className="p-3 text-xs text-slate-600">{appt.facility?.name || 'Assigned PHC'}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-500">{appt.clinical_notes || 'Routine appointment'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">No scheduled appointments yet. Click above to book your first appointment.</div>
          )}
        </section>

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
            <form onSubmit={handleBookAppointment} className="card w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-black text-slate-900">Schedule PHC Doctor Appointment</h2>
                <button type="button" onClick={() => setShowAppointmentModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-4 space-y-4 text-xs font-bold">
                <label className="block">
                  Preferred Appointment Date
                  <input required type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="input mt-1 text-xs font-semibold" />
                </label>

                <label className="block">
                  Purpose of Visit
                  <select value={appointmentPurpose} onChange={e => setAppointmentPurpose(e.target.value)} className="input mt-1 text-xs">
                    <option value="General PHC Wellness Checkup">General PHC Wellness Checkup</option>
                    <option value="Maternal & ANC Checkup">Maternal & ANC Checkup</option>
                    <option value="Medication & Prescription Review">Medication & Prescription Review</option>
                    <option value="Child Vaccination Session">Child Vaccination Session</option>
                    <option value="Blood Pressure & Sugar Check">Blood Pressure & Sugar Check</option>
                  </select>
                </label>

                <label className="block">
                  Symptoms or Special Request Notes
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe any current symptoms or reasons for visit..." className="input mt-1 min-h-20 text-xs font-normal" />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAppointmentModal(false)} className="secondary-btn text-xs">Cancel</button>
                <button disabled={busy} className="primary-btn text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  {busy ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
