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
      <h2 className="text-xl font-semibold">Portfolio Utility Status</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Utility Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property._id}>
                <TableCell className="font-medium">{property.address}</TableCell>
                <TableCell>
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
                          className={`px-2 py-1 rounded text-xs border ${
                            latestBill
                              ? latestBill.status === 'Unpaid'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : latestBill.status === 'Paid'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
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
