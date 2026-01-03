'use client';

import { useEffect, useState } from 'react';
import { getAlertStatus } from '@/lib/billing';
import { format, differenceInCalendarDays } from 'date-fns';
import { RecordPaymentModal } from '@/components/bills/RecordPaymentModal';
import { EditBillModal } from '@/components/bills/EditBillModal';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';

type Bill = z.infer<typeof BillSchema>;

export function BillsDueSoon() {
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

  const alerts = bills
    .map((bill) => {
      const daysRemaining = differenceInCalendarDays(new Date(bill.due_date), new Date());
      return {
        ...bill,
        daysRemaining,
        alertStatus: getAlertStatus(new Date(bill.due_date)),
      };
    })
    .filter((bill) => bill.alertStatus !== null && bill.status === 'Unpaid')
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (loading) return <div>Loading alerts...</div>;

  if (alerts.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center">
        No urgent bills due soon.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Bills Due Soon</h2>
      <div className="grid gap-4">
        {alerts.map((bill) => (
          <div
            key={bill._id}
            className={`p-5 border rounded-xl flex justify-between items-center bg-card shadow-sm relative overflow-hidden`}
          >
            {/* Accent Line */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                bill.daysRemaining <= 3 ? 'bg-urgency-high' : 'bg-urgency-medium'
              }`}
            />
            
            <div className="pl-2">
              <div className="font-bold text-lg">{bill.utility_type}</div>
              <div 
                className={`text-sm font-medium ${
                  bill.daysRemaining <= 3 ? 'text-urgency-high' : 'text-urgency-medium'
                }`}
              >
                {bill.daysRemaining === 0 
                  ? 'Due Today' 
                  : bill.daysRemaining === 1 
                  ? 'Due Tomorrow' 
                  : `Due in ${bill.daysRemaining} days`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(bill.due_date), 'PPP')}
              </div>
            </div>

            <div className="text-right flex items-center gap-6">
              <div className="text-2xl font-black tracking-tighter">
                ₹{bill.amount.toLocaleString()}
              </div>
              <div className="flex gap-2">
                <EditBillModal 
                  bill={bill} 
                  trigger={
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                  onSuccess={fetchBills}
                />
                <RecordPaymentModal bill={bill} onPaymentRecorded={fetchBills} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}