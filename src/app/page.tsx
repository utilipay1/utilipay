'use client';

import { useEffect, useState } from "react";
import { PropertiesView } from "@/components/properties/PropertiesView";
import { BillsView } from "@/components/bills/BillsView";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import { useView } from "@/context/ViewContext";
import { NotesView } from "@/components/notes/NotesView";

export default function Home() {
  const [bills, setBills] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentView } = useView();

  useEffect(() => {
    async function fetchData() {
      try {
        const [billsRes, propsRes] = await Promise.all([
          fetch('/api/bills?limit=1000'),
          fetch('/api/properties?limit=1000')
        ]);
        
        if (billsRes.ok) {
          const data = await billsRes.json();
          setBills(data.data || []);
        }
        if (propsRes.ok) {
          const data = await propsRes.json();
          setProperties(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
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
            <SummaryTiles bills={bills} properties={properties} loading={loading} />
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

      {currentView === 'notes' && (
        <NotesView />
      )}
    </div>
  );
}
