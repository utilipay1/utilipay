'use client';

import { useState, useMemo, useEffect } from 'react';
import { BillList } from './BillList';
import { AddBillModal } from './AddBillModal';
import { ExportBillsButton } from './ExportBillsButton';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { BillSchema, CompanySchema, PropertySchema } from '@/lib/schemas';
import { z } from 'zod';
import { BillsToolbar, BillFiltersState } from './BillsToolbar';
import useSWR, { mutate } from 'swr';

type Bill = z.infer<typeof BillSchema>;
type Company = z.infer<typeof CompanySchema>;
type Property = z.infer<typeof PropertySchema>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function BillsView() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const [filters, setFilters] = useState<BillFiltersState>({
    status: new Set(),
    utilityType: new Set(),
    propertyId: new Set(),
    billedTo: new Set(),
    search: "",
    showArchived: false,
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Reset page when other filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.utilityType, filters.propertyId, filters.billedTo, filters.showArchived]);

  // Construct Query
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    archived: filters.showArchived.toString(),
  });

  if (filters.status.size > 0) queryParams.set('status', Array.from(filters.status).join(','));
  if (filters.utilityType.size > 0) queryParams.set('utility_type', Array.from(filters.utilityType).join(','));
  if (filters.propertyId.size > 0) queryParams.set('propertyId', Array.from(filters.propertyId).join(','));
  if (filters.billedTo.size > 0) queryParams.set('billed_to', Array.from(filters.billedTo).join(','));
  if (debouncedSearch) queryParams.set('search', debouncedSearch);

  const { data: billsResponse, isLoading: billsLoading } = useSWR(
    `/api/bills?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  // Optimized fetch for dropdowns (IDs and Addresses only)
  const { data: propsResponse } = useSWR('/api/properties?archived=all&limit=1000&lookup=true', fetcher);
  const { data: companiesResponse } = useSWR('/api/companies?limit=1000', fetcher);

  // Transform Data
  const bills: Bill[] = useMemo(() => {
    if (!billsResponse?.data) return [];
    try {
      return billsResponse.data;
    } catch (e) {
      console.error("Failed to parse bills", e);
      return [];
    }
  }, [billsResponse]);

  const properties = useMemo(() => {
    const propsMap: Record<string, string> = {};
    if (propsResponse?.data) {
      propsResponse.data.forEach((p: Property) => {
        if (p._id) {
          propsMap[p._id] = p.address;
        }
      });
    }
    return propsMap;
  }, [propsResponse]);
  
  const fullProperties = useMemo(() => ({}), []);

  const companies = useMemo(() => {
    const companiesMap: Record<string, Company> = {};
    if (companiesResponse?.data) {
      companiesResponse.data.forEach((c: Company) => {
        if (c._id) {
          companiesMap[c._id] = c;
        }
      });
    }
    return { companies: companiesMap };
  }, [companiesResponse]);

  const totalPages = billsResponse?.pagination?.totalPages || 1;

  const handleRefresh = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/bills'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
        <div className="flex items-center gap-2">
          <ExportBillsButton 
            bills={bills} 
            properties={properties} 
            companies={companies.companies} 
          />
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

      <div className="space-y-4">
        <BillsToolbar 
          filters={filters} 
          setFilters={setFilters} 
          properties={properties} 
        />
        
        {/* Removed redundant loading check wrapper to allow BillList to handle loading skeleton */}
          <>
            <BillList 
              bills={bills} 
              properties={properties} 
              fullProperties={fullProperties}
              companies={companies.companies}
              onRefresh={handleRefresh} 
              loading={billsLoading}
            />
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || billsLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || billsLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
      </div>
    </div>
  );
}
