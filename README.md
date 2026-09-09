# GramCare (GramSwasthya) — Smart Rural Healthcare Platform (SIH 2026)

GramCare is an offline-first, AI-assisted rural healthcare decision support and digital referral platform built for Smart India Hackathon (SIH 2026). It empowers ASHA workers, ANMs, doctors, and hospital administrators to coordinate care across primary health centers (PHC), community health centers (CHC), and sub-divisional district hospitals.

---

## 🌟 Key Features

1. **Comprehensive Patient Intake & Management**:
   - Village & Gram Panchayat level patient registration.
   - Complete medical profile (Blood Group, Allergies, Pre-existing Conditions, Medications, Emergency Contact).
   - Real-time database persistence on Supabase PostgreSQL.

2. **AI-Assisted Risk Prioritization (CDSS)**:
   - Rule & model-based clinical decision support scoring (0–100 scale).
   - Dynamic triage categories: Low, Medium, High, and Critical.
   - Medical disclaimer: Decision support recommendation to assist qualified clinicians.

3. **Digital Inter-Facility Referral Workflow**:
   - Instant PHC → CHC → District Hospital referral generation.
   - Referral stage tracking (Intake → Created → Accepted → In Transit → Arrived → Completed).
   - Automated post-referral follow-up scheduling for ASHA workers.

4. **Lightweight Offline-First Outbox Sync**:
   - Local caching and offline patient/vitals registration when mobile data is unavailable.
   - Automatic background outbox queue synchronization upon internet reconnection.
   - Real-time online/offline status bar indicator.

5. **Multi-Role Access Control**:
   - **ASHA / ANM**: Intake, vitals recording, daily field workspace, follow-up checklist.
   - **Doctor**: Triage dashboard, clinical risk review, referral management, clinical notes.
   - **Hospital / Admin**: Emergency referral queue, bed/treatment status update, audit log monitoring.

---

## 🚀 Quick Start Guide

### 1. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2. Database Migrations & Seed Data
Execute the following SQL scripts in order in your **Supabase Dashboard → SQL Editor**:
1. `supabase/migrations/202609090006_complete_schema_and_schema_cache_reload.sql` — Builds all 12 platform tables, indexes, RLS security policies, auth trigger, and PostgREST schema cache reload.
2. `supabase/migrations/202609090007_seed_realistic_demo_data.sql` — Populates 18 realistic rural demo patients, health vitals, AI risk scores, referrals, and follow-ups.

### 3. Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡 System Architecture & Tech Stack
- **Frontend Framework**: Next.js 14 (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism design system.
- **Backend & Database**: Supabase Auth & PostgreSQL with Row Level Security (RLS).
- **Offline Storage**: Custom outbox queue sync engine (`lib/offline/sync-engine.ts`).
