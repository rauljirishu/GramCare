'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Search, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Video as VideoIcon,
  Heart,
  Baby,
  Droplets,
  Syringe,
  Apple,
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
  ChevronLeft,
  Tv
} from 'lucide-react';

export interface CartoonScene {
  title: string;
  heading: string;
  narration: string;
  character: 'asha' | 'mother_baby' | 'doctor' | 'family' | 'ambulance' | 'water_hygiene' | 'nutrition_plate' | 'vaccine_shield';
  bgGradient: string;
  accentColor: string;
  animationItems: string[];
}

export interface GuidanceVideo {
  id: string;
  title: string;
  category: 'maternal' | 'hygiene' | 'vaccination' | 'nutrition' | 'emergency' | 'referral';
  categoryLabel: string;
  icon: typeof Heart;
  description: string;
  simpleLanguageSummary: string;
  duration: string;
  thumbnailGradient: string;
  keyTakeaways: string[];
  scenes: CartoonScene[];
}

const cartoonGuidanceVideos: GuidanceVideo[] = [
  {
    id: 'cartoon-maternal-child',
    title: 'Maternal & Child Health Care',
    category: 'maternal',
    categoryLabel: 'Maternal & Child',
    icon: Baby,
    description: 'Animated cartoon story explaining ANC checkups, iron nutrition, and newborn care with ASHA Didi.',
    simpleLanguageSummary: 'Watch ASHA Didi guide expected mother Sunita on pregnancy checkups, eating iron-rich foods, and newborn care.',
    duration: '3 Scenes (Interactive)',
    thumbnailGradient: 'from-pink-500 via-rose-500 to-rose-600',
    keyTakeaways: [
      'Attend at least 4 ANC checkups at your nearest PHC.',
      'Take iron and folic acid tablets daily after food.',
      'Watch for warning signs: severe headache, bleeding, swelling or fever.',
      'Ensure immediate breastfeeding within 1 hour of birth.'
    ],
    scenes: [
      {
        title: 'Scene 1: Home Visit by ASHA Didi',
        heading: 'Namaste! Regular Checkups Keep Mother & Baby Healthy',
        narration: 'ASHA Didi visits Sunita at home. During pregnancy, getting at least 4 health checkups at the PHC ensures the baby is growing strong and safe.',
        character: 'asha',
        bgGradient: 'from-pink-500 to-rose-600',
        accentColor: '#f43f5e',
        animationItems: ['💖 Healthy Heartbeat', '📋 PHC ANC Card', '🩺 Blood Pressure Check']
      },
      {
        title: 'Scene 2: Daily Power Foods & Iron Tablets',
        heading: 'Eat Iron-Rich Foods & Take Daily Supplements',
        narration: 'ASHA Didi shows a basket of fresh spinach, chickpeas, lemon and amla. Taking your daily iron tablet with food prevents anaemia and fatigue!',
        character: 'nutrition_plate',
        bgGradient: 'from-amber-500 to-rose-500',
        accentColor: '#f59e0b',
        animationItems: ['🥬 Green Vegetables', '🍊 Vitamin C Citrus', '💊 Daily Iron Tablet']
      },
      {
        title: 'Scene 3: Safe Delivery & Warm Newborn Care',
        heading: 'Safe Hospital Birth & Immediate Breastfeeding',
        narration: 'Sunita delivers a healthy baby boy at the PHC! Breastfeeding within 1 hour gives the baby first immunity and love.',
        character: 'mother_baby',
        bgGradient: 'from-rose-600 to-indigo-600',
        accentColor: '#6366f1',
        animationItems: ['👶 Warm Newborn Care', '🤱 First Milk Protection', '🌟 Healthy Smile']
      }
    ]
  },
  {
    id: 'cartoon-hygiene',
    title: 'Clean Hands & Safe Water',
    category: 'hygiene',
    categoryLabel: 'Basic Hygiene',
    icon: Droplets,
    description: 'Fun animated lesson on 20-second handwashing, clean drinking water storage, and Dengue mosquito prevention.',
    simpleLanguageSummary: 'Learn how washing hands with soap and clearing standing water keeps germs and Dengue mosquitoes away!',
    duration: '3 Scenes (Interactive)',
    thumbnailGradient: 'from-cyan-500 via-blue-500 to-teal-600',
    keyTakeaways: [
      'Wash hands for 20 seconds with soap before cooking and eating.',
      'Keep drinking water vessels covered and elevated.',
      'Empty coolers, pots, and tires to stop dengue mosquitoes.',
      'Use bed nets for infants and young children.'
    ],
    scenes: [
      {
        title: 'Scene 1: 20-Second Handwashing Magic',
        heading: 'Soap & Water Wash Germs Away!',
        narration: 'Watch the soap bubbles chase away invisible germs! Wash hands thoroughly before cooking, eating, and after using the bathroom.',
        character: 'water_hygiene',
        bgGradient: 'from-cyan-500 to-blue-600',
        accentColor: '#06b6d4',
        animationItems: ['🧼 Soap Bubbles', '💧 Clean Water Stream', '🦠 Germs Popping Away!']
      },
      {
        title: 'Scene 2: Covered Drinking Water',
        heading: 'Keep Drinking Water Clean & Covered',
        narration: 'Always store drinking water in covered pots with a long-handled ladle so hands do not touch the clean water inside.',
        character: 'water_hygiene',
        bgGradient: 'from-blue-600 to-teal-600',
        accentColor: '#0284c7',
        animationItems: ['🚰 Covered Pot', '🥄 Clean Ladle', '✨ Safe Drinking Water']
      },
      {
        title: 'Scene 3: Mosquito Mosquito Go Away!',
        heading: 'Empty Standing Water to Stop Mosquitoes',
        narration: 'Dengue mosquitoes breed in clean standing water! Empty water from coolers, buckets, and tires every week.',
        character: 'family',
        bgGradient: 'from-teal-600 to-emerald-600',
        accentColor: '#10b981',
        animationItems: ['🦟 Mosquito Bye-Bye!', '🪴 Dry Coolers & Pots', '🛌 Bed Net Protection']
      }
    ]
  },
  {
    id: 'cartoon-vaccination',
    title: 'Baby Vaccination Shield',
    category: 'vaccination',
    categoryLabel: 'Vaccination',
    icon: Syringe,
    description: 'Animated superhero guide on how vaccines build a protective immunity shield for babies against polio and measles.',
    simpleLanguageSummary: 'See how childhood vaccines create a glowing shield that protects babies from serious infections.',
    duration: '3 Scenes (Interactive)',
    thumbnailGradient: 'from-purple-500 via-indigo-500 to-blue-600',
    keyTakeaways: [
      'Receive birth vaccines (BCG, Polio, Hep-B) promptly.',
      'Keep your child vaccination card safe for every session.',
      'Mild fever after vaccination is normal; consult your ASHA if concerned.',
      'Complete all booster doses up to 5 years.'
    ],
    scenes: [
      {
        title: 'Scene 1: Immunization Day at PHC',
        heading: 'Welcome to Village Immunization Day!',
        narration: 'ASHA Didi welcomes mothers and babies to the PHC. Every vaccine gives your child superpowers against dangerous illnesses.',
        character: 'vaccine_shield',
        bgGradient: 'from-purple-500 to-indigo-600',
        accentColor: '#a855f7',
        animationItems: ['📜 Vaccination Card', '🏥 Friendly PHC Session', '👶 Baby Smile']
      },
      {
        title: 'Scene 2: The Magical Immunity Shield',
        heading: 'Vaccines Build a Strong Protection Shield',
        narration: 'When baby gets vaccinated, a sparkling immunity shield appears! Polio drops and routine vaccines guard against disease.',
        character: 'vaccine_shield',
        bgGradient: 'from-indigo-600 to-blue-600',
        accentColor: '#3b82f6',
        animationItems: ['🛡️ Glowing Immunity Shield', '💧 Two Polio Drops', '⭐ Health Stars']
      },
      {
        title: 'Scene 3: Growing Up Strong & Active',
        heading: 'Healthy Children, Happy Families!',
        narration: 'Protected by vaccines, children run, play, attend school, and grow into healthy adults. Keep vaccination cards updated!',
        character: 'family',
        bgGradient: 'from-blue-600 to-purple-600',
        accentColor: '#8b5cf6',
        animationItems: ['🏃 Happy Active Kids', '🎓 Ready for School', '🏆 Full Vaccine Protection']
      }
    ]
  },
  {
    id: 'cartoon-nutrition',
    title: 'The Rainbow Diet & Anaemia Shield',
    category: 'nutrition',
    categoryLabel: 'Nutrition',
    icon: Apple,
    description: 'Vibrant cartoon characters showing how green vegetables, pulses, and lemon build hemoglobin and energy.',
    simpleLanguageSummary: 'Meet the cartoon food heroes — spinach, chickpeas, and lemon — who team up to fight tiredness and anaemia!',
    duration: '3 Scenes (Interactive)',
    thumbnailGradient: 'from-emerald-500 via-teal-500 to-green-600',
    keyTakeaways: [
      'Combine pulses and grains with green leafy vegetables daily.',
      'Eat vitamin C foods (lemon, amla) with meals for iron absorption.',
      'Avoid drinking tea or coffee immediately after food.',
      'Ensure toddlers receive complementary soft foods from 6 months.'
    ],
    scenes: [
      {
        title: 'Scene 1: Meet the Food Superheroes!',
        heading: 'Spinach, Chickpeas & Lemon Team Up!',
        narration: 'Green spinach gives iron, lentils give protein, and lemon helps your body absorb iron! Together they build strong red blood cells.',
        character: 'nutrition_plate',
        bgGradient: 'from-emerald-500 to-teal-600',
        accentColor: '#10b981',
        animationItems: ['🥬 Iron-Rich Spinach', '🫘 Protein Pulses', '🍋 Vitamin C Lemon']
      },
      {
        title: 'Scene 2: Fighting Anaemia & Fatigue',
        heading: 'More Hemoglobin, High Energy All Day!',
        narration: 'Eating colourful meals prevents anaemia, giving mothers and children energy to work, study, and play happily.',
        character: 'family',
        bgGradient: 'from-teal-600 to-amber-500',
        accentColor: '#f59e0b',
        animationItems: ['🔴 Healthy Red Blood Cells', '⚡ Energy Boost', '😊 Active Family']
      },
      {
        title: 'Scene 3: Balanced Nutrition for Babies',
        heading: 'Starting Complementary Foods at 6 Months',
        narration: 'From 6 months, add mashed kitchari, banana, and pulses along with mother milk so baby gains healthy weight.',
        character: 'mother_baby',
        bgGradient: 'from-amber-500 to-emerald-600',
        accentColor: '#059669',
        animationItems: ['🥣 Soft Mashed Food', '🍌 Fruit Goodness', '📈 Healthy Growth Curve']
      }
    ]
  },
  {
    id: 'cartoon-emergency',
    title: 'Spotting Red Flag Symptoms',
    category: 'emergency',
    categoryLabel: 'Emergency Care',
    icon: AlertTriangle,
    description: 'Animated emergency guide on recognizing high fever, chest breathing, or severe pain, and calling the PHC ambulance.',
    simpleLanguageSummary: 'Learn the urgent signs — high fever, breathlessness, or severe headache — that mean going to the PHC immediately.',
    duration: '3 Scenes (Interactive)',
    thumbnailGradient: 'from-rose-600 via-red-600 to-orange-600',
    keyTakeaways: [
      'Red Flag 1: Rapid breathing, chest indrawing, or extreme lethargy in infants.',
      'Red Flag 2: Severe abdominal pain, bleeding, or convulsions during pregnancy.',
      'Red Flag 3: Sudden weakness in arm/leg, chest pain, or slurred speech in adults.',
      'Call emergency ambulance or contact your PHC head immediately.'
    ],
    scenes: [
      {
        title: 'Scene 1: Knowing the Warning Signs',
        heading: 'When High Fever or Difficulty Breathing Happens',
        narration: 'If a baby has rapid breathing, chest pulling in, or high fever, do not wait! Recognize warning signs early.',
        character: 'asha',
        bgGradient: 'from-rose-600 to-red-700',
        accentColor: '#e11d48',
        animationItems: ['🤒 High Fever Check', '💨 Breathing Watch', '🚨 Emergency Bell']
      },
      {
        title: 'Scene 2: Calling Emergency Transport',
        heading: 'Here Comes the Ambulance!',
        narration: 'ASHA Didi calls the GramCare helpline. The emergency ambulance arrives quickly to carry the patient safely to the hospital.',
        character: 'ambulance',
        bgGradient: 'from-red-600 to-amber-600',
        accentColor: '#ea580c',
        animationItems: ['🚑 108 Emergency Transport', '📞 Quick PHC Call', '🛣️ Priority Road Journey']
      },
      {
        title: 'Scene 3: Immediate Hospital Care',
        heading: 'Doctor Care Starts Right Away!',
        narration: 'At the facility, doctors and nurses receive the patient with oxygen and medicine. Timely action saves lives!',
        character: 'doctor',
        bgGradient: 'from-amber-600 to-rose-600',
        accentColor: '#dc2626',
        animationItems: ['🏥 Hospital Emergency Unit', '🩺 Immediate Doctor Care', '💚 Patient Recovery']
      }
    ]
  },
  {
    id: 'cartoon-referral',
    title: 'The Connected Referral Journey',
    category: 'referral',
    categoryLabel: 'Referral Process',
    icon: ArrowRightLeft,
    description: 'Step-by-step cartoon showing how GramCare digital referrals transfer patient info instantly from PHC to hospital.',
    simpleLanguageSummary: 'Watch how your PHC worker sends digital referral details so the district hospital prepares your bed and treatment.',
    duration: '3 Scenes (Interactive)',
    thumbnailGradient: 'from-blue-600 via-indigo-600 to-sky-700',
    keyTakeaways: [
      'Your GramCare referral includes digital vitals and risk assessment details.',
      'Receiving hospital staff review the referral before your arrival.',
      'After hospital discharge, your PHC worker receives follow-up visit reminders.',
      'Keep your patient code handy during all facility visits.'
    ],
    scenes: [
      {
        title: 'Scene 1: Digital PHC Referral Creation',
        heading: 'PHC Doctor Logs Referral Digitally',
        narration: 'When advanced care is needed, PHC staff log vitals and referral reasons into GramCare on a tablet.',
        character: 'asha',
        bgGradient: 'from-blue-600 to-indigo-600',
        accentColor: '#2563eb',
        animationItems: ['📱 GramCare Digital Entry', '📊 Vitals & Risk Level', '🔒 Secure Privacy']
      },
      {
        title: 'Scene 2: Instant Information Transfer',
        heading: 'Hospital Receives Patient Information Ahead',
        narration: 'The referral data travels instantly to the district hospital. Specialist doctors review details before the patient arrives!',
        character: 'doctor',
        bgGradient: 'from-indigo-600 to-sky-600',
        accentColor: '#4f46e5',
        animationItems: ['📡 Instant Cloud Sync', '🛏️ Hospital Bed Ready', '👨‍⚕️ Specialist Review']
      },
      {
        title: 'Scene 3: Home Follow-up Continuity',
        heading: 'Care Continues Back Home at PHC',
        narration: 'After hospital treatment, ASHA Didi gets an automatic notification to visit home and ensure full recovery.',
        character: 'family',
        bgGradient: 'from-sky-600 to-blue-700',
        accentColor: '#0284c7',
        animationItems: ['🏠 Home Follow-Up Visit', '💊 Recovery Medicines', '❤️ Complete Connected Care']
      }
    ]
  }
];

import { useTranslation } from '@/lib/i18n/use-translation';

export function HealthGuidanceVideos() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<GuidanceVideo | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [voiceNarrating, setVoiceNarrating] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Automatic Scene Progression Timer when Playing
  useEffect(() => {
    if (!selectedVideo || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSceneIndex(prev => {
        const next = prev + 1;
        if (next >= selectedVideo.scenes.length) {
          return 0;
        }
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedVideo, isPlaying]);

  // Read narration aloud using Speech API when scene changes and voice is active
  useEffect(() => {
    if (!selectedVideo || !voiceNarrating || !speechSupported) return;
    window.speechSynthesis.cancel();
    const scene = selectedVideo.scenes[currentSceneIndex];
    const utterance = new SpeechSynthesisUtterance(`${scene.heading}. ${scene.narration}`);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onend = () => {};
    window.speechSynthesis.speak(utterance);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVideo, currentSceneIndex, voiceNarrating, speechSupported]);

  function openPlayer(video: GuidanceVideo) {
    setSelectedVideo(video);
    setCurrentSceneIndex(0);
    setIsPlaying(true);
    setVoiceNarrating(true);
  }

  function closePlayer() {
    if (speechSupported) window.speechSynthesis.cancel();
    setSelectedVideo(null);
    setCurrentSceneIndex(0);
    setIsPlaying(false);
    setVoiceNarrating(false);
  }

  function toggleVoice() {
    if (voiceNarrating) {
      if (speechSupported) window.speechSynthesis.cancel();
      setVoiceNarrating(false);
    } else {
      setVoiceNarrating(true);
    }
  }

  const categories = [
    { id: 'all', label: 'All Guidance' },
    { id: 'maternal', label: 'Maternal & Child' },
    { id: 'hygiene', label: 'Clean Hands & Water' },
    { id: 'vaccination', label: 'Vaccines' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'emergency', label: 'Emergency Care' },
    { id: 'referral', label: 'Referral Flow' }
  ];

  const filteredVideos = cartoonGuidanceVideos.filter(video => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const matchesSearch = `${video.title} ${video.description} ${video.simpleLanguageSummary}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold tracking-wide text-blue-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300 animate-spin" /> CARTOON ANIMATED HEALTH GUIDANCE
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              Fun & Educational Animated Health Stories
            </h1>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              Watch interactive cartoon animations explaining pregnancy checkups, hygiene, vaccines, nutrition, and emergency red flags in simple, easy-to-understand stories with ASHA Didi!
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Tv className="h-12 w-12 text-pink-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search animated stories..."
            className="input py-2 text-xs font-semibold pl-10"
          />
        </div>
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map(video => {
            const Icon = video.icon;
            const firstScene = video.scenes[0];
            return (
              <div
                key={video.id}
                className="group card overflow-hidden flex flex-col justify-between border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Cartoon Thumbnail Scene Container */}
                  <div
                    onClick={() => openPlayer(video)}
                    className={`relative cursor-pointer aspect-video w-full overflow-hidden bg-gradient-to-br ${video.thumbnailGradient} p-5 flex flex-col justify-between text-white shadow-inner`}
                  >
                    {/* Background Graphic Accents */}
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-slate-950/20 blur-xl"></div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur border border-white/10">
                        <Icon className="h-3 w-3 text-amber-300" /> {video.categoryLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold backdrop-blur border border-white/10">
                        <Sparkles className="h-3 w-3 text-pink-300" /> Cartoon Story
                      </span>
                    </div>

                    {/* Cartoon SVG Graphic Character Preview */}
                    <div className="relative z-10 my-auto flex items-center justify-center gap-3">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-blue-700 shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <Play className="h-6 w-6 fill-current ml-0.5 text-blue-600" />
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/90">
                      <span className="bg-slate-950/40 px-2 py-0.5 rounded-lg backdrop-blur">
                        🎬 3 Cartoon Scenes
                      </span>
                      <span className="bg-slate-950/40 px-2 py-0.5 rounded-lg backdrop-blur">
                        🗣️ Voice Narration
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h2 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {video.title}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 font-medium">
                      {video.simpleLanguageSummary}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <button
                    onClick={() => openPlayer(video)}
                    className="primary-btn w-full justify-center text-xs py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-3.5 w-3.5" /> Play Cartoon Animation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-500">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-bold">No animated guidance stories match your search.</p>
          <button
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
            className="secondary-btn mt-4 mx-auto text-xs"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Interactive Cartoon Animated Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="card w-full max-w-3xl overflow-hidden p-0 shadow-2xl border-blue-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md">
                  <Tv className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-black leading-tight">{selectedVideo.title}</h2>
                  <p className="text-xs text-blue-300 font-medium">GramCare Animated AI Health Story</p>
                </div>
              </div>
              <button
                onClick={closePlayer}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close video player"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cartoon Animation Display Canvas / Screen */}
            {(() => {
              const scene = selectedVideo.scenes[currentSceneIndex];
              return (
                <div className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${scene.bgGradient} p-6 flex flex-col justify-between text-white shadow-inner select-none transition-all duration-700`}>
                  
                  {/* Decorative Cartoon Scene Background Elements */}
                  <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl animate-pulse"></div>
                  <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-black/20 blur-2xl"></div>

                  {/* Scene Title Header Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-full bg-slate-950/50 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur border border-white/15 shadow-sm">
                      🎬 {scene.title}
                    </span>
                    <span className="rounded-full bg-slate-950/50 px-3 py-1 text-xs font-bold backdrop-blur border border-white/15 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-300" />
                      Scene {currentSceneIndex + 1} of {selectedVideo.scenes.length}
                    </span>
                  </div>

                  {/* Cartoon Character Animation Display Stage */}
                  <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    
                    {/* Animated Cartoon Graphic Illustration */}
                    <div className="flex justify-center">
                      <div className="relative grid h-44 w-44 place-items-center rounded-3xl bg-white/20 p-4 backdrop-blur-md border-2 border-white/30 shadow-2xl transition-all duration-500 hover:scale-105">
                        {scene.character === 'asha' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-3xl shadow-lg border-2 border-white animate-bounce">
                              👩‍⚕️
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-amber-200">
                              ASHA Didi
                            </span>
                          </div>
                        )}

                        {scene.character === 'mother_baby' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-3xl shadow-lg border-2 border-white animate-pulse">
                              👩‍🍼
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-pink-200">
                              Mother & Newborn
                            </span>
                          </div>
                        )}

                        {scene.character === 'doctor' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-3xl shadow-lg border-2 border-white">
                              👨‍⚕️
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-blue-200">
                              PHC Medical Officer
                            </span>
                          </div>
                        )}

                        {scene.character === 'water_hygiene' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl shadow-lg border-2 border-white animate-spin">
                              🧼
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-cyan-200">
                              Clean Hygiene
                            </span>
                          </div>
                        )}

                        {scene.character === 'nutrition_plate' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-3xl shadow-lg border-2 border-white animate-bounce">
                              🥗
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-emerald-200">
                              Iron Nutrition
                            </span>
                          </div>
                        )}

                        {scene.character === 'vaccine_shield' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 text-3xl shadow-lg border-2 border-white animate-pulse">
                              🛡️
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-purple-200">
                              Vaccine Shield
                            </span>
                          </div>
                        )}

                        {scene.character === 'ambulance' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-3xl shadow-lg border-2 border-white animate-bounce">
                              🚑
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-amber-200">
                              108 Ambulance
                            </span>
                          </div>
                        )}

                        {scene.character === 'family' && (
                          <div className="text-center space-y-2">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-3xl shadow-lg border-2 border-white">
                              👨‍👩‍👧‍👦
                            </div>
                            <span className="block text-xs font-black bg-slate-950/60 px-2 py-0.5 rounded-full text-blue-200">
                              Healthy Village Family
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Speech Bubble Narration & Key Scene Items */}
                    <div className="space-y-3">
                      <div className="relative rounded-2xl bg-white/95 p-4 text-slate-900 shadow-2xl border-2 border-white backdrop-blur">
                        <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 bg-white"></div>
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {scene.heading}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-700 font-medium">
                          "{scene.narration}"
                        </p>
                      </div>

                      {/* Scene Animated Feature Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {scene.animationItems.map((item, i) => (
                          <span key={i} className="rounded-full bg-slate-950/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur border border-white/20">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scene Timeline Progress Bar & Play Controls */}
                  <div className="relative z-10 space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1.5 flex-1">
                        {selectedVideo.scenes.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentSceneIndex(idx)}
                            className={`h-2 flex-1 rounded-full cursor-pointer transition-all ${
                              idx === currentSceneIndex
                                ? 'bg-white shadow-lg'
                                : idx < currentSceneIndex
                                ? 'bg-white/60'
                                : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-900 shadow-lg hover:bg-slate-100 transition-colors"
                        >
                          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setCurrentSceneIndex(0)}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950/50 text-white backdrop-blur hover:bg-slate-950/80 transition-colors"
                          title="Restart Cartoon Video"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        {speechSupported && (
                          <button
                            onClick={toggleVoice}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold backdrop-blur transition-all ${
                              voiceNarrating
                                ? 'bg-amber-400 text-slate-900 shadow-md'
                                : 'bg-slate-950/50 text-white hover:bg-slate-950/80'
                            }`}
                          >
                            {voiceNarrating ? <Volume2 className="h-4 w-4 text-slate-900" /> : <VolumeX className="h-4 w-4 text-white" />}
                            {voiceNarrating ? 'Voice Active' : 'Voice Off'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentSceneIndex === 0}
                          onClick={() => setCurrentSceneIndex(prev => Math.max(0, prev - 1))}
                          className="secondary-btn text-xs py-1.5 px-3 bg-white/20 text-white border-white/20 disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" /> Prev Scene
                        </button>
                        <button
                          disabled={currentSceneIndex === selectedVideo.scenes.length - 1}
                          onClick={() => setCurrentSceneIndex(prev => Math.min(selectedVideo.scenes.length - 1, prev + 1))}
                          className="primary-btn text-xs py-1.5 px-3 bg-white text-slate-900 hover:bg-slate-100 border-none disabled:opacity-30"
                        >
                          Next Scene <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Key Takeaways & Action Points */}
            <div className="p-6 space-y-5 bg-white">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Key Action Advice from ASHA Didi
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {selectedVideo.keyTakeaways.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> GramCare AI Educational Guidance. Follow advice from your assigned PHC.
                </span>
                <button onClick={closePlayer} className="primary-btn text-xs py-1.5">
                  Done Watching
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
