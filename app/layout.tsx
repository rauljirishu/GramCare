import './globals.css';
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
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
