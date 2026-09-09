import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile in public.users using user_metadata provided at signup
      const meta = data.user.user_metadata || {};
      const role = meta.requested_role || 'asha';

      await supabase.from('users').upsert({
        id: data.user.id,
        name: meta.name || 'Care Worker',
        phone: meta.phone || '',
        email: data.user.email,
        role: role
      }, { onConflict: 'id' });

      // Preferred UX: Redirect to login with verified notice
      return NextResponse.redirect(`${origin}/login?verified=true`);
    }
  }

  // Return to login with error state if verification exchange failed
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
