import type { SupportedLanguage } from './translations';

export type UiLabels = {
  dashboard: string;
  patients: string;
  assessment: string;
  referrals: string;
  followUps: string;
  maternalCare: string;
  healthGuidance: string;
  nearbyCare: string;
  requests: string;
  healthCamps: string;
  outbreaks: string;
  workers: string;
  createReferral: string;
  loading: string;
  noReferrals: string;
  retry: string;
  connectedCare: string;
  liveStats: string;
  patientAccess: string;
  quickActions: string;
  aiRisk: string;
  aiRiskDescription: string;
  liveInfo: string;
  offlineInfo: string;
  registerPatient: string;
  recordHealth: string;
  riskReview: string;
  careCoordination: string;
  followUpCare: string;
  authorisedPatients: string;
  highRiskCases: string;
  criticalCases: string;
  pendingReferrals: string;
  followUpsDue: string;
};

const english: UiLabels = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  assessment: 'Risk screening',
  referrals: 'Referrals',
  followUps: 'Follow-ups',
  maternalCare: 'Maternal Care',
  healthGuidance: 'Health Guidance',
  nearbyCare: 'Nearby Care',
  requests: 'Requests',
  healthCamps: 'Health Camps',
  outbreaks: 'Outbreaks',
  workers: 'Workers',
  createReferral: 'Create referral',
  loading: 'Loading...',
  noReferrals: 'No authorised referrals found.',
  retry: 'Retry',
  connectedCare: 'Connected care for every village.',
  liveStats: 'Live authorised statistics from the care coordination workspace.',
  patientAccess: 'Patient information is limited by account role and care assignment.',
  quickActions: 'Quick actions',
  aiRisk: 'AI-assisted risk screening',
  aiRiskDescription: 'Recorded symptoms, vitals and medical history produce a reproducible risk priority for qualified clinical review. This is clinical decision support, not a diagnosis.',
  liveInfo: 'Live authorised information',
  offlineInfo: 'Data entered offline is stored locally and synchronizes when connectivity is restored.',
  registerPatient: 'Register patient',
  recordHealth: 'Record health data',
  riskReview: 'Risk review',
  careCoordination: 'Care coordination',
  followUpCare: 'Follow-ups',
  authorisedPatients: 'Authorised patients',
  highRiskCases: 'High-risk cases',
  criticalCases: 'Critical risk cases',
  pendingReferrals: 'Pending referrals',
  followUpsDue: 'Follow-ups due'
};

export const labels: Partial<Record<SupportedLanguage, Partial<UiLabels>>> = {
  hi: { ...english, dashboard: 'डैशबोर्ड', patients: 'मरीज़', assessment: 'जोखिम जांच', referrals: 'रेफरल', followUps: 'फॉलो-अप', maternalCare: 'मातृ देखभाल', healthGuidance: 'स्वास्थ्य मार्गदर्शन', nearbyCare: 'नज़दीकी देखभाल', requests: 'अनुरोध', healthCamps: 'स्वास्थ्य शिविर', outbreaks: 'प्रकोप', workers: 'कार्यकर्ता', createReferral: 'रेफरल बनाएं', loading: 'लोड हो रहा है...', noReferrals: 'कोई अधिकृत रेफरल नहीं मिला।', retry: 'पुनः प्रयास' },
  gu: { ...english, dashboard: 'ડેશબોર્ડ', patients: 'દર્દીઓ', assessment: 'જોખમ તપાસ', referrals: 'રેફરલ', followUps: 'ફોલો-અપ', maternalCare: 'માતૃત્વ સંભાળ', healthGuidance: 'આરોગ્ય માર્ગદર્શન', nearbyCare: 'નજીકની સંભાળ', requests: 'વિનંતીઓ', healthCamps: 'આરોગ્ય શિબિર', outbreaks: 'રોગચાળો', workers: 'કર્મચારીઓ', createReferral: 'રેફરલ બનાવો', loading: 'લોડ થઈ રહ્યું છે...', noReferrals: 'કોઈ અધિકૃત રેફરલ મળ્યું નથી.', retry: 'ફરી પ્રયાસ કરો' },
  mr: { ...english, dashboard: 'डॅशबोर्ड', patients: 'रुग्ण', assessment: 'जोखीम तपासणी', referrals: 'रेफरल', followUps: 'फॉलो-अप', maternalCare: 'मातृत्व काळजी', healthGuidance: 'आरोग्य मार्गदर्शन', nearbyCare: 'जवळची सेवा', requests: 'विनंत्या', healthCamps: 'आरोग्य शिबिरे', outbreaks: 'उद्रेक', workers: 'कार्यकर्ते', createReferral: 'रेफरल तयार करा', loading: 'लोड होत आहे...', noReferrals: 'अधिकृत रेफरल सापडले नाही.', retry: 'पुन्हा प्रयत्न करा' },
  bn: { ...english, dashboard: 'ড্যাশবোর্ড', patients: 'রোগী', assessment: 'ঝুঁকি পরীক্ষা', referrals: 'রেফারেল', followUps: 'ফলো-আপ', maternalCare: 'মাতৃসেবা', healthGuidance: 'স্বাস্থ্য নির্দেশনা', nearbyCare: 'নিকটস্থ সেবা', requests: 'অনুরোধ', healthCamps: 'স্বাস্থ্য শিবির', outbreaks: 'রোগের প্রাদুর্ভাব', workers: 'কর্মী', createReferral: 'রেফারেল তৈরি করুন', loading: 'লোড হচ্ছে...', noReferrals: 'কোনও অনুমোদিত রেফারেল নেই।', retry: 'আবার চেষ্টা করুন' },
  ta: { ...english, dashboard: 'டாஷ்போர்டு', patients: 'நோயாளிகள்', assessment: 'ஆபத்து பரிசோதனை', referrals: 'பரிந்துரைகள்', followUps: 'தொடர் கண்காணிப்பு', maternalCare: 'மகப்பேறு பராமரிப்பு', healthGuidance: 'சுகாதார வழிகாட்டி', nearbyCare: 'அருகிலுள்ள சேவை', requests: 'கோரிக்கைகள்', healthCamps: 'சுகாதார முகாம்கள்', outbreaks: 'நோய் பரவல்', workers: 'பணியாளர்கள்', createReferral: 'பரிந்துரை உருவாக்கு', loading: 'ஏற்றுகிறது...', noReferrals: 'அங்கீகரிக்கப்பட்ட பரிந்துரைகள் இல்லை.', retry: 'மீண்டும் முயற்சி' },
  te: { ...english, dashboard: 'డాష్‌బోర్డ్', patients: 'రోగులు', assessment: 'ప్రమాద పరీక్ష', referrals: 'రిఫరల్స్', followUps: 'ఫాలో-అప్', maternalCare: 'మాతృ సంరక్షణ', healthGuidance: 'ఆరోగ్య మార్గదర్శకం', nearbyCare: 'సమీప సేవలు', requests: 'అభ్యర్థనలు', healthCamps: 'ఆరోగ్య శిబిరాలు', outbreaks: 'వ్యాధి వ్యాప్తి', workers: 'కార్యకర్తలు', createReferral: 'రిఫరల్ సృష్టించు', loading: 'లోడ్ అవుతోంది...', noReferrals: 'అధీకృత రిఫరల్స్ లేవు.', retry: 'మళ్లీ ప్రయత్నించండి' },
  kn: { ...english, dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', patients: 'ರೋಗಿಗಳು', assessment: 'ಅಪಾಯ ತಪಾಸಣೆ', referrals: 'ರೆಫರಲ್‌ಗಳು', followUps: 'ಫಾಲೋ-ಅಪ್', maternalCare: 'ತಾಯಿಯ ಆರೈಕೆ', healthGuidance: 'ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ', nearbyCare: 'ಹತ್ತಿರದ ಸೇವೆ', requests: 'ವಿನಂತಿಗಳು', healthCamps: 'ಆರೋಗ್ಯ ಶಿಬಿರಗಳು', outbreaks: 'ರೋಗ ಹರಡುವಿಕೆ', workers: 'ಕಾರ್ಯಕರ್ತರು', createReferral: 'ರೆಫರಲ್ ರಚಿಸಿ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', noReferrals: 'ಅಧಿಕೃತ ರೆಫರಲ್‌ಗಳು ಇಲ್ಲ.', retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' },
  ml: { ...english, dashboard: 'ഡാഷ്ബോർഡ്', patients: 'രോഗികൾ', assessment: 'അപകട പരിശോധന', referrals: 'റഫറലുകൾ', followUps: 'ഫോളോ-അപ്പ്', maternalCare: 'മാതൃ പരിചരണം', healthGuidance: 'ആരോഗ്യ മാർഗ്ഗനിർദ്ദേശം', nearbyCare: 'സമീപ സേവനം', requests: 'അഭ്യർത്ഥനകൾ', healthCamps: 'ആരോഗ്യ ക്യാമ്പുകൾ', outbreaks: 'രോഗവ്യാപനം', workers: 'പ്രവർത്തകർ', createReferral: 'റഫറൽ സൃഷ്ടിക്കുക', loading: 'ലോഡ് ചെയ്യുന്നു...', noReferrals: 'അംഗീകൃത റഫറലുകൾ ഇല്ല.', retry: 'വീണ്ടും ശ്രമിക്കുക' },
  pa: { ...english, dashboard: 'ਡੈਸ਼ਬੋਰਡ', patients: 'ਮਰੀਜ਼', assessment: 'ਖਤਰਾ ਜਾਂਚ', referrals: 'ਰੈਫਰਲ', followUps: 'ਫਾਲੋ-ਅੱਪ', maternalCare: 'ਮਾਤਾ ਸੰਭਾਲ', healthGuidance: 'ਸਿਹਤ ਮਾਰਗਦਰਸ਼ਨ', nearbyCare: 'ਨੇੜਲੀ ਸੇਵਾ', requests: 'ਬੇਨਤੀਆਂ', healthCamps: 'ਸਿਹਤ ਕੈਂਪ', outbreaks: 'ਬਿਮਾਰੀ ਫੈਲਾਅ', workers: 'ਕਰਮਚਾਰੀ', createReferral: 'ਰੈਫਰਲ ਬਣਾਓ', loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', noReferrals: 'ਕੋਈ ਅਧਿਕਾਰਤ ਰੈਫਰਲ ਨਹੀਂ ਮਿਲਿਆ।', retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼' },
  or: { ...english, dashboard: 'ଡ୍ୟାସବୋର୍ଡ', patients: 'ରୋଗୀ', assessment: 'ବିପଦ ଯାଞ୍ચ', referrals: 'ରେଫରାଲ', followUps: 'ଫଲୋ-ଅପ୍', maternalCare: 'ମାତୃ ସେବା', healthGuidance: 'ସ୍ୱାସ୍ଥ୍ୟ ମାର୍ଗଦର୍ଶନ', nearbyCare: 'ନିକଟସ୍ଥ ସେବା', requests: 'ଅନୁରୋଧ', healthCamps: 'ସ୍ୱାସ୍ଥ୍ୟ ଶିବିର', outbreaks: 'ରୋଗ ବ୍ୟାପିବା', workers: 'କର୍ମଚାରୀ', createReferral: 'ରେଫରାଲ ତିଆରି କରନ୍ତୁ', loading: 'ଲୋଡ୍ ହେଉଛି...', noReferrals: 'କୌଣସି ଅଧିକୃତ ରେଫରାଲ ମିଳିଲା ନାହିଁ।', retry: 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ' }
};

export const dashboardTranslations: Partial<Record<SupportedLanguage, Partial<UiLabels>>> = {
  hi: { connectedCare: 'हर गांव के लिए जुड़ी हुई स्वास्थ्य सेवा।', liveStats: 'केयर कोऑर्डिनेशन कार्यक्षेत्र के लाइव अधिकृत आंकड़े।', patientAccess: 'मरीज़ की जानकारी भूमिका और देखभाल असाइनमेंट के अनुसार सीमित है।', quickActions: 'त्वरित कार्य', aiRisk: 'एआई-सहायित जोखिम जांच', aiRiskDescription: 'लक्षण, वाइटल्स और चिकित्सा इतिहास योग्य चिकित्सकीय समीक्षा के लिए जोखिम प्राथमिकता बनाते हैं। यह निदान नहीं है।', offlineInfo: 'ऑफलाइन दर्ज डेटा स्थानीय रूप से सुरक्षित रहता है और कनेक्शन लौटने पर सिंक होता है।', registerPatient: 'मरीज़ पंजीकृत करें', recordHealth: 'स्वास्थ्य डेटा दर्ज करें', riskReview: 'जोखिम समीक्षा', followUpCare: 'फॉलो-अप देखभाल', authorisedPatients: 'अधिकृत मरीज़', highRiskCases: 'उच्च जोखिम वाले मामले', criticalCases: 'गंभीर मामले', pendingReferrals: 'लंबित रेफरल', followUpsDue: 'फॉलो-अप बाकी' },
  gu: { connectedCare: 'દરેક ગામ સુધી જોડાયેલી આરોગ્ય સંભાળ.', liveStats: 'કેર કો-ઓર્ડિનેશન વર્કસ્પેસના અધિકૃત જીવંત આંકડા.', patientAccess: 'દર્દીની માહિતી ભૂમિકા અને સંભાળ સોંપણી દ્વારા મર્યાદિત છે.', quickActions: 'ઝડપી કાર્યો', aiRisk: 'AI સહાયિત જોખમ તપાસ', aiRiskDescription: 'લક્ષણો, વાઇટલ્સ અને તબીબી ઇતિહાસ તબીબી સમીક્ષા માટે પુનરાવર્તિત જોખમ પ્રાથમિકતા આપે છે. આ નિદાન નથી.', offlineInfo: 'ઓફલાઇન દાખલ કરેલો ડેટા સ્થાનિક રીતે રહે છે અને કનેક્શન પાછું આવે ત્યારે સિંક થાય છે.', registerPatient: 'દર્દી નોંધણી', recordHealth: 'આરોગ્ય ડેટા દાખલ કરો', riskReview: 'જોખમ સમીક્ષા', followUpCare: 'ફોલો-અપ સંભાળ', authorisedPatients: 'અધિકૃત દર્દીઓ', highRiskCases: 'જોખમી કેસો', criticalCases: 'ગંભીર કેસો', pendingReferrals: 'પેન્ડિંગ રેફરલ', followUpsDue: 'બાકી ફોલો-અપ' },
  mr: { connectedCare: 'प्रत्येक गावासाठी जोडलेली आरोग्यसेवा.', liveStats: 'आरोग्य समन्वय कार्यक्षेत्रातील अधिकृत थेट आकडेवारी.', patientAccess: 'रुग्णांची माहिती भूमिका आणि सेवा नियुक्तीनुसार मर्यादित आहे.', quickActions: 'जलद कृती', aiRisk: 'AI-सहाय्यित जोखीम तपासणी', aiRiskDescription: 'लक्षणे, जीवनचिन्हे आणि वैद्यकीय इतिहासाच्या आधारे वैद्यकीय तपासणीसाठी जोखीम प्राधान्य दिले जाते. हे निदान नाही.', offlineInfo: 'ऑफलाइन नोंदवलेला डेटा स्थानिकरित्या साठवला जातो आणि कनेक्शन परत आल्यावर समक्रमित होतो.', registerPatient: 'रुग्ण नोंदणी', recordHealth: 'आरोग्य माहिती नोंदवा', riskReview: 'जोखीम तपासणी', followUpCare: 'फॉलो-अप', authorisedPatients: 'अधिकृत रुग्ण', highRiskCases: 'उच्च जोखीम प्रकरणे', criticalCases: 'गंभीर प्रकरणे', pendingReferrals: 'प्रलंबित रेफरल', followUpsDue: 'फॉलो-अप बाकी' },
  bn: { connectedCare: 'প্রতিটি গ্রামের জন্য সংযুক্ত স্বাস্থ্যসেবা।', liveStats: 'কেয়ার সমন্বয় কর্মক্ষেত্রের অনুমোদিত সরাসরি পরিসংখ্যান।', patientAccess: 'রোগীর তথ্য ভূমিকা ও সেবা বরাদ্দ অনুযায়ী সীমিত।', quickActions: 'দ্রুত কাজ', aiRisk: 'AI-সহায়িত ঝুঁকি পরীক্ষা', aiRiskDescription: 'লক্ষণ, জীবনচিহ্ন ও চিকিৎসা ইতিহাসের ভিত্তিতে চিকিৎসক পর্যালোচনার জন্য ঝুঁকি অগ্রাধিকার তৈরি হয়। এটি রোগ নির্ণয় নয়।', offlineInfo: 'অফলাইনে দেওয়া তথ্য স্থানীয়ভাবে থাকে এবং সংযোগ ফিরলে সিঙ্ক হয়।', registerPatient: 'রোগী নিবন্ধন', recordHealth: 'স্বাস্থ্য তথ্য নথিভুক্ত করুন', riskReview: 'ঝুঁকি পর্যালোচনা', followUpCare: 'ফলো-আপ', authorisedPatients: 'অনুমোদিত রোগী', highRiskCases: 'উচ্চ ঝুঁকির ঘটনা', criticalCases: 'গুরুতর ঘটনা', pendingReferrals: 'অমীমাংসিত রেফারেল', followUpsDue: 'ফলো-আপ বাকি' },
  ta: { connectedCare: 'ஒவ்வொரு கிராமத்திற்கும் இணைந்த சுகாதார சேவை.', liveStats: 'பராமரிப்பு ஒருங்கிணைப்பு பணியிடத்தின் அங்கீகரிக்கப்பட்ட நேரடி புள்ளிவிவரங்கள்.', patientAccess: 'நோயாளி தகவல் பங்கு மற்றும் பராமரிப்பு ஒதுக்கீட்டால் கட்டுப்படுத்தப்படுகிறது.', quickActions: 'விரைவு செயல்கள்', aiRisk: 'AI உதவியுடன் ஆபத்து பரிசோதனை', aiRiskDescription: 'அறிகுறிகள், உயிரளவுகள் மற்றும் மருத்துவ வரலாறு தகுதியான மருத்துவ பரிசோதனைக்கான ஆபத்து முன்னுரிமையை உருவாக்குகின்றன. இது நோயறிதல் அல்ல.', offlineInfo: 'ஆஃப்லைனில் உள்ளிடப்பட்ட தரவு சேமிக்கப்பட்டு இணைப்பு திரும்பியதும் ஒத்திசைக்கப்படும்.', registerPatient: 'நோயாளியை பதிவு செய்', recordHealth: 'சுகாதார தரவை பதிவு செய்', riskReview: 'ஆபத்து பரிசீலனை', followUpCare: 'தொடர் கண்காணிப்பு', authorisedPatients: 'அங்கீகரிக்கப்பட்ட நோயாளிகள்', highRiskCases: 'அதிக ஆபத்து வழக்குகள்', criticalCases: 'மிகவும் தீவிர வழக்குகள்', pendingReferrals: 'நிலுவை பரிந்துரைகள்', followUpsDue: 'நிலுவை தொடர் கண்காணிப்பு' },
  te: { connectedCare: 'ప్రతి గ్రామానికి అనుసంధాన ఆరోగ్య సేవ.', liveStats: 'కేర్ సమన్వయ కార్యస్థలంలోని అధీకృత ప్రత్యక్ష గణాంకాలు.', patientAccess: 'రోగి సమాచారం పాత్ర మరియు సంరక్షణ కేటాయింపు ఆధారంగా పరిమితం చేయబడింది.', quickActions: 'త్వరిత చర్యలు', aiRisk: 'AI సహాయంతో ప్రమాద పరీక్ష', aiRiskDescription: 'లక్షణాలు, ప్రాణ సూచికలు మరియు వైద్య చరిత్ర ఆధారంగా వైద్య సమీక్షకు ప్రమాద ప్రాధాన్యత రూపొందుతుంది. ఇది నిర్ధారణ కాదు.', offlineInfo: 'ఆఫ్‌లైన్‌లో నమోదు చేసిన డేటా స్థానికంగా ఉండి కనెక్షన్ వచ్చినప్పుడు సమకాలీకరించబడుతుంది.', registerPatient: 'రోగిని నమోదు చేయండి', recordHealth: 'ఆరోగ్య డేటా నమోదు', riskReview: 'ప్రమాద సమీక్ష', followUpCare: 'ఫాలో-అప్', authorisedPatients: 'అధీకృత రోగులు', highRiskCases: 'అధిక ప్రమాద కేసులు', criticalCases: 'తీవ్ర కేసులు', pendingReferrals: 'పెండింగ్ రిఫరల్స్', followUpsDue: 'ఫాలో-అప్‌లు పెండింగ్' },
  kn: { connectedCare: 'ಪ್ರತಿ ಹಳ್ಳಿಗೂ ಸಂಪರ್ಕಿತ ಆರೋಗ್ಯ ಸೇವೆ.', liveStats: 'ಆರೈಕೆ ಸಮನ್ವಯ ಕಾರ್ಯಸ್ಥಳದ ಅಧಿಕೃತ ನೇರ ಅಂಕಿಅಂಶಗಳು.', patientAccess: 'ರೋಗಿಯ ಮಾಹಿತಿ ಪಾತ್ರ ಮತ್ತು ಆರೈಕೆ ನಿಯೋಜನೆಯಿಂದ ಸೀಮಿತವಾಗಿದೆ.', quickActions: 'ತ್ವರಿತ ಕ್ರಮಗಳು', aiRisk: 'AI ಸಹಾಯದ ಅಪಾಯ ಪರಿಶೀಲನೆ', aiRiskDescription: 'ಲಕ್ಷಣಗಳು, ಜೀವಚಿಹ್ನೆಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವು ವೈದ್ಯಕೀಯ ಪರಿಶೀಲನೆಗೆ ಅಪಾಯ ಆದ್ಯತೆಯನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ. ಇದು ರೋಗನಿರ್ಣಯವಲ್ಲ.', offlineInfo: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ದಾಖಲಿಸಿದ ಮಾಹಿತಿ ಸ್ಥಳೀಯವಾಗಿ ಉಳಿದು ಸಂಪರ್ಕ ಬಂದಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ.', registerPatient: 'ರೋಗಿಯನ್ನು ನೋಂದಾಯಿಸಿ', recordHealth: 'ಆರೋಗ್ಯ ಮಾಹಿತಿ ದಾಖಲಿಸಿ', riskReview: 'ಅಪಾಯ ಪರಿಶೀಲನೆ', followUpCare: 'ಫಾಲೋ-ಅಪ್', authorisedPatients: 'ಅಧಿಕೃತ ರೋಗಿಗಳು', highRiskCases: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರಕರಣಗಳು', criticalCases: 'ತೀವ್ರ ಪ್ರಕರಣಗಳು', pendingReferrals: 'ಬಾಕಿ ರೆಫರಲ್‌ಗಳು', followUpsDue: 'ಬಾಕಿ ಫಾಲೋ-ಅಪ್‌ಗಳು' },
  ml: { connectedCare: 'ഓരോ ഗ്രാമത്തിനും ബന്ധിപ്പിച്ച ആരോഗ്യ പരിചരണം.', liveStats: 'കെയർ ഏകോപന പ്രവർത്തന മേഖലയിലെ അംഗീകൃത തത്സമയ കണക്കുകൾ.', patientAccess: 'രോഗിയുടെ വിവരങ്ങൾ ചുമതലയും പരിചരണ നിയോഗവും അനുസരിച്ച് പരിമിതപ്പെടുത്തിയിരിക്കുന്നു.', quickActions: 'ദ്രുത പ്രവർത്തനങ്ങൾ', aiRisk: 'AI സഹായത്തോടെയുള്ള അപകട പരിശോധന', aiRiskDescription: 'ലക്ഷണങ്ങൾ, ജീവചിഹ്നങ്ങൾ, മെഡിക്കൽ ചരിത്രം എന്നിവ വിദഗ്ധ പരിശോധനയ്ക്കുള്ള അപകട മുൻഗണന നൽകുന്നു. ഇത് രോഗനിർണ്ണയമല്ല.', offlineInfo: 'ഓഫ്‌ലൈനിൽ നൽകിയ ഡാറ്റ പ്രാദേശികമായി സൂക്ഷിച്ച് കണക്ഷൻ വന്നാൽ സമന്വയിപ്പിക്കും.', registerPatient: 'രോഗിയെ രജിസ്റ്റർ ചെയ്യുക', recordHealth: 'ആരോഗ്യ വിവരം രേഖപ്പെടുത്തുക', riskReview: 'അപകട പരിശോധന', followUpCare: 'ഫോളോ-അപ്പ്', authorisedPatients: 'അംഗീകൃത രോഗികൾ', highRiskCases: 'ഉയർന്ന അപകട കേസുകൾ', criticalCases: 'ഗുരുതര കേസുകൾ', pendingReferrals: 'തീർപ്പാക്കാത്ത റഫറലുകൾ', followUpsDue: 'ബാക്കി ഫോളോ-അപ്പുകൾ' },
  pa: { connectedCare: 'ਹਰ ਪਿੰਡ ਲਈ ਜੁੜੀ ਹੋਈ ਸਿਹਤ ਸੇਵਾ।', liveStats: 'ਕੇਅਰ ਕੋਆਰਡੀਨੇਸ਼ਨ ਵਰਕਸਪੇਸ ਦੇ ਅਧਿਕਾਰਤ ਲਾਈਵ ਅੰਕੜੇ।', patientAccess: 'ਮਰੀਜ਼ ਦੀ ਜਾਣਕਾਰੀ ਭੂਮਿਕਾ ਅਤੇ ਦੇਖਭਾਲ ਨਿਯੁਕਤੀ ਅਨੁਸਾਰ ਸੀਮਿਤ ਹੈ।', quickActions: 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ', aiRisk: 'AI ਸਹਾਇਤਾ ਨਾਲ ਖਤਰਾ ਜਾਂਚ', aiRiskDescription: 'ਲੱਛਣ, ਜੀਵਨ ਸੰਕੇਤ ਅਤੇ ਮੈਡੀਕਲ ਇਤਿਹਾਸ ਕਲੀਨਿਕਲ ਸਮੀਖਿਆ ਲਈ ਖਤਰੇ ਦੀ ਤਰਜੀਹ ਬਣਾਉਂਦੇ ਹਨ। ਇਹ ਨਿਦਾਨ ਨਹੀਂ ਹੈ।', offlineInfo: 'ਆਫਲਾਈਨ ਦਰਜ ਡਾਟਾ ਸਥਾਨਕ ਤੌਰ ਤੇ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਕਨੈਕਸ਼ਨ ਆਉਣ ਤੇ ਸਿੰਕ ਹੁੰਦਾ ਹੈ।', registerPatient: 'ਮਰੀਜ਼ ਦਰਜ ਕਰੋ', recordHealth: 'ਸਿਹਤ ਡਾਟਾ ਦਰਜ ਕਰੋ', riskReview: 'ਖਤਰਾ ਸਮੀਖਿਆ', followUpCare: 'ਫਾਲੋ-ਅੱਪ', authorisedPatients: 'ਅਧਿਕਾਰਤ ਮਰੀਜ਼', highRiskCases: 'ਉੱਚ ਖਤਰੇ ਦੇ ਕੇਸ', criticalCases: 'ਗੰਭੀਰ ਕੇਸ', pendingReferrals: 'ਬਾਕੀ ਰੈਫਰਲ', followUpsDue: 'ਬਾਕੀ ਫਾਲੋ-ਅੱਪ' },
  or: { connectedCare: 'ପ୍ରତ୍ୟେକ ଗାଁ ପାଇଁ ସଂଯୁକ୍ତ ସ୍ୱାସ୍ଥ୍ୟ ସେବା।', liveStats: 'କେୟାର ସମନ୍ୱୟ କାର୍ଯ୍ୟକ୍ଷେତ୍ରର ଅଧିକୃତ ଲାଇଭ୍ ତଥ୍ୟ।', patientAccess: 'ରୋଗୀ ସୂଚନା ଭୂମିକା ଏବଂ ସେବା ନିଯୁକ୍ତି ଅନୁସାରେ ସୀମିତ।', quickActions: 'ତୁରંત କାର୍ଯ୍ୟ', aiRisk: 'AI ସହାୟତାରେ ବିପଦ ଯାଞ୍ଚ', aiRiskDescription: 'ଲକ୍ଷଣ, ଜୀବନ ସୂચକ ଏବଂ ଚିକିତ୍ସା ଇତିହାସ ଡାକ୍ତରୀ ସମୀକ୍ଷା ପାଇଁ ବିପଦ ପ୍ରାଥମିକତା ଦିଏ। ଏହା ରୋଗ ନିର୍ଣ୍ଣୟ ନୁହେଁ।', offlineInfo: 'ଅଫଲାଇନରେ ଦିଆଯାଇଥିବା ତଥ୍ୟ ସ୍ଥାନୀୟ ଭାବେ ରହେ ଏବଂ ସଂଯୋଗ ଫେରିଲେ ସିଙ୍କ ହୁଏ।', registerPatient: 'ରୋଗୀ ପଞ୍ଜୀକରଣ', recordHealth: 'ସ୍ୱାସ୍ଥ્ય ତଥ୍ୟ ଲେଖନ୍ତୁ', riskReview: 'ବିପଦ ସମୀକ୍ଷା', followUpCare: 'ଫଲୋ-ଅପ୍', authorisedPatients: 'ଅଧିକୃତ ରୋଗୀ', highRiskCases: 'ଉଚ୍ચ ବିପଦ ମାମଲା', criticalCases: 'ଗୁରୁତର ମାମଲା', pendingReferrals: 'ବକେୟା ରେଫରାଲ', followUpsDue: 'ବକେୟା ଫଲୋ-ଅପ୍' }
};

export function uiLabels(language: SupportedLanguage): UiLabels {
  return { ...english, ...(labels[language] || {}), ...(dashboardTranslations[language] || {}) };
}
