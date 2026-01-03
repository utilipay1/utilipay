'use client';

import { useView } from '@/context/ViewContext';
import Header from './Header';

export default function Navigation() {
  const { currentView, setCurrentView } = useView();
  return <Header currentView={currentView} onViewChange={setCurrentView} />;
}
