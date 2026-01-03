'use client';

import { useState } from 'react';
import { PropertyList } from './PropertyList';
import { AddPropertyModal } from './AddPropertyModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PropertiesView() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <AddPropertyModal 
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          }
        />
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-muted/20"
        />
      </div>

      <PropertyList search={search} />
    </div>
  );
}
