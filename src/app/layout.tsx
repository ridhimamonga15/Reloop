import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ReLoop — Circular Resource Intelligence & Custody Platform',
  description:
    'Circular resource intelligence platform connecting colleges, offices and waste generators with certified recovery partners. Verifiable material recovery, deterministic matching and transparent environmental accounting.',
  keywords: [
    'circular economy',
    'resource recovery',
    'waste exchange',
    'recycling intelligence',
    'materials recovery',
    'e-waste compliance',
    'environmental hacks',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-warm-bg text-charcoal-900 antialiased selection:bg-forest-100 selection:text-forest-900">
        {children}
      </body>
    </html>
  );
}
