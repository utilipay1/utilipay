'use client';

import { useState, useCallback } from 'react';
import { PropertyList } from './PropertyList';
import { AddPropertyModal } from './AddPropertyModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function PropertiesView() {
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <AddPropertyModal 
          onSuccess={handleRefresh}
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search by address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-muted/20"
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived-props"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <Label htmlFor="show-archived-props" className="text-sm font-medium">
            Archived
          </Label>
        </div>
      </div>

      <PropertyList search={search} showArchived={showArchived} key={refreshKey} />
    </div>
  );
}