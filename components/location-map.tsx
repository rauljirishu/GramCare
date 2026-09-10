'use client';

import { useEffect, useRef } from 'react';
import { INDIA_MAP_CENTER, INDIA_MAP_ZOOM } from '@/lib/location/types';

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  color?: 'blue' | 'green' | 'red';
}

interface LocationMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  /** When true, only show approximate area (slightly offset marker) for privacy */
  approximate?: boolean;
}

function fixLeafletIcons(L: typeof import('leaflet')) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

export function LocationMap({
  markers = [],
  center,
  zoom,
  height = '280px',
  className = '',
  approximate = false,
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !containerRef.current) return;

      fixLeafletIcons(L);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const defaultCenter = center || (markers[0] ? [markers[0].lat, markers[0].lng] as [number, number] : INDIA_MAP_CENTER);
      const defaultZoom = zoom ?? (markers.length ? 12 : INDIA_MAP_ZOOM);

      const map = L.map(containerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      markers.forEach((m) => {
        let lat = m.lat;
        let lng = m.lng;
        if (approximate) {
          lat += (Math.random() - 0.5) * 0.01;
          lng += (Math.random() - 0.5) * 0.01;
        }

        const iconColor = m.color === 'green' ? '#10b981' : m.color === 'red' ? '#ef4444' : '#2563eb';
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: iconColor,
          color: '#fff',
          weight: 2,
          fillOpacity: 0.85,
        }).addTo(map);

        if (m.label) {
          marker.bindPopup(m.label);
        }

        bounds.push([lat, lng]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, center, zoom, approximate]);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-0 ${className}`}
      style={{ height, minHeight: height }}
    />
  );
}
