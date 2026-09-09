import type { RiskLevel } from '@/lib/types';

export const AI_DISCLAIMER_TEXT = "AI-assisted risk prioritization. This is clinical decision support, NOT a medical diagnosis. Final clinical decisions must be made by qualified healthcare professionals.";

export interface VitalsInput {
  age?: number | null;
  gender?: string | null;
  isPregnant?: boolean | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  bloodSugar?: number | null;
  temperatureC?: number | null;
  pulseBpm?: number | null;
  spo2?: number | null;
  respiratoryRate?: number | null;
  hemoglobin?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  bmi?: number | null;
  symptoms?: string | null;
  existingConditions?: string[] | null;
  familyHistory?: string | null;
}

export interface PredictionResult {
  riskScore: number;
  riskLevel: RiskLevel;
  priority: 'URGENT REVIEW' | 'PRIORITY TRIAGE' | 'ROUTINE MONITORING';
  warningSignals: string[];
  contributingFactors: string[];
  recommendedAction: string;
  modelVersion: string;
  disclaimer: string;
}

export function predictOfflineRisk(vitals: VitalsInput): PredictionResult {
  let score = 10;
  const warnings: string[] = [];
  const factors: string[] = [];

  const sys = vitals.systolicBp;
  const dia = vitals.diastolicBp;
  const sugar = vitals.bloodSugar;
  const temp = vitals.temperatureC;
  const pulse = vitals.pulseBpm;
  const spo2 = vitals.spo2;
  const resp = vitals.respiratoryRate;
  const hb = vitals.hemoglobin;
  const sx = (vitals.symptoms || '').toLowerCase();
  const conditions = (vitals.existingConditions || []).map(c => c.toLowerCase());

  if (vitals.age && vitals.age >= 60) {
    score += 10;
    factors.push('Advanced age (60+ yrs)');
  }

  if (vitals.isPregnant) {
    score += 15;
    factors.push('High-risk obstetrics (Pregnant patient)');
  }

  if (sys || dia) {
    if ((sys && sys >= 160) || (dia && dia >= 100)) {
      score += 45;
      warnings.push(`Severe Hypertensive Stage 2 (${sys || '—'}/${dia || '—'} mmHg)`);
      factors.push('High Systolic/Diastolic BP');
    } else if ((sys && sys >= 140) || (dia && dia >= 90)) {
      score += 30;
      warnings.push(`Hypertension Stage 1 (${sys || '—'}/${dia || '—'} mmHg)`);
      factors.push('Elevated Blood Pressure');
    } else if ((sys && sys < 90) || (dia && dia < 60)) {
      score += 25;
      warnings.push(`Hypotension Low BP (${sys || '—'}/${dia || '—'} mmHg)`);
      factors.push('Hypotension Low BP');
    }
  }

  if (spo2 !== undefined && spo2 !== null) {
    if (spo2 < 90) {
      score += 50;
      warnings.push(`Severe Hypoxia (SpO2 ${spo2}%)`);
      factors.push('Critical SpO2 oxygen depletion');
    } else if (spo2 < 94) {
      score += 30;
      warnings.push(`Moderate Oxygen Depletion (SpO2 ${spo2}%)`);
      factors.push('Low SpO2');
    }
  }

  if (sugar !== undefined && sugar !== null) {
    if (sugar >= 250) {
      score += 40;
      warnings.push(`Severe Hyperglycemia (${sugar} mg/dL)`);
      factors.push('Uncontrolled Blood Sugar');
    } else if (sugar >= 200) {
      score += 25;
      warnings.push(`Elevated Random Blood Sugar (${sugar} mg/dL)`);
      factors.push('High Blood Sugar');
    } else if (sugar < 70) {
      score += 30;
      warnings.push(`Hypoglycemia Risk (${sugar} mg/dL)`);
      factors.push('Hypoglycemia alert');
    }
  }

  if (pulse !== undefined && pulse !== null) {
    if (pulse >= 120 || pulse <= 45) {
      score += 25;
      warnings.push(`Critical Heart Rate Abnormal (${pulse} bpm)`);
      factors.push('Abnormal Heart Rate');
    } else if (pulse >= 100) {
      score += 15;
      warnings.push(`Tachycardia Elevated Pulse (${pulse} bpm)`);
      factors.push('Tachycardia');
    }
  }

  if (temp !== undefined && temp !== null) {
    if (temp >= 39.0) {
      score += 30;
      warnings.push(`High Fever (${temp}°C)`);
      factors.push('High Fever');
    } else if (temp >= 38.0) {
      score += 15;
      warnings.push(`Fever Detected (${temp}°C)`);
      factors.push('Fever');
    }
  }

  if (resp !== undefined && resp !== null) {
    if (resp >= 30 || resp <= 10) {
      score += 30;
      warnings.push(`Abnormal Respiratory Rate (${resp} breaths/min)`);
      factors.push('Respiratory distress signal');
    }
  }

  if (hb !== undefined && hb !== null) {
    if (hb < 7.0) {
      score += 40;
      warnings.push(`Severe Anemia (Hb ${hb} g/dL)`);
      factors.push('Critical low hemoglobin');
    } else if (hb < 10.0) {
      score += 20;
      warnings.push(`Moderate Anemia (Hb ${hb} g/dL)`);
      factors.push('Low hemoglobin');
    }
  }

  const highRiskKeywords = ['chest pain', 'breathlessness', 'shortness of breath', 'bleeding', 'seizure', 'unconscious', 'convulsion', 'blurry vision', 'severe headache'];
  const medRiskKeywords = ['fever', 'cough', 'vomiting', 'dizziness', 'swelling', 'edema', 'fatigue', 'pain'];

  for (const kw of highRiskKeywords) {
    if (sx.includes(kw)) {
      score += 35;
      warnings.push(`Critical Symptom Signal: ${kw}`);
      factors.push(`Acute symptom: ${kw}`);
      break;
    }
  }

  for (const kw of medRiskKeywords) {
    if (sx.includes(kw)) {
      score += 15;
      warnings.push(`Moderate Symptom Signal: ${kw}`);
      factors.push(`Reported symptom: ${kw}`);
      break;
    }
  }

  if (conditions.length > 0) {
    score += Math.min(20, conditions.length * 10);
    factors.push(`Pre-existing medical conditions: ${conditions.join(', ')}`);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: RiskLevel = 'low';
  let priority: 'URGENT REVIEW' | 'PRIORITY TRIAGE' | 'ROUTINE MONITORING' = 'ROUTINE MONITORING';
  let recommendedAction = 'Routine community healthcare checkup. Continue standard monitoring.';

  if (finalScore >= 85) {
    riskLevel = 'critical';
    priority = 'URGENT REVIEW';
    recommendedAction = 'CRITICAL EMERGENCY: Immediate doctor review & priority 108 ambulance transport to District Hospital.';
  } else if (finalScore >= 65) {
    riskLevel = 'high';
    priority = 'URGENT REVIEW';
    recommendedAction = 'URGENT: High Risk Patient! Initiate immediate doctor referral and emergency transport to PHC/CHC.';
  } else if (finalScore >= 35) {
    riskLevel = 'medium';
    priority = 'PRIORITY TRIAGE';
    recommendedAction = 'MONITOR: Moderate Risk. Schedule specialist tele-referral checkup within 24-48 hours.';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    priority,
    warningSignals: warnings.length ? warnings : ['All vitals within normal clinical thresholds'],
    contributingFactors: factors.length ? factors : ['Standard vitals baseline'],
    recommendedAction,
    modelVersion: 'GramCare-AI-ClinicalScoring-v3.0',
    disclaimer: AI_DISCLAIMER_TEXT
  };
}
