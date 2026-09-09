'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Stethoscope, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  LogIn,
  CheckCircle2
} from 'lucide-react';

const roles = [
  {
    value: 'asha',
    title: 'Health Worker (ASHA / ANM)',
    note: 'Register patients and coordinate community care in villages.',
    icon: <User className="h-5 w-5 text-blue-600" />
  },
  {
    value: 'doctor',
    title: 'Doctor / Medical Officer',
    note: 'Review clinical referrals, vitals, and high-risk priorities.',
    icon: <Stethoscope className="h-5 w-5 text-emerald-600" />
  },
  {
    value: 'admin',
    title: 'Health Admin',
    note: 'Manage health facilities, care teams, and system access.',
    icon: <ShieldCheck className="h-5 w-5 text-violet-600" />
  }
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<'asha' | 'doctor' | 'admin'>('asha');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    facility: ''
  });
  const [error, setError] = useState('');
  const [rateLimitNotice, setRateLimitNotice] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  async function handleDirectLogin() {
    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password
      });

      if (signInError) {
        // Direct to login page with prefilled email
        router.push(`/login?email=${encodeURIComponent(email)}`);
        return;
      }

      if (signInData?.session && signInData?.user) {
        await supabase.from('users').upsert({
          id: signInData.user.id,
          name: form.name.trim() || 'Health Worker',
          phone: form.phone.replace(/\s/g, ''),
          email: email,
          role: role
        }, { onConflict: 'id' });

        if (role === 'doctor' || role === 'admin') {
          router.replace('/dashboard');
        } else {
          router.replace('/workspace');
        }
      }
    } catch {
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setDisabledNotice(false);
    setRateLimitNotice(false);

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    const cleanPhone = form.phone.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return setError('Enter a valid 10-digit mobile number.');
    }

    const email = form.email.trim().toLowerCase();
    setBusy(true);

    try {
      // 1. Attempt Supabase Auth Sign Up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            phone: cleanPhone,
            facility: form.facility.trim(),
            requested_role: role
          }
        }
      });

      // 2. If Sign Up returns error (e.g. rate limit or email confirmation issue)
      if (signUpError) {
        const isRateLimit = signUpError.message.toLowerCase().includes('rate limit') || signUpError.status === 429;
        const isDisabled = signUpError.message.toLowerCase().includes('disabled');

        // First attempt direct sign-in in case account already exists
        const { data: directSignIn } = await supabase.auth.signInWithPassword({
          email,
          password: form.password
        });

        if (directSignIn?.session && directSignIn?.user) {
          await supabase.from('users').upsert({
            id: directSignIn.user.id,
            name: form.name.trim(),
            phone: cleanPhone,
            email: email,
            role: role
          }, { onConflict: 'id' });

          if (role === 'doctor' || role === 'admin') {
            router.replace('/dashboard');
          } else {
            router.replace('/workspace');
          }
          return;
        }

        if (isRateLimit) {
          setRateLimitNotice(true);
          setError(
            'Supabase Email Rate Limit Reached: Email confirmation limit exceeded. Click below to log in directly with your credentials or turn OFF "Confirm email" in Supabase Dashboard.'
          );
          return;
        }

        if (isDisabled) {
          setDisabledNotice(true);
          setError(
            'Email signups are currently disabled in your Supabase project configuration.'
          );
          return;
        }

        setError(signUpError.message);
        return;
      }

      // 3. Attempt immediate post-signup sign-in
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password: form.password
      });

      const user = signInData?.user || signUpData?.user;

      if (user) {
        await supabase.from('users').upsert({
          id: user.id,
          name: form.name.trim(),
          phone: cleanPhone,
          email: email,
          role: role
        }, { onConflict: 'id' });
      }

      if (signInData?.session) {
        if (role === 'doctor' || role === 'admin') {
          router.replace('/dashboard');
        } else {
          router.replace('/workspace');
        }
      } else {
        router.replace('/login?created=1');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during account creation.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-base font-bold text-blue-700 hover:underline">
          ← Back to GramCare
        </Link>

        <form onSubmit={submit} className="card mt-4 p-6 sm:p-9 shadow-xl border-slate-200">
          <div className="flex items-center justify-between">
            <p className="eyebrow flex items-center gap-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Create your secure account
            </p>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
              Instant Setup
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Tell us how you support care
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Fill in your details to create an account and access your care workspace immediately.
          </p>

          {error && (
            <div role="alert" className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-5 text-sm font-semibold leading-6 text-rose-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <span className="font-extrabold text-rose-900 block">{error}</span>

                  {rateLimitNotice && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-300 p-4 text-amber-950 font-normal">
                      <p className="font-bold flex items-center gap-1.5 text-amber-950 text-sm">
                        <HelpCircle className="h-4.5 w-4.5 text-amber-700" />
                        Quick Solutions for Rate Limit Error:
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs text-amber-900 leading-5">
                        <li className="flex items-start gap-1.5">
                          <span>1.</span>
                          <span><strong>Log In Directly:</strong> If your account was registered, click the button below to sign in instantly.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span>2.</span>
                          <span><strong>Turn OFF "Confirm email" in Supabase:</strong> Open <em>Supabase Dashboard → Authentication → Email → Turn OFF "Confirm email"</em>.</span>
                        </li>
                      </ul>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleDirectLogin}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-amber-800 transition"
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Try Logging In Directly Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {disabledNotice && (
                    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900 font-normal">
                      <p className="font-bold flex items-center gap-1.5 text-amber-950 text-sm">
                        <HelpCircle className="h-4 w-4 text-amber-700" />
                        How to enable Email Signups in Supabase:
                      </p>
                      <ol className="mt-2 list-decimal list-inside space-y-1 text-xs leading-5 text-amber-900">
                        <li>Open your <strong>Supabase Dashboard</strong> (https://supabase.com/dashboard).</li>
                        <li>Navigate to <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Email</strong>.</li>
                        <li>Toggle <strong>ON</strong> <strong>"Enable Email provider"</strong> & <strong>"Allow new users to sign up"</strong>.</li>
                        <li>Toggle <strong>OFF</strong> <strong>"Confirm email"</strong>.</li>
                        <li>Click <strong>Save</strong> and try signing up again.</li>
                      </ol>
                    </div>
                  )}

                  {!rateLimitNotice && !disabledNotice && (
                    <p className="mt-2 font-normal text-rose-700">
                      Tip: If your account was already created, try{' '}
                      <button
                        type="button"
                        onClick={handleDirectLogin}
                        className="font-bold underline text-rose-900"
                      >
                        logging in directly
                      </button>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <fieldset className="mt-7">
            <legend className="text-base font-extrabold text-slate-900">Select your care role</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                    role === r.value
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="role"
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                  />
                  <div className="flex items-center gap-2">
                    {r.icon}
                    <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                  </div>
                  <span className="mt-2 block text-xs leading-5 text-slate-600">{r.note}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Form Fields with fixed spacing and non-overlapping text */}
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              value={form.name}
              change={value => update('name', value)}
              placeholder="e.g. Anita Sharma"
              type="text"
              icon={<User className="h-5 w-5 text-slate-400" />}
            />
            <Field
              label="Mobile number"
              value={form.phone}
              change={value => update('phone', value)}
              placeholder="10-digit phone number"
              type="tel"
              icon={<Phone className="h-5 w-5 text-slate-400" />}
            />
            <Field
              label="Work email"
              value={form.email}
              change={value => update('email', value)}
              placeholder="name@example.org"
              type="email"
              icon={<Mail className="h-5 w-5 text-slate-400" />}
            />
            <Field
              label="Health facility or village"
              value={form.facility}
              change={value => update('facility', value)}
              placeholder="e.g. Rampur PHC"
              type="text"
              icon={<Building2 className="h-5 w-5 text-slate-400" />}
            />
            <PasswordField
              label="Password"
              value={form.password}
              change={value => update('password', value)}
              show={show}
              toggle={() => setShow(!show)}
            />
            <PasswordField
              label="Confirm password"
              value={form.confirmPassword}
              change={value => update('confirmPassword', value)}
              show={show}
              toggle={() => setShow(!show)}
            />
          </div>

          <label className="mt-7 flex items-start gap-3 text-sm leading-6 text-slate-700">
            <input required type="checkbox" className="mt-1 h-5 w-5 rounded accent-blue-600" />
            <span>I confirm that the information provided is accurate for official care coordination.</span>
          </label>

          <button
            disabled={busy}
            className="primary-btn mt-7 w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-blue-500/20"
          >
            {busy ? (
              <span>Creating your account…</span>
            ) : (
              <>
                <span>Create account & Sign in</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm font-semibold text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleDirectLogin}
              className="font-extrabold text-blue-700 hover:underline"
            >
              Log in directly
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  change,
  placeholder,
  type,
  icon
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  placeholder: string;
  type: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-extrabold text-slate-800">
      {label}
      <div className="relative mt-2">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
            {icon}
          </div>
        )}
        <input
          required
          type={type}
          value={value}
          onChange={event => change(event.target.value)}
          placeholder={placeholder}
          autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined}
          className={`input ${icon ? 'input-icon-left' : ''}`}
          style={icon ? { paddingLeft: '3.25rem' } : undefined}
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  change,
  show,
  toggle
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <label className="block text-sm font-extrabold text-slate-800">
      {label}
      <div className="relative mt-2">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
          <Lock className="h-5 w-5" />
        </div>
        <input
          required
          minLength={6}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={event => change(event.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          className="input input-icon-both"
          style={{ paddingLeft: '3.25rem', paddingRight: '5.5rem' }}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition z-10"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
