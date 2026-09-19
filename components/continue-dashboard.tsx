'use client';
import Link from 'next/link'; import {useEffect,useState} from 'react'; import {currentRole} from '@/lib/auth';
export function ContinueDashboard(){const[role,setRole]=useState<string|null>(null);useEffect(()=>{currentRole().then(setRole)},[]);return role?<Link href="/dashboard" className="secondary-btn">Continue to dashboard</Link>:null}
