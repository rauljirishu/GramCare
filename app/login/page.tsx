'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  LogIn
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('created') === '1') {
      setNotice('Your account was created successfully! Please log in with your email and password below.');
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError || !data.user) {
        setError(authError?.message || 'Account not found. Please check your credentials or create a new account.');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role || data.user.user_metadata?.requested_role || 'asha';

      if (!profile) {
        await supabase.from('users').upsert({
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Care Worker',
          email: data.user.email,
          role: role
        }, { onConflict: 'id' });
      }

      router.replace(role === 'doctor' || role === 'admin' ? '/dashboard' : '/workspace');
    } catch (err: any) {
      setError(err?.message || 'An error occurred during sign in.');
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) return setError('Enter your email address first, then click Forgot password.');
    setBusy(true);
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`
    });
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setNotice('If this email address exists, password reset instructions have been sent.');
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-base font-bold text-blue-700 hover:underline">
          ← GramCare Home
        </Link>

        <form onSubmit={submit} className="card mt-4 p-6 sm:p-9 shadow-xl border-slate-200">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <LogIn className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Log in to access your secure GramCare workspace.
          </p>

          {notice && (
            <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <label className="mt-6 block text-sm font-extrabold text-slate-800">
            Email
            <div className="relative mt-2">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
                <Mail className="h-5 w-5" />
              </div>
              <input
                className="input input-icon-left"
                style={{ paddingLeft: '3.25rem' }}
                type="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="name@example.org"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="mt-5 block text-sm font-extrabold text-slate-800">
            Password
            <div className="relative mt-2">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
                <Lock className="h-5 w-5" />
              </div>
              <input
                className="input input-icon-both"
                style={{ paddingLeft: '3.25rem', paddingRight: '5.5rem' }}
                type={show ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition z-10"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={forgot}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            disabled={busy}
            className="primary-btn mt-7 w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-blue-500/20"
          >
            {busy ? (
              <span>Signing in…</span>
            ) : (
              <>
                <span>Log in securely</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm font-semibold text-slate-600">
            No account yet?{' '}
            <Link className="font-extrabold text-blue-700 hover:underline" href="/signup">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
