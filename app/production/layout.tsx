import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './production.css';

export const metadata: Metadata = {
  title: 'Production readiness · PantryPilot',
};

export default function ProductionLayout({children}: {children: ReactNode}) {
  return children;
}
