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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecordPaymentModal } from './RecordPaymentModal';
import { ExportBillsButton } from './ExportBillsButton';
import { format, differenceInCalendarDays } from 'date-fns';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';

type Bill = z.infer<typeof BillSchema>;

export function BillList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills');
      if (response.ok) {
        const data = await response.json();
        const parsedData = z.array(BillSchema).parse(data);
        setBills(parsedData);
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
      <div className="flex justify-between items-center">
        <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-auto">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="Overdue">Overdue</TabsTrigger>
            <TabsTrigger value="Paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>
        <ExportBillsButton />
      </div>
      <div className="mt-4">
          <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[12px] p-0"></TableHead>
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => {
                    const daysRemaining = differenceInCalendarDays(new Date(bill.due_date), new Date());
                    const isUnpaid = bill.status === 'Unpaid' || bill.status === 'Overdue';
                    const isUrgent = isUnpaid && daysRemaining <= 7;
                    
                    return (
                      <TableRow key={bill._id} className="relative group">
                        <TableCell className="p-0">
                          {isUrgent && (
                            <div 
                              className={`w-1 h-full absolute left-0 top-0 ${
                                daysRemaining <= 3 ? 'bg-urgency-high' : 'bg-urgency-medium'
                              }`} 
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">{bill.utility_type}</TableCell>
                        <TableCell className="font-medium text-base">₹{bill.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={isUrgent ? (daysRemaining <= 3 ? 'text-urgency-high font-medium' : 'text-urgency-medium font-medium') : ''}>
                              {format(new Date(bill.due_date), 'PP')}
                            </span>
                            {isUrgent && (
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${daysRemaining <= 3 ? 'text-urgency-high' : 'text-urgency-medium'}`}>
                                {daysRemaining <= 0 ? 'Due' : `In ${daysRemaining} days`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            bill.status.startsWith('Paid') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-muted text-muted-foreground border-muted-foreground/20'
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isUnpaid ? (
                            <RecordPaymentModal bill={bill} onPaymentRecorded={fetchBills} />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
    </div>
  );
}

