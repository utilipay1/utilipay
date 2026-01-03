'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Property {
  _id: string;
  address: string;
  utilities_managed: string[];
  is_archived: boolean;
}

interface Bill {
  property_id: string;
  utility_type: string;
  status: string;
  due_date: string;
}

export function PortfolioTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propsRes, billsRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/bills'),
        ]);

        if (propsRes.ok && billsRes.ok) {
          const propsData = await propsRes.json();
          const billsData = await billsRes.json();
          setProperties(propsData);
          setBills(billsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading portfolio...</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-4">Property Address</TableHead>
              <TableHead className="py-4">Utility Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property._id} className="group hover:bg-muted/50 transition-colors">
                <TableCell className="font-semibold text-base py-4">{property.address}</TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {property.utilities_managed.map((utility) => {
                      // Find the latest bill for this property and utility
                      const latestBill = bills
                        .filter(
                          (b) =>
                            b.property_id === property._id &&
                            b.utility_type === utility
                        )
                        .sort(
                          (a, b) =>
                            new Date(b.due_date).getTime() -
                            new Date(a.due_date).getTime()
                        )[0];

                      return (
                        <div
                          key={utility}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                            latestBill
                              ? latestBill.status === 'Unpaid'
                                ? 'bg-muted text-foreground border-muted-foreground/30'
                                : latestBill.status === 'Paid'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-muted text-muted-foreground border-muted-foreground/20'
                              : 'bg-muted/30 text-muted-foreground/50 border-transparent'
                          }`}
                        >
                          {utility}: {latestBill ? latestBill.status : 'No Bill'}
                        </div>
                      );
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
