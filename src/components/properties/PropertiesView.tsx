'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { PropertyList } from './PropertyList';
import { AddPropertyModal } from './AddPropertyModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PropertiesToolbar, PropertyFiltersState } from './PropertiesToolbar';
import { ExportPropertiesButton } from './ExportPropertiesButton';
import useSWR from 'swr';
import { CompanySchema } from '@/lib/schemas';
import { z } from 'zod';

type Company = z.infer<typeof CompanySchema>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PropertiesView() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState<PropertyFiltersState>({
    utilityType: new Set(),
    companyId: new Set(),
    managedStatus: new Set(),
    search: "",
    showArchived: false,
  });

  const { data: companiesResponse } = useSWR('/api/companies?limit=1000', fetcher);
  
  const companiesMap = useMemo(() => {
    const map: Record<string, Company> = {};
    if (companiesResponse?.data) {
      companiesResponse.data.forEach((c: Company) => {
        if (c._id) {
          map[c._id] = c;
        }
      });
    }
    return map;
  }, [companiesResponse]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Reset page when other filters change
  useEffect(() => {
    setPage(1);
  }, [filters.utilityType, filters.companyId, filters.managedStatus, filters.showArchived]);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    archived: filters.showArchived ? 'true' : 'false',
  });

  if (filters.utilityType.size > 0) queryParams.set('utility_type', Array.from(filters.utilityType).join(','));
  if (filters.companyId.size > 0) queryParams.set('companyId', Array.from(filters.companyId).join(','));
  if (filters.managedStatus.size > 0) queryParams.set('managed_status', Array.from(filters.managedStatus).join(','));
  if (debouncedSearch) queryParams.set('search', debouncedSearch);

  const { data: propsResponse, isLoading: propsLoading } = useSWR(
    `/api/properties?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const properties = propsResponse?.data || [];
  const pagination = propsResponse?.pagination;

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const companiesSimpleMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.values(companiesMap).forEach(c => {
      if (c._id) {
        map[c._id] = c.name;
      }
    });
    return map;
  }, [companiesMap]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <div className="flex items-center gap-2">
          <ExportPropertiesButton 
            properties={properties} 
            companies={companiesMap} 
          />
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
      </div>

      <PropertiesToolbar 
        filters={filters}
        setFilters={setFilters}
        companies={companiesSimpleMap}
      />

      <PropertyList 
        properties={properties} 
        isLoading={propsLoading} 
        pagination={pagination}
        page={page}
        setPage={setPage}
        key={refreshKey} 
      />
    </div>
  );
}