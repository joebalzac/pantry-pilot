import type { Metadata } from 'next';
import { Fraunces, Nunito } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

export const metadata: Metadata = {
  title: 'PantryPilot',
  description: 'A household pantry that stays one step ahead of the essentials.',
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
