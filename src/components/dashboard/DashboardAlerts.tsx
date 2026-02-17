'use client';

import { useState } from 'react';
import { format, differenceInCalendarDays, isBefore, startOfDay, isPast, addDays } from 'date-fns';
import { RecordPaymentModal } from '@/components/bills/RecordPaymentModal';
import { BillModal } from '@/components/bills/BillModal';
import { Button } from '@/components/ui/button';
import { Edit, AlertCircle } from 'lucide-react';
import { BillSchema, CompanySchema } from '@/lib/schemas';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Bill = z.infer<typeof BillSchema> & {
  property?: {
    address: string;
    utility_companies?: Record<string, string>;
    tenant_info?: {
      name?: string | null;
      contact?: string | null;
      move_in_date?: string | Date | null;
      move_out_date?: string | Date | null;
    };
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

    // Tenant move-out warning
    const moveOutDate = bill.property?.tenant_info?.move_out_date ? new Date(bill.property.tenant_info.move_out_date) : null;
    const isMoveOutPast = moveOutDate ? isPast(moveOutDate) : false;
    const isMoveOutSoon = moveOutDate ? isBefore(moveOutDate, addDays(today, 14)) && !isMoveOutPast : false;
    
    return (
      <div
        key={bill._id}
        className="group p-4 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden flex items-center justify-between gap-4"
      >
        {/* Urgency Indicator */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isOverdue ? 'bg-destructive' : daysRemaining <= 3 ? 'bg-urgency-high' : 'bg-urgency-medium'
          }`}
        />
        
        <div className="pl-2 flex-1 min-w-0">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">
                {bill.utility_type} {companyName && `• ${companyName}`}
              </span>
              {(isMoveOutPast || isMoveOutSoon) && (
                <span className={cn(
                  "flex items-center gap-1 px-1 py-0 rounded-[4px] text-[8px] font-black uppercase tracking-tighter border",
                  isMoveOutPast ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-urgency-medium/10 text-urgency-medium border-urgency-medium/20"
                )}>
                  {isMoveOutPast ? "Move-out Overdue" : "Moving Out Soon"}
                </span>
              )}
            </div>
            <div className="font-bold text-base leading-tight text-foreground truncate" title={bill.property?.address}>
              {bill.property?.address || "Unknown Property"}
            </div>
            <div className="flex items-center gap-2 mt-1">
               <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isOverdue ? 'text-destructive' : daysRemaining <= 3 ? 'text-urgency-high' : 'text-urgency-medium'
              }`}>
                {isOverdue 
                  ? `${Math.abs(daysRemaining)}d Overdue` 
                  : daysRemaining === 0 
                  ? 'Due Today' 
                  : `In ${daysRemaining} days`}
              </span>
              <span className="text-muted-foreground/20 text-[10px]">•</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/40">
                {format(new Date(bill.due_date), 'MMM d')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-xl font-black tracking-tighter text-foreground">
            ₹{bill.amount.toLocaleString()}
          </div>
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors cursor-pointer rounded-lg"
              onClick={() => handleEditClick(bill)}
            >
              <Edit className="h-3.5 w-3.5" />
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