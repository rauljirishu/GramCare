'use client';
import Link from 'next/link'; import {useEffect,useState} from 'react'; import {currentRole} from '@/lib/auth';
const destinations:Record<string,string>={central:'/dashboard/central',head:'/dashboard/phc',doctor:'/dashboard/doctor',worker:'/dashboard/worker',hospital:'/dashboard/hospital',patient:'/dashboard/patient'};
export function ContinueDashboard(){const[role,setRole]=useState<string|null>(null);useEffect(()=>{currentRole().then(setRole)},[]);return role?<Link href={destinations[role]||'/dashboard'} className="secondary-btn">Continue to dashboard</Link>:null}
