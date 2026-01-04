'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RecordPaymentModal } from './RecordPaymentModal';
import { BillModal } from './BillModal';
import { format, differenceInCalendarDays } from 'date-fns';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { Edit, Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Bill = z.infer<typeof BillSchema>;

interface BillListProps {
  bills: Bill[];
  properties: Record<string, string>;
  onRefresh: () => void;
}

export function BillList({ bills, properties, onRefresh }: BillListProps) {
  // Modal state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

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
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update charged status:', error);
    }
  };

  const handleArchive = async (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    const action = bill.is_archived ? 'restore' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this bill?`)) return;

    try {
      const response = await fetch(`/api/bills/${bill._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: !bill.is_archived }),
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error(`Failed to ${action} bill:`, error);
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

  return (
    <>
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
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                  No bills found.
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => {
                const daysRemaining = differenceInCalendarDays(new Date(bill.due_date), new Date());
                const isUnpaid = bill.status === 'Unpaid' || bill.status === 'Overdue';
                const isPaid = bill.status.startsWith('Paid');
                const isUrgent = isUnpaid && daysRemaining <= 7 && !bill.is_archived;
                const propertyAddress = properties[bill.property_id] || "Unknown Property";
                
                return (
                  <TableRow 
                    key={bill._id} 
                    className={`relative group hover:bg-muted/50 transition-colors cursor-pointer ${bill.is_archived ? 'opacity-60 bg-muted/20' : ''}`}
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
                        disabled={!isPaid || bill.is_archived}
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
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 text-muted-foreground hover:text-${bill.is_archived ? 'primary' : 'destructive'}`}
                          onClick={(e) => handleArchive(e, bill)}
                          title={bill.is_archived ? "Restore" : "Archive"}
                        >
                          {bill.is_archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </Button>
                        {!bill.is_archived && isUnpaid ? (
                          <div onClick={(e) => e.stopPropagation()}>
                              <RecordPaymentModal bill={bill} onPaymentRecorded={onRefresh} />
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

      <BillModal
        bill={selectedBill}
        propertyName={selectedBill ? properties[selectedBill.property_id] : undefined}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          onRefresh();
        }}
        defaultMode={modalMode}
      />
    </>
  );
}