import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Wannabe · Videoclip cosplay',
};

export default function WannabeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
