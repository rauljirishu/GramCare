export type SupportedLanguage = 'en' | 'hi';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: TranslationDictionary = {
  // Brand & Shell
  appName: { en: 'GramCare', hi: 'ग्रामकेयर' },
  appTagline: { en: 'Rural Healthcare Platform', hi: 'ग्रामीण स्वास्थ्य सेवा मंच' },
  doctorPortal: { en: 'Doctor & Clinical Portal', hi: 'चिकित्सक और नैदानिक पोर्टल' },
  adminPortal: { en: 'Health Admin Control Center', hi: 'स्वास्थ्य प्रशासन नियंत्रण केंद्र' },
  hospitalPortal: { en: 'Hospital Referral & Emergency Care Portal', hi: 'अस्पताल रेफरल और आपातकालीन देखभाल पोर्टल' },
  
  // Navigation Items
  navDashboard: { en: 'Doctor Dashboard', hi: 'डैशबोर्ड' },
  navPatients: { en: 'Patient Records', hi: 'मरीज़ रिकॉर्ड' },
  navHighRisk: { en: 'High-Risk Triage', hi: 'उच्च जोखिम ट्रायेज' },
  navReferrals: { en: 'Digital Referrals', hi: 'डिजिटल रेफरल' },
  navHospital: { en: 'Hospital Portal', hi: 'अस्पताल पोर्टल' },
  navFollowUps: { en: 'Follow-up Tasks', hi: 'फॉलो-अप कार्य' },
  navWorkspace: { en: 'ASHA Mobile Intake', hi: 'आशा मोबाइल इनटेक' },
  navAnalytics: { en: 'Health Analytics', hi: 'स्वास्थ्य विश्लेषण' },
  navProfile: { en: 'User Profile', hi: 'प्रोफ़ाइल' },
  navSettings: { en: 'Settings', hi: 'सेटिंग्स' },
  navSignOut: { en: 'Sign Out', hi: 'लॉग आउट' },

  // Dashboard Headings & Metric Labels
  goodDay: { en: 'Good day', hi: 'शुभ दिन' },
  dashboardSubtitle: { en: 'Real-time rural healthcare triage, digital referrals, and AI-assisted risk prioritization.', hi: 'वास्तविक समय ग्रामीण स्वास्थ्य सेवा ट्रायेज, डिजिटल रेफरल और एआई-सहायता प्राप्त जोखिम प्राथमिकता।' },
  totalPatients: { en: 'Total Patients', hi: 'कुल मरीज़' },
  newPatientsThisWeek: { en: 'New Patients This Week', hi: 'इस सप्ताह नए मरीज़' },
  criticalPatients: { en: 'Critical Patients', hi: 'गंभीर स्थिति मरीज़' },
  highRiskPatients: { en: 'High-Risk Patients', hi: 'उच्च जोखिम वाले मरीज़' },
  pendingReferrals: { en: 'Pending Referrals', hi: 'लंबित रेफरल' },
  activeFollowUps: { en: 'Active Follow-ups', hi: 'सक्रिय फॉलो-अप' },
  missedFollowUps: { en: 'Missed Follow-ups', hi: 'छूटे हुए फॉलो-अप' },
  priorityPatients: { en: 'Priority Patient Triage (Sorted by Risk)', hi: 'प्राथमिकता मरीज़ ट्रायेज (जोखिम अनुसार)' },

  // Hospital Dashboard Labels
  incomingReferrals: { en: 'Incoming Referrals', hi: 'आगमन रेफरल' },
  urgentReferrals: { en: 'Urgent Referrals', hi: 'आपातकालीन रेफरल' },
  acceptedReferrals: { en: 'Accepted Referrals', hi: 'स्वीकृत रेफरल' },
  inTransitPatients: { en: 'Patients in Transit', hi: 'रास्ते में मरीज़' },
  arrivedPatients: { en: 'Arrived Patients', hi: 'पहुंचे हुए मरीज़' },
  treatmentStarted: { en: 'Treatment Started', hi: 'इलाज शुरू' },
  completedReferrals: { en: 'Completed Referrals', hi: 'पूर्ण रेफरल' },
  acceptReferral: { en: 'Accept Referral', hi: 'रेफरल स्वीकार करें' },
  rejectReferral: { en: 'Reject Referral', hi: 'रेफरल अस्वीकार करें' },
  markInTransit: { en: 'Mark In Transit (108 Ambulance)', hi: 'रास्ते में दर्ज करें (108 एम्बुलेंस)' },
  markArrived: { en: 'Mark Patient Arrived', hi: 'मरीज़ आगमन दर्ज करें' },
  startTreatment: { en: 'Start Clinical Treatment', hi: 'इलाज शुरू करें' },
  completeTreatment: { en: 'Complete & Discharge', hi: 'इलाज पूर्ण और डिस्चार्ज' },

  // Clinical Actions & Filters
  searchPlaceholder: { en: 'Search name or village…', hi: 'नाम या गाँव से खोजें…' },
  allRiskLevels: { en: 'All Risk Levels', hi: 'सभी जोखिम स्तर' },
  allVillages: { en: 'All Villages', hi: 'सभी गाँव' },
  allGenders: { en: 'All Genders', hi: 'सभी लिंग' },
  filterAll: { en: 'All', hi: 'सभी' },
  filterCritical: { en: 'Critical', hi: 'गंभीर' },
  filterHigh: { en: 'High Risk', hi: 'उच्च जोखिम' },
  filterMedium: { en: 'Medium Risk', hi: 'मध्यम जोखिम' },
  filterLow: { en: 'Low Risk', hi: 'कम जोखिम' },
  actionRefer: { en: 'Refer Patient', hi: 'रेफर करें' },
  actionViewChart: { en: 'View Chart', hi: 'चार्ट देखें' },
  actionCreateReferral: { en: 'Create Referral', hi: 'रेफरल बनाएं' },
  actionRecordVitals: { en: 'Record Vitals', hi: 'वाइटल्स दर्ज करें' },

  // Triage Levels & Status Badges
  riskCritical: { en: 'CRITICAL', hi: 'गंभीर (Critical)' },
  riskHigh: { en: 'HIGH RISK', hi: 'उच्च जोखिम (High Risk)' },
  riskMedium: { en: 'MEDIUM RISK', hi: 'मध्यम जोखिम (Medium Risk)' },
  riskLow: { en: 'LOW RISK', hi: 'कम जोखिम (Low Risk)' },
  statusPending: { en: 'Pending', hi: 'लंबित' },
  statusAccepted: { en: 'Accepted', hi: 'स्वीकृत' },
  statusInTransit: { en: 'In Transit', hi: 'रास्ते में' },
  statusArrived: { en: 'Arrived', hi: 'पहुंच गए' },
  statusCompleted: { en: 'Completed', hi: 'पूर्ण' },
  statusMissed: { en: 'Missed', hi: 'छूटा हुआ' },
  statusUpcoming: { en: 'Upcoming', hi: 'आगामी' },

  // Profile Section Headers & Labels
  profileTitle: { en: 'User Profile', hi: 'उपयोगकर्ता प्रोफ़ाइल' },
  profileSubtitle: { en: 'Manage your personal, professional, and facility account information.', hi: 'अपनी व्यक्तिगत, पेशेवर और स्वास्थ्य केंद्र प्रोफ़ाइल जानकारी प्रबंधित करें।' },
  personalInfo: { en: 'Personal Information', hi: 'व्यक्तिगत जानकारी' },
  professionalInfo: { en: 'Professional Information', hi: 'पेशेवर जानकारी' },
  accountInfo: { en: 'Account & Security Information', hi: 'खाता और सुरक्षा जानकारी' },
  editProfile: { en: 'Edit Profile', hi: 'प्रोफ़ाइल संपादित करें' },
  saveChanges: { en: 'Save Changes', hi: 'बदलाव सहेजें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम' },
  email: { en: 'Email Address', hi: 'ईमेल पता' },
  phone: { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  gender: { en: 'Gender', hi: 'लिंग' },
  dob: { en: 'Date of Birth', hi: 'जन्म तिथि' },
  address: { en: 'Address', hi: 'पता' },
  city: { en: 'City', hi: 'शहर' },
  state: { en: 'State', hi: 'राज्य' },
  pincode: { en: 'PIN Code', hi: 'पिन कोड' },
  role: { en: 'Role', hi: 'भूमिका' },
  staffId: { en: 'Employee / Staff ID', hi: 'कर्मचारी आईडी' },
  facility: { en: 'Health Facility / PHC', hi: 'स्वास्थ्य केंद्र / पीएचसी' },
  department: { en: 'Department', hi: 'विभाग' },
  designation: { en: 'Designation', hi: 'पद' },
  assignedArea: { en: 'Assigned Village / Area', hi: 'आवंटित गाँव / क्षेत्र' },
  joiningDate: { en: 'Joining Date', hi: 'शामिल होने की तिथि' },
  accountStatus: { en: 'Account Status', hi: 'खाता स्थिति' },
  lastLogin: { en: 'Last Login', hi: 'अंतिम लॉगिन' },

  // Settings Section Headers & Labels
  settingsTitle: { en: 'Settings & Preferences', hi: 'सेटिंग्स और प्राथमिकताएं' },
  settingsSubtitle: { en: 'Customize appearance, language, accessibility scaling, and notification preferences.', hi: 'उपस्थिति, भाषा, पहुंच (Accessibility) और अधिसूचना सेटिंग्स को अनुकूलित करें।' },
  tabAppearance: { en: 'Appearance & Theme', hi: 'दिखावट और थीम' },
  tabLanguage: { en: 'Language & Region', hi: 'भाषा और क्षेत्र' },
  tabAccessibility: { en: 'Accessibility Scaling', hi: 'पहुंच और टेक्स्ट आकार' },
  tabNotifications: { en: 'Notifications', hi: 'अधिसूचनाएं' },
  tabPrivacy: { en: 'Privacy & Security', hi: 'गोपनीयता और सुरक्षा' },
  tabAccount: { en: 'Account Security', hi: 'खाता सुरक्षा' },

  // Theme & Appearance
  themeHeading: { en: 'Global Application Theme', hi: 'ग्लोबल एप्लिकेशन थीम' },
  themeDesc: { en: 'Choose between Light, Dark, or System automatic theme styling.', hi: 'लाइट, डार्क या सिस्टम स्वचालित थीम के बीच चयन करें।' },
  themeLight: { en: 'Light Theme', hi: 'लाइट थीम (Light)' },
  themeDark: { en: 'Dark Theme', hi: 'डार्क थीम (Dark Navy)' },
  themeSystem: { en: 'System Default', hi: 'सिस्टम डिफ़ॉल्ट (System)' },

  // Language Section
  languageHeading: { en: 'Select Primary Language', hi: 'प्राथमिक भाषा चुनें' },
  languageDesc: { en: 'Changes will apply instantly across all pages, forms, and navigation menus.', hi: 'बदलाव तुरंत सभी पृष्ठों, फॉर्मों और नेविगेशन मेनू में लागू होंगे।' },
  englishLabel: { en: 'English', hi: 'English (अंग्रेज़ी)' },
  hindiLabel: { en: 'हिन्दी (Hindi)', hi: 'हिन्दी (Hindi)' },
  futureLanguages: { en: 'Additional regional languages coming soon: Gujarati, Marathi, Bengali, Tamil, Telugu.', hi: 'अन्य क्षेत्रीय भाषाएं जल्द आ रही हैं: गुजराती, मराठी, बंगाली, तमिल, तेलुगु।' },

  // Accessibility Section
  textSizeHeading: { en: 'Text Size Scaling', hi: 'टेक्स्ट का आकार (Text Size)' },
  sizeSmall: { en: 'Small (0.95x)', hi: 'छोटा (0.95x)' },
  sizeDefault: { en: 'Default (1.0x)', hi: 'सामान्य (1.0x)' },
  sizeLarge: { en: 'Large (1.10x)', hi: 'बड़ा (1.10x)' },
  sizeXLarge: { en: 'Extra Large (1.20x)', hi: 'अति बड़ा (1.20x)' },
  highContrastHeading: { en: 'High Contrast Mode', hi: 'उच्च कंट्रास्ट मोड (High Contrast)' },
  highContrastDesc: { en: 'Increases border definition and text contrast for low-vision readability.', hi: 'कम दृष्टि वाले उपयोगकर्ताओं के लिए बॉर्डर और टेक्स्ट कंट्रास्ट को बढ़ाता है।' },
  reducedMotionHeading: { en: 'Reduced Motion', hi: 'कम मोशन (Reduced Motion)' },
  reducedMotionDesc: { en: 'Disables UI transitions and subtle keyframe animations.', hi: 'यूआई ट्रांजिशन और एनिमेशन को बंद करता है।' },

  // Notification Preferences
  referralNotifs: { en: 'Referral Status Notifications', hi: 'रेफरल स्थिति की सूचनाएं' },
  followUpNotifs: { en: 'Follow-up Reminders', hi: 'फॉलो-अप याद दिलाना' },
  highRiskNotifs: { en: 'High-Risk Triage Alerts', hi: 'उच्च जोखिम ट्रायेज अलर्ट' },
  systemNotifs: { en: 'System & Sync Notifications', hi: 'सिस्टम और सिंक सूचनाएं' },

  // Privacy & Security
  changePassword: { en: 'Change Password', hi: 'पासवर्ड बदलें' },
  signOutAll: { en: 'Sign Out All Sessions', hi: 'सभी सत्रों से लॉग आउट करें' },
  
  // Feedback Messages
  profileUpdatedSuccess: { en: 'Profile updated successfully.', hi: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।' },
  profileUpdateFailed: { en: 'Unable to update profile. Please try again.', hi: 'प्रोफ़ाइल अपडेट करने में असमर्थ। कृपया पुनः प्रयास करें।' },
  settingsSavedSuccess: { en: 'Settings and preferences saved successfully.', hi: 'सेटिंग्स और प्राथमिकताएं सफलतापूर्वक सहेजी गईं।' }
};
