'use client';

import { useState, useMemo } from 'react';
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import useSWR, { mutate } from 'swr';
import { Check, ChevronsUpDown, Droplets, Flame, Zap, Waves, Building, Building2, SlidersHorizontal, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BillSchema, CompanySchema, PropertySchema } from '@/lib/schemas';
import { z } from 'zod';

type Bill = z.infer<typeof BillSchema> & {
  property?: {
    address: string;
    utility_companies?: Record<string, string>;
  };
};
type Company = z.infer<typeof CompanySchema>;
type Property = z.infer<typeof PropertySchema>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data: billsData, isLoading: billsLoading } = useSWR('/api/bills?limit=1000', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: propsData, isLoading: propsLoading } = useSWR('/api/properties?limit=1000', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: companiesData } = useSWR('/api/companies?limit=1000', fetcher);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [openPropertySelect, setOpenPropertySelect] = useState(false);
  const [openCompanySelect, setOpenCompanySelect] = useState(false);

  const bills = useMemo<Bill[]>(() => billsData?.data || [], [billsData]);
  const properties = useMemo<Property[]>(() => propsData?.data || [], [propsData]);
  const companies = useMemo<Company[]>(() => companiesData?.data || [], [companiesData]);
  const isLoading = billsLoading || propsLoading;

  const companiesMap = useMemo(() => {
    const map: Record<string, Company> = {};
    companies.forEach(c => {
      if (c._id) map[c._id] = c;
    });
    return map;
  }, [companies]);

  const filteredBills = useMemo(() => {
    let filtered = bills;
    if (selectedPropertyId) {
      filtered = filtered.filter((b) => b.property_id === selectedPropertyId);
    }
    if (selectedUtility) {
      filtered = filtered.filter((b) => b.utility_type === selectedUtility);
    }
    if (selectedCompanyId) {
      filtered = filtered.filter((b) => {
        const companyId = b.property?.utility_companies?.[b.utility_type];
        return companyId === selectedCompanyId;
      });
    }
    return filtered;
  }, [bills, selectedPropertyId, selectedUtility, selectedCompanyId]);

  const filteredProperties = useMemo(() => {
    let filtered = properties;
    if (selectedPropertyId) {
      filtered = filtered.filter((p) => p._id === selectedPropertyId);
    }
    if (selectedUtility) {
      filtered = filtered.filter((p) => p.utilities_managed.includes(selectedUtility as 'Water' | 'Sewer' | 'Gas' | 'Electric'));
    }
    if (selectedCompanyId) {
      filtered = filtered.filter((p) => {
        const companyIds = Object.values(p.utility_companies || {});
        return companyIds.includes(selectedCompanyId);
      });
    }
    return filtered;
  }, [properties, selectedPropertyId, selectedUtility, selectedCompanyId]);

  const handleRefresh = () => {
    mutate('/api/bills?limit=1000');
  };

  const isFiltered = !!(selectedPropertyId || selectedUtility || selectedCompanyId);

  const resetFilters = () => {
    setSelectedPropertyId(null);
    setSelectedUtility(null);
    setSelectedCompanyId(null);
  };

  const utilityFilters = [
    { value: 'Water', icon: Droplets, label: 'Water' },
    { value: 'Electric', icon: Zap, label: 'Electric' },
    { value: 'Gas', icon: Flame, label: 'Gas' },
    { value: 'Sewer', icon: Waves, label: 'Sewer' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">Dashboard</h1>
            <p className="text-muted-foreground text-sm font-medium">Portfolio performance and upcoming obligations.</p>
          </div>

          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border self-start lg:self-auto shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUtility(null)}
              className={cn(
                "rounded-md px-3 h-8 text-[10px] font-bold uppercase tracking-widest transition-all",
                !selectedUtility 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              All
            </Button>
            {utilityFilters.map((u) => (
              <Button
                key={u.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUtility(selectedUtility === u.value ? null : u.value)}
                className={cn(
                  "rounded-md px-3 h-8 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5",
                  selectedUtility === u.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <u.icon className="w-3 h-3" />
                {u.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover open={openPropertySelect} onOpenChange={setOpenPropertySelect}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-xl border border-input bg-background px-4 text-xs font-semibold transition-all hover:bg-muted/50",
                  selectedPropertyId && "border-foreground bg-muted/20"
                )}
              >
                <Building className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                {selectedPropertyId
                  ? properties.find((p) => p._id === selectedPropertyId)?.address
                  : "All Properties"}
                <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 shadow-2xl border rounded-xl overflow-hidden" align="start">
              <Command>
                <CommandInput placeholder="Search property..." className="h-11" />
                <CommandList>
                  <CommandEmpty>No property found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedPropertyId(null);
                        setOpenPropertySelect(false);
                      }}
                      className="cursor-pointer py-3"
                    >
                      <Check className={cn("mr-2 h-4 w-4", !selectedPropertyId ? "opacity-100" : "opacity-0")} />
                      All Properties
                    </CommandItem>
                    {properties.map((property) => (
                      <CommandItem
                        key={property._id}
                        value={property.address}
                        onSelect={() => {
                          setSelectedPropertyId(property._id === selectedPropertyId ? null : property._id!)
                          setOpenPropertySelect(false);
                        }}
                        className="cursor-pointer py-3"
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedPropertyId === property._id ? "opacity-100" : "opacity-0")} />
                        {property.address}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={openCompanySelect} onOpenChange={setOpenCompanySelect}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-xl border border-input bg-background px-4 text-xs font-semibold transition-all hover:bg-muted/50",
                  selectedCompanyId && "border-foreground bg-muted/20"
                )}
              >
                <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                {selectedCompanyId
                  ? companies.find((c) => c._id === selectedCompanyId)?.name
                  : "All Companies"}
                <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 shadow-2xl border rounded-xl overflow-hidden" align="start">
              <Command>
                <CommandInput placeholder="Search company..." className="h-11" />
                <CommandList>
                  <CommandEmpty>No company found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedCompanyId(null);
                        setOpenCompanySelect(false);
                      }}
                      className="cursor-pointer py-3"
                    >
                      <Check className={cn("mr-2 h-4 w-4", !selectedCompanyId ? "opacity-100" : "opacity-0")} />
                      All Companies
                    </CommandItem>
                    {companies.map((company) => (
                      <CommandItem
                        key={company._id}
                        value={company.name}
                        onSelect={() => {
                          setSelectedCompanyId(company._id === selectedCompanyId ? null : company._id!)
                          setOpenCompanySelect(false);
                        }}
                        className="cursor-pointer py-3"
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedCompanyId === company._id ? "opacity-100" : "opacity-0")} />
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {isFiltered && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
      
      <SummaryTiles bills={filteredBills} properties={filteredProperties} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Action Items</h2>
        <DashboardAlerts 
           bills={filteredBills} 
           isLoading={isLoading} 
           onRefresh={handleRefresh}
           companies={companiesMap}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Portfolio Status</h2>
        <PortfolioTable 
          properties={filteredProperties} 
          bills={bills}
          isLoading={isLoading}
          selectedUtility={selectedUtility}
        />
      </div>
    </div>
  );
}
