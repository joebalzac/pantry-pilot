import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './shopping.css';

export const metadata: Metadata = {
  title: 'Shopping · PantryPilot',
};

export default function ShoppingLayout({children}: {children: ReactNode}) {
  return children;
}
