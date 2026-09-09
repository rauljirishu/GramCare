import type { RiskLevel } from '@/lib/types';

export interface VitalsInput {
  systolicBp?: number | null;
  diastolicBp?: number | null;
  bloodSugar?: number | null;
  temperatureC?: number | null;
  pulseBpm?: number | null;
  spo2?: number | null;
  symptoms?: string | null;
}

export interface PredictionResult {
  riskScore: number;
  riskLevel: RiskLevel;
  warningSignals: string[];
  recommendedAction: string;
  modelVersion: string;
}

export function predictOfflineRisk(vitals: VitalsInput): PredictionResult {
  let score = 10;
  const warnings: string[] = [];

  const sys = vitals.systolicBp;
  const dia = vitals.diastolicBp;
  const sugar = vitals.bloodSugar;
  const temp = vitals.temperatureC;
  const pulse = vitals.pulseBpm;
  const spo2 = vitals.spo2;
  const sx = (vitals.symptoms || '').toLowerCase();

  if (sys || dia) {
    if ((sys && sys >= 160) || (dia && dia >= 100)) {
      score += 45;
      warnings.push(`Severe Hypertensive Stage 2 (${sys || '—'}/${dia || '—'} mmHg)`);
    } else if ((sys && sys >= 140) || (dia && dia >= 90)) {
      score += 30;
      warnings.push(`Hypertension Stage 1 (${sys || '—'}/${dia || '—'} mmHg)`);
    } else if ((sys && sys < 90) || (dia && dia < 60)) {
      score += 25;
      warnings.push(`Hypotension Low BP (${sys || '—'}/${dia || '—'} mmHg)`);
    }
  }

  if (spo2 !== undefined && spo2 !== null) {
    if (spo2 < 90) {
      score += 50;
      warnings.push(`Severe Hypoxia (SpO2 ${spo2}%)`);
    } else if (spo2 < 94) {
      score += 30;
      warnings.push(`Moderate Oxygen Depletion (SpO2 ${spo2}%)`);
    }
  }

  if (sugar !== undefined && sugar !== null) {
    if (sugar >= 250) {
      score += 40;
      warnings.push(`Severe Hyperglycemia (${sugar} mg/dL)`);
    } else if (sugar >= 200) {
      score += 25;
      warnings.push(`Elevated Random Blood Sugar (${sugar} mg/dL)`);
    } else if (sugar < 70) {
      score += 30;
      warnings.push(`Hypoglycemia Risk (${sugar} mg/dL)`);
    }
  }

  if (pulse !== undefined && pulse !== null) {
    if (pulse >= 120 || pulse <= 45) {
      score += 25;
      warnings.push(`Critical Heart Rate Abnormal (${pulse} bpm)`);
    } else if (pulse >= 100) {
      score += 15;
      warnings.push(`Tachycardia Elevated Pulse (${pulse} bpm)`);
    }
  }

  if (temp !== undefined && temp !== null) {
    if (temp >= 39.0) {
      score += 30;
      warnings.push(`High Fever (${temp}°C)`);
    } else if (temp >= 38.0) {
      score += 15;
      warnings.push(`Fever Detected (${temp}°C)`);
    }
  }

  const highRiskKeywords = ['chest pain', 'breathlessness', 'shortness of breath', 'bleeding', 'seizure', 'unconscious', 'convulsion', 'blurry vision', 'severe headache'];
  const medRiskKeywords = ['fever', 'cough', 'vomiting', 'dizziness', 'swelling', 'edema', 'fatigue', 'pain'];

  for (const kw of highRiskKeywords) {
    if (sx.includes(kw)) {
      score += 35;
      warnings.push(`Critical Symptom Signal: ${kw}`);
      break;
    }
  }

  for (const kw of medRiskKeywords) {
    if (sx.includes(kw)) {
      score += 15;
      warnings.push(`Moderate Symptom Signal: ${kw}`);
      break;
    }
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: RiskLevel = 'low';
  let recommendedAction = 'Routine community healthcare checkup. Continue standard monitoring.';

  if (finalScore >= 70) {
    riskLevel = 'high';
    recommendedAction = 'URGENT: High Risk Patient! Initiate immediate doctor referral and emergency transport to PHC/CHC.';
  } else if (finalScore >= 40) {
    riskLevel = 'medium';
    recommendedAction = 'MONITOR: Moderate Risk. Schedule specialist tele-referral checkup within 24-48 hours.';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    warningSignals: warnings.length ? warnings : ['Normal vital ranges'],
    recommendedAction,
    modelVersion: 'GramCare-OfflineRules-v1.2'
  };
}
