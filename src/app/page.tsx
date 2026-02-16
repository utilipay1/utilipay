'use client';

import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data: billsData, isLoading: billsLoading } = useSWR('/api/bills?limit=1000', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: propsData, isLoading: propsLoading } = useSWR('/api/properties?limit=1000', fetcher, {
    revalidateOnFocus: false,
  });

  const bills = billsData?.data || [];
  const properties = propsData?.data || [];
  const isLoading = billsLoading || propsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your property utilities and upcoming bills.</p>
      </div>
      
      <SummaryTiles bills={bills} properties={properties} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Action Items</h2>
        <DashboardAlerts />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Portfolio Status</h2>
        <PortfolioTable />
      </div>
    </div>
  );
}
