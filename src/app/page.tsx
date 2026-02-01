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
    <div className="space-y-8">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your property utilities and upcoming bills.</p>
        </div>
        
        <section>
          <SummaryTiles bills={bills} properties={properties} isLoading={isLoading} />
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Action Items
          </h2>
          <DashboardAlerts />
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Status</h2>
          <PortfolioTable />
        </section>
      </div>
    </div>
  );
}
