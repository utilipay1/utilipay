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
import { BillModal } from './BillModal';
import { format, differenceInCalendarDays } from 'date-fns';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Bill = z.infer<typeof BillSchema>;
interface Property {
  _id: string;
  address: string;
}

export function BillList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [properties, setProperties] = useState<Record<string, string>>({}); // Map id -> address
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, propsRes] = await Promise.all([
        fetch('/api/bills'),
        fetch('/api/properties')
      ]);

      if (billsRes.ok && propsRes.ok) {
        const billsData = await billsRes.json();
        const propsData = await propsRes.json();
        
        const parsedBills = z.array(BillSchema).parse(billsData);
        setBills(parsedBills);

        const propsMap: Record<string, string> = {};
        propsData.forEach((p: Property) => {
          propsMap[p._id] = p.address;
        });
        setProperties(propsMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleCharged = async (e: React.MouseEvent, billId: string, currentStatus: string) => {
    e.stopPropagation(); // Prevent row click
    const isCharged = currentStatus === 'Paid-Charged';
    const newStatus = isCharged ? 'Paid-Uncharged' : 'Paid-Charged';
    
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBills(prev => prev.map(b => b._id === billId ? { ...b, status: newStatus as Bill['status'] } : b));
      }
    } catch (error) {
      console.error('Failed to update charged status:', error);
    }
  };

  const handleRowClick = (bill: Bill) => {
    setSelectedBill(bill);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    setSelectedBill(bill);
    setModalMode("edit");
    setIsModalOpen(true);
  };

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
      </div>
      <div className="mt-4">
          <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[12px] p-0"></TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Utility</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charged in Books</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => {
                    const daysRemaining = differenceInCalendarDays(new Date(bill.due_date), new Date());
                    const isUnpaid = bill.status === 'Unpaid' || bill.status === 'Overdue';
                    const isPaid = bill.status.startsWith('Paid');
                    const isUrgent = isUnpaid && daysRemaining <= 7;
                    const propertyAddress = properties[bill.property_id] || "Unknown Property";
                    
                    return (
                      <TableRow 
                        key={bill._id} 
                        className="relative group hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(bill)}
                      >
                        <TableCell className="p-0">
                          {isUrgent && (
                            <div 
                              className={`w-1 h-full absolute left-0 top-0 ${
                                daysRemaining <= 3 ? 'bg-urgency-high' : 'bg-urgency-medium'
                              }`} 
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate" title={propertyAddress}>
                          {propertyAddress}
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
                            isPaid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-muted text-muted-foreground border-muted-foreground/20'
                          }`}>
                            {bill.status === 'Paid-Charged' ? 'Paid' : bill.status === 'Paid-Uncharged' ? 'Paid' : bill.status}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Switch 
                            disabled={!isPaid}
                            checked={bill.status === 'Paid-Charged'}
                            onCheckedChange={() => handleToggleCharged({ stopPropagation: () => {} } as React.MouseEvent, bill._id!, bill.status)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={(e) => handleEditClick(e, bill)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isUnpaid ? (
                              <div onClick={(e) => e.stopPropagation()}>
                                 <RecordPaymentModal bill={bill} onPaymentRecorded={fetchData} />
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <BillModal
          bill={selectedBill}
          propertyName={selectedBill ? properties[selectedBill.property_id] : undefined}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
          defaultMode={modalMode}
        />
    </div>
  );
}