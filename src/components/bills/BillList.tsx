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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecordPaymentModal } from './RecordPaymentModal';
import { format } from 'date-fns';

interface Bill {
  _id: string;
  property_id: string;
  utility_type: string;
  amount: number;
  status: string;
  due_date: string;
}

export function BillList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills');
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  if (loading) return <div>Loading bills...</div>;

  const filteredBills = 
    activeTab === 'All' ? bills :
    activeTab === 'Paid' ? bills.filter(b => b.status.startsWith('Paid')) :
    bills.filter(b => b.status === activeTab);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="All" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="Overdue">Overdue</TabsTrigger>
          <TabsTrigger value="Paid">Paid</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utility</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">{bill.utility_type}</TableCell>
                      <TableCell>${bill.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(bill.due_date), 'PP')}</TableCell>
                      <TableCell>{bill.status}</TableCell>
                      <TableCell className="text-right">
                        {bill.status === 'Unpaid' || bill.status === 'Overdue' ? (
                          <RecordPaymentModal bill={bill} onPaymentRecorded={fetchBills} />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

