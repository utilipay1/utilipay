'use client';

import { useEffect, useState } from "react";
import { PropertyList } from "@/components/properties/PropertyList";
import { BillList } from "@/components/bills/BillList";
import { BillsDueSoon } from "@/components/dashboard/BillsDueSoon";
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
        <div className="space-y-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your property utilities and upcoming bills.</p>
          </div>
          <section>
            <SummaryTiles bills={bills} properties={properties} />
          </section>
          <section>
            <BillsDueSoon />
          </section>
          <section>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Portfolio Status</h2>
            <PortfolioTable />
          </section>
        </div>
      )}

      {currentView === 'properties' && (
        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
           </div>
          <PropertyList />
        </div>
      )}

      {currentView === 'bills' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
           </div>
          <BillList />
        </div>
      )}
    </div>
  );
}