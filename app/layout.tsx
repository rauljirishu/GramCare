import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'GramSwasthya | Doctor Portal', description: 'Rural health referral dashboard' };
export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
