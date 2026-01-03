'use client';

import { useEffect, useState } from 'react';
import { getAlertStatus } from '@/lib/billing';
import { format, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';
import { RecordPaymentModal } from '@/components/bills/RecordPaymentModal';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';

type Bill = z.infer<typeof BillSchema>;

export function DashboardAlerts() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

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

  const today = startOfDay(new Date());

  const unpaidBills = bills.filter(b => b.status === 'Unpaid');
  
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

  if (loading) return <div>Loading alerts...</div>;

  if (overdueAlerts.length === 0 && upcomingAlerts.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center">
        No urgent alerts.
      </div>
    );
  }

  const renderAlertCard = (bill: Bill, isOverdue: boolean) => {
    const daysRemaining = differenceInCalendarDays(startOfDay(new Date(bill.due_date)), today);
    
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
        
        <div className="pl-2">
          <div className="font-bold">{bill.utility_type}</div>
          <div 
            className={`text-sm font-medium ${
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
          <div className="text-xs text-muted-foreground mt-0.5">
            Due: {format(new Date(bill.due_date), 'MMM d, yyyy')}
          </div>
        </div>

        <div className="text-right flex items-center gap-4">
          <div className="text-xl font-bold">
            ₹{bill.amount.toLocaleString()}
          </div>
          <RecordPaymentModal bill={bill} onPaymentRecorded={fetchBills} />
        </div>
      </div>
    );
  };

  return (
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
  );
}