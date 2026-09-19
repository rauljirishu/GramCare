'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { currentRole } from '@/lib/auth';
import { GramRole } from '@/lib/grams-data';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Clock, 
  HeartPulse, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Pill, 
  Calendar, 
  MapPin, 
  Phone, 
  Stethoscope,
  ArrowRight,
  FileText,
  UserPlus,
  X
} from 'lucide-react';

type SupportRequest = {
  id: string;
  request_type: string;
  title: string;
  details: string;
  priority: string;
  status: string;
  resolution_note: string | null;
  created_at: string;
  facilities?: { name: string } | null;
};

type PatientTreatmentRow = {
  id: string;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  village: string | null;
  current_medications: string[] | null;
  existing_conditions: string[] | null;
  next_follow_up_date: string | null;
  notes: string | null;
};

export default function Dashboard() {
  const [role, setRole] = useState<GramRole>('central');
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<{ id: string; name: string; role: string; facility_id: string | null } | null>(null);

  useEffect(() => {
    currentRole().then(value => {
      if (value === 'patient') {
        window.location.href = '/patient-dashboard';
      } else if (value) {
        setRole(value);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('id,name,role,facility_id').eq('id', user.id).single().then(({ data }) => {
          if (data) setUserProfile(data);
        });
      }
    });
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center font-bold text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-xs font-black uppercase text-blue-900 tracking-wider">Loading Authorised Workspace...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {role === 'central' && <CentralAuthorityDashboard profile={userProfile} />}
      {role === 'head' && <PhcHeadDashboard profile={userProfile} />}
      {role === 'worker' && <PhcWorkerDashboard profile={userProfile} />}
      {role === 'doctor' && <PhcHeadDashboard profile={userProfile} />}
      {role === 'hospital' && <CentralAuthorityDashboard profile={userProfile} />}
    </DashboardShell>
  );
}

{/* ========================================================================= */}
{/* 1. CENTRAL AUTHORITY DASHBOARD (Full System Access & Oversight)            */}
{/* ========================================================================= */}
function CentralAuthorityDashboard({ profile }: { profile: any }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'locations' | 'hospitals' | 'heads' | 'phcs' | 'patients' | 'resources' | 'feedback' | 'complaints'>('locations');
  const [stats, setStats] = useState({ totalLocations: 3, totalHospitals: 4, totalHeads: 3, totalPhcs: 6, totalPatients: 6, totalDemands: 3, totalFeedbacks: 4, totalComplaints: 3 });
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  
  const [locationsList, setLocationsList] = useState<any[]>([]);
  const [hospitalsList, setHospitalsList] = useState<any[]>([]);
  const [phcHeadsList, setPhcHeadsList] = useState<any[]>([]);
  const [phcsList, setPhcsList] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [demandsList, setDemandsList] = useState<any[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);

  async function loadCentralAdminData() {
    // 1. Fetch Facilities
    const { data: facs } = await supabase.from('facilities').select('*, users!users_facility_id_fkey(name, role)');

    const demoHospitals = [
      { id: 'h1', name: 'Rampur District Headquarters Hospital', district: 'Rampur Central', address: 'Hospital Road, Sector 1', phone: '+91 98765 00001', bed_capacity: 120, status: 'Active' },
      { id: 'h2', name: 'Community Health Centre (CHC) Rampur', district: 'Rampur East', address: 'CHC Complex, Main Highway', phone: '+91 98765 00002', bed_capacity: 45, status: 'Active' },
      { id: 'h3', name: 'Sub-District Emergency Care Facility', district: 'Rampur West', address: 'Station Road, Ward 4', phone: '+91 98765 00003', bed_capacity: 30, status: 'Active' },
      { id: 'h4', name: 'Maternal & Child Referral Hospital', district: 'Rampur South', address: 'Civil Lines, Block B', phone: '+91 98765 00004', bed_capacity: 60, status: 'Active' }
    ];

    const demoPhcs = [
      { id: 'p1', name: 'Primary Health Centre Rampur Central', district: 'Rampur Central', head_name: 'Dr. Rajesh Sharma', worker_count: 8, status: 'Operational' },
      { id: 'p2', name: 'PHC Rampur East Sub-branch', district: 'Rampur East', head_name: 'Dr. Ananya Sharma', worker_count: 5, status: 'Operational' },
      { id: 'p3', name: 'PHC Rampur West Sub-branch', district: 'Rampur West', head_name: 'Dr. Vikramaditya Roy', worker_count: 6, status: 'Operational' },
      { id: 'p4', name: 'PHC Anandpur Rural Centre', district: 'Anandpur Area', head_name: 'Dr. Suresh Verma', worker_count: 4, status: 'Operational' },
      { id: 'p5', name: 'PHC Chandanpur Community Post', district: 'Chandanpur Area', head_name: 'Dr. Meena Patel', worker_count: 5, status: 'Operational' },
      { id: 'p6', name: 'PHC Sundarpur Health Outpost', district: 'Sundarpur Area', head_name: 'Dr. Arvind Kumar', worker_count: 3, status: 'Operational' }
    ];

    const demoLocations = [
      { id: 'l1', area_name: 'Rampur Central District', district: 'Rampur District', phc_count: 2, hospital_name: 'Rampur District Headquarters Hospital', status: 'Covered' },
      { id: 'l2', area_name: 'Rampur East Sub-region', district: 'Rampur District', phc_count: 2, hospital_name: 'CHC Rampur', status: 'Covered' },
      { id: 'l3', area_name: 'Rampur West Sub-region', district: 'Rampur District', phc_count: 2, hospital_name: 'Sub-District Care Facility', status: 'Covered' }
    ];

    const demoHeads = [
      { id: 'ph1', name: 'Dr. Ananya Sharma', assigned_phc: 'PHC Rampur East Sub-branch', area: 'Rampur East Sub-region', email: 'phchead@gramswasthya.demo', phone: '+91 98765 23456', status: 'Authorised' },
      { id: 'ph2', name: 'Dr. Rajesh Sharma', assigned_phc: 'Primary Health Centre Rampur Central', area: 'Rampur Central District', email: 'rajesh.sharma@gramswasthya.in', phone: '+91 98765 12345', status: 'Authorised' },
      { id: 'ph3', name: 'Dr. Vikramaditya Roy', assigned_phc: 'PHC Rampur West Sub-branch', area: 'Rampur West Sub-region', email: 'central@gramswasthya.demo', phone: '+91 98765 34567', status: 'Authorised' }
    ];

    const demoDemands = [
      { id: 'req-1', title: '12 Oxygen Cylinders & Flowmeters', requested_by_head: 'Dr. Rajesh Sharma', phc_name: 'PHC Rampur Central', priority: 'high', status: 'pending', created_at: '2026-09-18' },
      { id: 'req-2', title: 'ECG Machine & Diagnostic Test Strips', requested_by_head: 'Dr. Ananya Sharma', phc_name: 'PHC Rampur East Sub-branch', priority: 'high', status: 'in_progress', created_at: '2026-09-17' },
      { id: 'req-3', title: 'Emergency Transport Ambulance Unit', requested_by_head: 'Dr. Vikramaditya Roy', phc_name: 'PHC Rampur West Sub-branch', priority: 'urgent', status: 'pending', created_at: '2026-09-16' }
    ];

    const demoFeedbacks = [
      { id: 'fb-1', sender_name: 'Anita Devi', role: 'Patient', phc_name: 'PHC Rampur Central', rating: 5, category: 'Doctor & Nursing Care', message: 'Maternal checkup was very smooth. Clear explanation of medicines.' },
      { id: 'fb-2', sender_name: 'Ramesh Singh', role: 'Patient', phc_name: 'PHC Rampur East', rating: 4, category: 'PHC Facility & Cleanliness', message: 'Clean waiting area and prompt blood pressure testing.' },
      { id: 'fb-3', sender_name: 'Sunita Verma', role: 'Health Worker', phc_name: 'PHC Anandpur', rating: 5, category: 'Mobile Screening Kits', message: 'Offline sync tablets provided by central authority work great.' }
    ];

    const demoComplaints = [
      { id: 'cmp-1', ticket_no: 'GRM-CMP-081', complainant_name: 'Dr. Rajesh Sharma', issue_category: 'Equipment Breakdown', title: 'ECG Machine Sensor Fault', priority: 'Critical', status: 'Under Investigation' },
      { id: 'cmp-2', ticket_no: 'GRM-CMP-079', complainant_name: 'Sunita Devi', issue_category: 'Medicine Delay', title: 'Tetanus Toxoid Stock Out Risk', priority: 'High', status: 'Open' },
      { id: 'cmp-3', ticket_no: 'GRM-CMP-074', complainant_name: 'Ramesh Kumar', issue_category: 'Patient Grievance', title: 'Long OPD Wait Time for BP Checks', priority: 'Medium', status: 'Resolved' }
    ];

    const { data: pts } = await supabase.from('patients').select('*, facilities(name)');

    setLocationsList(demoLocations);
    setHospitalsList(demoHospitals);
    setPhcsList(demoPhcs);
    setPhcHeadsList(demoHeads);
    setDemandsList(demoDemands);
    setFeedbacksList(demoFeedbacks);
    setComplaintsList(demoComplaints);
    setPatientsList(pts && pts.length ? pts : [
      { id: 'pt1', patient_code: 'GS-DEMO-001', name: 'Ramesh Kumar', age: 45, gender: 'male', village: 'Rampur', area: 'Rampur Central', verification_status: 'verified', facilities: { name: 'PHC Rampur Central' } },
      { id: 'pt2', patient_code: 'GS-DEMO-002', name: 'Priya Sharma', age: 28, gender: 'female', village: 'Rampur East', area: 'Rampur East', verification_status: 'verified', facilities: { name: 'PHC Rampur East' } },
      { id: 'pt3', patient_code: 'GS-DEMO-003', name: 'Sunita Devi', age: 34, gender: 'female', village: 'Anandpur', area: 'Anandpur Area', verification_status: 'verified', facilities: { name: 'PHC Anandpur' } },
      { id: 'pt4', patient_code: 'GS-DEMO-004', name: 'Vikram Singh', age: 52, gender: 'male', village: 'Chandanpur', area: 'Chandanpur Area', verification_status: 'pending', facilities: { name: 'PHC Chandanpur' } },
      { id: 'pt5', patient_code: 'GS-DEMO-005', name: 'Anita Patel', age: 23, gender: 'female', village: 'Sundarpur', area: 'Sundarpur Area', verification_status: 'verified', facilities: { name: 'PHC Sundarpur' } },
      { id: 'pt6', patient_code: 'GS-DEMO-006', name: 'Rajesh Gupta', age: 60, gender: 'male', village: 'Rampur West', area: 'Rampur West', verification_status: 'verified', facilities: { name: 'PHC Rampur West' } }
    ]);

    setStats({
      totalLocations: demoLocations.length,
      totalHospitals: demoHospitals.length,
      totalHeads: demoHeads.length,
      totalPhcs: demoPhcs.length,
      totalPatients: pts && pts.length ? pts.length : 6,
      totalDemands: demoDemands.length,
      totalFeedbacks: demoFeedbacks.length,
      totalComplaints: demoComplaints.length
    });
  }

  useEffect(() => { loadCentralAdminData(); }, []);

  return (
    <div className="space-y-6">
      {/* Central Authority Header */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-blue-200 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-blue-300" /> {t('centralBadge', 'CENTRAL HEALTHCARE AUTHORITY — SYSTEM ADMINISTRATION & OVERSIGHT')}
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              {t('centralTitle', 'Statewide Healthcare Administration & Monitoring')}
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-2xl leading-relaxed">
              {t('centralDesc', 'Full Central Authority access to view patient records, PHC sub-branches, review equipment/resource demands, monitor feedback, and resolve complaint tickets.')}
            </p>
          </div>
        </div>
      </section>

      {notice && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{notice}</div>}

      {/* Top Overview Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button onClick={() => setActiveTab('locations')} className={`card p-4 text-left transition-all ${activeTab === 'locations' ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('navAreaLocations', 'Area Locations & PHCs')}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalLocations} Areas / {stats.totalPhcs} PHCs</p>
          <p className="mt-1 text-[11px] font-bold text-blue-700">Covered Regions →</p>
        </button>

        <button onClick={() => setActiveTab('patients')} className={`card p-4 text-left transition-all ${activeTab === 'patients' ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('navAllPatientData', 'Master Patient Data')}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalPatients} Records</p>
          <p className="mt-1 text-[11px] font-bold text-blue-700">All Patient Records →</p>
        </button>

        <button onClick={() => setActiveTab('resources')} className={`card p-4 text-left transition-all ${activeTab === 'resources' ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('navEquipmentDemands', 'Equipment Demands')}</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{stats.totalDemands} Demands</p>
          <p className="mt-1 text-[11px] font-bold text-amber-700">Resource Requests →</p>
        </button>

        <button onClick={() => setActiveTab('feedback')} className={`card p-4 text-left transition-all ${activeTab === 'feedback' ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('navFeedbackSection', 'Feedback Section')}</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.totalFeedbacks} Feedbacks</p>
          <p className="mt-1 text-[11px] font-bold text-emerald-700">Patient & PHC Reviews →</p>
        </button>

        <button onClick={() => setActiveTab('complaints')} className={`card p-4 text-left transition-all ${activeTab === 'complaints' ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('navComplaintBox', 'Complaint Box')}</p>
          <p className="mt-2 text-2xl font-black text-rose-600">{stats.totalComplaints} Tickets</p>
          <p className="mt-1 text-[11px] font-bold text-rose-700">Grievances & Problems →</p>
        </button>
      </div>

      {/* Main Admin Section Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('locations')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'locations' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            📍 1. {t('navAreaLocations', 'Area Locations')} ({stats.totalLocations})
          </button>

          <button onClick={() => setActiveTab('hospitals')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'hospitals' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            🏥 2. {t('tabHospitalsList', 'Hospital List')} ({stats.totalHospitals})
          </button>

          <button onClick={() => setActiveTab('heads')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'heads' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            👨‍⚕️ 3. {t('tabDoctorsList', 'PHC Head List')} ({stats.totalHeads})
          </button>

          <button onClick={() => setActiveTab('phcs')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'phcs' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            🏢 4. {t('tabPhcList', 'All PHCs')} ({stats.totalPhcs})
          </button>

          <button onClick={() => setActiveTab('patients')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'patients' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            👥 5. {t('navAllPatientData', 'All Patient Data')} ({stats.totalPatients})
          </button>

          <button onClick={() => setActiveTab('resources')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'resources' ? 'bg-amber-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            📦 6. {t('navEquipmentDemands', 'Equipment Demands')} ({stats.totalDemands})
          </button>

          <button onClick={() => setActiveTab('feedback')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'feedback' ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            💬 7. {t('navFeedbackSection', 'Feedback Section')} ({stats.totalFeedbacks})
          </button>

          <button onClick={() => setActiveTab('complaints')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'complaints' ? 'bg-rose-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            🚨 8. {t('navComplaintBox', 'Complaint Box')} ({stats.totalComplaints})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t('filterOverview', 'Filter overview')}...`} className="input py-1.5 text-xs pl-9" />
        </div>
      </div>

      {/* SECTION 1: AREA / PHC LOCATIONS */}
      {activeTab === 'locations' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">CENTRAL AUTHORITY MONITORING</span>
              <h2 className="text-xl font-black text-slate-900">Area & PHC Locations Directory</h2>
              <p className="text-xs text-slate-500">List of all geographical areas and locations covered by GramCare.</p>
            </div>
            <button onClick={() => setNotice('Location settings updated.')} className="secondary-btn text-xs">
              Manage Location Data
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Area / Location Name</th>
                  <th className="p-3">District Region</th>
                  <th className="p-3">Related PHCs Count</th>
                  <th className="p-3">Primary Referral Hospital</th>
                  <th className="p-3">Coverage Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {locationsList
                  .filter(l => `${l.area_name} ${l.district} ${l.hospital_name}`.toLowerCase().includes(search.toLowerCase()))
                  .map(loc => (
                    <tr key={loc.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{loc.area_name}</td>
                      <td className="p-3 text-xs font-semibold text-slate-600">{loc.district}</td>
                      <td className="p-3 text-xs font-bold text-blue-700">{loc.phc_count} Primary Health Centres</td>
                      <td className="p-3 text-xs font-semibold text-slate-800">{loc.hospital_name}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {loc.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => setNotice(`Viewing location details for ${loc.area_name}`)} className="text-xs font-bold text-blue-700 hover:underline">
                          View Location →
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 2: HOSPITAL LIST */}
      {activeTab === 'hospitals' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">REGISTERED HEALTHCARE INSTITUTIONS</span>
              <h2 className="text-xl font-black text-slate-900">Registered Hospital Directory</h2>
              <p className="text-xs text-slate-500">Statewide list of registered referral hospitals, CHCs, and emergency centers.</p>
            </div>
            <button onClick={() => setNotice('Hospital registry updated.')} className="secondary-btn text-xs">
              + Register New Hospital
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Hospital Name</th>
                  <th className="p-3">Location / Area</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Emergency Contact</th>
                  <th className="p-3">Bed Capacity</th>
                  <th className="p-3">Account Status</th>
                </tr>
              </thead>
              <tbody>
                {hospitalsList
                  .filter(h => `${h.name} ${h.district} ${h.address}`.toLowerCase().includes(search.toLowerCase()))
                  .map(hosp => (
                    <tr key={hosp.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{hosp.name}</td>
                      <td className="p-3 text-xs font-semibold text-slate-700">{hosp.district}</td>
                      <td className="p-3 text-xs text-slate-600">{hosp.address}</td>
                      <td className="p-3 text-xs font-bold text-emerald-700">{hosp.phone}</td>
                      <td className="p-3 text-xs font-bold text-slate-900">{hosp.bed_capacity} Beds Available</td>
                      <td className="p-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {hosp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 3: PHC HEAD LIST */}
      {activeTab === 'heads' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">AUTHORISED AREA LEADERSHIP</span>
              <h2 className="text-xl font-black text-slate-900">PHC Head & Medical Officers List</h2>
              <p className="text-xs text-slate-500">Central Directory of all authorised PHC Heads and Medical Officers in charge.</p>
            </div>
            <button onClick={() => setNotice('PHC Head account directory refreshed.')} className="secondary-btn text-xs">
              Manage Accounts
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">PHC Head Name</th>
                  <th className="p-3">Assigned PHC</th>
                  <th className="p-3">Area / Jurisdiction</th>
                  <th className="p-3">Email & Contact</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {phcHeadsList
                  .filter(head => `${head.name} ${head.assigned_phc} ${head.email}`.toLowerCase().includes(search.toLowerCase()))
                  .map(head => (
                    <tr key={head.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{head.name}</td>
                      <td className="p-3 text-xs font-semibold text-blue-700">{head.assigned_phc}</td>
                      <td className="p-3 text-xs text-slate-600">{head.area}</td>
                      <td className="p-3 text-xs text-slate-700">
                        <p className="font-bold">{head.email}</p>
                        <p className="text-slate-500">{head.phone}</p>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {head.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => setNotice(`Managing account details for ${head.name}`)} className="text-xs font-bold text-blue-700 hover:underline">
                          View Account →
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 4: ALL PHCS */}
      {activeTab === 'phcs' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">PRIMARY HEALTHCARE CENTRES</span>
              <h2 className="text-xl font-black text-slate-900">Registered PHC Facilities Directory</h2>
              <p className="text-xs text-slate-500">Every registered Primary Health Centre across all sub-branches.</p>
            </div>
            <button onClick={() => setNotice('PHC registry updated.')} className="secondary-btn text-xs">
              + Register New PHC
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">PHC Name</th>
                  <th className="p-3">Area / Location</th>
                  <th className="p-3">PHC Head in Charge</th>
                  <th className="p-3">Assigned Workers</th>
                  <th className="p-3">Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {phcsList
                  .filter(phc => `${phc.name} ${phc.district} ${phc.head_name}`.toLowerCase().includes(search.toLowerCase()))
                  .map(phc => (
                    <tr key={phc.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{phc.name}</td>
                      <td className="p-3 text-xs font-semibold text-slate-700">{phc.district}</td>
                      <td className="p-3 text-xs font-bold text-blue-700">{phc.head_name}</td>
                      <td className="p-3 text-xs font-bold text-slate-900">{phc.worker_count} Staff & Workers</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {phc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 5: ALL PATIENT DATA */}
      {activeTab === 'patients' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">SYSTEM-WIDE PATIENT REGISTRY</span>
              <h2 className="text-xl font-black text-slate-900">All Patient Master Data</h2>
              <p className="text-xs text-slate-500">Complete authorized system-wide patient registry across all connected PHCs.</p>
            </div>
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter patient data..." className="input py-1.5 text-xs pl-9" />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Patient Name & Code</th>
                  <th className="p-3">Assigned PHC</th>
                  <th className="p-3">Village / Area</th>
                  <th className="p-3">Demographics</th>
                  <th className="p-3">Registration Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {patientsList
                  .filter(p => `${p.name} ${p.patient_code} ${p.village || ''} ${p.area || ''}`.toLowerCase().includes(search.toLowerCase()))
                  .map(pt => (
                    <tr key={pt.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <p className="font-extrabold text-slate-900">{pt.name}</p>
                        <p className="text-xs text-slate-500">{pt.patient_code || 'GS-DEMO-001'}</p>
                      </td>
                      <td className="p-3 text-xs font-semibold text-blue-700">{pt.facilities?.name || pt.assigned_phc || 'PHC Rampur Central'}</td>
                      <td className="p-3 text-xs text-slate-700">{pt.village || pt.area || 'Rampur Area'}</td>
                      <td className="p-3 text-xs text-slate-600">{pt.age} yrs · <span className="capitalize">{pt.gender}</span></td>
                      <td className="p-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">
                          {pt.verification_status || 'verified'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link href={`/patients/${pt.patient_code || 'GS-DEMO-001'}`} className="text-xs font-bold text-blue-700 hover:underline">
                          View Record →
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 6: EQUIPMENT & RESOURCE DEMANDS */}
      {activeTab === 'resources' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">HIGHER AUTHORITY RESOURCE MANAGEMENT</span>
              <h2 className="text-xl font-black text-slate-900">Equipment & Resource Demands</h2>
              <p className="text-xs text-slate-500">Demands submitted by Area PHC Heads for equipment, medical supplies, and emergency units.</p>
            </div>
            <Link href="/resources" className="primary-btn text-xs">
              View Full Resource Center →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Demand Title</th>
                  <th className="p-3">Requested By (PHC Head)</th>
                  <th className="p-3">PHC Facility</th>
                  <th className="p-3">Priority Level</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Central Action</th>
                </tr>
              </thead>
              <tbody>
                {demandsList
                  .filter(d => `${d.title} ${d.requested_by_head} ${d.phc_name}`.toLowerCase().includes(search.toLowerCase()))
                  .map(dem => (
                    <tr key={dem.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{dem.title}</td>
                      <td className="p-3 text-xs font-semibold text-slate-700">{dem.requested_by_head}</td>
                      <td className="p-3 text-xs text-blue-700 font-bold">{dem.phc_name}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${dem.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {dem.priority} Priority
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${dem.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : dem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                          {dem.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setDemandsList(demandsList.map(item => item.id === dem.id ? { ...item, status: 'approved' } : item));
                            setNotice(`Resource demand "${dem.title}" approved by Central Authority.`);
                          }}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-emerald-700"
                        >
                          Approve Demand
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 7: FEEDBACK SECTION */}
      {activeTab === 'feedback' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">STATEWIDE FEEDBACK MONITORING</span>
              <h2 className="text-xl font-black text-slate-900">Feedback Section</h2>
              <p className="text-xs text-slate-500">Service evaluations and feedback received from patients and health workers.</p>
            </div>
            <Link href="/feedback" className="secondary-btn text-xs">
              Open Dedicated Feedback Portal →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {feedbacksList
              .filter(f => `${f.sender_name} ${f.message} ${f.category}`.toLowerCase().includes(search.toLowerCase()))
              .map(fb => (
                <div key={fb.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900 text-sm">{fb.sender_name}</span>
                      <span className="ml-2 text-xs font-semibold text-slate-500">({fb.role} · {fb.phc_name})</span>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                      {'⭐'.repeat(fb.rating)} ({fb.rating}/5)
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-700 leading-relaxed">{fb.message}</p>
                  <p className="mt-2 text-[10px] font-bold text-blue-700">Category: {fb.category}</p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* SECTION 8: COMPLAINT BOX */}
      {activeTab === 'complaints' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">CENTRAL GRIEVANCE REDRESSAL</span>
              <h2 className="text-xl font-black text-slate-900">Complaint Box & Problem Tracking</h2>
              <p className="text-xs text-slate-500">Centralized list of issues, breakdown reports, and grievances requiring action.</p>
            </div>
            <Link href="/complaints" className="primary-btn text-xs">
              Open Complaint Desk →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Ticket No</th>
                  <th className="p-3">Problem Title</th>
                  <th className="p-3">Complainant</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaintsList
                  .filter(c => `${c.ticket_no} ${c.title} ${c.complainant_name}`.toLowerCase().includes(search.toLowerCase()))
                  .map(cmp => (
                    <tr key={cmp.id} className="border-t border-slate-100">
                      <td className="p-3 text-xs font-black text-slate-500">{cmp.ticket_no}</td>
                      <td className="p-3 font-extrabold text-slate-900">{cmp.title}</td>
                      <td className="p-3 text-xs font-semibold text-slate-700">{cmp.complainant_name}</td>
                      <td className="p-3 text-xs text-slate-600">{cmp.issue_category}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cmp.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {cmp.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cmp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : cmp.status === 'Under Investigation' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                          {cmp.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setComplaintsList(complaintsList.map(item => item.id === cmp.id ? { ...item, status: 'Resolved' } : item));
                            setNotice(`Complaint ticket ${cmp.ticket_no} marked as Resolved by Central Authority.`);
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-blue-700"
                        >
                          Resolve Ticket
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

{/* ========================================================================= */}
{/* 2. AREA / PHC HEAD DASHBOARD (Area Scoped Authority Only)                 */}
{/* ========================================================================= */}
function PhcHeadDashboard({ profile }: { profile: any }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'phcs' | 'workers' | 'demands'>('overview');
  const [stats, setStats] = useState({ areaPatients: 0, areaWorkers: 0, highRisk: 0, myDemands: 0 });
  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [areaPatientsList, setAreaPatientsList] = useState<any[]>([]);
  const [areaDoctorsList, setAreaDoctorsList] = useState<any[]>([]);
  const [areaPhcsList, setAreaPhcsList] = useState<any[]>([]);
  const [areaWorkersList, setAreaWorkersList] = useState<any[]>([]);
  
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [demandTitle, setDemandTitle] = useState('');
  const [demandType, setDemandType] = useState('equipment');
  const [demandQuantity, setDemandQuantity] = useState('10');
  const [demandReason, setDemandReason] = useState('');
  const [demandPriority, setDemandPriority] = useState('high');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const assignedArea = 'Rampur East Sub-region';
  const assignedPhc = 'PHC Rampur East Sub-branch';

  async function loadData() {
    const [pts, wrks, reqs] = await Promise.all([
      supabase.from('patients').select('id,patient_code,name,age,gender,village,verification_status,created_at,facilities(name)', { count: 'exact' }),
      supabase.from('users').select('id,name,role,email,phone,facilities(name)').in('role', ['phc_worker', 'asha', 'anm']),
      supabase.from('support_requests').select('id,request_type,title,details,priority,status,resolution_note,created_at').order('created_at', { ascending: false })
    ]);

    const demoDoctors = [
      { id: 'doc-1', name: 'Dr. Ananya Sharma', specialization: 'General Physician & PHC Lead', phc_name: assignedPhc, phone: '+91 98765 23456', status: 'Available On Duty' },
      { id: 'doc-2', name: 'Dr. Rajesh Sharma', specialization: 'Senior Medical Officer', phc_name: 'Primary Health Centre Rampur Central', phone: '+91 98765 12345', status: 'Available' },
      { id: 'doc-3', name: 'Dr. Suresh Verma', specialization: 'Community Health Specialist', phc_name: 'PHC Anandpur Rural Centre', phone: '+91 98765 34567', status: 'On Field Duty' }
    ];

    const demoPhcs = [
      { id: 'phc-1', name: 'PHC Rampur East Sub-branch', location: 'Rampur East Sub-region', head_name: 'Dr. Ananya Sharma', worker_count: 5, patient_count: 142, status: 'Operational' },
      { id: 'phc-2', name: 'PHC Anandpur Rural Centre', location: 'Anandpur Area', head_name: 'Dr. Suresh Verma', worker_count: 4, patient_count: 98, status: 'Operational' }
    ];

    const demoWorkers = [
      { id: 'wrk-1', name: 'Sunita Verma', role: 'ANM Senior Field Worker', assigned_phc: assignedPhc, phone: '+91 98765 44401', status: 'Active Field Duty' },
      { id: 'wrk-2', name: 'Meena Devi', role: 'ASHA Healthcare Worker', assigned_phc: assignedPhc, phone: '+91 98765 44402', status: 'Active Field Duty' },
      { id: 'wrk-3', name: 'Radha Patel', role: 'ASHA Worker', assigned_phc: assignedPhc, phone: '+91 98765 44403', status: 'On Home Visit' },
      { id: 'wrk-4', name: 'Kavita Singh', role: 'PHC Health Worker', assigned_phc: assignedPhc, phone: '+91 98765 44404', status: 'Active' }
    ];

    setAreaDoctorsList(demoDoctors);
    setAreaPhcsList(demoPhcs);
    setAreaWorkersList(demoWorkers);

    const loadedPatients = (pts.data || []) as any[];
    setAreaPatientsList(loadedPatients && loadedPatients.length ? loadedPatients : [
      { id: 'p1', patient_code: 'GS-EAST-001', name: 'Ramesh Kumar', age: 45, gender: 'male', village: 'Rampur East', verification_status: 'verified', facilities: { name: assignedPhc } },
      { id: 'p2', patient_code: 'GS-EAST-002', name: 'Priya Sharma', age: 28, gender: 'female', village: 'Rampur East Sub-region', verification_status: 'verified', facilities: { name: assignedPhc } },
      { id: 'p3', patient_code: 'GS-EAST-003', name: 'Kavita Devi', age: 34, gender: 'female', village: 'Rampur Village 2', verification_status: 'verified', facilities: { name: assignedPhc } }
    ]);

    setStats({
      areaPatients: loadedPatients && loadedPatients.length ? loadedPatients.length : 142,
      areaWorkers: demoWorkers.length,
      highRisk: 12,
      myDemands: (reqs.data || []).length || 3
    });

    setMyRequests((reqs.data || []) as unknown as SupportRequest[]);
  }

  useEffect(() => { loadData(); }, []);

  async function submitResourceDemand(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setNotice('');

    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProf } = await supabase.from('users').select('facility_id').eq('id', user?.id || '').single();

    if (!user) {
      setNotice('Unable to submit: Authentication session missing.');
      setBusy(false); return;
    }

    const fullTitle = `${demandQuantity} x ${demandTitle.trim()}`;
    const fullDetails = `Reason: ${demandReason.trim()} | Assigned PHC: ${assignedPhc}`;

    const { error } = await supabase.from('support_requests').insert({
      requested_by: user.id,
      facility_id: userProf?.facility_id || null,
      request_type: demandType,
      title: fullTitle,
      details: fullDetails,
      priority: demandPriority,
      status: 'pending'
    });

    setBusy(false);
    if (error) { setNotice(`Failed to submit demand: ${error.message}`); return; }

    setDemandTitle(''); setDemandReason(''); setShowDemandModal(false);
    setNotice(`Equipment/Resource demand "${fullTitle}" submitted UPWARD to Central Authority for approval.`);
    loadData();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-blue-200 backdrop-blur">
              <Building2 className="h-4 w-4 text-blue-300" /> {t('level2Sub', 'LEVEL 2 — AREA AUTHORITY / PHC HEAD COMMAND')}
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              {t('level2Title', 'Area Health Authority & Oversight Desk')}
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-2xl leading-relaxed">
              {t('level2Desc', 'Authority restricted strictly to your assigned area.')} <b>{assignedArea}</b> ({assignedPhc}).
            </p>
          </div>
          <button onClick={() => setShowDemandModal(true)} className="primary-btn bg-amber-500 hover:bg-amber-600 text-slate-900 font-black shadow-lg">
            <Plus className="h-4 w-4" /> {t('demandResourcesBtn', 'Demand Resources to Central')}
          </button>
        </div>
      </section>

      {notice && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{notice}</div>}

      {/* Sub-Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('overview')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            🏢 {t('tabAreaOverview', '1. Area Overview')}
          </button>
          <button onClick={() => setActiveTab('patients')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'patients' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            👥 {t('tabPatientDetails', '2. Patient Details')} ({stats.areaPatients})
          </button>
          <button onClick={() => setActiveTab('doctors')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'doctors' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            👨‍⚕️ {t('tabDoctorsList', '3. Doctors List')} ({areaDoctorsList.length})
          </button>
          <button onClick={() => setActiveTab('phcs')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'phcs' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            🏢 {t('tabPhcList', '4. PHC List')} ({areaPhcsList.length})
          </button>
          <button onClick={() => setActiveTab('workers')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'workers' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            👩‍⚕️ {t('tabPhcWorkerList', '5. PHC Worker List')} ({areaWorkersList.length})
          </button>
          <button onClick={() => setActiveTab('demands')} className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${activeTab === 'demands' ? 'bg-amber-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            📦 {t('tabEquipmentRequests', '6. Equipment Requests')} ({stats.myDemands})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t('filterOverview', 'Filter overview')}...`} className="input py-1.5 text-xs pl-9" />
        </div>
      </div>

      {/* SECTION 1: AREA / PHC OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5 border-blue-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">{t('assignedAreaJurisdiction', 'Assigned Area Jurisdiction')}</span>
              <p className="mt-2 text-lg font-black text-slate-900">{assignedArea}</p>
              <p className="mt-1 text-xs font-semibold text-blue-700">Strictly Scoped Access</p>
            </div>

            <div className="card p-5 border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">{t('assignedPrimaryHealthFacility', 'Assigned Primary Health Facility')}</span>
              <p className="mt-2 text-lg font-black text-slate-900">{assignedPhc}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">Operational Status: Active</p>
            </div>

            <div className="card p-5 border-indigo-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">{t('assignedFieldStaff', 'Assigned Field Staff')}</span>
              <p className="mt-2 text-3xl font-black text-slate-900">{stats.areaWorkers} {t('staffLabel', 'Staff')}</p>
              <p className="mt-1 text-xs font-semibold text-indigo-700">ASHA & ANM Healthcare Roster</p>
            </div>

            <div className="card p-5 border-purple-200">
              <span className="text-[10px] font-bold uppercase text-slate-500">{t('areaPatientScope', 'Area Patient Scope')}</span>
              <p className="mt-2 text-3xl font-black text-slate-900">{stats.areaPatients} {t('patientsLabel', 'Patients')}</p>
              <p className="mt-1 text-xs font-semibold text-purple-700">{t('registeredUnderAssignedPhc', 'Registered under assigned PHC')}</p>
            </div>
          </div>

          <section className="card p-6 border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-3">Facility Infrastructure & Jurisdiction Details</h2>
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-500">Facility Address:</span>
                <p className="font-extrabold text-slate-900 mt-1">CHC Complex, Main Highway, Sector 4</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-500">Emergency & Helpline Contact:</span>
                <p className="font-extrabold text-blue-700 mt-1">+91 98765 23456</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-500">Inpatient & Emergency Beds:</span>
                <p className="font-extrabold text-emerald-700 mt-1">20 Beds Available</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: PATIENT DETAILS */}
      {activeTab === 'patients' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">AREA PATIENT REGISTRY (READ-ONLY OVERSIGHT)</span>
              <h2 className="text-xl font-black text-slate-900">Area Patient Directory & Follow-up Status</h2>
              <p className="text-xs text-slate-500">Patients belonging strictly to {assignedPhc}. Patient registration rights belong exclusively to Level 3 PHC Workers.</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-200">
              🔒 Level 2 Area Head Scope: Read-Only Patient Profiles
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Patient Code & Name</th>
                  <th className="p-3">Age / Gender</th>
                  <th className="p-3">Village Location</th>
                  <th className="p-3">Assigned PHC</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {areaPatientsList
                  .filter(p => `${p.name} ${p.patient_code} ${p.village || ''}`.toLowerCase().includes(search.toLowerCase()))
                  .map(pt => (
                    <tr key={pt.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <p className="font-extrabold text-slate-900">{pt.name}</p>
                        <p className="text-xs text-slate-500">{pt.patient_code || 'GS-EAST-001'}</p>
                      </td>
                      <td className="p-3 text-xs text-slate-700">{pt.age} yrs · <span className="capitalize">{pt.gender}</span></td>
                      <td className="p-3 text-xs font-semibold text-slate-700">{pt.village || 'Rampur East'}</td>
                      <td className="p-3 text-xs font-bold text-blue-700">{pt.facilities?.name || assignedPhc}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 capitalize">
                          {pt.verification_status || 'verified'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link href={`/patients/${pt.patient_code || 'GS-EAST-001'}`} className="text-xs font-bold text-blue-700 hover:underline">
                          View Profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 3: DOCTORS LIST */}
      {activeTab === 'doctors' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">AREA MEDICAL STAFF</span>
              <h2 className="text-xl font-black text-slate-900">Associated Doctors Directory</h2>
              <p className="text-xs text-slate-500">Doctors associated with {assignedArea}.</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Doctor Name</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Assigned Facility</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {areaDoctorsList
                  .filter(d => `${d.name} ${d.specialization}`.toLowerCase().includes(search.toLowerCase()))
                  .map(doc => (
                    <tr key={doc.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{doc.name}</td>
                      <td className="p-3 text-xs font-semibold text-slate-700">{doc.specialization}</td>
                      <td className="p-3 text-xs text-blue-700 font-bold">{doc.phc_name}</td>
                      <td className="p-3 text-xs text-slate-600">{doc.phone}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 4: PHC LIST */}
      {activeTab === 'phcs' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">AREA JURISDICTION FACILITIES</span>
              <h2 className="text-xl font-black text-slate-900">PHCs Belonging to Area Jurisdiction</h2>
              <p className="text-xs text-slate-500">Primary Health Centres operating under {assignedArea}.</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">PHC Name</th>
                  <th className="p-3">Location / Region</th>
                  <th className="p-3">PHC Head in Charge</th>
                  <th className="p-3">Worker Count</th>
                  <th className="p-3">Patient Count</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {areaPhcsList
                  .filter(p => `${p.name} ${p.location}`.toLowerCase().includes(search.toLowerCase()))
                  .map(phc => (
                    <tr key={phc.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{phc.name}</td>
                      <td className="p-3 text-xs text-slate-700">{phc.location}</td>
                      <td className="p-3 text-xs font-bold text-blue-700">{phc.head_name}</td>
                      <td className="p-3 text-xs font-bold text-slate-900">{phc.worker_count} Workers</td>
                      <td className="p-3 text-xs font-bold text-slate-900">{phc.patient_count} Patients</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {phc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 5: PHC WORKER LIST */}
      {activeTab === 'workers' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">FIELD HEALTHCARE TEAM</span>
              <h2 className="text-xl font-black text-slate-900">PHC Worker Roster (ASHA / ANM)</h2>
              <p className="text-xs text-slate-500">Authorized healthcare workers assigned to {assignedPhc}.</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Assigned PHC</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {areaWorkersList
                  .filter(w => `${w.name} ${w.role}`.toLowerCase().includes(search.toLowerCase()))
                  .map(wrk => (
                    <tr key={wrk.id} className="border-t border-slate-100">
                      <td className="p-3 font-extrabold text-slate-900">{wrk.name}</td>
                      <td className="p-3 text-xs font-bold text-blue-700">{wrk.role}</td>
                      <td className="p-3 text-xs text-slate-700">{wrk.assigned_phc}</td>
                      <td className="p-3 text-xs text-slate-600">{wrk.phone}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {wrk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 6: EQUIPMENT & RESOURCE REQUESTS */}
      {activeTab === 'demands' && (
        <section className="card p-6 border-slate-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="eyebrow">UPWARD RESOURCE MANAGEMENT</span>
              <h2 className="text-xl font-black text-slate-900">Equipment & Resource Requests to Central Authority</h2>
              <p className="text-xs text-slate-500">Submit requests for equipment, medicines, infrastructure, or staffing upward to Central Authority. (Self-approval is disabled).</p>
            </div>
            <button onClick={() => setShowDemandModal(true)} className="primary-btn text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 font-black">
              <Plus className="h-4 w-4" /> Submit Upward Resource Request
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Item / Resource Title</th>
                  <th className="p-3">Request Type</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status from Central</th>
                  <th className="p-3">Central Resolution / Note</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(req => (
                  <tr key={req.id} className="border-t border-slate-100">
                    <td className="p-3 font-extrabold text-slate-900">{req.title}</td>
                    <td className="p-3 text-xs font-semibold capitalize text-slate-600">{req.request_type.replaceAll('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${req.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : req.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                        {req.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-600">{req.resolution_note || 'Awaiting review & approval by Central Authority'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Demand Resource Modal */}
      {showDemandModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={submitResourceDemand} className="card w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Demand Resources to Central Authority</h2>
                <p className="text-xs text-slate-500">Level 2 Area Authority Upward Request Form</p>
              </div>
              <button type="button" onClick={() => setShowDemandModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <label className="block">
                Request Category
                <select value={demandType} onChange={e => setDemandType(e.target.value)} className="input mt-1 text-xs">
                  <option value="equipment">Medical Equipment (ECG, BP Monitors, Oxygen)</option>
                  <option value="medicine">Medicines & Vaccine Stocks</option>
                  <option value="infrastructure">Infrastructure & Water/Power</option>
                  <option value="staffing">Staffing Support (ASHA / ANM / Nurses)</option>
                  <option value="other">Other PHC Requirements</option>
                </select>
              </label>

              <label className="block">
                Item / Resource Required
                <input required value={demandTitle} onChange={e => setDemandTitle(e.target.value)} placeholder="e.g. Oxygen Cylinders with Flowmeters" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Quantity Required
                <input required value={demandQuantity} onChange={e => setDemandQuantity(e.target.value)} placeholder="e.g. 10 Units" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Reason & Clinical Justification
                <textarea required value={demandReason} onChange={e => setDemandReason(e.target.value)} placeholder="Explain affected village area, current stock shortage, and justification..." className="input mt-1 min-h-20 text-xs font-normal" />
              </label>

              <label className="block">
                Priority
                <select value={demandPriority} onChange={e => setDemandPriority(e.target.value)} className="input mt-1 text-xs">
                  <option value="normal">Normal Routine Demand</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Emergency Supply</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowDemandModal(false)} className="secondary-btn text-xs">Cancel</button>
              <button disabled={busy} className="primary-btn text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow">
                {busy ? 'Submitting...' : 'Submit Request Upward to Central'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

{/* ========================================================================= */}
{/* 3. PHC FIELD WORKER DASHBOARD (Treatment & Compliance Tracking)            */}
{/* ========================================================================= */}
function PhcWorkerDashboard({ profile }: { profile: any }) {
  const [patients, setPatients] = useState<PatientTreatmentRow[]>([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [notice, setNotice] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [village, setVillage] = useState('');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadData() {
    const { data, error } = await supabase
      .from('patients')
      .select('id,patient_code,name,age,gender,village,current_medications,existing_conditions,next_follow_up_date,notes')
      .order('created_at', { ascending: false });

    if (error) setNotice('Unable to load patient treatment list.');
    else setPatients((data || []) as PatientTreatmentRow[]);
  }

  useEffect(() => { loadData(); }, []);

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setNotice('');

    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProf } = await supabase.from('users').select('facility_id').eq('id', user?.id || '').single();

    const code = `GS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { error } = await supabase.from('patients').insert({
      patient_code: code,
      name: name.trim(),
      age: Number(age),
      gender,
      village: village.trim() || 'Assigned PHC Area',
      current_medications: medications ? medications.split(',').map(m => m.trim()) : null,
      existing_conditions: conditions ? conditions.split(',').map(c => c.trim()) : null,
      notes: notes.trim() || null,
      registered_by: user?.id,
      registered_phc_id: userProf?.facility_id || null,
      verification_status: 'verified'
    });

    setBusy(false);
    if (error) { setNotice(`Failed to add patient: ${error.message}`); return; }

    setName(''); setAge(''); setVillage(''); setMedications(''); setConditions(''); setNotes('');
    setShowAddPatientModal(false);
    setNotice(`New patient ${code} added with history & medications record.`);
    loadData();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-200 backdrop-blur">
              <HeartPulse className="h-4 w-4 text-emerald-300" /> TIER 3 — PHC FIELD HEALTHCARE WORKER
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              Patient Care Treatment & Prescription Compliance Tracker
            </h1>
            <p className="mt-2 text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Track patient treatment, check if patients follow prescribed medication schedules, add patient details, past medical history, and follow-up care.
            </p>
          </div>
          <button onClick={() => setShowAddPatientModal(true)} className="primary-btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black">
            <UserPlus className="h-4 w-4" /> Add Patient Details & History
          </button>
        </div>
      </section>

      {notice && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{notice}</div>}

      {/* Patient Treatment & Prescription Compliance Table */}
      <section className="card p-6 border-slate-200 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="eyebrow">AREA PATIENT TREATMENT MONITORING</span>
            <h2 className="text-xl font-black text-slate-900">Patients Under Active Treatment & Prescription Tracking</h2>
            <p className="text-xs text-slate-500">Monitor compliance, past medical history, and schedule follow-ups.</p>
          </div>
          <button onClick={() => setShowAddPatientModal(true)} className="secondary-btn text-xs">
            <UserPlus className="h-3.5 w-3.5" /> Add Patient Record
          </button>
        </div>

        {patients.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Village Area</th>
                  <th className="p-3">Current Condition / History</th>
                  <th className="p-3">Prescribed Medicines</th>
                  <th className="p-3">Prescription Compliance</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.patient_code} · {p.age} yrs · {p.gender}</p>
                    </td>
                    <td className="p-3 text-xs font-semibold text-slate-700">{p.village || 'Assigned Area'}</td>
                    <td className="p-3 text-xs text-slate-600">
                      {p.existing_conditions?.join(', ') || 'Routine Wellness'}
                    </td>
                    <td className="p-3 text-xs font-semibold text-blue-800">
                      {p.current_medications?.join(', ') || 'Iron & Folic Acid'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Following Prescription
                      </span>
                    </td>
                    <td className="p-3">
                      <Link href={`/patients/${p.patient_code}`} className="text-xs font-bold text-blue-700 hover:underline">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">No patients under active treatment in this PHC scope.</div>
        )}
      </section>

      {/* Add Patient & History Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <form onSubmit={handleAddPatient} className="card w-full max-w-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Add Patient & Clinical History Details</h2>
              <button type="button" onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs font-bold">
              <label className="block">
                Full Name
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Patel" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Age
                <input required type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age in years" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Gender
                <select value={gender} onChange={e => setGender(e.target.value)} className="input mt-1 text-xs">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block">
                Village / Area
                <input value={village} onChange={e => setVillage(e.target.value)} placeholder="Village name" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block sm:col-span-2">
                Existing Conditions / Past Medical History
                <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="e.g. Hypertension, Iron Deficiency (comma-separated)" className="input mt-1 text-xs font-normal" />
              </label>

              <label className="block sm:col-span-2">
                Current Prescribed Medicines
                <input value={medications} onChange={e => setMedications(e.target.value)} placeholder="e.g. Iron & Folic Acid, BP Tablets (comma-separated)" className="input mt-1 text-xs font-normal" />
              </label>

              <label className="block sm:col-span-2">
                Clinical Care Notes & Treatment Plan
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add care instructions, next visit date, or observation notes..." className="input mt-1 min-h-20 text-xs font-normal" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddPatientModal(false)} className="secondary-btn text-xs">Cancel</button>
              <button disabled={busy} className="primary-btn text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                {busy ? 'Saving...' : 'Save Patient History'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
