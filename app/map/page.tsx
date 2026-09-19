'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { LocationMap, type MapMarker } from '@/components/location-map';
import { getNearbyFacilities } from '@/lib/api/doctor';
import { requestCurrentPosition, searchLocationClient } from '@/lib/location/geolocation';
import { INDIA_MAP_CENTER } from '@/lib/location/types';
import type { NearbyFacilityResult } from '@/lib/location/types';
import { Cross, Hospital, LocateFixed, MapPin, Navigation, Pill, Search, Stethoscope } from 'lucide-react';

type Category = 'all' | 'hospital' | 'clinic' | 'pharmacy';

function categoryOf(value: string | null): Exclude<Category, 'all'> {
  const type = (value || '').toLowerCase();
  if (type.includes('pharm') || type.includes('medical')) return 'pharmacy';
  if (type.includes('clinic') || type.includes('phc') || type.includes('health')) return 'clinic';
  return 'hospital';
}

export default function NearbyCarePage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [facilities, setFacilities] = useState<NearbyFacilityResult[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function loadNearby(latitude: number, longitude: number) {
    setLoading(true); setMessage(''); setPosition([latitude, longitude]);
    const results = await getNearbyFacilities(latitude, longitude, 30);
    setFacilities(results);
    if (!results.length) setMessage('No facilities with coordinates were found nearby. Search a place or ask an administrator to add facility coordinates.');
    setLoading(false);
  }

  async function useLocation() {
    try {
      const current = await requestCurrentPosition();
      await loadNearby(current.latitude, current.longitude);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Location permission was denied. Search manually instead.');
    }
  }

  async function searchPlace(event: React.FormEvent) {
    event.preventDefault();
    if (!search.trim()) return;
    setLoading(true); setMessage('');
    const result = await searchLocationClient(search.trim());
    if (!result.ok || !result.results.length) { setMessage('Place not found. Try a village, district, or PIN code.'); setLoading(false); return; }
    const first = result.results[0];
    setQuery(first.displayName);
    await loadNearby(first.lat, first.lon);
  }

  useEffect(() => { loadNearby(INDIA_MAP_CENTER[0], INDIA_MAP_CENTER[1]); }, []);

  const visible = useMemo(() => facilities.filter(item => category === 'all' || categoryOf(item.facility_type) === category), [facilities, category]);
  const markers: MapMarker[] = [
    ...(position ? [{ lat: position[0], lng: position[1], label: 'Your selected location', color: 'red' as const }] : []),
    ...visible.map(item => ({ lat: item.latitude, lng: item.longitude, label: `${item.name}<br>${item.distanceKm.toFixed(1)} km away`, color: categoryOf(item.facility_type) === 'pharmacy' ? 'green' as const : categoryOf(item.facility_type) === 'clinic' ? 'amber' as const : 'blue' as const })),
  ];

  return <DashboardShell>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Nearby care</p><h1 className="mt-2 text-3xl font-black">Hospitals, clinics and pharmacies</h1><p className="mt-1 text-sm text-slate-600">Use GPS or search manually. Precise location is used only in this view and is not required.</p></div><button onClick={useLocation} className="primary-btn"><LocateFixed className="h-4 w-4" />Use my location</button></div>
    <form onSubmit={searchPlace} className="card mt-5 flex flex-col gap-2 p-4 sm:flex-row"><label className="sr-only" htmlFor="care-search">Search location</label><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input id="care-search" value={search} onChange={event => setSearch(event.target.value)} className="input py-2 pl-10" placeholder="Search village, district or PIN" /></div><button className="secondary-btn"><Search className="h-4 w-4" />Find nearby care</button></form>
    {query && <p className="mt-3 text-xs font-semibold text-slate-500">Showing care near {query}</p>}
    {message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{message}</p>}
    <div className="mt-5 flex flex-wrap gap-2">{(['all', 'hospital', 'clinic', 'pharmacy'] as Category[]).map(item => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${category === item ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{item === 'all' ? 'All care' : item === 'pharmacy' ? 'Pharmacies' : `${item}s`}</button>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><div className="card overflow-hidden p-2"><LocationMap markers={markers} center={position || INDIA_MAP_CENTER} zoom={position ? 13 : 5} height="560px" /></div><section className="space-y-3">{loading && <div className="card p-6 text-center text-sm text-slate-500">Finding nearby facilities...</div>}{!loading && !visible.length && <div className="card p-6 text-center text-sm text-slate-500">No matching facilities found.</div>}{visible.map(item => <article className="card p-4" key={item.id}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">{categoryOf(item.facility_type) === 'pharmacy' ? <Pill className="h-5 w-5" /> : categoryOf(item.facility_type) === 'clinic' ? <Stethoscope className="h-5 w-5" /> : <Hospital className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><h2 className="font-black">{item.name}</h2><p className="mt-1 text-sm text-slate-600">{item.address || [item.village, item.district, item.state].filter(Boolean).join(', ') || 'Address not recorded'}</p><div className="mt-2 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-2 py-1 capitalize">{item.facility_type || 'health facility'}</span><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{item.distanceKm.toFixed(1)} km</span></div><div className="mt-3 flex gap-2"><a className="secondary-btn px-3 py-2 text-xs" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}><Navigation className="h-3.5 w-3.5" />Directions</a>{item.referral_available && <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Referral available</span>}</div></div></div></article>)}</section></div>
  </DashboardShell>;
}
