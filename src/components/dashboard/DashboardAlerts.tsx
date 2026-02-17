'use client';

import { useState } from 'react';
import { format, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';
import { RecordPaymentModal } from '@/components/bills/RecordPaymentModal';
import { BillModal } from '@/components/bills/BillModal';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { BillSchema, CompanySchema } from '@/lib/schemas';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

type Bill = z.infer<typeof BillSchema> & {
  property?: {
    address: string;
    utility_companies?: Record<string, string>;
  };
};
type Company = z.infer<typeof CompanySchema>;

interface DashboardAlertsProps {
  bills: Bill[];
  isLoading: boolean;
  onRefresh: () => void;
  companies: Record<string, Company>;
}

export function DashboardAlerts({ bills, isLoading, onRefresh, companies }: DashboardAlertsProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = startOfDay(new Date());

  const handleEditClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const unpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue');
  
  const overdueAlerts = unpaidBills
    .filter(b => isBefore(startOfDay(new Date(b.due_date)), today))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const upcomingAlerts = unpaidBills
    .filter(b => {
      const dueDate = startOfDay(new Date(b.due_date));
      const daysRemaining = differenceInCalendarDays(dueDate, today);
      return daysRemaining >= 0 && daysRemaining <= 7;
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  if (isLoading && bills.length === 0) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (overdueAlerts.length === 0 && upcomingAlerts.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center">
        No urgent alerts.
      </div>
    );
  }

  const renderAlertCard = (bill: Bill, isOverdue: boolean) => {
    const daysRemaining = differenceInCalendarDays(startOfDay(new Date(bill.due_date)), today);
    const companyId = bill.property?.utility_companies?.[bill.utility_type];
    const companyName = companyId ? companies[companyId]?.name : null;
    
    return (
      <div
        key={bill._id}
        className={`p-4 border rounded-xl flex justify-between items-center bg-card shadow-sm relative overflow-hidden`}
      >
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isOverdue ? 'bg-destructive' : daysRemaining <= 3 ? 'bg-urgency-high' : 'bg-urgency-medium'
          }`}
        />
        
        <div className="pl-4">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">
              {bill.utility_type} {companyName && `• ${companyName}`}
            </span>
            <div className="font-bold text-base leading-tight truncate max-w-[200px]" title={bill.property?.address}>
              {bill.property?.address || "Unknown Property"}
            </div>
          </div>
          
          <div 
            className={`text-sm font-semibold mt-1 ${
              isOverdue ? 'text-destructive' : daysRemaining <= 3 ? 'text-urgency-high' : 'text-urgency-medium'
            }`}
          >
            {isOverdue 
              ? `Overdue by ${Math.abs(daysRemaining)} days` 
              : daysRemaining === 0 
              ? 'Due Today' 
              : daysRemaining === 1 
              ? 'Due Tomorrow' 
              : `Due in ${daysRemaining} days`}
          </div>
          <div className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground/40 mt-0.5">
            Due: {format(new Date(bill.due_date), 'MMM d, yyyy')}
          </div>
        </div>

        <div className="text-right flex items-center gap-4">
          <div className="text-xl font-black">
            ₹{bill.amount.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
              onClick={() => handleEditClick(bill)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <RecordPaymentModal bill={bill} onPaymentRecorded={onRefresh} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Overdue
          </h3>
          <div className="space-y-3">
            {overdueAlerts.length > 0 ? (
              overdueAlerts.map(b => renderAlertCard(b, true))
            ) : (
              <p className="text-sm text-muted-foreground italic">No overdue bills.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-urgency-high" />
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingAlerts.length > 0 ? (
              upcomingAlerts.map(b => renderAlertCard(b, false))
            ) : (
              <p className="text-sm text-muted-foreground italic">No upcoming bills this week.</p>
            )}
          </div>
        </div>
      </div>

      <BillModal
        bill={selectedBill}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        defaultMode="edit"
      />
    </div>
  );
}