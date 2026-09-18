import { supabase } from '@/lib/supabase/client';

export type DatabaseRole = 'central_authority' | 'phc_head' | 'phc_worker' | 'patient';
export type UiRole = 'central' | 'head' | 'worker' | 'doctor' | 'hospital' | 'patient';
export const uiRoleFor = (role: string): UiRole => ({ central_authority:'central', phc_head:'head', phc_worker:'worker', doctor:'doctor', hospital:'hospital', patient:'patient' }[role] || 'patient') as UiRole;

export async function currentRole(): Promise<UiRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
  return data?.role ? uiRoleFor(data.role) : null;
}
