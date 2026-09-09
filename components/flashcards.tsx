'use client';

import React, { useState } from 'react';
import { 
  HeartPulse, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Baby, 
  FileText, 
  Activity, 
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export interface Flashcard {
  id: string;
  category: 'vitals' | 'maternal' | 'referral' | 'emergency';
  categoryLabelEn: string;
  categoryLabelHi: string;
  icon: React.ReactNode;
  questionEn: string;
  questionHi: string;
  subtitleEn: string;
  subtitleHi: string;
  answerTitleEn: string;
  answerTitleHi: string;
  stepsEn: string[];
  stepsHi: string[];
  alertEn?: string;
  alertHi?: string;
  bgGradientFront: string;
  bgGradientBack: string;
}

const flashcardsData: Flashcard[] = [
  {
    id: '1',
    category: 'emergency',
    categoryLabelEn: 'Emergency Vitals',
    categoryLabelHi: 'आपातकालीन संकेत',
    icon: <AlertTriangle className="h-6 w-6 text-rose-600" />,
    questionEn: 'Severe BP Elevation (>140/90 mmHg with Headache or Blurry Vision)',
    questionHi: 'गंभीर बीपी वृद्धि (>140/90 mmHg सिरदर्द या धुंधली दृष्टि के साथ)',
    subtitleEn: 'Signs of severe pre-eclampsia or hypertensive emergency.',
    subtitleHi: 'गंभीर प्री-एकलम्पसिया या उच्च रक्तचाप आपात स्थिति के संकेत।',
    answerTitleEn: 'Immediate Emergency Action Steps:',
    answerTitleHi: 'तत्काल आपातकालीन कार्रवाई के कदम:',
    stepsEn: [
      'Position patient comfortably on left side rest.',
      'Notify District/PHC Doctor immediately for urgent review.',
      'Arrange emergency referral transport to nearest CHC/Hospital.',
      'Monitor blood pressure every 15 minutes.'
    ],
    stepsHi: [
      'मरीज को बाईं करवट आराम की स्थिति में लिटाएं।',
      'तत्काल समीक्षा के लिए तुरंत पीएचसी डॉक्टर को सूचित करें।',
      'निकटतम सामुदायिक स्वास्थ्य केंद्र/अस्पताल के लिए आपातकालीन एम्बुलेंस व्यवस्थित करें।',
      'हर 15 मिनट में रक्तचाप की निगरानी करें।'
    ],
    alertEn: 'Critical Risk: Do not delay referral for severe hypertension.',
    alertHi: 'अति आवश्यक: गंभीर उच्च रक्तचाप के लिए रेफरल में देरी न करें।',
    bgGradientFront: 'from-rose-500/10 via-red-500/5 to-white border-rose-200',
    bgGradientBack: 'from-rose-600 to-rose-700 text-white border-rose-600'
  },
  {
    id: '2',
    category: 'maternal',
    categoryLabelEn: 'Maternal Care',
    categoryLabelHi: 'मातृ स्वास्थ्य',
    icon: <Baby className="h-6 w-6 text-pink-600" />,
    questionEn: 'High-Risk Pregnancy (HRP) Triage Checklist',
    questionHi: 'उच्च जोखिम वाली गर्भावस्था (HRP) ट्राइएज चेकलिस्ट',
    subtitleEn: 'Key warning signs requiring specialized clinical monitoring.',
    subtitleHi: 'विशेष नैदानिक निगरानी की आवश्यकता वाले प्रमुख चेतावनी संकेत।',
    answerTitleEn: 'Clinical Care Protocol:',
    answerTitleHi: 'नैदानिक देखभाल प्रोटोकॉल:',
    stepsEn: [
      'Check Hemoglobin (Hb < 7 g/dL indicates severe anemia).',
      'Inspect for facial or pedal edema.',
      'Log fetal movement status and maternal weight progression.',
      'Schedule priority ANC checkup with Medical Officer.'
    ],
    stepsHi: [
      'हीमोग्लोबिन की जांच करें (Hb < 7 g/dL गंभीर एनीमिया दर्शाता है)।',
      'चेहरे या पैरों में सूजन की जांच करें।',
      'भ्रूण की हलचल और मां के वजन में वृद्धि दर्ज करें।',
      'चिकित्सा अधिकारी के साथ प्राथमिकता एएनसी जांच शेड्यूल करें।'
    ],
    alertEn: 'High Risk: Require at least 4 ANC visits and iron supplementation.',
    alertHi: 'उच्च जोखिम: कम से कम 4 एएनसी जांच और आयरन पूरकता की आवश्यकता है।',
    bgGradientFront: 'from-pink-500/10 via-purple-500/5 to-white border-pink-200',
    bgGradientBack: 'from-pink-600 to-purple-700 text-white border-pink-600'
  },
  {
    id: '3',
    category: 'vitals',
    categoryLabelEn: 'Vitals & Diabetes',
    categoryLabelHi: 'वाइटल्स और मधुमेह',
    icon: <Activity className="h-6 w-6 text-sky-600" />,
    questionEn: 'Random Blood Sugar (RBS) > 200 mg/dL Management',
    questionHi: 'रैंडम ब्लड शुगर (RBS) > 200 mg/dL प्रबंधन',
    subtitleEn: 'Screening for hyperglycemia and uncontrolled diabetes.',
    subtitleHi: 'हाइपरग्लाइसेमिया और अनियंत्रित मधुमेह की जांच।',
    answerTitleEn: 'Follow-Up Protocol:',
    answerTitleHi: 'फॉलो-अप प्रोटोकॉल:',
    stepsEn: [
      'Confirm with Fasting Blood Sugar (FBS) test next morning.',
      'Evaluate for polyuria, polydipsia, or unexplained weight loss.',
      'Advise dietary control and hydration immediately.',
      'Refer to Doctor for glycemic control treatment plan.'
    ],
    stepsHi: [
      'अगली सुबह फास्टिंग ब्लड शुगर (FBS) परीक्षण से पुष्टि करें।',
      'बार-बार पेशाब आने, प्यास लगने या वजन घटने का मूल्यांकन करें।',
      'तुरंत आहार नियंत्रण और पर्याप्त पानी पीने की सलाह दें।',
      'शुगर नियंत्रण उपचार योजना के लिए डॉक्टर के पास भेजें।'
    ],
    bgGradientFront: 'from-sky-500/10 via-blue-500/5 to-white border-sky-200',
    bgGradientBack: 'from-sky-600 to-blue-700 text-white border-sky-600'
  },
  {
    id: '4',
    category: 'referral',
    categoryLabelEn: 'Referral Protocol',
    categoryLabelHi: 'रेफरल प्रोटोकॉल',
    icon: <FileText className="h-6 w-6 text-emerald-600" />,
    questionEn: 'How to Complete a Tele-Referral to Medical Specialist',
    questionHi: 'मेडिकल स्पेशलिस्ट को टेली-रेफरल कैसे पूरा करें',
    subtitleEn: 'Ensure smooth handoff between village health worker and PHC doctor.',
    subtitleHi: 'गांव के स्वास्थ्य कार्यकर्ता और पीएचसी डॉक्टर के बीच सुचारू संचार सुनिश्चित करें।',
    answerTitleEn: 'Standard Referral Workflow:',
    answerTitleHi: 'मानक रेफरल प्रक्रिया:',
    stepsEn: [
      'Log full patient history including recent BP, Pulse, Spo2 & Sugar.',
      'Attach clear photos of clinical reports or physical symptoms if present.',
      'Select target CHC/PHC Facility and clinical priority.',
      'Share GramCare Digital Referral Pass with patient guardian.'
    ],
    stepsHi: [
      'बीपी, पल्स, ऑक्सीजन स्तर और शुगर सहित रोगी का पूरा इतिहास दर्ज करें।',
      'यदि रिपोर्ट या लक्षण हों तो उनकी स्पष्ट तस्वीरें संलग्न करें।',
      'लक्ष्य पीएचसी/अस्पताल सुविधा और नैदानिक प्राथमिकता चुनें।',
      'रोगी के अभिभावक के साथ ग्रामकेयर डिजिटल रेफरल पास साझा करें।'
    ],
    bgGradientFront: 'from-emerald-500/10 via-teal-500/5 to-white border-emerald-200',
    bgGradientBack: 'from-emerald-600 to-teal-700 text-white border-emerald-600'
  }
];

export function FlashcardsSection({ lang = 'English' }: { lang?: 'English' | 'हिंदी' }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const filteredCards = activeCategory === 'all' 
    ? flashcardsData 
    : flashcardsData.filter(c => c.category === activeCategory);

  const currentCard = filteredCards[currentIndex % filteredCards.length] || flashcardsData[0];
  const isHi = lang === 'हिंदी';

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm animate-pulse-subtle">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>{isHi ? 'इंटरैक्टिव क्लिनिकल गाइड कार्ड्स' : 'Interactive Clinical Guidance Flashcards'}</span>
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {isHi ? 'स्वास्थ्य सेवा सहायता कार्ड' : 'Quick Health Protocols & Decision Guidance'}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-base leading-6 text-slate-600">
          {isHi 
            ? 'कार्ड पर क्लिक करके महत्वपूर्ण नैदानिक कदम और आपातकालीन दिशानिर्देश देखें।' 
            : 'Click any card to flip and view key clinical steps, referral protocols, and emergency guidance.'}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {[
          { id: 'all', en: 'All Topics', hi: 'सभी विषय' },
          { id: 'emergency', en: 'Emergency Signals', hi: 'आपातकालीन' },
          { id: 'maternal', en: 'Maternal Care', hi: 'मातृ स्वास्थ्य' },
          { id: 'vitals', en: 'Vitals & Risk', hi: 'वाइटल्स' },
          { id: 'referral', en: 'Referrals', hi: 'रेफरल' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCategory(tab.id);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeCategory === tab.id
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isHi ? tab.hi : tab.en}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div 
          onClick={() => setIsFlipped(!isFlipped)} 
          className="perspective-1000 h-[380px] w-full max-w-2xl cursor-pointer select-none"
        >
          <div className={`flip-card-inner card shadow-xl ${isFlipped ? 'is-flipped' : ''}`}>
            <div className={`flip-card-front flex flex-col justify-between border-2 bg-gradient-to-br ${currentCard.bgGradientFront} p-7 shadow-lg transition-transform`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-slate-800 shadow-sm border border-slate-200">
                    {currentCard.icon}
                    {isHi ? currentCard.categoryLabelHi : currentCard.categoryLabelEn}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    <RotateCw className="h-3.5 w-3.5" />
                    {isHi ? 'पलटने के लिए क्लिक करें' : 'Click to flip'}
                  </span>
                </div>

                <div className="mt-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isHi ? 'क्लिनिकल स्थिति / प्रश्न' : 'Clinical Scenario / Question'}
                  </span>
                  <h3 className="mt-2 text-2xl font-black leading-snug text-slate-900">
                    {isHi ? currentCard.questionHi : currentCard.questionEn}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {isHi ? currentCard.subtitleHi : currentCard.subtitleEn}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4">
                <span className="text-xs font-semibold text-slate-500">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700">
                  <span>{isHi ? 'प्रोटोकॉल देखें' : 'Reveal Guidance'}</span>
                  <RotateCw className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className={`flip-card-back flex flex-col justify-between border-2 bg-gradient-to-br ${currentCard.bgGradientBack} p-7 shadow-2xl text-white`}>
              <div>
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">
                      {isHi ? currentCard.answerTitleHi : currentCard.answerTitleEn}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur">
                    <RotateCw className="h-3.5 w-3.5" />
                    {isHi ? 'वापस पलटें' : 'Flip back'}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5 text-sm">
                  {(isHi ? currentCard.stepsHi : currentCard.stepsEn).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[11px] font-black text-slate-900">
                        {idx + 1}
                      </span>
                      <span className="leading-snug text-white/95 font-medium">{step}</span>
                    </li>
                  ))}
                </ul>

                {(currentCard.alertEn || currentCard.alertHi) && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-black/20 p-2.5 text-xs font-bold text-amber-200 border border-amber-300/30">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
                    <span>{isHi ? currentCard.alertHi : currentCard.alertEn}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/80 font-medium">
                <span>{isHi ? 'ग्रामकेयर क्लिनिकल प्रोटोकॉल' : 'GramCare Standard Care Protocol'}</span>
                <span className="underline">{isHi ? 'सामने जाएं' : 'Flip back'} →</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={prevCard}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:scale-95"
            aria-label="Previous flashcard"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {filteredCards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(i);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIndex % filteredCards.length 
                    ? 'w-7 bg-blue-600' 
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:scale-95"
            aria-label="Next flashcard"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
