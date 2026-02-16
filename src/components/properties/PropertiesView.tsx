'use client';

import { useState, useCallback, useMemo } from 'react';
import { PropertyList } from './PropertyList';
import { AddPropertyModal } from './AddPropertyModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PropertiesToolbar, PropertyFiltersState } from './PropertiesToolbar';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PropertiesView() {
  const [filters, setFilters] = useState<PropertyFiltersState>({
    utilityType: new Set(),
    companyId: new Set(),
    search: "",
    showArchived: false,
  });

  const { data: companiesResponse } = useSWR('/api/companies?limit=1000', fetcher);
  
  const companiesMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (companiesResponse?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      companiesResponse.data.forEach((c: any) => {
        map[c._id] = c.name;
      });
    }
    return map;
  }, [companiesResponse]);

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

      <PropertiesToolbar 
        filters={filters}
        setFilters={setFilters}
        companies={companiesMap}
      />

      <PropertyList filters={filters} key={refreshKey} />
    </div>
  );
}