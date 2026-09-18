'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: name.trim(),
          requested_role: 'patient'
        }
      }
    });

    if (signupError) {
      setError(signupError.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      router.replace('/patient-dashboard');
      return;
    }

    router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <main className="grid min-h-screen bg-slate-50 p-4 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-800 to-slate-950 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3 text-2xl font-black">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl text-blue-700">+</span>
            GramCare
          </div>
          <p className="mt-2 text-sm font-semibold text-blue-200">Connected Healthcare for Rural Communities</p>
        </div>
        <div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">SECURE PATIENT ACCESS</span>
          <h1 className="mt-5 max-w-lg text-5xl font-black leading-tight">Start with trusted care.</h1>
          <p className="mt-5 max-w-md leading-7 text-blue-100">Your clinical record remains under PHC control. Staff accounts and authority roles are approved separately.</p>
        </div>
        <p className="text-sm text-blue-200">Email verification is required before access.</p>
      </section>

      <section className="mx-auto flex w-full max-w-md flex-col justify-center py-8">
        <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <div className="card border-slate-200 p-6 shadow-xl sm:p-9">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <UserPlus className="h-7 w-7" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Verified account creation
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create a patient account to view information shared by your authorised PHC.</p>

          {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-800">Full name<input required value={name} onChange={event => setName(event.target.value)} className="input mt-1" autoComplete="name" /></label>
            <label className="block text-sm font-bold text-slate-800">Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="input mt-1" autoComplete="email" /></label>
            <label className="block text-sm font-bold text-slate-800">Password<input required type="password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} className="input mt-1" autoComplete="new-password" /><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 8 characters.</span></label>
            <label className="block text-sm font-bold text-slate-800">Confirm password<input required type="password" minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="input mt-1" autoComplete="new-password" /></label>
            <button disabled={busy} className="primary-btn w-full justify-center py-3"><Lock className="h-4 w-4" />{busy ? 'Creating account…' : 'Create patient account'}</button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-bold text-blue-700">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
