'use client';
import Link from 'next/link';
import { useState } from 'react';
import { DashboardShell } from './dashboard-shell';
import { camps, outbreaks, patients, resourceRequests } from '@/lib/grams-data';
import { CalendarDays, CheckCircle2, ClipboardList, HeartPulse, MapPin, Mic, Plus, Search, ShieldCheck, WifiOff } from 'lucide-react';

const pageData: Record<string, {title:string; subtitle:string; rows:string[][]; icon: typeof ClipboardList}> = {
  'maternal-care': { title:'Maternal Care', subtitle:'Pregnancy registration, milestones and field-worker reminders.', rows:[['Pooja Rathod','24 weeks','Bhadarva PHC','Nutrition guidance shared'],['Meena Shah','18 weeks','Kheda PHC','Hb test due']], icon:HeartPulse },
  'health-camps': { title:'Health Camps', subtitle:'Create, approve, schedule and record community health camps.', rows:camps, icon:CalendarDays },
  outbreaks: { title:'Outbreak Monitoring', subtitle:'PHC reports are reviewed by higher authorities for coordinated support.', rows:outbreaks, icon:ClipboardList },
  resources: { title:'Resource Requests', subtitle:'Track availability and the workflow from request through receipt.', rows:resourceRequests, icon:ClipboardList },
  workers: { title:'Worker Management', subtitle:'Authorized administrators can manage field healthcare teams.', rows:[['ASHA-01','Savita Patel','Rampur PHC','Active'],['ANM-04','Rekha Joshi','Kheda PHC','Active'],['DOC-02','Dr. Nikhil Shah','Bhadarva PHC','On field visit']], icon:HeartPulse },
  'health-education': { title:'Health Education', subtitle:'Short, mobile-friendly community health guidance in local languages.', rows:[['Maternal health','Hindi · Gujarati','3 min guide','Open'],['Dengue prevention','English · Hindi','2 min guide','Open'],['Nutrition for families','Gujarati · Marathi','4 min guide','Open']], icon:HeartPulse },
  reports: { title:'Reports', subtitle:'Privacy-conscious aggregate reports for authorised planning.', rows:[['Patient registrations','September 2026','126 records','View'],['PHC activity','This month','87% reporting','View'],['Resource requests','This quarter','18 requests','View']], icon:ClipboardList },
  map: { title:'Nearby Healthcare Map', subtitle:'Use your device location to find nearby PHCs, hospitals and health camps.', rows:[['Rampur PHC','1.4 km','General care, maternal care','Open today'],['District Civil Hospital','8.2 km','Emergency services, diagnostics','24 hours'],['Maternal Wellness Camp','2.1 km','21 Sep 2026','Scheduled']], icon:MapPin },
};

export function ModulePage({ module }: {module:string}) {
 const data=pageData[module]; const Icon=data.icon; const [notice,setNotice]=useState(''); const [voice,setVoice]=useState('');
 const action = module==='outbreaks'?'Report situation':module==='resources'?'New request':module==='health-camps'?'Request camp':module==='workers'?'Add worker':'Add record';
 return <DashboardShell><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">GramCare workspace</p><h1 className="mt-2 text-3xl font-black text-slate-900">{data.title}</h1><p className="mt-1 text-slate-600">{data.subtitle}</p></div><button className="primary-btn" onClick={()=>setNotice(`${action} is not available in this workspace yet.`)}><Plus className="h-4 w-4"/>{action}</button></div>
 <div className="mb-5 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-800"><ShieldCheck className="h-4 w-4"/>Patient information is protected and accessible only to authorized users.</div>
 {notice&&<div role="status" className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</div>}
 {module==='map'&&<button className="secondary-btn mb-5" onClick={()=>navigator.geolocation?.getCurrentPosition(()=>setNotice('Location permission granted. Nearby facilities are ordered using your device location.'),()=>setNotice('Location access was not granted. Search manually or select a listed facility.'))}><MapPin className="h-4 w-4"/>Use my location</button>}
 {module==='maternal-care'&&<section className="card mb-5 p-5"><div className="flex items-center justify-between"><div><h2 className="font-black">Voice data entry</h2><p className="text-sm text-slate-500">Speak → Review → Confirm → Save</p></div><button className="secondary-btn" onClick={()=>setVoice('Voice input is not supported in this browser. Please use manual entry.')}><Mic className="h-4 w-4"/>Start Voice Entry</button></div>{voice&&<p className="mt-3 text-sm text-amber-700">{voice}</p>}</section>}
 <section className="card overflow-hidden"><div className="border-b border-slate-100 p-5"><div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input className="input py-2 text-sm" style={{paddingLeft:'2.4rem'}} placeholder="Search demo records"/></div></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{data.rows.map((row,i)=><tr className="border-b border-slate-100" key={i}>{row.map((cell,j)=><td key={j} className="px-5 py-4 font-medium text-slate-700">{j===row.length-1?<span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{cell}</span>:cell}</td>)}</tr>)}</tbody></table></div></section>
 <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><WifiOff className="h-4 w-4"/>Offline data is stored locally and synchronizes when a configured secure backend is available.</p></DashboardShell>
}
