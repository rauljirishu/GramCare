'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { Bell, CheckCircle2 } from 'lucide-react';

type Notification = { id: string; title: string; message: string; type: string; is_read: boolean; created_at: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('notifications').select('id,title,message,type,is_read,created_at').order('created_at', { ascending: false }).limit(30).then(({ data, error: loadError }) => {
      if (loadError) setError('Unable to load authorised notifications.');
      else setItems((data || []) as Notification[]);
    });
  }, []);

  return <DashboardShell>
    <p className="eyebrow">Notification center</p>
    <h1 className="mt-2 text-3xl font-black">Updates that need attention</h1>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
    <div className="mt-6 space-y-3">{items.length ? items.map(item => <article className="card flex gap-4 p-5" key={item.id}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Bell className="h-5 w-5" /></span><div><h2 className="font-black">{item.title}</h2><p className="mt-1 text-sm text-slate-600">{item.message}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{item.is_read ? 'Read' : 'New'} · {new Date(item.created_at).toLocaleDateString()}</span></div></article>) : <div className="card p-8 text-center text-sm text-slate-500">No notifications are available for this authorised account.</div>}</div>
  </DashboardShell>;
}
