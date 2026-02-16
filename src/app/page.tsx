'use client';

import { useState, useMemo } from 'react';
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import useSWR, { mutate } from 'swr';
import { Check, ChevronsUpDown, Droplets, Flame, Zap, Waves } from "lucide-react"
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
import { BillSchema, PropertySchema } from '@/lib/schemas';
import { z } from 'zod';

type Bill = z.infer<typeof BillSchema>;
type Property = z.infer<typeof PropertySchema>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data: billsData, isLoading: billsLoading } = useSWR('/api/bills?limit=1000', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: propsData, isLoading: propsLoading } = useSWR('/api/properties?limit=1000', fetcher, {
    revalidateOnFocus: false,
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const [openPropertySelect, setOpenPropertySelect] = useState(false);

  const bills = useMemo<Bill[]>(() => billsData?.data || [], [billsData]);
  const properties = useMemo<Property[]>(() => propsData?.data || [], [propsData]);
  const isLoading = billsLoading || propsLoading;

  const filteredBills = useMemo(() => {
    let filtered = bills;
    if (selectedPropertyId) {
      filtered = filtered.filter((b) => b.property_id === selectedPropertyId);
    }
    if (selectedUtility) {
      filtered = filtered.filter((b) => b.utility_type === selectedUtility);
    }
    return filtered;
  }, [bills, selectedPropertyId, selectedUtility]);

  const filteredProperties = useMemo(() => {
    if (selectedPropertyId) {
      return properties.filter((p) => p._id === selectedPropertyId);
    }
    return properties;
  }, [properties, selectedPropertyId]);

  const handleRefresh = () => {
    mutate('/api/bills?limit=1000');
  };

  const utilityFilters = [
    { value: 'Water', icon: Droplets, label: 'Water' },
    { value: 'Electric', icon: Zap, label: 'Electric' },
    { value: 'Gas', icon: Flame, label: 'Gas' },
    { value: 'Sewer', icon: Waves, label: 'Sewer' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={() => setSelectedPropertyId(null)}>Dashboard</h1>
            <span className="text-muted-foreground/30 text-3xl font-light">/</span>
            
            <Popover open={openPropertySelect} onOpenChange={setOpenPropertySelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={openPropertySelect}
                  className="pl-2 pr-2 text-3xl font-bold tracking-tight hover:bg-transparent hover:text-primary transition-colors h-auto py-0 -ml-2"
                >
                  {selectedPropertyId
                    ? properties.find((p) => p._id === selectedPropertyId)?.address
                    : "All Properties"}
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search property..." />
                  <CommandList>
                    <CommandEmpty>No property found.</CommandEmpty>
                    <CommandGroup>
                       <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedPropertyId(null);
                          setOpenPropertySelect(false);
                        }}
                        className="cursor-pointer font-medium"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !selectedPropertyId ? "opacity-100" : "opacity-0"
                          )}
                        />
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
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPropertyId === property._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {property.address}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">Manage your property utilities and upcoming bills.</p>
        </div>

        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border self-start lg:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUtility(null)}
            className={cn(
              "rounded-md px-3 h-8 text-xs font-bold uppercase tracking-wider transition-all",
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
                "rounded-md px-3 h-8 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                selectedUtility === u.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <u.icon className="w-3.5 h-3.5" />
              {u.label}
            </Button>
          ))}
        </div>
      </div>
      
      <SummaryTiles bills={filteredBills} properties={filteredProperties} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Action Items</h2>
        <DashboardAlerts 
           bills={filteredBills} 
           isLoading={isLoading} 
           onRefresh={handleRefresh}
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
