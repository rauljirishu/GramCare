'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  BadgeCheck, 
  Calendar, 
  Edit3, 
  Camera, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Stethoscope,
  Briefcase,
  X
} from 'lucide-react';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;
  gender?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  department?: string;
  designation?: string;
  assigned_area?: string;
  joining_date?: string;
  staff_id?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfileData>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Toast Alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (dbUser && active) {
            const data: UserProfileData = {
              id: dbUser.id,
              name: dbUser.name || user.user_metadata?.name || 'Administrator Rishu',
              email: dbUser.email || user.email || 'admin@gramcare.gov.in',
              phone: dbUser.phone || '+91 98765 43210',
              role: dbUser.role || 'admin',
              avatar_url: dbUser.avatar_url || undefined,
              gender: dbUser.gender || 'Female',
              dob: dbUser.dob || '1992-05-14',
              address: dbUser.address || '',
              city: dbUser.city || '',
              state: dbUser.state || '',
              pincode: dbUser.pincode || '',
              department: dbUser.department || '',
              designation: dbUser.designation || '',
              assigned_area: dbUser.assigned_area || '',
              joining_date: dbUser.joining_date || '2021-08-15',
              staff_id: dbUser.staff_id || 'GC-STAFF-2026-88',
              created_at: dbUser.created_at || user.created_at || new Date().toISOString()
            };
            setProfile(data);
          } else if (user && active) {
            // Fallback demo profile
            const demo: UserProfileData = {
              id: user.id,
              name: user.user_metadata?.name || 'Administrator Rishu',
              email: user.email || 'admin@gramcare.gov.in',
              phone: '+91 98765 43210',
              role: user.user_metadata?.requested_role || 'admin',
              gender: 'Female',
              dob: '1992-05-14',
              address: '',
              city: '',
              state: '',
              pincode: '',
              department: '',
              designation: '',
              assigned_area: '',
              joining_date: '2021-08-15',
              staff_id: 'GC-STAFF-2026-88',
              created_at: user.created_at || new Date().toISOString()
            };
            setProfile(demo);
          }
        }
        if (active) setLoading(false);
      } catch {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditForm({ ...profile });
    setAvatarPreview(profile.avatar_url || null);
    setEditModalOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast('Image file size must be less than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      setEditForm(prev => ({ ...prev, avatar_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setEditForm(prev => ({ ...prev, avatar_url: '' }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validation
    if (!editForm.name?.trim()) {
      triggerToast('Full Name is required.', 'error');
      return;
    }
    if (editForm.pincode && !/^\d{6}$/.test(editForm.pincode)) {
      triggerToast('Please enter a valid 6-digit PIN code.', 'error');
      return;
    }

    setSaving(true);
    try {
      const updatedData: UserProfileData = {
        ...profile,
        ...editForm,
        name: editForm.name.trim()
      };

      const { error } = await supabase
        .from('users')
        .update({
          name: updatedData.name,
          phone: updatedData.phone,
          avatar_url: updatedData.avatar_url,
          gender: updatedData.gender,
          dob: updatedData.dob,
          address: updatedData.address,
          city: updatedData.city,
          state: updatedData.state,
          pincode: updatedData.pincode,
          department: updatedData.department,
          designation: updatedData.designation,
          assigned_area: updatedData.assigned_area
        })
        .eq('id', profile.id);

      // Local state update immediately
      setProfile(updatedData);
      setSaving(false);
      setEditModalOpen(false);
      triggerToast(t('profileUpdatedSuccess'), 'success');
    } catch {
      setSaving(false);
      triggerToast(t('profileUpdateFailed'), 'error');
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <Loading label="Loading profile records…" />
      </DashboardShell>
    );
  }

  const p = profile || {
    id: 'demo-user',
    name: 'Administrator Rishu',
    email: 'admin@gramcare.gov.in',
    phone: '+91 98765 43210',
    role: 'admin',
    gender: 'Female',
    dob: '1992-05-14',
    address: '',
    city: '',
    state: '',
    pincode: '',
    department: '',
    designation: '',
    assigned_area: '',
    joining_date: '2021-08-15',
    staff_id: 'GC-STAFF-2026-88',
    created_at: new Date().toISOString()
  };

  const initials = p.name ? p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'GC';

  return (
    <DashboardShell>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl p-4 text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Profile Banner Summary Card */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-800/40">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.name} className="h-24 w-24 rounded-2xl object-cover border-4 border-blue-400/40 shadow-md shrink-0" />
            ) : (
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-blue-600 font-black text-3xl border-4 border-blue-400/40 shadow-md">
                {initials}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{p.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-extrabold text-blue-200 capitalize">
                  {p.role === 'admin' ? <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> : <Stethoscope className="h-3.5 w-3.5 text-blue-400" />}
                  <span>{p.role}</span>
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-300">{p.designation} • {p.department}</p>
              <p className="mt-2 text-xs font-semibold text-blue-300 flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span>{p.city}, {p.state} • {p.assigned_area}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            <span>{t('editProfile')}</span>
          </button>
        </div>
      </div>

      {/* Grid Section: Personal, Professional, & Account Information */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Personal Information */}
        <section className="card p-6 border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="h-5 w-5 text-blue-600" />
            <span>{t('personalInfo')}</span>
          </h2>
          <dl className="mt-4 space-y-3.5 text-xs">
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('fullName')}</dt><dd className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{p.name}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('email')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {p.email}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('phone')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {p.phone}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('gender')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">{p.gender}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('dob')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {p.dob}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('address')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{p.address}, {p.city}, {p.state} - {p.pincode}</dd></div>
          </dl>
        </section>

        {/* Card 2: Professional Information */}
        <section className="card p-6 border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            <span>{t('professionalInfo')}</span>
          </h2>
          <dl className="mt-4 space-y-3.5 text-xs">
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('role')}</dt><dd className="font-extrabold text-blue-700 dark:text-blue-400 text-sm mt-0.5 capitalize">{p.role}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('staffId')}</dt><dd className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{p.staff_id}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('department')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{p.department}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('designation')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{p.designation}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('assignedArea')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {p.assigned_area}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('joiningDate')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{p.joining_date}</dd></div>
          </dl>
        </section>

        {/* Card 3: Account Information */}
        <section className="card p-6 border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            <span>{t('accountInfo')}</span>
          </h2>
          <dl className="mt-4 space-y-3.5 text-xs">
            <div>
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('accountStatus')}</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified & Active</span>
                </span>
              </dd>
            </div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('lastLogin')}</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Today at 17:45 (Web Session)</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Account Created</dt><dd className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{new Date(p.created_at || '').toLocaleDateString()}</dd></div>
            <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">System User ID</dt><dd className="font-mono text-[11px] text-slate-500 truncate mt-0.5">{p.id}</dd></div>
          </dl>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold">
                  <Edit3 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('editProfile')}</h2>
                  <p className="text-xs text-slate-500">Update personal and clinical details</p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 grid place-items-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5 text-xs">
              {/* Avatar Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Profile Photo / Avatar</label>
                <div className="mt-2 flex items-center gap-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="h-16 w-16 rounded-2xl object-cover border-2 border-blue-500" />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white font-black text-xl">
                      {initials}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="secondary-btn text-xs py-2 px-3 cursor-pointer">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                    </label>

                    {avatarPreview && (
                      <button type="button" onClick={handleRemoveAvatar} className="rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-xs font-bold flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Gender</label>
                  <select
                    value={editForm.gender || 'Female'}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                    className="input mt-1 bg-white dark:bg-slate-900"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dob || ''}
                    onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    value={editForm.department || ''}
                    onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation || ''}
                    onChange={e => setEditForm({ ...editForm, designation: e.target.value })}
                    className="input mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="input mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">State</label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editForm.pincode || ''}
                    onChange={e => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditModalOpen(false)} className="secondary-btn text-xs py-2.5">
                  {t('cancel')}
                </button>
                <button disabled={saving} type="submit" className="primary-btn text-xs py-2.5">
                  {saving ? 'Saving changes…' : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
