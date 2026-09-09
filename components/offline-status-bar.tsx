'use client';

import React, { useEffect, useState } from 'react';
import { syncEngine } from '@/lib/offline/sync-engine';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';

export function OfflineStatusBar() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncEngine.processQueue();
    setIsSyncing(false);
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-sm px-4 py-2.5">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="h-3.5 w-3.5" />
              <span>Online — data synchronized</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-extrabold text-amber-800 border border-amber-200">
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
              <span>Offline — changes will sync automatically</span>
            </span>
          )}

          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700 border border-blue-200">
              <CloudUpload className="h-3.5 w-3.5" />
              <span>{pendingCount} item{pendingCount > 1 ? 's' : ''} queued in outbox</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
            </button>
          )}

          {pendingCount === 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 font-medium text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>All records synced</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
