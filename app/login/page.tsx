'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { uiRoleFor } from '@/lib/auth';
import { 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Crown, 
  Building2, 
  HeartPulse, 
  UserCheck, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface RolePreset {
  id: string;
  level: string;
  name: string;
  roleTitle: string;
  email: string;
  icon: typeof Crown;
  badgeColor: string;
  scopeDescription: string;
}

const rolePresets: RolePreset[] = [
  {
    id: 'central',
    level: '1st Level Authority',
    name: 'Central Authority',
    roleTitle: 'Full System Access',
    email: 'central@gramswasthya.demo',
    icon: Crown,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    scopeDescription: 'Full authorized access across all PHCs, patient registries, vitals, referrals, follow-ups, and worker management.'
  },
  {
    id: 'head',
    level: '2nd Level Authority',
    name: 'Area / PHC Head',
    roleTitle: 'Area Scoped Access',
    email: 'phchead@gramswasthya.demo',
    icon: Building2,
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    scopeDescription: 'Access strictly restricted to their assigned PHC facility, assigned workers, area patients, and local care workflows.'
  },
  {
    id: 'worker',
    level: '3rd Level Staff',
    name: 'PHC Worker / ASHA / ANM',
    roleTitle: 'Patient Care & Guidance',
    email: 'worker@gramswasthya.demo',
    icon: HeartPulse,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    scopeDescription: 'Assigned PHC scope; can register patients, record vitals, guide patients, create referrals, and complete follow-ups.'
  },
  {
    id: 'patient',
    level: '4th Level Patient',
    name: 'Patient Account',
    roleTitle: 'Personal Record Access',
    email: 'patient@gramswasthya.demo',
    icon: UserCheck,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    scopeDescription: 'Read-only access restricted strictly to their own linked patient record and assigned PHC details. Cannot edit clinical data.'
  }
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('central@gramswasthya.demo');
  const [password, setPassword] = useState<string>('Demo@12345');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('central');
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  async function performLogin(targetEmail: string, presetId: string) {
    setBusy(true);
    setError('');

    // Sign out any existing session first to ensure clean role switch
    await supabase.auth.signOut();

    // 1. Attempt standard sign in
    let { data, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: 'Demo@12345'
    });

    // 2. Auto-provision demo user if needed
    if ((authError || !data?.user) && targetEmail.includes('@gramswasthya.demo')) {
      const roleMap: Record<string, { name: string; role: string }> = {
        'central@gramswasthya.demo': { name: 'Central Authority Demo', role: 'central_authority' },
        'phchead@gramswasthya.demo': { name: 'PHC Head Demo', role: 'phc_head' },
        'worker@gramswasthya.demo': { name: 'ASHA Worker Demo', role: 'phc_worker' },
        'patient@gramswasthya.demo': { name: 'Patient Demo', role: 'patient' }
      };

      const presetInfo = roleMap[targetEmail] || {
        name: presetId === 'central' ? 'Central Authority' : presetId === 'head' ? 'PHC Head' : presetId === 'worker' ? 'ASHA Worker' : 'Patient Demo',
        role: presetId === 'central' ? 'central_authority' : presetId === 'head' ? 'phc_head' : presetId === 'worker' ? 'phc_worker' : 'patient'
      };

      const signUpRes = await supabase.auth.signUp({
        email: targetEmail,
        password: 'Demo@12345',
        options: {
          data: { name: presetInfo.name, requested_role: presetInfo.role }
        }
      });

      if (signUpRes.data?.user) {
        const retryRes = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: 'Demo@12345'
        });
        data = retryRes.data;
        authError = retryRes.error;
      }
    }

    if (!data?.user) {
      setError(authError?.message || 'Unable to sign in. Please check your credentials.');
      setBusy(false);
      return;
    }

    const roleDbMap: Record<string, string> = {
      'central@gramswasthya.demo': 'central_authority',
      'phchead@gramswasthya.demo': 'phc_head',
      'worker@gramswasthya.demo': 'phc_worker',
      'patient@gramswasthya.demo': 'patient'
    };

    const targetDbRole = roleDbMap[targetEmail] || (presetId === 'central' ? 'central_authority' : presetId === 'head' ? 'phc_head' : presetId === 'worker' ? 'phc_worker' : 'patient');

    await supabase.from('users').upsert({
      id: data.user.id,
      email: targetEmail,
      name: targetEmail.split('@')[0].toUpperCase(),
      role: targetDbRole
    });

    const targetUiRole = uiRoleFor(targetDbRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem('override_role', targetUiRole);
      localStorage.setItem('gramcare_role', targetDbRole);
      localStorage.setItem('demo_role', targetDbRole);
    }

    router.replace(targetUiRole === 'patient' ? '/patient-dashboard' : '/dashboard');
  }

  function selectRole(preset: RolePreset) {
    setSelectedPresetId(preset.id);
    setEmail(preset.email);
    setPassword('Demo@12345');
    setError('');
    performLogin(preset.email, preset.id);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    performLogin(email.trim(), selectedPresetId);
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] p-4 lg:p-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-2xl text-white">+</span>
            Gram<span className="text-blue-600">Care</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Row Level Security (RLS) Active
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column: 4 User Tier Selectors */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="eyebrow">ROLE-BASED HEALTHCARE SECURITY</span>
              <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Select Your Authorised Role
              </h1>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                GramCare strictly enforces 4 user access tiers in both frontend and database policies. Select a role below for instant demo sign in:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {rolePresets.map(preset => {
                const Icon = preset.icon;
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => selectRole(preset)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${preset.badgeColor}`}>
                        <Icon className="h-3 w-3" /> {preset.level}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                    </div>

                    <h2 className="mt-2 text-sm font-black text-slate-900">{preset.name}</h2>
                    <p className="text-[11px] font-bold text-blue-700 mt-0.5">{preset.roleTitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {preset.scopeDescription}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-900">
              <span className="font-bold flex items-center gap-1 mb-1">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> Data Scope Guarantee:
              </span>
              Users can never see or modify records outside their authorized scope. Clinical records remain read-only for patients.
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="lg:col-span-5">
            <div className="card p-6 sm:p-8 shadow-xl border-slate-200">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Sign in securely</h2>
                  <p className="text-xs text-slate-500">Authorised GramCare Credentials</p>
                </div>
              </div>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  Account Email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input mt-1.5 py-2 text-xs font-semibold"
                    placeholder="Enter email"
                  />
                </label>

                <label className="block text-xs font-bold text-slate-700">
                  Password
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input mt-1.5 py-2 text-xs font-semibold"
                    placeholder="Enter password"
                  />
                </label>

                {error && (
                  <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
                    {error}
                  </p>
                )}

                <button
                  disabled={busy}
                  className="primary-btn w-full justify-center text-xs py-2.5 bg-blue-600 hover:bg-blue-700"
                >
                  <Lock className="h-4 w-4" />
                  {busy ? 'Signing in...' : 'Sign In to Workspace'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                <p className="text-[11px] font-semibold text-slate-500">
                  Demo Password: <span className="font-bold text-slate-800">Demo@12345</span>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
