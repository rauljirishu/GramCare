import {createServerClient,type CookieOptions} from '@supabase/ssr'; import {NextResponse,type NextRequest} from 'next/server';
const publicPaths=new Set(['/','/login','/signup','/verify-email']);
const supportedRoles:Record<string,boolean>={central_authority:true,phc_head:true,doctor:true,phc_worker:true,hospital:true,patient:true,admin:true,asha:true,anm:true,medical_officer:true};
const roleAlias:Record<string,string>={admin:'central_authority',medical_officer:'central_authority',asha:'phc_worker',anm:'phc_worker'};
const routeRoles:Record<string,string[]>={
	'/patients':['head','worker','doctor','patient'],
	'/assessment':['head','worker','doctor'],
	'/referrals':['central','head','worker','doctor','hospital','patient'],
	'/follow-ups':['head','worker','doctor','hospital','patient'],
	'/hospital':['hospital'],
	'/maternal-care':['head','worker','patient'],
	'/workers':['central','head'],
	'/patient-dashboard':['patient']
};
export async function middleware(request:NextRequest){let response=NextResponse.next({request});const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>request.cookies.getAll(),setAll(items:{name:string;value:string;options:CookieOptions}[]){items.forEach(x=>request.cookies.set(x.name,x.value));response=NextResponse.next({request});items.forEach(x=>response.cookies.set(x.name,x.value,x.options))}}});const {data:{user}}=await supabase.auth.getUser();const path=request.nextUrl.pathname;const isPublic=publicPaths.has(path)||path.startsWith('/auth/')||path.startsWith('/api/')||path.startsWith('/_next/')||path.includes('.');if(!user&&!isPublic){const url=request.nextUrl.clone();url.pathname='/login';url.searchParams.set('next',path);return NextResponse.redirect(url)}if(!user)return response;const {data:profile}=await supabase.from('users').select('role').eq('id',user.id).single();const databaseRole=profile?.role;const role=databaseRole?roleAlias[databaseRole]||databaseRole:undefined;if(!role||!supportedRoles[databaseRole||'']){await supabase.auth.signOut();const url=request.nextUrl.clone();url.pathname='/login';url.searchParams.set('error','unauthorised_role');return NextResponse.redirect(url)}if(path==='/'||path==='/dashboard')return response;if(path.startsWith('/dashboard/')){const url=request.nextUrl.clone();url.pathname='/dashboard';return NextResponse.redirect(url)}const route=Object.keys(routeRoles).find(candidate=>path===candidate||path.startsWith(`${candidate}/`));if(route&&!routeRoles[route].includes(role)){const url=request.nextUrl.clone();url.pathname=role==='patient'?'/patient-dashboard':'/dashboard';return NextResponse.redirect(url)}return response}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
