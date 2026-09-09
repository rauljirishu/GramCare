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
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Briefcase,
  Award,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

const specializationsList = [
  'General Medicine',
  'Family Medicine',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'ENT (Otorhinolaryngology)',
  'Ophthalmology',
  'Psychiatry',
  'Emergency Medicine',
  'General Surgery',
  'Neurology',
  'Nephrology',
  'Pulmonology',
  'Oncology',
  'Other'
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'asha' | 'doctor' | 'admin'>('asha');
  const [showPassword, setShowPassword] = useState(false);

  // Common Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('English');

  // ASHA / ANM Specific Fields
  const [workerType, setWorkerType] = useState<'asha' | 'anm'>('asha');
  const [workerId, setWorkerId] = useState('');
  const [village, setVillage] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [block, setBlock] = useState('');
  const [district, setDistrict] = useState('');
  const [facility, setFacility] = useState('');

  // Doctor Specific Fields
  const [doctorType, setDoctorType] = useState<'doctor' | 'medical_officer'>('doctor');
  const [degree, setDegree] = useState('MBBS');
  const [institution, setInstitution] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [councilState, setCouncilState] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [department, setDepartment] = useState('Outpatient Department (OPD)');

  // Admin Specific Fields
  const [adminDesignation, setAdminDesignation] = useState('District Health Officer');
  const [adminOrg, setAdminOrg] = useState('District Health Authority');
  const [adminAuthKey, setAdminAuthKey] = useState('');

  // Status & Validation
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function validateStep2(): boolean {
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }

    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    // Role-specific validation
    if (role === 'doctor' && !licenseNumber.trim()) {
      setError('Medical license/registration number is required for doctor accounts.');
      return false;
    }

    if (role === 'admin' && !adminAuthKey.trim()) {
      setError('Health Admin registration requires an Admin Security Authorization Key.');
      return false;
    }

    return true;
  }

  function handleNextStep() {
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  async function handleFinalSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateStep2()) {
      setStep(2);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\s/g, '');
    setBusy(true);

    try {
      // 1. Register user via Supabase Auth (Confirm email ON, no auto-login)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name.trim(),
            phone: cleanPhone,
            requested_role: role,
            preferred_language: language,
            worker_type: role === 'asha' ? workerType : undefined,
            worker_id: role === 'asha' ? workerId : undefined,
            village: village,
            gram_panchayat: gramPanchayat,
            block: block,
            district: district,
            facility: facility,
            doctor_type: role === 'doctor' ? doctorType : undefined,
            degree: role === 'doctor' ? degree : undefined,
            institution: role === 'doctor' ? institution : undefined,
            license_number: role === 'doctor' ? licenseNumber : undefined,
            council_state: role === 'doctor' ? councilState : undefined,
            experience_years: role === 'doctor' ? experienceYears : undefined,
            specialization: role === 'doctor' ? specialization : undefined,
            department: role === 'doctor' ? department : undefined,
            admin_designation: role === 'admin' ? adminDesignation : undefined,
            admin_org: role === 'admin' ? adminOrg : undefined,
            verification_status: role === 'doctor' ? 'PENDING_VERIFICATION' : role === 'admin' ? 'VERIFIED' : 'APPROVED'
          }
        }
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes('rate limit') || signUpError.status === 429) {
          setError('Unable to send the verification email right now. Please try again in a moment.');
        } else if (msg.includes('already registered') || msg.includes('already exists')) {
          setError('An account with this email address already exists. Please log in or verify your email.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // 2. Redirect to /verify-email without creating sessions or auto-login
      if (signUpData?.user) {
        router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
      } else {
        router.push('/login?created=1');
      }
    } catch {
      setError('Unable to complete account registration. Please try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:py-12 transition-colors">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header Link */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline">
            ← GramCare Home
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 px-3.5 py-1 text-xs font-black text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Verified Registration System
          </span>
        </div>

        {/* Signup Form Card */}
        <div className="card mt-4 p-6 sm:p-10 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          
          {/* Progress Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && 'Role Selection'}
                {step === 2 && 'Account & Role Details'}
                {step === 3 && 'Review & Submit'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
            Create your care workspace account
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400 font-medium">
            Create your account and verify your email to access your care workspace.
          </p>

          {error && (
            <div role="alert" className="mt-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-5 text-sm font-semibold leading-6 text-rose-800 dark:text-rose-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-extrabold text-rose-900 dark:text-rose-100 block text-base">{error}</span>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                      className="font-bold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Resend Verification Email
                    </Link>
                    <span>•</span>
                    <Link
                      href={`/login?email=${encodeURIComponent(email.trim())}`}
                      className="font-bold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Go to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Select your healthcare role
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your selected role determines your dynamic registration fields and workspace permissions.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* ASHA / ANM */}
                <label
                  onClick={() => setRole('asha')}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                    role === 'asha'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                  }`}
                >
                  <input type="radio" name="role" checked={role === 'asha'} onChange={() => setRole('asha')} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Health Worker</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400 font-medium">
                    ASHA / ANM health workers collecting field vitals and coordinating community care.
                  </p>
                </label>

                {/* Doctor */}
                <label
                  onClick={() => setRole('doctor')}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                    role === 'doctor'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                  }`}
                >
                  <input type="radio" name="role" checked={role === 'doctor'} onChange={() => setRole('doctor')} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Doctor / Clinician</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400 font-medium">
                    Physicians and medical officers reviewing triage priorities and digital referrals.
                  </p>
                </label>

                {/* Admin */}
                <label
                  onClick={() => setRole('admin')}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                    role === 'admin'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                  }`}
                >
                  <input type="radio" name="role" checked={role === 'admin'} onChange={() => setRole('admin')} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Health Admin</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400 font-medium">
                    System administrators managing health facilities, care teams, and audit logs.
                  </p>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="primary-btn w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-blue-500/20"
                >
                  <span>Continue to Registration Details</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC ROLE & ACCOUNT DETAILS */}
          {step === 2 && (
            <div className="mt-8 space-y-8">
              
              {/* SECTION A: COMMON ACCOUNT CREDENTIALS */}
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  1. Common Account Credentials
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full Name *"
                    value={name}
                    change={setName}
                    placeholder="e.g. Anita Sharma"
                    type="text"
                    icon={<User className="h-5 w-5 text-slate-400" />}
                  />
                  <Field
                    label="Mobile Number (10 Digits) *"
                    value={phone}
                    change={setPhone}
                    placeholder="e.g. 9876543210"
                    type="tel"
                    icon={<Phone className="h-5 w-5 text-slate-400" />}
                  />
                  <Field
                    label="Work / Primary Email Address *"
                    value={email}
                    change={setEmail}
                    placeholder="name@example.org"
                    type="email"
                    icon={<Mail className="h-5 w-5 text-slate-400" />}
                  />
                  <label className="block text-base font-extrabold text-slate-800 dark:text-slate-200">
                    Preferred Language
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="input mt-2"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                    </select>
                  </label>

                  <PasswordField
                    label="Password (min 6 chars) *"
                    value={password}
                    change={setPassword}
                    show={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                  />
                  <PasswordField
                    label="Confirm Password *"
                    value={confirmPassword}
                    change={setConfirmPassword}
                    show={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              {/* SECTION B: DYNAMIC ROLE SPECIFIC FIELDS */}

              {/* ROLE 1: ASHA / ANM */}
              {role === 'asha' && (
                <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 p-6 border border-blue-100 dark:border-blue-900/50 space-y-5">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-blue-200 dark:border-blue-800 pb-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    2. Health Worker Professional & Location Details
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-base font-extrabold text-slate-800 dark:text-slate-200">
                      Health Worker Type *
                      <select
                        value={workerType}
                        onChange={e => setWorkerType(e.target.value as any)}
                        className="input mt-2"
                      >
                        <option value="asha">ASHA (Accredited Social Health Activist)</option>
                        <option value="anm">ANM (Auxiliary Nurse Midwife)</option>
                      </select>
                    </label>

                    <Field
                      label="Worker / Employee Staff ID"
                      value={workerId}
                      change={setWorkerId}
                      placeholder="e.g. ASHA-MH-2026-981"
                      type="text"
                    />

                    <Field
                      label="Assigned Village *"
                      value={village}
                      change={setVillage}
                      placeholder="e.g. Rampur"
                      type="text"
                      icon={<MapPin className="h-5 w-5 text-slate-400" />}
                    />

                    <Field
                      label="Gram Panchayat"
                      value={gramPanchayat}
                      change={setGramPanchayat}
                      placeholder="e.g. Rampur Gram Panchayat"
                      type="text"
                    />

                    <Field
                      label="Block / Taluka"
                      value={block}
                      change={setBlock}
                      placeholder="e.g. Haveli Block"
                      type="text"
                    />

                    <Field
                      label="District *"
                      value={district}
                      change={setDistrict}
                      placeholder="e.g. Pune"
                      type="text"
                    />

                    <Field
                      label="Primary Health Center (PHC) Facility"
                      value={facility}
                      change={setFacility}
                      placeholder="e.g. Rampur Sub-Center PHC"
                      type="text"
                      icon={<Building2 className="h-5 w-5 text-slate-400" />}
                    />
                  </div>
                </div>
              )}

              {/* ROLE 2: DOCTOR / MEDICAL OFFICER */}
              {role === 'doctor' && (
                <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 p-6 border border-emerald-100 dark:border-emerald-900/50 space-y-5">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-3">
                    <Stethoscope className="h-5 w-5 text-emerald-600" />
                    2. Doctor Professional Medical Registration
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-base font-extrabold text-slate-800 dark:text-slate-200">
                      Doctor Role Type *
                      <select
                        value={doctorType}
                        onChange={e => setDoctorType(e.target.value as any)}
                        className="input mt-2"
                      >
                        <option value="doctor">Specialist / Clinical Doctor</option>
                        <option value="medical_officer">PHC Medical Officer (MO)</option>
                      </select>
                    </label>

                    <Field
                      label="Medical Qualification / Degree *"
                      value={degree}
                      change={setDegree}
                      placeholder="e.g. MBBS, MD (General Medicine)"
                      type="text"
                      icon={<Award className="h-5 w-5 text-slate-400" />}
                    />

                    <Field
                      label="Medical License / Registration Number *"
                      value={licenseNumber}
                      change={setLicenseNumber}
                      placeholder="e.g. MCI-2018-998877"
                      type="text"
                      icon={<FileCheck className="h-5 w-5 text-slate-400" />}
                    />

                    <Field
                      label="State Medical Council"
                      value={councilState}
                      change={setCouncilState}
                      placeholder="e.g. Maharashtra Medical Council"
                      type="text"
                    />

                    <label className="block text-base font-extrabold text-slate-800 dark:text-slate-200">
                      Clinical Specialization *
                      <select
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value)}
                        className="input mt-2"
                      >
                        {specializationsList.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    <Field
                      label="Years of Clinical Experience"
                      value={experienceYears}
                      change={setExperienceYears}
                      placeholder="e.g. 8"
                      type="number"
                    />

                    <Field
                      label="Current Facility / Hospital Name"
                      value={facility}
                      change={setFacility}
                      placeholder="e.g. District Referral Hospital"
                      type="text"
                      icon={<Building2 className="h-5 w-5 text-slate-400" />}
                    />

                    <Field
                      label="Department"
                      value={department}
                      change={setDepartment}
                      placeholder="e.g. General Medicine / Triage"
                      type="text"
                    />
                  </div>

                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200 font-semibold leading-5">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
                      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                      Doctor Account Verification Requirement:
                    </p>
                    <p className="mt-1">
                      To prevent unauthorized clinical access, doctor accounts are registered under <strong>PENDING_VERIFICATION</strong> status. Full clinical referral controls are activated upon credentials review.
                    </p>
                  </div>
                </div>
              )}

              {/* ROLE 3: HEALTH ADMIN */}
              {role === 'admin' && (
                <div className="rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 p-6 border border-violet-100 dark:border-violet-900/50 space-y-5">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-violet-200 dark:border-violet-800 pb-3">
                    <ShieldCheck className="h-5 w-5 text-violet-600" />
                    2. Health Admin Authorization & Credentials
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Admin Designation *"
                      value={adminDesignation}
                      change={setAdminDesignation}
                      placeholder="e.g. District Health Officer (DHO)"
                      type="text"
                    />

                    <Field
                      label="Organization / Health Authority *"
                      value={adminOrg}
                      change={setAdminOrg}
                      placeholder="e.g. State Public Health Dept"
                      type="text"
                    />

                    <Field
                      label="District"
                      value={district}
                      change={setDistrict}
                      placeholder="e.g. Pune"
                      type="text"
                    />

                    <PasswordField
                      label="Admin Security Authorization Key *"
                      value={adminAuthKey}
                      change={setAdminAuthKey}
                      show={showPassword}
                      toggle={() => setShowPassword(!showPassword)}
                    />
                  </div>

                  <div className="rounded-xl bg-violet-100 dark:bg-violet-950/60 p-4 border border-violet-200 dark:border-violet-800 text-xs text-violet-950 dark:text-violet-200 font-semibold leading-5">
                    <p className="font-bold flex items-center gap-1.5 text-violet-950 dark:text-violet-100">
                      <ShieldAlert className="h-4 w-4 text-violet-600 shrink-0" />
                      Controlled Administrative Privileges:
                    </p>
                    <p className="mt-1">
                      Health Admin accounts grant system-wide control. Registration requires a valid Admin Security Authorization Key provided by your health department administrator.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="secondary-btn py-3 px-6 text-base font-bold"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Role Selection</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="primary-btn py-3 px-8 text-base font-bold shadow-lg shadow-blue-500/20"
                >
                  <span>Review Information</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="mt-8 space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Review Your Account Information
              </h2>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 space-y-4 text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Care Role</span>
                    <p className="font-black text-slate-900 dark:text-slate-100 text-base capitalize">{role} Account</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Full Name</span>
                    <p className="font-black text-slate-900 dark:text-slate-100 text-base">{name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Work Email</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Mobile Phone</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{phone}</p>
                  </div>
                  {role === 'asha' && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Worker Type</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">{workerType}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Assigned Village & District</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{village || '—'}, {district || '—'}</p>
                      </div>
                    </>
                  )}
                  {role === 'doctor' && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Medical License</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{licenseNumber}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Specialization</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{specialization}</p>
                      </div>
                    </>
                  )}
                  {role === 'admin' && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Designation</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{adminDesignation}</p>
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300 leading-6">
                <input required type="checkbox" className="mt-1 h-5 w-5 rounded accent-blue-600 shrink-0" />
                <span>I confirm that the information provided is accurate for official rural healthcare coordination.</span>
              </label>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="secondary-btn py-3 px-6 text-base font-bold"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Edit Information</span>
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="primary-btn py-3.5 px-8 text-base font-bold shadow-lg shadow-blue-500/20"
                >
                  {busy ? (
                    <span>Creating account…</span>
                  ) : (
                    <>
                      <span>Create Account & Send Verification</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link className="font-extrabold text-blue-700 dark:text-blue-400 hover:underline" href="/login">
              Log in directly
            </Link>
          </p>
        </div>
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
    <label className="block text-base font-extrabold text-slate-800 dark:text-slate-200">
      {label}
      <div className="relative mt-2">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
            {icon}
          </div>
        )}
        <input
          required={label.includes('*')}
          type={type}
          value={value}
          onChange={event => change(event.target.value)}
          placeholder={placeholder}
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
    <label className="block text-base font-extrabold text-slate-800 dark:text-slate-200">
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
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition z-10"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
