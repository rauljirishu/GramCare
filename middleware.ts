import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = new Set(['/', '/login', '/signup', '/verify-email']);

const dbToUiRole: Record<string, string> = {
  central_authority: 'central',
  admin: 'central',
  medical_officer: 'central',
  phc_head: 'head',
  phc_worker: 'worker',
  asha: 'worker',
  anm: 'worker',
  doctor: 'doctor',
  hospital: 'hospital',
  patient: 'patient'
};

const routeRoles: Record<string, string[]> = {
  '/patients': ['central', 'head', 'worker', 'doctor'],
  '/assessment': ['central', 'head', 'worker', 'doctor'],
  '/referrals': ['central', 'head', 'worker', 'doctor', 'hospital', 'patient'],
  '/follow-ups': ['central', 'head', 'worker', 'doctor', 'hospital', 'patient'],
  '/hospital': ['central', 'hospital'],
  '/maternal-care': ['central', 'head', 'worker', 'patient'],
  '/health-education': ['central', 'head', 'worker', 'doctor', 'hospital', 'patient'],
  '/map': ['central', 'head', 'worker', 'doctor', 'hospital', 'patient'],
  '/resources': ['central', 'head', 'worker'],
  '/health-camps': ['central', 'head', 'worker', 'patient'],
  '/outbreaks': ['central', 'head', 'worker'],
  '/workers': ['central', 'head'],
  '/reports': ['central', 'head'],
  '/patient-dashboard': ['patient']
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Allow static assets, API routes, auth callbacks, and public pages
  const isPublic = publicPaths.has(path) || 
    path.startsWith('/auth/') || 
    path.startsWith('/api/') || 
    path.startsWith('/_next/') || 
    path.includes('.');

  if (isPublic) {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(items: { name: string; value: string; options: CookieOptions }[]) {
            items.forEach(x => request.cookies.set(x.name, x.value));
            response = NextResponse.next({ request });
            items.forEach(x => response.cookies.set(x.name, x.value, x.options));
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // If no Supabase auth session cookie is present, allow request to proceed
    // so client-side DashboardShell handles local demo storage navigation without blocking links.
    if (!user) {
      return response;
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    const rawRole = profile?.role || user.user_metadata?.requested_role || 'patient';
    const uiRole = dbToUiRole[rawRole] || rawRole;

    // Check route permissions
    const route = Object.keys(routeRoles).find(candidate => path === candidate || path.startsWith(`${candidate}/`));
    if (route && !routeRoles[route].includes(uiRole)) {
      const url = request.nextUrl.clone();
      url.pathname = uiRole === 'patient' ? '/patient-dashboard' : '/dashboard';
      return NextResponse.redirect(url);
    }
  } catch {
    // If Supabase check fails, allow client-side handling
    return response;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
