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
import { BillSchema, PropertySchema, CompanySchema } from '@/lib/schemas';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Edit, Archive, RotateCcw, MoreHorizontal, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

type Bill = z.infer<typeof BillSchema> & {
  property?: {
    address: string;
    utility_companies?: Record<string, string>;
  };
};
type Property = z.infer<typeof PropertySchema>;
type Company = z.infer<typeof CompanySchema>;

interface BillListProps {
  bills: Bill[];
  properties: Record<string, string>; // Kept for interface compatibility but unused for main display
  fullProperties: Record<string, Property>; // Kept for interface compatibility but unused
  companies: Record<string, Company>;
  onRefresh: () => void;
  loading?: boolean;
}

export function BillList({ bills, properties, fullProperties, companies, onRefresh, loading = false }: BillListProps) {
  // Modal state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const handleUpdateBilledTo = async (billId: string, billedTo: 'None' | 'Owner' | 'Tenant') => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billed_to: billedTo }),
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update billed_to status:', error);
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

  const handleDelete = async (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this bill? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/bills/${bill._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete bill:', error);
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
              <TableHead>Billed To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="p-0"><Skeleton className="h-full w-1" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : bills.length === 0 ? (
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
                const propertyAddress = bill.property?.address || properties[bill.property_id] || "Unknown Property";
                
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
                        {bill.status.startsWith('Paid') ? 'Paid' : bill.status}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!isPaid || bill.is_archived}>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "transition-all px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider",
                              isPaid && !bill.is_archived ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                              (bill.billed_to === 'Owner' || (bill.billed_to as string) === 'None' || !bill.billed_to) && "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
                              bill.billed_to === 'Tenant' && "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                            )}
                          >
                            {(bill.billed_to as string) === 'None' || !bill.billed_to ? 'Owner' : bill.billed_to}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="min-w-[120px]">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateBilledTo(bill._id!, 'Owner')}
                            className="flex items-center justify-between"
                          >
                            Owner
                            {(bill.billed_to === 'Owner' || (bill.billed_to as string) === 'None' || !bill.billed_to) && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateBilledTo(bill._id!, 'Tenant')}
                            className="flex items-center justify-between"
                          >
                            Tenant
                            {bill.billed_to === 'Tenant' && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!bill.is_archived && isUnpaid && (
                           <RecordPaymentModal bill={bill} onPaymentRecorded={onRefresh} />
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={(e) => handleEditClick(e, bill)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleArchive(e, bill)}
                              className="cursor-pointer"
                            >
                              {bill.is_archived ? (
                                <>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restore
                                </>
                              ) : (
                                <>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDelete(e, bill)} 
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        propertyName={selectedBill?.property?.address || (selectedBill ? properties[selectedBill.property_id] : undefined)}
        companyName={(() => {
          if (!selectedBill) return undefined;
          // Try to get company ID from the joined property data first
          const companyId = selectedBill.property?.utility_companies?.[selectedBill.utility_type];
          // Fallback to the old method if needed (though fullProperties is empty now)
          const fallbackCompanyId = fullProperties[selectedBill.property_id]?.utility_companies?.[selectedBill.utility_type];
          
          const finalId = companyId || fallbackCompanyId;
          return finalId ? companies[finalId]?.name : undefined;
        })()}
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