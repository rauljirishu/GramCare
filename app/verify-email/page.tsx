'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Mail, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Clock
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const errorParam = searchParams.get('error') || '';

  const [email, setEmail] = useState(emailParam);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(
    errorParam === 'email_not_confirmed' 
      ? 'Please verify your email before signing in.' 
      : ''
  );

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email.trim()) {
      setError('Please enter your email address to resend the verification link.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (resendError) {
        if (resendError.message.toLowerCase().includes('rate limit') || resendError.status === 429) {
          setError('Unable to send the verification email right now. Please wait a moment before trying again.');
        } else {
          setError(resendError.message);
        }
      } else {
        setNotice(`Verification email sent again to ${email.trim()}! Please check your inbox and spam folder.`);
        setCooldown(60); // 60-second cooldown
      }
    } catch {
      setError('Unable to send the verification email right now. Please try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </Link>

        <div className="card mt-4 p-6 sm:p-9 shadow-xl border-slate-200">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-sm">
            <Mail className="h-7 w-7" />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authentication Guard</span>
          </div>

          <h1 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            Verify your email
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            We've sent a verification link to your email address. You must verify your email before accessing your GramCare workspace.
          </p>

          {email && (
            <div className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-3.5 flex items-center gap-3 border border-slate-200">
              <Mail className="h-5 w-5 text-blue-600 shrink-0" />
              <span className="font-extrabold text-slate-900 text-sm truncate">{email}</span>
            </div>
          )}

          {notice && (
            <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!email && (
            <label className="mt-5 block text-sm font-extrabold text-slate-800">
              Your Email Address
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.org"
                className="input mt-2"
              />
            </label>
          )}

          <div className="mt-7 space-y-3">
            <button
              onClick={handleResend}
              disabled={busy || cooldown > 0}
              className="primary-btn w-full justify-center py-3 text-sm font-bold shadow-md shadow-blue-500/10 disabled:opacity-60"
            >
              {busy ? (
                <span>Sending verification email…</span>
              ) : cooldown > 0 ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Resend in {cooldown}s</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Resend verification email</span>
                </span>
              )}
            </button>

            <Link
              href="/login"
              className="flex w-full justify-center items-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
        <div className="text-sm font-bold text-slate-600">Loading email verification...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
