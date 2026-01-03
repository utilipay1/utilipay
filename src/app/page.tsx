'use client';

import { useEffect, useState } from "react";
import { PropertiesView } from "@/components/properties/PropertiesView";
import { BillsView } from "@/components/bills/BillsView";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import { useView } from "@/context/ViewContext";

export default function Home() {
  const [bills, setBills] = useState([]);
  const [properties, setProperties] = useState([]);
  const { currentView } = useView();

  useEffect(() => {
    async function fetchData() {
      try {
        const [billsRes, propsRes] = await Promise.all([
          fetch('/api/bills'),
          fetch('/api/properties')
        ]);
        
        if (billsRes.ok) {
          const data = await billsRes.json();
          setBills(data);
        }
        if (propsRes.ok) {
          const data = await propsRes.json();
          setProperties(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {currentView === 'dashboard' && (
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your property utilities and upcoming bills.</p>
          </div>
          
          <section>
            <SummaryTiles bills={bills} properties={properties} />
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
      )}

      {currentView === 'properties' && (
        <PropertiesView />
      )}

      {currentView === 'bills' && (
        <BillsView />
      )}
    </div>
  );
}
