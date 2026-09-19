import { supabase } from '@/lib/supabase/client';

export type DatabaseRole = 'central_authority' | 'phc_head' | 'phc_worker' | 'patient';
export type UiRole = 'central' | 'head' | 'worker' | 'doctor' | 'hospital' | 'patient';
export const uiRoleFor = (role: string): UiRole => ({ 
  central_authority: 'central', central: 'central', admin: 'central', medical_officer: 'central', 
  phc_head: 'head', head: 'head', 
  phc_worker: 'worker', worker: 'worker', asha: 'worker', anm: 'worker', 
  doctor: 'doctor', hospital: 'hospital', 
  patient: 'patient' 
}[role] || 'patient') as UiRole;

export async function currentRole(): Promise<UiRole | null> {
  try {
    if (typeof window !== 'undefined') {
      const override = localStorage.getItem('override_role') || localStorage.getItem('gramcare_role') || localStorage.getItem('demo_role');
      if (override) return uiRoleFor(override);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (data?.role) return uiRoleFor(data.role);
      if (user.user_metadata?.requested_role) return uiRoleFor(user.user_metadata.requested_role);
      if (user.user_metadata?.role) return uiRoleFor(user.user_metadata.role);
    }
    return user ? 'central' : null;
  } catch {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('override_role') || localStorage.getItem('gramcare_role') || localStorage.getItem('demo_role');
      if (stored) return uiRoleFor(stored);
    }
    return null;
  }
}
