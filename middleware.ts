import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = new Set(['/', '/login', '/verify-email']);
const staffOnly = ['/patients','/workers','/maternal-care','/outbreaks','/resources','/reports'];
export async function middleware(request: NextRequest) {
 let response=NextResponse.next({request}); const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>request.cookies.getAll(),setAll(cookiesToSet: {name:string;value:string;options:CookieOptions}[]){cookiesToSet.forEach(c=>request.cookies.set(c.name,c.value));response=NextResponse.next({request});cookiesToSet.forEach(c=>response.cookies.set(c.name,c.value,c.options))}}});
 const {data:{user}}=await supabase.auth.getUser(); const path=request.nextUrl.pathname; const isPublic=publicPaths.has(path)||path.startsWith('/auth/')||path.startsWith('/api/')||path.startsWith('/_next/')||path.includes('.');
 if(!user&&!isPublic){const url=request.nextUrl.clone();url.pathname='/login';return NextResponse.redirect(url)}
 if(!user)return response;
 const {data:profile}=await supabase.from('users').select('role').eq('id',user.id).single(); const role=profile?.role;
 if(!role){await supabase.auth.signOut();const url=request.nextUrl.clone();url.pathname='/login';url.searchParams.set('error','unauthorised_role');return NextResponse.redirect(url)}
 const home=role==='patient'?'/patient-dashboard':'/dashboard';
 if(path==='/login'||path==='/'){const url=request.nextUrl.clone();url.pathname=home;return NextResponse.redirect(url)}
 if(role==='patient'&&(staffOnly.some(prefix=>path===prefix||path.startsWith(`${prefix}/`))||path==='/dashboard')){const url=request.nextUrl.clone();url.pathname='/patient-dashboard';return NextResponse.redirect(url)}
 if(role==='central_authority'&&path.startsWith('/patients')){const url=request.nextUrl.clone();url.pathname='/dashboard';return NextResponse.redirect(url)}
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
