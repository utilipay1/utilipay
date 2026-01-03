'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getAlertStatus } from '@/lib/billing';

export default function Navbar() {
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('/api/bills');
        if (response.ok) {
          const bills = await response.json();
          const count = bills.filter((bill: any) => 
            bill.status !== 'Paid' && getAlertStatus(new Date(bill.due_date)) !== null
          ).length;
          setUrgentCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    }
    fetchAlerts();
    
    // Poll every 2 seconds for near-realtime updates
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              UtiliPay
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Dashboard
            </Link>
            <Link href="/properties" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Properties
            </Link>
            <Link href="/bills" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Bills
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search could go here */}
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            {urgentCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {urgentCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

