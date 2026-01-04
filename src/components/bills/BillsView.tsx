'use client';

import { useState, useCallback, useEffect } from 'react';
import { BillList } from './BillList';
import { AddBillModal } from './AddBillModal';
import { ExportBillsButton } from './ExportBillsButton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BillSchema, PropertySchema, CompanySchema } from '@/lib/schemas';
import { z } from 'zod';
import { BillsToolbar, BillFiltersState } from './BillsToolbar';

type Bill = z.infer<typeof BillSchema>;
type Property = z.infer<typeof PropertySchema>;
type Company = z.infer<typeof CompanySchema>;

export function BillsView() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [properties, setProperties] = useState<Record<string, string>>({}); // Map id -> address
  const [fullProperties, setFullProperties] = useState<Record<string, Property>>({});
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<BillFiltersState>({
    status: new Set(),
    utilityType: new Set(),
    propertyId: new Set(),
    search: "",
    showArchived: false,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [billsRes, propsRes, companiesRes] = await Promise.all([
        fetch(`/api/bills?archived=${filters.showArchived}`),
        fetch('/api/properties?archived=all'),
        fetch('/api/companies')
      ]);

      if (billsRes.ok && propsRes.ok && companiesRes.ok) {
        const billsData = await billsRes.json();
        const propsData = await propsRes.json();
        const companiesData = await companiesRes.json();
        
        const parsedBills = z.array(BillSchema).parse(billsData);
        // Ensure consistent sorting by due_date ascending
        parsedBills.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        setBills(parsedBills);

        const propsMap: Record<string, string> = {};
        const propsFullMap: Record<string, Property> = {};
        propsData.forEach((p: Property) => {
          if (p._id) {
            propsMap[p._id] = p.address;
            propsFullMap[p._id] = p;
          }
        });
        setProperties(propsMap);
        setFullProperties(propsFullMap);

        const companiesMap: Record<string, Company> = {};
        companiesData.forEach((c: Company) => {
          if (c._id) {
            companiesMap[c._id] = c;
          }
        });
        setCompanies(companiesMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.showArchived]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBills = bills.filter((bill) => {
    // Search Filter (Address)
    const address = properties[bill.property_id] || "";
    if (filters.search && !address.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Status Filter
    if (filters.status.size > 0 && !filters.status.has(bill.status)) {
        return false;
    }

    // Utility Filter
    if (filters.utilityType.size > 0 && !filters.utilityType.has(bill.utility_type)) {
        return false;
    }

    // Property Filter (ID match)
    if (filters.propertyId.size > 0 && !filters.propertyId.has(bill.property_id)) {
        return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
        <div className="flex items-center gap-2">
          <ExportBillsButton bills={filteredBills} properties={properties} />
          <AddBillModal 
            onSuccess={fetchData}
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
        
        {loading ? (
           <div>Loading bills...</div>
        ) : (
          <BillList 
            bills={filteredBills} 
            properties={properties} 
            fullProperties={fullProperties}
            companies={companies}
            onRefresh={fetchData} 
          />
        )}
      </div>
    </div>
  );
}
