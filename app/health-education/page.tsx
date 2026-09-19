'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { HealthGuidanceVideos } from '@/components/health-guidance-videos';

export default function HealthEducationPage() {
  return (
    <DashboardShell>
      <HealthGuidanceVideos />
    </DashboardShell>
  );
}
