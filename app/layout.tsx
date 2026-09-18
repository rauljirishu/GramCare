import './globals.css';
import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next';
import { SettingsProvider } from '@/lib/context/settings-context';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'GramSwasthya | Rural Healthcare Platform',
  description: 'Secure, offline-first rural healthcare coordination platform.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SettingsProvider>
          <PwaRegister />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
