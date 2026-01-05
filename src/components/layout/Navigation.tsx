'use client';

import { useView } from '@/context/ViewContext';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { currentView, setCurrentView } = useView();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return <Header currentView={currentView} onViewChange={setCurrentView} />;
}
