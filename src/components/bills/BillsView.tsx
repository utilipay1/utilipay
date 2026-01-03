'use client';

import { useState, useCallback } from 'react';
import { BillList } from './BillList';
import { AddBillModal } from './AddBillModal';
import { ExportBillsButton } from './ExportBillsButton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function BillsView() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
        <div className="flex items-center gap-2">
          <ExportBillsButton />
          <AddBillModal 
            onSuccess={handleRefresh}
            trigger={
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Bill
              </Button>
            }
          />
        </div>
      </div>

      <BillList key={refreshKey} />
    </div>
  );
}
