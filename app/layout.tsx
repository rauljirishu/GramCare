import './globals.css';
import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next';
import { SettingsProvider } from '@/lib/context/settings-context';

export const metadata: Metadata = {
  title: 'GramCare | Rural Healthcare Platform',
  description: 'AI-assisted rural health triage, digital referral, and doctor control center platform.'
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
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
