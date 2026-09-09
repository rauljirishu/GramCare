'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FlashcardsSection } from '@/components/flashcards';
import { 
  Users, 
  HeartHandshake, 
  Ambulance, 
  Calendar, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowRight, 
  Globe,
  Sparkles,
  Stethoscope,
  Activity,
  Heart,
  HeartPulse,
  UserCheck,
  Hospital,
  Globe2
} from 'lucide-react';

type Language = 'English' | 'हिंदी';

const copy = {
  English: {
    hero: 'Care that reaches every village.',
    intro: 'GramCare helps health workers, doctors, and administrators coordinate safer care—wherever it is needed.',
    start: 'Create account',
    login: 'Log in',
    works: 'How it works',
    flashcardsNav: 'Guidance Cards',
    language: 'Language'
  },
  'हिंदी': {
    hero: 'हर गांव तक पहुंचने वाली स्वास्थ्य देखभाल।',
    intro: 'ग्रामकेयर स्वास्थ्य कर्मियों, डॉक्टरों और प्रशासकों को सुरक्षित देखभाल समन्वयित करने में मदद करता है।',
    start: 'खाता बनाएं',
    login: 'लॉग इन',
    works: 'यह कैसे काम करता है',
    flashcardsNav: 'सहायता कार्ड',
    language: 'भाषा'
  }
};

const features = [
  { icon: <Users className="h-7 w-7 text-blue-600" />, titleEn: 'Patient management', titleHi: 'रोगी प्रबंधन', textEn: 'Keep permitted patient profiles, visits, and care needs in one organized view.', textHi: 'अनुमत रोगी प्रोफाइल, विज़िट और देखभाल की जरूरतों को व्यवस्थित रखें।', color: 'bg-blue-50/80 border-blue-100' },
  { icon: <HeartHandshake className="h-7 w-7 text-emerald-600" />, titleEn: 'Health worker coordination', titleHi: 'स्वास्थ्य कार्यकर्ता समन्वय', textEn: 'Connect field workers and clinicians around the same care plan.', textHi: 'फील्ड कार्यकर्ताओं और डॉक्टरों को एक ही देखभाल योजना से जोड़ें।', color: 'bg-emerald-50/80 border-emerald-100' },
  { icon: <Ambulance className="h-7 w-7 text-amber-600" />, titleEn: 'Referrals & Triage', titleHi: 'रेफरल और ट्राइएज', textEn: 'Send and track referrals to the right facility without losing vital context.', textHi: 'महत्वपूर्ण जानकारी खोए बिना सही अस्पताल में रेफरल भेजें और ट्रैक करें।', color: 'bg-amber-50/80 border-amber-100' },
  { icon: <Calendar className="h-7 w-7 text-violet-600" />, titleEn: 'Follow-up tracking', titleHi: 'फॉलो-अप ट्रैकिंग', textEn: 'Never miss a scheduled check-in with clear, timely automated reminders.', textHi: 'स्पष्ट, समय पर याद दिलाते हुए कोई भी निर्धारित जांच न चूकें।', color: 'bg-violet-50/80 border-violet-100' },
  { icon: <FileSpreadsheet className="h-7 w-7 text-rose-600" />, titleEn: 'Health records', titleHi: 'स्वास्थ्य रिकॉर्ड', textEn: 'Access secure health information when you are authorized to do so.', textHi: 'अधिकृत होने पर सुरक्षित स्वास्थ्य जानकारी और वाइटल्स तक पहुंच प्राप्त करें।', color: 'bg-rose-50/80 border-rose-100' },
  { icon: <ShieldCheck className="h-7 w-7 text-cyan-600" />, titleEn: 'Private by design', titleHi: 'गोपनीयता सुरक्षा', textEn: 'Role-based access keeps sensitive health information in the right hands.', textHi: 'भूमिका-आधारित पहुंच संवेदनशील स्वास्थ्य डेटा को सुरक्षित रखती है।', color: 'bg-cyan-50/80 border-cyan-100' }
];

const steps = [
  { number: '01', titleEn: 'Create your account', titleHi: 'अपना खाता बनाएं', textEn: 'Enter your contact details and select your care role.', textHi: 'अपने संपर्क विवरण दर्ज करें और अपनी भूमिका चुनें।' },
  { number: '02', titleEn: 'Direct Login', titleHi: 'सीधा लॉग इन करें', textEn: 'Access your workspace immediately with your credentials.', textHi: 'अपनी साख के साथ सीधे अपने वर्कस्पेस तक पहुंचें।' },
  { number: '03', titleEn: 'Coordinate care', titleHi: 'देखभाल का समन्वय करें', textEn: 'Manage daily patient care, referrals, and vital checkups.', textHi: 'दैनिक रोगी देखभाल, रेफरल और स्वास्थ्य जांच प्रबंधित करें।' }
];

export default function WelcomePage() {
  const [language, setLanguage] = useState<Language>('English');
  const [helpOpen, setHelpOpen] = useState(false);
  const t = copy[language];
  const isHi = language === 'हिंदी';

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
          <Brand />
          
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="nav-link">{isHi ? 'विशेषताएं' : 'Features'}</a>
            <a href="#flashcards" className="nav-link flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-blue-600" />
              {t.flashcardsNav}
            </a>
            <a href="#impact" className="nav-link">{isHi ? 'प्रभाव एवं लाभ' : 'Impact'}</a>
            <a href="#how-it-works" className="nav-link">{t.works}</a>
            <a href="#preview" className="nav-link">{isHi ? 'डैशबोर्ड' : 'Dashboard'}</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
              <Globe className="h-4 w-4 text-slate-500" />
              <label className="sr-only" htmlFor="language">{t.language}</label>
              <select
                id="language"
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="हिंदी">हिंदी (Hindi)</option>
              </select>
            </div>

            <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 sm:block">
              {t.login}
            </Link>
            <Link href="/signup" className="primary-btn !px-4 !py-2.5 text-sm">
              {t.start}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr]">
        <div className="absolute -left-20 top-10 -z-10 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute right-0 top-32 -z-10 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl animate-float" />
        
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>{isHi ? 'सुरक्षित ग्रामीण स्वास्थ्य नेटवर्क' : 'Secure Rural Health Network'}</span>
          </div>
          
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl text-slate-900">
            {t.hero}
          </h1>
          
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 font-medium">
            {t.intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="primary-btn px-6 py-3.5 text-base shadow-lg shadow-blue-500/20">
              <span>{t.start}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button onClick={() => setHelpOpen(true)} className="secondary-btn px-6 py-3.5 text-base">
              {t.works}
            </button>
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            {isHi ? 'पहले से पंजीकृत हैं?' : 'Already registered?'}{' '}
            <Link className="font-extrabold text-blue-700 hover:underline" href="/login">
              {t.login}
            </Link>
          </p>
        </div>

        <HeroCard />
      </section>

      {/* FLASHCARDS SECTION */}
      <div id="flashcards" className="border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50 py-12">
        <FlashcardsSection lang={language} />
      </div>

      {/* IMPACT AND BENEFITS SHOWCASE SECTION */}
      <section id="impact" className="border-y border-slate-200 bg-gradient-to-b from-white via-slate-50 to-blue-50/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-black text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Smart India Hackathon 2026</span>
            </div>
            <h2 className="mt-3 text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
              IMPACT AND BENEFITS
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 font-medium">
              GramCare helps reduce referral delays, improve record accessibility, strengthen coordination, and maintain continuity of healthcare for rural communities.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Patients */}
            <article className="card p-6 border-slate-200 text-center bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-rose-100 shadow-md">
                <img src="/images/patient_care_clinic.png" alt="For Patients" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 flex items-center justify-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-600" />
                For Patients
              </h3>
              <ul className="mt-4 space-y-2 text-left text-xs leading-5 text-slate-600 font-semibold">
                <li className="flex items-start gap-2">● Faster identification of high-risk cases</li>
                <li className="flex items-start gap-2">● Reduced unnecessary travel</li>
                <li className="flex items-start gap-2">● Better continuity of treatment</li>
                <li className="flex items-start gap-2">● Improved follow-up care</li>
              </ul>
            </article>

            {/* Health Workers */}
            <article className="card p-6 border-slate-200 text-center bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100 shadow-md">
                <img src="/images/rural_health_worker.png" alt="For Healthcare Workers" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 flex items-center justify-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Healthcare Workers
              </h3>
              <ul className="mt-4 space-y-2 text-left text-xs leading-5 text-slate-600 font-semibold">
                <li className="flex items-start gap-2">● Can work without internet</li>
                <li className="flex items-start gap-2">● Digital patient records</li>
                <li className="flex items-start gap-2">● AI-assisted prioritization</li>
                <li className="flex items-start gap-2">● Easier patient tracking</li>
              </ul>
            </article>

            {/* Doctors & Hospitals */}
            <article className="card p-6 border-slate-200 text-center bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-violet-100 shadow-md">
                <img src="/images/doctor_triage_dashboard.png" alt="For Doctors & Hospitals" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 flex items-center justify-center gap-2">
                <Hospital className="h-5 w-5 text-violet-600" />
                Doctors & Hospitals
              </h3>
              <ul className="mt-4 space-y-2 text-left text-xs leading-5 text-slate-600 font-semibold">
                <li className="flex items-start gap-2">● Centralized patient info</li>
                <li className="flex items-start gap-2">● High-risk cases visible quickly</li>
                <li className="flex items-start gap-2">● Better referral coordination</li>
                <li className="flex items-start gap-2">● Improved healthcare management</li>
              </ul>
            </article>

            {/* Social Impact */}
            <article className="card p-6 border-slate-200 text-center bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-emerald-100 shadow-md">
                <img src="/images/community_health_impact.png" alt="Social Impact" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 flex items-center justify-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-600" />
                Social Impact
              </h3>
              <ul className="mt-4 space-y-2 text-left text-xs leading-5 text-slate-600 font-semibold">
                <li className="flex items-start gap-2">● Improved healthcare accessibility</li>
                <li className="flex items-start gap-2">● Support for underserved areas</li>
                <li className="flex items-start gap-2">● Reduced healthcare delays</li>
                <li className="flex items-start gap-2">● Stronger rural healthcare</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="border-b border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">{isHi ? 'आसान और त्वरित शुरुआत' : 'A simple, direct start'}</p>
          <h2 className="section-title">{isHi ? 'ग्रामकेयर कैसे काम करता है' : 'How GramCare works'}</h2>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="card p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {isHi ? step.titleHi : step.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 font-medium">
                  {isHi ? step.textHi : step.textEn}
                </p>
                <div className="mt-6 h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-blue-600" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="eyebrow">{isHi ? 'आपकी टीम के लिए आवश्यक उपकरण' : 'Everything your care team needs'}</p>
        <h2 className="section-title">{isHi ? 'सामुदायिक स्वास्थ्य के लिए डिज़ाइन किया गया' : 'Designed for connected community care'}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 font-medium">
          {isHi 
            ? 'स्पष्ट कार्यप्रवाह टीमों को जानकारी खोजने में कम और लोगों की मदद करने में अधिक समय बिताने में मदद करते हैं।' 
            : 'Clear workflows help teams spend less time searching for information and more time helping people.'}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.titleEn} className={`group rounded-3xl border ${f.color} p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl`}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </span>
              <h3 className="mt-6 text-xl font-extrabold tracking-tight text-slate-900">
                {isHi ? f.titleHi : f.titleEn}
              </h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-600 font-medium">
                {isHi ? f.textHi : f.textEn}
              </p>
              <Link href="/signup" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 group-hover:underline">
                <span>{isHi ? 'उपकरण देखें' : 'Explore care tools'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Brand light />
            <p className="mt-4 max-w-xs text-xs leading-6 text-slate-400">
              A secure rural health network built for dependable care coordination.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-xs">
            <a href="#" className="footer-link">About</a>
            <a href="mailto:support@gramcare.org" className="footer-link">Contact</a>
            <a href="#" className="footer-link">Privacy</a>
            <button onClick={() => setHelpOpen(true)} className="text-left footer-link">
              Help / Support
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">
          © 2026 GramCare. Built for better community health.
        </div>
      </footer>

      {helpOpen && <Help onClose={() => setHelpOpen(false)} isHi={isHi} />}
    </main>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-sm">
        +
      </span>
      <span>
        <b className={`text-lg tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
          Gram<span className="text-blue-600">Care</span>
        </b>
        <small className={`block text-[10px] uppercase font-bold tracking-wider ${light ? 'text-slate-400' : 'text-slate-500'}`}>
          Rural Health Network
        </small>
      </span>
    </Link>
  );
}

function HeroCard() {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-200/50 sm:p-8 transition-transform duration-300 hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <b className="text-base font-extrabold text-slate-900">Care connected</b>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Network
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-md">
          <Stethoscope className="mx-auto h-7 w-7" />
          <p className="mt-2 text-xs font-bold">Health Worker</p>
        </div>
        <div className="rounded-2xl bg-sky-100 p-4 text-blue-900">
          <Heart className="mx-auto h-7 w-7 text-sky-600" />
          <p className="mt-2 text-xs font-bold">Patient Care</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-md">
          <Activity className="mx-auto h-7 w-7 text-emerald-400" />
          <p className="mt-2 text-xs font-bold">Clinician</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600 border border-slate-200/70 font-medium">
        Health records and vital triage info move securely from village field workers to primary health centers.
      </div>
    </div>
  );
}

function Help({ onClose, isHi }: { onClose: () => void; isHi: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isHi ? 'सहायता एवं जानकारी' : 'Help & Support'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isHi ? 'ग्रामकेयर शुरू करने के तीन आसान चरण।' : 'Get started in three clear steps.'}
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
            ✕
          </button>
        </div>

        <ol className="mt-6 space-y-4">
          {steps.map((step) => (
            <li className="flex gap-3" key={step.number}>
              <b className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                {step.number}
              </b>
              <p className="text-xs leading-5 text-slate-600 font-medium">
                <strong className="text-slate-800">{isHi ? step.titleHi : step.titleEn}.</strong>{' '}
                {isHi ? step.textHi : step.textEn}
              </p>
            </li>
          ))}
        </ol>

        <Link onClick={onClose} href="/signup" className="primary-btn mt-7 w-full justify-center text-base py-3 font-bold">
          {isHi ? 'खाता बनाएं' : 'Create an account'}
        </Link>
      </section>
    </div>
  );
}
